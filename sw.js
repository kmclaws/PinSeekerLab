/* ============================================================
   KC YARDAGE — sw.js · chunk-13.4
   ------------------------------------------------------------
   Two caches, two lifecycles:

   · SHELL_CACHE  — the app itself. Versioned; a new deploy bumps the
     name, the old shell is deleted on activate. No skipWaiting: the
     new worker waits and takes over on the next cold launch, because
     a forced refresh mid-round during a GPS capture is worse than
     old code (matches the in-app update copy).

   · TILE_CACHE   — Esri satellite imagery (Chunk 13.4). Deliberately
     NOT versioned and NOT cleared on activate: tiles are static
     imagery that never changes, so they survive every app update.
     Cache-first with a FIFO cap (~600 × 25 KB ≈ 15 MB of imagery).

   If you already run a customized sw.js: splice only the block
   between the CHUNK 13.4 markers into the TOP of your existing
   fetch handler (before the app-shell logic, keeping its `return`),
   plus trimTileCache() and the two TILE_* constants. Never register
   a second 'fetch' listener — multiple fetch listeners in one
   worker behave unpredictably.
   ============================================================ */

var SHELL_CACHE = 'kc-shell-chunk-13.4';
var SHELL_URLS = ['./'];   // the app is one file served at scope root

/* ==== CHUNK 13.4 — Dispersion overlay + tile cache ==== */
var TILE_CACHE = 'kc-tiles-v1';
var TILE_MAX = 600;   // ~600 × 25KB ≈ 15 MB
var TILE_RE = /^https:\/\/server\.arcgisonline\.com\/ArcGIS\/rest\/services\/World_Imagery\/MapServer\/tile\//;

function trimTileCache(cache){
  return cache.keys().then(function(keys){
    if(keys.length <= TILE_MAX) return;
    var excess = keys.length - TILE_MAX;
    var drops = [];
    for(var i = 0; i < excess; i++) drops.push(cache.delete(keys[i]));   // FIFO — cache.keys() is insertion-ordered
    return Promise.all(drops);
  });
}
/* ==== end CHUNK 13.4 block ==== */

self.addEventListener('install', function(event){
  event.waitUntil(
    caches.open(SHELL_CACHE).then(function(cache){
      return cache.addAll(SHELL_URLS);
    })
    /* no skipWaiting — see header */
  );
});

self.addEventListener('activate', function(event){
  event.waitUntil(
    caches.keys().then(function(names){
      return Promise.all(names.map(function(name){
        /* Retire old shells only. TILE_CACHE is explicitly exempt —
           imagery survives every app version. */
        if(name === TILE_CACHE) return Promise.resolve(false);
        if(name !== SHELL_CACHE) return caches.delete(name);
        return Promise.resolve(false);
      }));
    }).then(function(){
      return self.clients.claim();   // first install claims the open page right away
    })
  );
});

self.addEventListener('fetch', function(event){
  if(event.request.method !== 'GET') return;
  var url = event.request.url;

  /* ==== CHUNK 13.4 — Dispersion overlay + tile cache ==== */
  if(TILE_RE.test(url)){
    event.respondWith(
      caches.open(TILE_CACHE).then(function(cache){
        return cache.match(event.request).then(function(hit){
          if(hit) return hit;
          return fetch(event.request).then(function(resp){
            /* Tiles load via <img> (no crossorigin), so the response is
               opaque — resp.ok is false on every opaque response even
               when the tile arrived fine. Gate on ok OR opaque; a plain
               resp.ok check would never cache a single tile. */
            if(resp.ok || resp.type === 'opaque'){
              cache.put(event.request, resp.clone());
              trimTileCache(cache);
            }
            return resp;
          });
        });
      }).catch(function(){
        /* Offline, uncached: hand the <img> an empty 204 — its onerror
           path removes it and the dark field shows through (Chunk 12). */
        return new Response(new Uint8Array(0), {
          status: 204,
          headers: { 'Content-Type': 'image/png' }
        });
      })
    );
    return;   // never fall through to the app-shell logic
  }
  /* ==== end CHUNK 13.4 block ==== */

  /* App shell + fonts: cache-first, refresh in the background. Google
     Fonts responses are opaque via no-cors — same ok-or-opaque gate. */
  var sameOrigin = url.indexOf(self.location.origin) === 0;
  var isFont = /^https:\/\/fonts\.(googleapis|gstatic)\.com\//.test(url);
  if(!sameOrigin && !isFont) return;

  event.respondWith(
    caches.open(SHELL_CACHE).then(function(cache){
      return cache.match(event.request, { ignoreSearch: sameOrigin }).then(function(hit){
        var net = fetch(event.request).then(function(resp){
          if(resp.ok || resp.type === 'opaque') cache.put(event.request, resp.clone());
          return resp;
        });
        return hit || net;
      });
    }).catch(function(){
      return caches.match('./');
    })
  );
});
