import { useState, useCallback, useRef, useEffect } from "react";

const PHASES = [
  {
    id: "nodejs",
    icon: "⚙️",
    title: "Install Node.js",
    subtitle: "The engine that makes everything run",
    color: "#3b82f6",
    explainer:
      "Node.js is a program your computer needs before 9Router or OpenCode will work. Think of it like needing a Blu-ray player before you can watch a Blu-ray disc — the disc is useless without the player.",
    steps: [
      {
        id: "open-browser",
        label: "Open your web browser",
        detail: `Find your web browser icon on your desktop or taskbar (the strip along the bottom of your screen).`,
        visual: {
          type: "icons",
          items: [
            { icon: "🔴🟡🟢🔵", name: "Chrome", desc: "Round colorful circle" },
            { icon: "🌊", name: "Edge", desc: "Blue-green wave shape" },
            { icon: "🦊", name: "Firefox", desc: "Orange fox on a globe" },
          ],
        },
        tip: `Can't find any of them? Click the Windows Start button (bottom-left corner), type "edge", and press Enter. Edge comes pre-installed on every Windows 10 computer.`,
      },
      {
        id: "go-to-nodejs",
        label: "Go to the Node.js website",
        detail:
          "Click the address bar at the very top of your browser — it's the long white rectangle where you see web addresses. All the text inside it will turn blue. Type the address below and press Enter.",
        command: "nodejs.org",
        commandLabel: "Type this into the address bar",
      },
      {
        id: "download-nodejs",
        label: 'Click the big green "Download" button',
        detail:
          'Look for a large green button that says "Download Node.js (LTS)". LTS just means "the stable version" — click it.',
        visual: {
          type: "mockButton",
          text: "⬇ Download Node.js (LTS)",
          color: "#3e863d",
        },
        tip: "A file will start downloading. Wait until it finishes — you'll see a progress bar at the bottom of your browser, or your browser will say 'Complete'.",
      },
      {
        id: "run-installer",
        label: "Open the downloaded file",
        detail: `The file is called something like "node-v24.x.x-x64.msi" — the exact numbers don't matter.`,
        visual: {
          type: "finder",
          options: [
            "Click it at the bottom of your browser (Chrome/Edge show downloads there)",
            'Or press Windows key + E to open File Explorer → click "Downloads" on the left → double-click the file starting with "node"',
          ],
        },
      },
      {
        id: "installer-wizard",
        label: "Walk through the installer (click Next a bunch of times)",
        detail:
          "A setup wizard will pop up. Here's exactly what to click on each screen:",
        visual: {
          type: "wizard",
          screens: [
            { screen: "Welcome", action: "Click Next" },
            {
              screen: "License Agreement",
              action: '☑ Check "I accept the terms" → Click Next',
            },
            {
              screen: "Destination Folder",
              action: "Don't change anything → Click Next",
            },
            {
              screen: "Custom Setup",
              action: "Don't change anything → Click Next",
            },
            {
              screen: "Tools for Native Modules",
              action:
                '☑ CHECK the box "Automatically install necessary tools" → Click Next',
              important: true,
            },
            { screen: "Ready to Install", action: "Click Install" },
            {
              screen: "Permission popup",
              action: 'Click "Yes" to allow changes',
            },
            {
              screen: "Progress bar",
              action: "Wait 1–3 minutes for it to finish",
            },
            { screen: "Completed", action: "Click Finish" },
          ],
        },
      },
      {
        id: "black-window",
        label: "If a black window appears — don't panic!",
        detail:
          'If you checked that "Tools" box (good!), a black window full of scrolling text may open by itself. This is normal. Don\'t close it — let it do its thing.',
        tip: 'It can take 5–10 minutes. When it says "Press any key to continue..." press any key and the window closes on its own.',
        warning: true,
      },
      {
        id: "verify-node",
        label: "Verify Node.js installed correctly",
        detail:
          "Time to confirm everything worked. You'll open a program called Command Prompt and type two quick checks.",
        substeps: [
          'Press the Windows key (bottom-left of keyboard), type "cmd", and click "Command Prompt"',
          "A black window opens. Type the command below and press Enter:",
        ],
        command: "node --version",
        commandLabel: "Check #1 — Type this and press Enter",
        expect:
          "You should see something like v24.4.0 — any version number starting with v means it worked!",
        followup: {
          command: "npm --version",
          commandLabel: "Check #2 — Type this and press Enter",
          expect:
            "You should see a number like 10.9.2 — again, exact number doesn't matter.",
        },
        tip: 'If you get an error saying "not recognized," restart your computer and try again. Windows sometimes needs a reboot to notice new programs.',
      },
    ],
  },
  {
    id: "terminal",
    icon: "🖥️",
    title: "Install Windows Terminal",
    subtitle: "A better-looking command window",
    color: "#8b5cf6",
    explainer:
      "The old Command Prompt on Windows 10 is outdated. OpenCode needs a modern terminal that can display colors and fancy text properly. Windows Terminal is Microsoft's free, modern replacement — think of it as upgrading from a flip phone to a smartphone for your command line.",
    steps: [
      {
        id: "open-store",
        label: "Open the Microsoft Store",
        detail:
          'Click the Windows Start button (bottom-left corner), type "Microsoft Store", and click it when it appears.',
        visual: {
          type: "mockButton",
          text: "🛍️ Microsoft Store",
          color: "#0078d4",
        },
      },
      {
        id: "search-terminal",
        label: 'Search for "Windows Terminal"',
        detail:
          'Click the search bar at the top of the Microsoft Store. Type "Windows Terminal" and press Enter.',
      },
      {
        id: "install-terminal",
        label: 'Click "Get" or "Install"',
        detail:
          'Find the one that says "Windows Terminal" by Microsoft Corporation. Click Get or Install. Takes about 1–2 minutes.',
        tip: 'If it says "Open" instead of "Get," you already have it — skip ahead!',
      },
      {
        id: "test-terminal",
        label: "Open Windows Terminal to make sure it works",
        detail:
          'Press the Windows key, type "Windows Terminal", and click it. A sleek dark window should appear. You can close it — you\'ll use it in the next steps.',
        expect:
          "You should see a clean, dark window with a blinking cursor. Much nicer than the old Command Prompt!",
      },
    ],
  },
  {
    id: "9router",
    icon: "🔀",
    title: "Install 9Router",
    subtitle: "The smart AI traffic controller",
    color: "#06b6d4",
    explainer:
      "9Router is a free program that runs on your computer and acts as a traffic controller for AI models. When one AI model is busy or you've used up your free quota, 9Router automatically switches you to another model — without you lifting a finger. It's like having a GPS that automatically reroutes you around traffic jams.",
    steps: [
      {
        id: "open-terminal-9r",
        label: "Open Windows Terminal",
        detail:
          'Press the Windows key, type "Windows Terminal", and click it to open.',
      },
      {
        id: "install-9router",
        label: "Install 9Router with one command",
        detail:
          "Copy the command below and paste it into the terminal window, then press Enter. (To paste in the terminal, right-click.)",
        command: "npm install -g 9router",
        commandLabel: "Copy → paste into terminal → press Enter",
        commandBreakdown: [
          { piece: "npm", meaning: "The package manager you installed with Node.js" },
          { piece: "install", meaning: "Download and set up a program" },
          { piece: "-g", meaning: '"Global" — usable from anywhere on your computer' },
          { piece: "9router", meaning: "The program you're installing" },
        ],
        tip: "You'll see text scrolling by — that's normal. Wait until you see the blinking cursor again. Yellow WARN messages are fine — only red ERROR messages are a problem.",
      },
      {
        id: "start-9router",
        label: "Start 9Router",
        detail:
          "In the same terminal window, type the command below and press Enter.",
        command: "9router",
        commandLabel: "Type this and press Enter",
        expect:
          'You should see a rocket emoji 🚀 and a message about 9Router starting, including a "Dashboard" web address.',
        warning_box:
          "KEEP THIS TERMINAL WINDOW OPEN! If you close it, 9Router stops running. Minimize it to your taskbar instead.",
      },
      {
        id: "open-dashboard",
        label: "Open the 9Router Dashboard in your browser",
        detail:
          "Open your web browser and type the address below into the address bar. This is a website running on your own computer — only you can see it.",
        command: "localhost:20128",
        commandLabel: "Type this into your browser's address bar",
        expect:
          'You should see a clean dashboard with "Usage & Analytics" and a sidebar with options like Providers, Combos, and Usage.',
        tip: "If the page won't load, check that the terminal window with 9Router is still open and running.",
      },
    ],
  },
  {
    id: "opencode-go",
    icon: "🔑",
    title: "Sign Up for OpenCode Go",
    subtitle: "$5 first month, then $10/month — access to 14 AI models",
    color: "#f59e0b",
    explainer:
      "OpenCode Go is a subscription that gives you access to 14 powerful AI coding models (DeepSeek V4 Pro, GLM 5.2, Kimi K2.7, and more) for one flat monthly price. No confusing per-token billing. The screenshot you saw? Someone used 7 million tokens and spent less than 30 cents — that's the power of this setup.",
    steps: [
      {
        id: "go-to-opencode",
        label: "Go to the OpenCode Go page",
        detail: "Open your web browser and go to:",
        command: "opencode.ai/go",
        commandLabel: "Type this into your browser's address bar",
      },
      {
        id: "signup-opencode",
        label: "Sign up and subscribe",
        detail:
          'Click the sign-up button (might say "Get Started" or "Subscribe"). Create an account with your email and a password, then enter your payment info. The first month is only $5.',
      },
      {
        id: "get-api-key",
        label: "Get your API key and save it somewhere safe",
        detail:
          "After signing up, you'll get an API key — a long string of letters and numbers that looks like this:",
        command: "sk-oc-xxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        commandLabel: "Your key will look something like this (but with real characters)",
        warning_box:
          "SAVE THIS KEY SOMEWHERE SAFE — a Notepad file, a note on your phone, anywhere you won't lose it. You'll need it in the next steps. If you lose it, log into opencode.ai and look in Settings or API Keys.",
      },
    ],
  },
  {
    id: "connect",
    icon: "🔗",
    title: "Connect OpenCode Go to 9Router",
    subtitle: "Tell 9Router where to send your AI requests",
    color: "#10b981",
    explainer:
      "Now you're wiring things together. You'll tell 9Router about your OpenCode Go subscription so it can route your requests to those powerful AI models.",
    steps: [
      {
        id: "open-dashboard-2",
        label: "Open the 9Router Dashboard",
        detail: "In your browser, go to:",
        command: "localhost:20128",
        commandLabel: "Go to this address (or click the tab if it's still open)",
      },
      {
        id: "add-provider",
        label: "Add OpenCode Go as a provider",
        substeps: [
          'Click "Providers" on the left sidebar',
          'Click "Add Provider" or the + button',
          'Find and click "OpenCode" or "OpenCode Go"',
          "Paste your API key from the previous phase",
          "Make sure the Base URL is set to the address below",
        ],
        command: "https://opencode.ai/zen/go/v1",
        commandLabel: "Base URL (may already be filled in)",
        detail: 'Click "Save" or "Connect" when done.',
      },
      {
        id: "verify-provider",
        label: "Verify the connection",
        detail:
          "You should see OpenCode Go listed as an active provider with a green dot or checkmark. You might also see the available models listed (DeepSeek V4 Pro, GLM 5.2, etc.).",
        expect: "Green indicator next to OpenCode Go = you're connected!",
      },
    ],
  },
  {
    id: "combo",
    icon: "🎯",
    title: 'Set Up a "Combo" in 9Router',
    subtitle: "The smart routing — automatic model switching",
    color: "#ec4899",
    explainer:
      'A "Combo" is a priority list of AI models. When the first model hits its limit, 9Router automatically falls to the next one — like having backup quarterbacks ready to go. This is how you get massive token usage for almost nothing.',
    steps: [
      {
        id: "create-combo",
        label: "Create a new Combo",
        substeps: [
          'Click "Combos" on the left sidebar',
          'Click "Create New" or the + button',
          "Name it something like my-coding-combo",
        ],
        detail: "",
      },
      {
        id: "add-models",
        label: "Add models to your Combo in this order",
        detail:
          "Add these models top to bottom — 9Router tries the top one first, then falls down the list:",
        visual: {
          type: "priority",
          items: [
            {
              rank: 1,
              name: "DeepSeek V4 Pro",
              desc: "Best quality — great for complex coding",
              tag: "Top pick",
            },
            {
              rank: 2,
              name: "DeepSeek V4 Flash",
              desc: "Faster and cheaper — nearly as good",
              tag: "Speed",
            },
            {
              rank: 3,
              name: "GLM 5.2",
              desc: "Excellent reasoning — huge context window",
              tag: "Smart",
            },
            {
              rank: 4,
              name: "Kimi K2.7 Code",
              desc: "Strong at multi-step problems",
              tag: "Reliable",
            },
          ],
        },
      },
      {
        id: "add-free",
        label: "(Optional) Add free fallback providers",
        detail:
          'Go back to Providers and add "OpenCode Free" — no API key needed. Then add its models to the bottom of your Combo as free backups.',
        tip: "This gives you a free safety net. When your Go plan models are at capacity, the free models kick in automatically.",
      },
    ],
  },
  {
    id: "opencode-install",
    icon: "🤖",
    title: "Install OpenCode",
    subtitle: "The AI coding tool you'll actually talk to",
    color: "#6366f1",
    explainer:
      'OpenCode is the program you\'ll actually use to write code. You type what you want ("build me a website," "fix this bug") and it does it, using the AI models from your OpenCode Go subscription, routed through 9Router.',
    steps: [
      {
        id: "new-terminal",
        label: "Open a NEW Windows Terminal window",
        detail:
          'Your first terminal window is running 9Router — don\'t close it! Press the Windows key, type "Windows Terminal", and click it to open a second window.',
        warning_box:
          "You should now have TWO terminal windows: one running 9Router (leave it alone), and a new empty one for this step.",
      },
      {
        id: "install-opencode",
        label: "Install OpenCode",
        detail:
          "In the new terminal window, paste the command below and press Enter.",
        command: "npm install -g opencode-ai@latest",
        commandLabel: "Copy → paste into the NEW terminal → press Enter",
        tip: "This takes 1–5 minutes. Wait for the blinking cursor to reappear.",
        altMethod: {
          title: "Alternative: Install with Scoop",
          detail:
            "If the npm method gives you trouble, you can use Scoop instead. First install Scoop with these two commands (paste them one at a time):",
          commands: [
            "Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser",
            "Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression",
          ],
          then: "Then install OpenCode:",
          finalCommand: "scoop install opencode",
        },
      },
      {
        id: "verify-opencode",
        label: "Verify OpenCode installed",
        command: "opencode --version",
        commandLabel: "Type this and press Enter",
        detail: "",
        expect: "You should see a version number. If you do, it's installed!",
      },
    ],
  },
  {
    id: "configure",
    icon: "⚡",
    title: "Configure OpenCode to Use 9Router",
    subtitle: "Wire the last connection",
    color: "#f97316",
    explainer:
      "This is the final wiring step. You need to tell OpenCode to send all its AI requests through 9Router, which will route them to your OpenCode Go models. You'll do this by setting two 'environment variables' — think of them as secret settings your computer stores for programs to use.",
    steps: [
      {
        id: "set-env-perm",
        label: "Set environment variables (permanent method — recommended)",
        detail: "This only needs to be done once. Follow these steps carefully:",
        substeps: [
          'Press the Windows key, type "environment variables"',
          'Click "Edit the system environment variables"',
          'Click the "Environment Variables..." button at the bottom',
          'Under "User variables" (the TOP section), click "New..."',
        ],
        visual: {
          type: "envvars",
          vars: [
            {
              name: "OPENAI_BASE_URL",
              value: "http://localhost:20128/v1",
              note: "This points OpenCode at 9Router",
            },
            {
              name: "OPENAI_API_KEY",
              value: "(your OpenCode Go API key from Phase 4)",
              note: "Paste your real key here",
            },
          ],
        },
        detail2:
          'For each variable: type the name, paste the value, click OK. After adding both, click OK on all windows to close them. Then close your terminal and open a new one for changes to take effect.',
      },
      {
        id: "create-folder",
        label: "Create a project folder",
        detail:
          "OpenCode works best inside a project folder. Run these two commands to create one and move into it:",
        command: "mkdir C:\\Users\\%USERNAME%\\my-project\ncd C:\\Users\\%USERNAME%\\my-project",
        commandLabel: "Run these two lines (one at a time or together)",
      },
      {
        id: "start-opencode",
        label: "Start OpenCode!",
        command: "opencode",
        commandLabel: "Type this and press Enter",
        detail: "",
        expect:
          "A beautiful terminal interface should appear with a text box at the bottom where you can type prompts. You're in!",
      },
      {
        id: "select-model",
        label: "Select your AI model",
        detail: "Inside OpenCode, type the command below to see available models:",
        command: "/models",
        commandLabel: "Type this inside OpenCode",
        tip: "Choose DeepSeek V4 Pro or GLM 5.2 for the best results. DeepSeek V4 Flash is the fastest option.",
      },
      {
        id: "test-it",
        label: "Test it with a simple request!",
        detail: "Type a prompt to make sure everything is working:",
        command:
          'Create a simple HTML page that says "Hello World" with blue text and a yellow background',
        commandLabel: "Try typing this prompt",
        expect:
          "OpenCode should start generating code. If it does — congratulations, everything is working!",
      },
    ],
  },
  {
    id: "autostart",
    icon: "🔄",
    title: "Make 9Router Start Automatically",
    subtitle: "So you don't have to remember to start it every time",
    color: "#14b8a6",
    explainer:
      "Right now, every time you restart your computer, you'd have to open a terminal and type '9router' again. This step makes it start automatically when you log in.",
    steps: [
      {
        id: "create-shortcut",
        label: "Create a startup shortcut",
        substeps: [
          "Press Windows key + R (opens the Run dialog)",
          'Type shell:startup and press Enter',
          "A File Explorer window opens — this is your Startup folder",
          "Right-click in the empty space → New → Shortcut",
          "In the location box, paste the command below:",
        ],
        command: "cmd.exe /k 9router",
        commandLabel: "Paste this as the shortcut location",
        detail: 'Click Next, name it "9Router", and click Finish.',
        tip: "Now every time you log into Windows, 9Router will start automatically in a terminal window. You can minimize it to the taskbar.",
      },
    ],
  },
  {
    id: "done",
    icon: "🎉",
    title: "Understanding Your Setup & Costs",
    subtitle: "You did it! Here's what you built",
    color: "#22c55e",
    explainer: "",
    steps: [
      {
        id: "check-usage",
        label: "Know how to check your usage anytime",
        detail:
          'Open your browser, go to localhost:20128, and click "Usage" on the left sidebar. You\'ll see total requests, token counts, and estimated cost — just like the screenshot that inspired this whole setup.',
        tip: 'A "token" is roughly ¾ of a word. So 1,000 tokens ≈ 750 words. The screenshot showed 7.7 million tokens for ~$0.27 — that\'s roughly 5.8 million words processed for about a quarter.',
      },
      {
        id: "know-costs",
        label: "Understand your monthly costs",
        detail: "",
        visual: {
          type: "costs",
          items: [
            { item: "OpenCode Go subscription", cost: "$10/mo", note: "$5 first month" },
            { item: "9Router", cost: "Free", note: "Open source" },
            { item: "OpenCode", cost: "Free", note: "Open source" },
            { item: "Node.js", cost: "Free", note: "" },
            { item: "Windows Terminal", cost: "Free", note: "" },
          ],
        },
      },
    ],
  },
];

/* ───── tiny clipboard helper ───── */
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={copy}
      style={{
        background: copied ? "#22c55e" : "var(--accent-dim)",
        color: copied ? "#fff" : "var(--fg)",
        border: "none",
        borderRadius: 6,
        padding: "5px 12px",
        fontSize: 13,
        cursor: "pointer",
        fontWeight: 600,
        transition: "all .2s",
        whiteSpace: "nowrap",
      }}
    >
      {copied ? "✓ Copied!" : "📋 Copy"}
    </button>
  );
}

/* ───── command block ───── */
function CommandBlock({ command, label, breakdown }) {
  return (
    <div style={{ margin: "10px 0" }}>
      {label && (
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: ".5px",
            color: "var(--muted)",
            marginBottom: 4,
          }}
        >
          {label}
        </div>
      )}
      <div
        style={{
          background: "#1e293b",
          borderRadius: 10,
          padding: "14px 16px",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <pre
          style={{
            margin: 0,
            color: "#e2e8f0",
            fontSize: 15,
            fontFamily: "'Cascadia Code', 'Fira Code', 'Consolas', monospace",
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
            flex: 1,
            lineHeight: 1.5,
          }}
        >
          {command}
        </pre>
        <CopyButton text={command} />
      </div>
      {breakdown && (
        <div
          style={{
            marginTop: 8,
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            gap: "4px 12px",
            fontSize: 13,
            color: "var(--muted)",
            padding: "0 4px",
          }}
        >
          {breakdown.map((b) => (
            <React.Fragment key={b.piece}>
              <code
                style={{
                  background: "var(--accent-dim)",
                  padding: "1px 6px",
                  borderRadius: 4,
                  fontWeight: 600,
                  color: "var(--fg)",
                  fontSize: 12,
                }}
              >
                {b.piece}
              </code>
              <span>{b.meaning}</span>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}

/* ───── visual renderers ───── */
function VisualBlock({ visual }) {
  if (!visual) return null;

  if (visual.type === "icons") {
    return (
      <div
        style={{
          display: "flex",
          gap: 12,
          margin: "12px 0",
          flexWrap: "wrap",
        }}
      >
        {visual.items.map((it) => (
          <div
            key={it.name}
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: "14px 18px",
              textAlign: "center",
              flex: "1 1 120px",
              minWidth: 120,
            }}
          >
            <div style={{ fontSize: 28 }}>{it.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 14, marginTop: 4 }}>
              {it.name}
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>{it.desc}</div>
          </div>
        ))}
      </div>
    );
  }

  if (visual.type === "mockButton") {
    return (
      <div style={{ margin: "12px 0", textAlign: "center" }}>
        <div
          style={{
            display: "inline-block",
            background: visual.color,
            color: "#fff",
            padding: "14px 32px",
            borderRadius: 8,
            fontSize: 18,
            fontWeight: 700,
            pointerEvents: "none",
            boxShadow: "0 2px 8px rgba(0,0,0,.15)",
          }}
        >
          {visual.text}
        </div>
        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>
          ↑ The button looks something like this
        </div>
      </div>
    );
  }

  if (visual.type === "finder") {
    return (
      <div style={{ margin: "12px 0" }}>
        {visual.options.map((opt, i) => (
          <div
            key={i}
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: "12px 16px",
              marginBottom: 8,
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
            }}
          >
            <span
              style={{
                background: "var(--accent-dim)",
                borderRadius: "50%",
                width: 26,
                height: 26,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 13,
                flexShrink: 0,
                marginTop: 1,
              }}
            >
              {i === 0 ? "A" : "B"}
            </span>
            <span style={{ fontSize: 14 }}>{opt}</span>
          </div>
        ))}
      </div>
    );
  }

  if (visual.type === "wizard") {
    return (
      <div style={{ margin: "12px 0" }}>
        {visual.screens.map((s, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
              padding: "10px 0",
              borderBottom:
                i < visual.screens.length - 1
                  ? "1px solid var(--border)"
                  : "none",
            }}
          >
            <div
              style={{
                background: s.important ? "#f59e0b" : "var(--accent-dim)",
                color: s.important ? "#fff" : "var(--fg)",
                borderRadius: "50%",
                width: 28,
                height: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 13,
                flexShrink: 0,
              }}
            >
              {i + 1}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{s.screen}</div>
              <div
                style={{
                  fontSize: 14,
                  color: s.important ? "#f59e0b" : "var(--muted)",
                  fontWeight: s.important ? 600 : 400,
                }}
              >
                {s.action}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (visual.type === "priority") {
    return (
      <div style={{ margin: "12px 0" }}>
        {visual.items.map((it) => (
          <div
            key={it.rank}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 14px",
              background: "var(--card-bg)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              marginBottom: 8,
            }}
          >
            <div
              style={{
                background: `hsl(${260 - it.rank * 30}, 70%, 55%)`,
                color: "#fff",
                borderRadius: "50%",
                width: 34,
                height: 34,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 16,
                flexShrink: 0,
              }}
            >
              {it.rank}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{it.name}</div>
              <div style={{ fontSize: 13, color: "var(--muted)" }}>
                {it.desc}
              </div>
            </div>
            <span
              style={{
                background: "var(--accent-dim)",
                padding: "3px 10px",
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: ".3px",
                whiteSpace: "nowrap",
              }}
            >
              {it.tag}
            </span>
          </div>
        ))}
      </div>
    );
  }

  if (visual.type === "envvars") {
    return (
      <div style={{ margin: "12px 0" }}>
        {visual.vars.map((v) => (
          <div
            key={v.name}
            style={{
              background: "#1e293b",
              borderRadius: 10,
              padding: "14px 16px",
              marginBottom: 10,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 6,
              }}
            >
              <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>
                Variable name:
              </span>
              <CopyButton text={v.name} />
            </div>
            <pre
              style={{
                margin: 0,
                color: "#67e8f9",
                fontSize: 15,
                fontFamily: "monospace",
              }}
            >
              {v.name}
            </pre>
            <div
              style={{
                marginTop: 10,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 6,
              }}
            >
              <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>
                Variable value:
              </span>
              <CopyButton text={v.value} />
            </div>
            <pre
              style={{
                margin: 0,
                color: "#fde68a",
                fontSize: 15,
                fontFamily: "monospace",
                wordBreak: "break-all",
                whiteSpace: "pre-wrap",
              }}
            >
              {v.value}
            </pre>
            {v.note && (
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 6 }}>
                → {v.note}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (visual.type === "costs") {
    const total = "$10/month";
    return (
      <div style={{ margin: "12px 0" }}>
        {visual.items.map((it) => (
          <div
            key={it.item}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 14px",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <span style={{ fontSize: 15 }}>{it.item}</span>
            <div style={{ textAlign: "right" }}>
              <span
                style={{
                  fontWeight: 700,
                  color: it.cost === "Free" ? "#22c55e" : "var(--fg)",
                  fontSize: 15,
                }}
              >
                {it.cost}
              </span>
              {it.note && (
                <div style={{ fontSize: 11, color: "var(--muted)" }}>
                  {it.note}
                </div>
              )}
            </div>
          </div>
        ))}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "14px",
            background: "var(--accent-dim)",
            borderRadius: "0 0 10px 10px",
            fontWeight: 800,
            fontSize: 17,
          }}
        >
          <span>Total ongoing cost</span>
          <span>{total}</span>
        </div>
      </div>
    );
  }

  return null;
}

/* ───── single step row ───── */
function StepRow({ step, checked, onToggle, phaseColor }) {
  return (
    <div
      style={{
        padding: "16px 0",
        borderBottom: "1px solid var(--border)",
        opacity: checked ? 0.55 : 1,
        transition: "opacity .3s",
      }}
    >
      <label
        style={{
          display: "flex",
          gap: 12,
          cursor: "pointer",
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: 7,
            border: checked
              ? "none"
              : "2px solid var(--muted)",
            background: checked ? "#22c55e" : "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            marginTop: 1,
            transition: "all .2s",
          }}
        >
          {checked && (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M3.5 8.5L6.5 11.5L12.5 4.5"
                stroke="#fff"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: 16,
              lineHeight: 1.35,
              textDecoration: checked ? "line-through" : "none",
              color: checked ? "var(--muted)" : "var(--fg)",
            }}
          >
            {step.label}
          </div>
        </div>
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          style={{ display: "none" }}
        />
      </label>

      {!checked && (
        <div style={{ paddingLeft: 38, marginTop: 8 }}>
          {step.detail && (
            <p style={{ margin: "0 0 6px", fontSize: 14, lineHeight: 1.6, color: "var(--fg)" }}>
              {step.detail}
            </p>
          )}

          {step.substeps && (
            <ol
              style={{
                margin: "8px 0",
                paddingLeft: 20,
                fontSize: 14,
                lineHeight: 1.8,
                color: "var(--fg)",
              }}
            >
              {step.substeps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          )}

          <VisualBlock visual={step.visual} />

          {step.command && (
            <CommandBlock
              command={step.command}
              label={step.commandLabel}
              breakdown={step.commandBreakdown}
            />
          )}

          {step.detail2 && (
            <p style={{ margin: "8px 0 0", fontSize: 14, lineHeight: 1.6, color: "var(--fg)" }}>
              {step.detail2}
            </p>
          )}

          {step.followup && (
            <div style={{ marginTop: 12 }}>
              <CommandBlock
                command={step.followup.command}
                label={step.followup.commandLabel}
              />
              {step.followup.expect && (
                <div
                  style={{
                    background: "#ecfdf5",
                    color: "#065f46",
                    borderRadius: 8,
                    padding: "10px 14px",
                    fontSize: 13,
                    marginTop: 6,
                    borderLeft: "4px solid #22c55e",
                  }}
                >
                  ✅ {step.followup.expect}
                </div>
              )}
            </div>
          )}

          {step.expect && (
            <div
              style={{
                background: "#ecfdf5",
                color: "#065f46",
                borderRadius: 8,
                padding: "10px 14px",
                fontSize: 13,
                marginTop: 8,
                borderLeft: "4px solid #22c55e",
              }}
            >
              ✅ {step.expect}
            </div>
          )}

          {step.tip && (
            <div
              style={{
                background: step.warning ? "#fefce8" : "#eff6ff",
                color: step.warning ? "#854d0e" : "#1e40af",
                borderRadius: 8,
                padding: "10px 14px",
                fontSize: 13,
                marginTop: 8,
                borderLeft: `4px solid ${step.warning ? "#f59e0b" : "#3b82f6"}`,
              }}
            >
              {step.warning ? "⚠️" : "💡"} {step.tip}
            </div>
          )}

          {step.warning_box && (
            <div
              style={{
                background: "#fef2f2",
                color: "#991b1b",
                borderRadius: 8,
                padding: "12px 14px",
                fontSize: 14,
                marginTop: 8,
                borderLeft: "4px solid #ef4444",
                fontWeight: 600,
              }}
            >
              🚨 {step.warning_box}
            </div>
          )}

          {step.altMethod && (
            <details
              style={{
                marginTop: 12,
                background: "var(--card-bg)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "0 14px",
              }}
            >
              <summary
                style={{
                  padding: "12px 0",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: 14,
                  color: "var(--muted)",
                }}
              >
                🔧 {step.altMethod.title} (click to expand)
              </summary>
              <div style={{ paddingBottom: 14 }}>
                <p style={{ fontSize: 13, margin: "0 0 8px", color: "var(--fg)" }}>
                  {step.altMethod.detail}
                </p>
                {step.altMethod.commands?.map((c, i) => (
                  <CommandBlock key={i} command={c} />
                ))}
                {step.altMethod.then && (
                  <p style={{ fontSize: 13, margin: "8px 0", color: "var(--fg)" }}>
                    {step.altMethod.then}
                  </p>
                )}
                {step.altMethod.finalCommand && (
                  <CommandBlock command={step.altMethod.finalCommand} />
                )}
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  );
}

/* ───── troubleshooting section ───── */
const TROUBLESHOOTING = [
  {
    problem: '"9router is not recognized as a command"',
    fix: "Close your terminal, open a new one, and try again. If it still fails, re-run: npm install -g 9router",
  },
  {
    problem: '"node is not recognized"',
    fix: "Restart your computer. Node.js sometimes needs a reboot for Windows to notice it.",
  },
  {
    problem: "OpenCode can't connect to models",
    fix: "Check that: (1) 9Router is running in its terminal window, (2) your environment variables are set, (3) your API key is correct, (4) localhost:20128 loads in your browser.",
  },
  {
    problem: "9Router dashboard won't load",
    fix: 'Make sure 9Router is running. If you see a "port in use" error, try: 9router --port 20129 (then update your OPENAI_BASE_URL to use 20129).',
  },
  {
    problem: '"EPERM" or permission errors',
    fix: 'Right-click Windows Terminal → "Run as administrator" and try again.',
  },
  {
    problem: "Models are slow",
    fix: "Normal for free-tier models. DeepSeek V4 Flash is the fastest paid model. GLM 5.2 and Kimi K2.7 are slower but smarter.",
  },
];

const CHEATSHEET = [
  { what: "Start 9Router", cmd: "9router", where: "Terminal" },
  { what: "Open dashboard", cmd: "localhost:20128", where: "Browser" },
  { what: "Start OpenCode", cmd: "opencode", where: "Terminal (2nd window)" },
  { what: "Check Node version", cmd: "node --version", where: "Terminal" },
  { what: "Update 9Router", cmd: "npm install -g 9router", where: "Terminal" },
  { what: "Update OpenCode", cmd: "npm install -g opencode-ai@latest", where: "Terminal" },
  { what: "List models", cmd: "/models", where: "Inside OpenCode" },
  { what: "Undo last change", cmd: "/undo", where: "Inside OpenCode" },
  { what: "Switch modes", cmd: "Tab key", where: "Inside OpenCode" },
];

/* ═══════════ MAIN APP ═══════════ */
export default function App() {
  const [checked, setChecked] = useState({});
  const [expandedPhase, setExpandedPhase] = useState(PHASES[0].id);
  const phaseRefs = useRef({});

  const toggle = useCallback((stepId) => {
    setChecked((prev) => ({ ...prev, [stepId]: !prev[stepId] }));
  }, []);

  const totalSteps = PHASES.reduce((a, p) => a + p.steps.length, 0);
  const doneSteps = Object.values(checked).filter(Boolean).length;
  const pct = Math.round((doneSteps / totalSteps) * 100);

  const phaseComplete = (phase) =>
    phase.steps.every((s) => checked[s.id]);
  const phasePct = (phase) => {
    const done = phase.steps.filter((s) => checked[s.id]).length;
    return Math.round((done / phase.steps.length) * 100);
  };

  const togglePhase = (id) => {
    setExpandedPhase((prev) => (prev === id ? null : id));
  };

  return (
    <div
      style={{
        "--fg": "#1e293b",
        "--bg": "#f8fafc",
        "--card-bg": "#ffffff",
        "--border": "#e2e8f0",
        "--muted": "#64748b",
        "--accent-dim": "#f1f5f9",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: "var(--fg)",
        background: "var(--bg)",
        minHeight: "100vh",
        maxWidth: 740,
        margin: "0 auto",
        padding: "0 20px 80px",
      }}
    >
      {/* ── HEADER ── */}
      <div style={{ textAlign: "center", padding: "36px 0 10px" }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🚀</div>
        <h1
          style={{
            fontSize: 26,
            fontWeight: 800,
            margin: "0 0 6px",
            lineHeight: 1.25,
            letterSpacing: "-.3px",
          }}
        >
          AI Coding on a Budget
        </h1>
        <p
          style={{
            fontSize: 15,
            color: "var(--muted)",
            margin: 0,
            maxWidth: 480,
            marginLeft: "auto",
            marginRight: "auto",
            lineHeight: 1.5,
          }}
        >
          Set up 9Router + OpenCode on Windows 10 — step by step, with nothing
          assumed. Check off each step as you go.
        </p>
      </div>

      {/* ── WHAT YOU NEED ── */}
      <div
        style={{
          background: "#eff6ff",
          borderRadius: 14,
          padding: "18px 20px",
          margin: "20px 0 24px",
          borderLeft: "5px solid #3b82f6",
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>
          📦 Before you start, make sure you have:
        </div>
        <div style={{ fontSize: 14, lineHeight: 1.8 }}>
          ✔ Your Windows 10 computer — turned on, connected to the internet
          <br />
          ✔ A web browser (Chrome, Edge, or Firefox — whatever's already there)
          <br />
          ✔ A credit or debit card (for the $10/mo OpenCode Go subscription — $5
          first month)
          <br />
          ✔ About 30–45 minutes of quiet time
          <br />✔ A cup of coffee ☕
        </div>
      </div>

      {/* ── PROGRESS BAR ── */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "var(--bg)",
          padding: "12px 0 8px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: 6,
          }}
        >
          <span style={{ fontWeight: 700, fontSize: 14 }}>
            Overall progress
          </span>
          <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600 }}>
            {doneSteps} / {totalSteps} steps · {pct}%
          </span>
        </div>
        <div
          style={{
            height: 10,
            background: "#e2e8f0",
            borderRadius: 99,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              background:
                pct === 100
                  ? "#22c55e"
                  : "linear-gradient(90deg, #3b82f6, #8b5cf6)",
              borderRadius: 99,
              transition: "width .4s ease",
            }}
          />
        </div>
        {pct === 100 && (
          <div
            style={{
              textAlign: "center",
              marginTop: 8,
              fontSize: 15,
              fontWeight: 700,
              color: "#22c55e",
            }}
          >
            🎉 All done! You're set up and ready to code!
          </div>
        )}
      </div>

      {/* ── PHASES ── */}
      {PHASES.map((phase, phaseIdx) => {
        const isOpen = expandedPhase === phase.id;
        const done = phaseComplete(phase);
        const pp = phasePct(phase);
        return (
          <div
            key={phase.id}
            ref={(el) => (phaseRefs.current[phase.id] = el)}
            style={{
              background: "var(--card-bg)",
              borderRadius: 16,
              border: "1px solid var(--border)",
              marginTop: 16,
              overflow: "hidden",
              boxShadow: isOpen ? "0 4px 20px rgba(0,0,0,.06)" : "none",
              transition: "box-shadow .3s",
            }}
          >
            {/* phase header */}
            <button
              onClick={() => togglePhase(phase.id)}
              style={{
                width: "100%",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                padding: "18px 20px",
                display: "flex",
                alignItems: "center",
                gap: 14,
                textAlign: "left",
              }}
            >
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 12,
                  background: done ? "#dcfce7" : `${phase.color}15`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  flexShrink: 0,
                }}
              >
                {done ? "✅" : phase.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: ".8px",
                      color: phase.color,
                    }}
                  >
                    Phase {phaseIdx + 1}
                  </span>
                  {done && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        background: "#dcfce7",
                        color: "#166534",
                        padding: "2px 8px",
                        borderRadius: 20,
                      }}
                    >
                      COMPLETE
                    </span>
                  )}
                </div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 17,
                    lineHeight: 1.3,
                    color: "var(--fg)",
                  }}
                >
                  {phase.title}
                </div>
                <div style={{ fontSize: 13, color: "var(--muted)" }}>
                  {phase.subtitle}
                </div>
                {/* mini progress */}
                {!done && (
                  <div
                    style={{
                      marginTop: 6,
                      height: 4,
                      background: "#e2e8f0",
                      borderRadius: 99,
                      overflow: "hidden",
                      maxWidth: 180,
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${pp}%`,
                        background: phase.color,
                        borderRadius: 99,
                        transition: "width .3s",
                      }}
                    />
                  </div>
                )}
              </div>
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                style={{
                  transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform .3s",
                  flexShrink: 0,
                  color: "var(--muted)",
                }}
              >
                <path
                  d="M5 7.5L10 12.5L15 7.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </button>

            {/* phase body */}
            {isOpen && (
              <div style={{ padding: "0 20px 20px" }}>
                {phase.explainer && (
                  <div
                    style={{
                      background: `${phase.color}10`,
                      borderRadius: 10,
                      padding: "12px 16px",
                      fontSize: 14,
                      lineHeight: 1.65,
                      color: "var(--fg)",
                      marginBottom: 8,
                      borderLeft: `4px solid ${phase.color}`,
                    }}
                  >
                    {phase.explainer}
                  </div>
                )}
                {phase.steps.map((step) => (
                  <StepRow
                    key={step.id}
                    step={step}
                    checked={!!checked[step.id]}
                    onToggle={() => toggle(step.id)}
                    phaseColor={phase.color}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* ── TROUBLESHOOTING ── */}
      <div
        style={{
          background: "var(--card-bg)",
          borderRadius: 16,
          border: "1px solid var(--border)",
          marginTop: 24,
          overflow: "hidden",
        }}
      >
        <details>
          <summary
            style={{
              padding: "18px 20px",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: 17,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span style={{ fontSize: 24 }}>🔧</span> Troubleshooting — Common Problems & Fixes
          </summary>
          <div style={{ padding: "0 20px 20px" }}>
            {TROUBLESHOOTING.map((t, i) => (
              <div
                key={i}
                style={{
                  padding: "14px 0",
                  borderBottom:
                    i < TROUBLESHOOTING.length - 1
                      ? "1px solid var(--border)"
                      : "none",
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 14,
                    color: "#dc2626",
                    marginBottom: 4,
                  }}
                >
                  Problem: {t.problem}
                </div>
                <div style={{ fontSize: 14, color: "var(--fg)", lineHeight: 1.6 }}>
                  <strong style={{ color: "#16a34a" }}>Fix:</strong> {t.fix}
                </div>
              </div>
            ))}
          </div>
        </details>
      </div>

      {/* ── CHEAT SHEET ── */}
      <div
        style={{
          background: "var(--card-bg)",
          borderRadius: 16,
          border: "1px solid var(--border)",
          marginTop: 16,
          overflow: "hidden",
        }}
      >
        <details>
          <summary
            style={{
              padding: "18px 20px",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: 17,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span style={{ fontSize: 24 }}>📋</span> Quick-Reference Cheat Sheet
          </summary>
          <div style={{ padding: "0 20px 20px", overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 14,
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: "2px solid var(--border)",
                    textAlign: "left",
                  }}
                >
                  <th style={{ padding: "10px 8px", fontWeight: 700 }}>What</th>
                  <th style={{ padding: "10px 8px", fontWeight: 700 }}>Command</th>
                  <th style={{ padding: "10px 8px", fontWeight: 700 }}>Where</th>
                </tr>
              </thead>
              <tbody>
                {CHEATSHEET.map((row, i) => (
                  <tr
                    key={i}
                    style={{
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    <td style={{ padding: "10px 8px" }}>{row.what}</td>
                    <td style={{ padding: "10px 8px" }}>
                      <code
                        style={{
                          background: "#1e293b",
                          color: "#e2e8f0",
                          padding: "3px 8px",
                          borderRadius: 5,
                          fontSize: 13,
                          fontFamily: "monospace",
                        }}
                      >
                        {row.cmd}
                      </code>
                    </td>
                    <td
                      style={{
                        padding: "10px 8px",
                        color: "var(--muted)",
                        fontSize: 13,
                      }}
                    >
                      {row.where}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </div>

      {/* ── ARCHITECTURE DIAGRAM ── */}
      <div
        style={{
          background: "var(--card-bg)",
          borderRadius: 16,
          border: "1px solid var(--border)",
          marginTop: 16,
          padding: 20,
          textAlign: "center",
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 16 }}>
          How it all fits together
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 0,
            flexWrap: "wrap",
          }}
        >
          {[
            { icon: "🧑‍💻", label: "You", sub: "type prompts" },
            null,
            { icon: "🤖", label: "OpenCode", sub: "AI coding tool" },
            null,
            { icon: "🔀", label: "9Router", sub: "traffic controller" },
            null,
            { icon: "🧠", label: "AI Models", sub: "DeepSeek, GLM, etc." },
          ].map((item, i) =>
            item === null ? (
              <div
                key={`arrow-${i}`}
                style={{
                  fontSize: 22,
                  color: "var(--muted)",
                  padding: "0 4px",
                }}
              >
                →
              </div>
            ) : (
              <div
                key={item.label}
                style={{
                  background: "var(--accent-dim)",
                  borderRadius: 12,
                  padding: "14px 16px",
                  minWidth: 100,
                }}
              >
                <div style={{ fontSize: 28 }}>{item.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 13, marginTop: 4 }}>
                  {item.label}
                </div>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>
                  {item.sub}
                </div>
              </div>
            )
          )}
        </div>
      </div>

      <div
        style={{
          textAlign: "center",
          padding: "32px 0 0",
          fontSize: 14,
          color: "var(--muted)",
          lineHeight: 1.6,
        }}
      >
        Now go build something cool. 🚀
      </div>
    </div>
  );
}
