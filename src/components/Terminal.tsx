"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const themes = [
  {
    id: "macos",
    label: "macOS",
    headerBg: "var(--card-bg)",
    headerBorder: "var(--card-border)",
    bodyBg: "var(--card-bg)",
    border: "var(--card-border)",
    radius: "0.5rem",
    titleBar: (
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full" style={{ background: "#ff5f57" }} />
        <span className="w-3 h-3 rounded-full" style={{ background: "#febc2e" }} />
        <span className="w-3 h-3 rounded-full" style={{ background: "#28c840" }} />
      </div>
    ),
    titleText: "~/projects/offer-letter-engine",
    prompt: "$",
    promptColor: "var(--accent-bright)",
    textColor: "var(--fg-muted)",
    successColor: "var(--accent-bright)",
    arrowColor: "var(--accent)",
    errorColor: "#e85050",
  },
  {
    id: "linux",
    label: "Linux",
    headerBg: "#2d2d2d",
    headerBorder: "#404040",
    bodyBg: "#1a1a2e",
    border: "#404040",
    radius: "0.5rem",
    titleBar: (
      <div className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-sm border" style={{ borderColor: "#666", background: "transparent" }} />
        <span className="w-2.5 h-2.5 rounded-sm border" style={{ borderColor: "#666", background: "transparent" }} />
        <span className="w-2.5 h-2.5 rounded-sm" style={{ background: "#e85050" }} />
      </div>
    ),
    titleText: "tristan@dev:~/projects/offer-letter-engine",
    prompt: "tristan@dev:~$",
    promptColor: "#5af78e",
    textColor: "#a9b1d6",
    successColor: "#5af78e",
    arrowColor: "#7aa2f7",
    errorColor: "#f7768e",
  },
  {
    id: "windows",
    label: "PowerShell",
    headerBg: "#012456",
    headerBorder: "#012456",
    bodyBg: "#012456",
    border: "#1a3a6a",
    radius: "0.5rem",
    titleBar: (
      <div className="flex items-center gap-3">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
    ),
    titleText: "Windows PowerShell",
    prompt: "PS C:\\projects>",
    promptColor: "#ffff00",
    textColor: "#cccccc",
    successColor: "#54ff54",
    arrowColor: "#cccccc",
    errorColor: "#ff5555",
  },
  {
    id: "retro",
    label: "Retro",
    headerBg: "#000080",
    headerBorder: "#000080",
    bodyBg: "#000000",
    border: "#c0c0c0",
    radius: "0",
    titleBar: (
      <div className="flex items-center gap-1">
        <span className="text-xs font-bold" style={{ color: "#ffffff" }}>■</span>
      </div>
    ),
    titleText: "C:\\PROJECTS\\OFFER-LETTER-ENGINE",
    prompt: "C:\\>",
    promptColor: "#c0c0c0",
    textColor: "#00ff00",
    successColor: "#00ff00",
    arrowColor: "#00ff00",
    errorColor: "#ff0000",
  },
  {
    id: "ubuntu",
    label: "Ubuntu",
    headerBg: "#300a24",
    headerBorder: "#5c2d4f",
    bodyBg: "#300a24",
    border: "#5c2d4f",
    radius: "0.75rem",
    titleBar: (
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full" style={{ background: "#e95420" }} />
        <span className="w-3 h-3 rounded-full" style={{ background: "#848484" }} />
        <span className="w-3 h-3 rounded-full" style={{ background: "#848484" }} />
      </div>
    ),
    titleText: "tristan@ubuntu:~/projects/offer-letter-engine",
    prompt: "tristan@ubuntu:~$",
    promptColor: "#4e9a06",
    textColor: "#d3d7cf",
    successColor: "#4e9a06",
    arrowColor: "#729fcf",
    errorColor: "#ef2929",
  },
];

const COMMAND_TEXT = "node server/index.js --generate WD_SWE_Contract_Retail.docx";

const outputLines = [
  { arrow: true, text: "Extracting .docx content (tables, paragraphs)...", delay: 1800 },
  { arrow: true, text: "Mapping profile fields + event categories...", delay: 1400 },
  { arrow: true, text: "Parsing contract body → AST (53 condition blocks)", delay: 2200 },
  { arrow: true, text: "Compiling placeholders + rendering to JS...", delay: 1200 },
  { arrow: true, text: "Validating output against schema...", delay: 1600 },
];

const SUCCESS_TEXT = "✓ Generated WD_SWE_Contract_Retail.js in 8.2s";

// Theme-aware command responses
function getCommands(themeId: string): Record<string, string[]> {
  const isWindows = themeId === "windows" || themeId === "retro";

  const base: Record<string, string[]> = {
    help: isWindows ? [
      "Available commands:",
      "  help            Show this message",
      "  about           About the developer",
      "  skills          List technical skills",
      "  contact         Contact information",
      "  projects        List projects",
      "  cls             Clear terminal",
      "  whoami          Current user",
      "  dir             List files",
      "  type resume     View resume summary",
      "  experience      Career timeline",
      "  runas /hire me  You know what to do",
    ] : [
      "Available commands:",
      "  help            Show this message",
      "  about           About the developer",
      "  skills          List technical skills",
      "  contact         Contact information",
      "  projects        List projects",
      "  clear           Clear terminal",
      "  whoami          Current user",
      "  ls              List files",
      "  cat resume      View resume summary",
      "  experience      Career timeline",
      "  sudo hire me    You know what to do",
    ],
    about: [
      "# 5+ years of full-stack development.",
      "# Based in the Philippines; specialized in seamless remote collaboration.",
      "# Status: Open to work",
    ],
    skills: [
      "Languages:  TypeScript, JavaScript, C#, Python, Java, PHP",
      "Frontend:   React, Next.js, Tailwind CSS",
      "Backend:    Node.js, PostgreSQL, MySQL, Firebase",
      "Tooling:    Git, Docker, Kubernetes, VS Code Extensions",
    ],
    contact: [
      "Email:    tristansereno@gmail.com",
      "LinkedIn: https://www.linkedin.com/in/tristan-sere%C3%B1o-9b1b662a3/",
    ],
    projects: [
      "01  Offer Letter Automation Engine     #work",
      "02  Enterprise Automation Suite        #automation",
      "03  Smart Quote Replacer              #work",
      "04  Numerra Calculator                https://apps.microsoft.com/detail/9npwb2bk246z",
      "05  ywcims.com                        https://ywcims.com/home.html",
      "06  Zamora Gym App                    https://github.com/mangfredo/Zamora-Gym-App",
      "07  FixME: Capstone Project           https://github.com/mangfredo/Fix-Me-Game",
      "08  ExoTECH                           https://github.com/mangfredo/Exotech",
      "09  JOBSearch                         https://github.com/mangfredo/JOBSearch",
      "10  Task Management App              https://github.com/mangfredo/Task-Management-App",
    ],
    whoami: isWindows
      ? ["DESKTOP-TRISTAN\\tristan"]
      : themeId === "ubuntu"
      ? ["tristan@ubuntu"]
      : ["tristan"],
    ls: isWindows ? [
      " Directory of C:\\projects\\offer-letter-engine",
      "",
      " 05/05/2026  08:30 AM    <DIR>          server",
      " 05/05/2026  08:30 AM    <DIR>          config",
      " 05/05/2026  08:30 AM    <DIR>          web",
      " 05/05/2026  08:30 AM    <DIR>          files",
      " 05/05/2026  08:30 AM             1,204 package.json",
      " 05/05/2026  08:30 AM               342 README.md",
    ] : [
      "server/        config/        web/           files/",
      "package.json   README.md      .gitignore",
    ],
    dir: isWindows ? [
      " Directory of C:\\projects\\offer-letter-engine",
      "",
      " 05/05/2026  08:30 AM    <DIR>          server",
      " 05/05/2026  08:30 AM    <DIR>          config",
      " 05/05/2026  08:30 AM    <DIR>          web",
      " 05/05/2026  08:30 AM    <DIR>          files",
      " 05/05/2026  08:30 AM             1,204 package.json",
      " 05/05/2026  08:30 AM               342 README.md",
    ] : ["dir: command not found. Did you mean 'ls'?"],
    "cat resume": [
      "# Tristan Sereño",
      "Software Engineer | 5+ years experience",
      "Focus: Automation, Internal Tooling, Full-Stack TypeScript",
      "Notable: Built a system that cut 6-hour processes to 10 minutes",
    ],
    "type resume": isWindows ? [
      "# Tristan Sereño",
      "Software Engineer | 5+ years experience",
      "Focus: Automation, Internal Tooling, Full-Stack TypeScript",
      "Notable: Built a system that cut 6-hour processes to 10 minutes",
    ] : ["type: command not found. Did you mean 'cat'?"],
    "sudo hire me": isWindows
      ? ["'sudo' is not recognized as an internal or external command.", "Try: runas /hire me"]
      : ["✓ Excellent choice. Sending offer letter... just kidding.", "  But seriously — let's talk. tristansereno@gmail.com"],
    "runas /hire me": isWindows
      ? ["✓ Excellent choice. Sending offer letter... just kidding.", "  But seriously — let's talk. tristansereno@gmail.com"]
      : ["runas: command not found. Did you mean 'sudo hire me'?"],
    pwd: isWindows
      ? ["C:\\projects\\offer-letter-engine"]
      : ["/home/tristan/projects/offer-letter-engine"],
    cd: isWindows
      ? ["C:\\projects\\offer-letter-engine"]
      : ["tristan: no directory specified"],
    date: [new Date().toUTCString()],
    echo: ["Usage: echo <message>"],
    cls: ["__CLEAR__"],
    experience: [
      "2025 - Present    Software Engineer (Technical Solutions)",
      "2021 - Present    Full-Stack Engineer (Freelance/Contract)",
      "2025              Graduated STI College Caloocan",
      '2021              > console.log("Hello World")',
    ],
    neofetch: isWindows ? [
      "  tristan@DESKTOP-TRISTAN",
      "  ─────────────────────────",
      "  OS:     Windows 11 Pro (Next.js 16)",
      "  Host:   Vercel Edge Network",
      "  Shell:  PowerShell 7.4",
      "  Theme:  Forest Green / Terracotta",
    ] : themeId === "ubuntu" ? [
      "  tristan@ubuntu",
      "  ─────────────────",
      "  OS:     Ubuntu 24.04 LTS (Next.js 16)",
      "  Host:   Vercel Edge Network",
      "  Shell:  bash 5.2",
      "  Theme:  Forest Green / Terracotta",
    ] : [
      "  tristan@portfolio",
      "  ─────────────────",
      "  OS:     Next.js 16 + Tailwind",
      "  Host:   Vercel Edge Network",
      "  Shell:  Interactive Portfolio Terminal",
      "  Theme:  Forest Green / Terracotta",
    ],
  };

  return base;
}

type Phase = "idle" | "typing" | "output" | "done" | "interactive";

// Render text with auto-linked URLs, emails, and #anchors
function renderLinkedText(text: string, theme: typeof themes[0]) {
  // Match URLs, emails, and #section anchors
  const linkRegex = /(https?:\/\/[^\s]+)|([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})|(#[a-z]+)/g;
  const parts: (string | { type: "url" | "email" | "anchor"; value: string })[] = [];
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[1]) {
      parts.push({ type: "url", value: match[1] });
    } else if (match[2]) {
      parts.push({ type: "email", value: match[2] });
    } else if (match[3]) {
      parts.push({ type: "anchor", value: match[3] });
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  // If no links found, return plain text
  if (parts.length === 1 && typeof parts[0] === "string") {
    return text;
  }

  return parts.map((part, i) => {
    if (typeof part === "string") return <span key={i}>{part}</span>;
    if (part.type === "anchor") {
      return (
        <a
          key={i}
          href={part.value}
          className="underline decoration-dotted underline-offset-2 transition-colors hover:opacity-80"
          style={{ color: theme.successColor }}
        >
          {part.value}
        </a>
      );
    }
    const href = part.type === "email" ? `mailto:${part.value}` : part.value;
    // Shorten display for long URLs
    let display = part.value;
    if (part.type === "url" && display.length > 45) {
      display = display.slice(0, 42) + "...";
    }
    return (
      <a
        key={i}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="underline decoration-dotted underline-offset-2 transition-colors hover:opacity-80"
        style={{ color: theme.successColor }}
      >
        {display}
      </a>
    );
  });
}

interface HistoryLine {
  type: "command" | "output" | "success" | "error" | "arrow";
  text: string;
}

interface TerminalProps {
  startTyping?: boolean;
  onComplete?: () => void;
}

export default function Terminal({ startTyping = true, onComplete }: TerminalProps) {
  const [themeIndex, setThemeIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [typedChars, setTypedChars] = useState(0);
  const [visibleOutputs, setVisibleOutputs] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFinalPrompt, setShowFinalPrompt] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [history, setHistory] = useState<HistoryLine[]>([]);
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [cmdHistoryIdx, setCmdHistoryIdx] = useState(-1);
  const [cursorPos, setCursorPos] = useState(0);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; hasSelection: boolean } | null>(null);
  const cancelRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  const theme = themes[themeIndex];

  // Contain text selection within terminal body
  // Make surrounding content unselectable while selecting inside terminal
  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;

    function onMouseDown(e: MouseEvent) {
      if (body!.contains(e.target as Node)) {
        // Started selecting inside terminal — disable selection on everything else
        document.body.style.userSelect = "none";
        document.body.style.webkitUserSelect = "none";
        body!.style.userSelect = "text";
        body!.style.webkitUserSelect = "text";
      }
    }

    function onMouseUp() {
      // Re-enable selection everywhere
      document.body.style.userSelect = "";
      document.body.style.webkitUserSelect = "";
      body!.style.userSelect = "";
      body!.style.webkitUserSelect = "";
    }

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseup", onMouseUp);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseup", onMouseUp);
      // Cleanup in case component unmounts mid-select
      document.body.style.userSelect = "";
      document.body.style.webkitUserSelect = "";
    };
  }, []);

  // Auto-scroll to bottom when history changes
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [history, showFinalPrompt, phase]);

  const runAnimation = useCallback(() => {
    cancelRef.current = false;
    setPhase("typing");
    setTypedChars(0);
    setVisibleOutputs(0);
    setShowSuccess(false);
    setShowFinalPrompt(false);
    setHistory([]);

    let charIdx = 0;
    function typeNext() {
      if (cancelRef.current) return;
      charIdx++;
      setTypedChars(charIdx);
      if (charIdx < COMMAND_TEXT.length) {
        setTimeout(typeNext, 10 + Math.random() * 15);
      } else {
        setTimeout(showOutputs, 400);
      }
    }

    function showOutputs() {
      if (cancelRef.current) return;
      setPhase("output");
      let lineIdx = 0;

      function nextLine() {
        if (cancelRef.current) return;
        lineIdx++;
        setVisibleOutputs(lineIdx);
        if (lineIdx < outputLines.length) {
          setTimeout(nextLine, outputLines[lineIdx].delay);
        } else {
          setTimeout(() => {
            if (cancelRef.current) return;
            setShowSuccess(true);
            setTimeout(() => {
              if (cancelRef.current) return;
              setShowFinalPrompt(true);
              setPhase("interactive");
              onComplete?.();
            }, 300);
          }, 350);
        }
      }

      setTimeout(() => {
        if (cancelRef.current) return;
        nextLine();
      }, 100);
    }

    setTimeout(typeNext, 200);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (startTyping && phase === "idle") {
      runAnimation();
    }
  }, [startTyping, phase, runAnimation]);

  function cycleTheme() {
    cancelRef.current = true;
    setThemeIndex((prev) => (prev + 1) % themes.length);
    setTypedChars(COMMAND_TEXT.length);
    setVisibleOutputs(outputLines.length);
    setShowSuccess(true);
    setShowFinalPrompt(true);
    setPhase("interactive");
    // Clear interactive history so stale theme-specific output doesn't persist
    setHistory([]);
    setUserInput("");
    setCursorPos(0);
  }

  // Close context menu on click anywhere or scroll
  useEffect(() => {
    function close() { setContextMenu(null); }
    window.addEventListener("click", close);
    window.addEventListener("scroll", close, true);
    return () => {
      window.removeEventListener("click", close);
      window.removeEventListener("scroll", close, true);
    };
  }, []);

  function updateCursorPos() {
    if (inputRef.current) {
      setCursorPos(inputRef.current.selectionStart ?? userInput.length);
    }
  }

  function handleCommand(input: string) {
    const trimmed = input.trim().toLowerCase().replace(/\s+/g, " ");
    const newHistory: HistoryLine[] = [
      ...history,
      { type: "command", text: input },
    ];

    if (trimmed === "clear" || trimmed === "cls") {
      setHistory([]);
      setUserInput("");
      setCursorPos(0);
      return;
    }

    const cmds = getCommands(theme.id);

    // Check for echo with argument
    if (trimmed.startsWith("echo ")) {
      const msg = input.trim().slice(5);
      newHistory.push({ type: "output", text: msg });
    } else if (cmds[trimmed]) {
      const response = cmds[trimmed];
      if (response[0] === "__CLEAR__") {
        setHistory([]);
        setUserInput("");
        setCursorPos(0);
        return;
      }
      for (const line of response) {
        newHistory.push({ type: "output", text: line });
      }
    } else if (trimmed === "") {
      // Empty command, just add a new prompt
    } else {
      newHistory.push({
        type: "error",
        text: `command not found: ${input.trim()}. Type "help" for available commands.`,
      });
    }

    setHistory(newHistory);
    setCmdHistory((prev) => [input, ...prev]);
    setCmdHistoryIdx(-1);
    setUserInput("");
    setCursorPos(0);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      handleCommand(userInput);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (cmdHistory.length > 0) {
        const nextIdx = Math.min(cmdHistoryIdx + 1, cmdHistory.length - 1);
        setCmdHistoryIdx(nextIdx);
        setUserInput(cmdHistory[nextIdx]);
        setCursorPos(cmdHistory[nextIdx].length);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (cmdHistoryIdx > 0) {
        const nextIdx = cmdHistoryIdx - 1;
        setCmdHistoryIdx(nextIdx);
        setUserInput(cmdHistory[nextIdx]);
        setCursorPos(cmdHistory[nextIdx].length);
      } else {
        setCmdHistoryIdx(-1);
        setUserInput("");
        setCursorPos(0);
      }
    } else if (e.ctrlKey && e.key.length === 1) {
      e.preventDefault();
      const letter = e.key.toUpperCase();

      if (letter === "L") {
        // Ctrl+L: clear
        setHistory([]);
      } else if (letter === "C") {
        // Ctrl+C: show ^C and cancel current input
        setHistory((prev) => [
          ...prev,
          { type: "command", text: userInput + "^C" },
        ]);
        setUserInput("");
        setCursorPos(0);
      } else if (letter === "U") {
        // Ctrl+U: clear line
        setUserInput("");
        setCursorPos(0);
      } else if (letter === "A") {
        // Ctrl+A: select all in input
        if (inputRef.current) {
          inputRef.current.select();
          setCursorPos(userInput.length);
        }
      } else if (letter === "E") {
        // Ctrl+E: move to end
        setCursorPos(userInput.length);
        if (inputRef.current) {
          inputRef.current.setSelectionRange(userInput.length, userInput.length);
        }
      }
      // All other Ctrl combos are silently ignored (no ^letter output)
    }
  }

  // Context menu handlers
  function handleContextMenu(e: React.MouseEvent) {
    if (phase !== "interactive") return;
    e.preventDefault();
    e.stopPropagation();
    const bodyEl = bodyRef.current;
    if (!bodyEl) return;
    const rect = bodyEl.getBoundingClientRect();

    // Position relative to the body div, accounting for scroll
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top + bodyEl.scrollTop;

    // Check if menu would overflow the visible area bottom
    const menuHeight = 120;
    const visibleBottom = bodyEl.scrollTop + bodyEl.clientHeight;
    const flipUp = (y + menuHeight) > visibleBottom;

    const sel = window.getSelection();
    const hasSelection = !!(sel && sel.toString().trim());

    setContextMenu({
      x,
      y: flipUp ? y - menuHeight : y,
      hasSelection,
    });
  }

  async function handlePaste() {
    setContextMenu(null);
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        const before = userInput.slice(0, cursorPos);
        const after = userInput.slice(cursorPos);
        const newVal = before + text + after;
        setUserInput(newVal);
        setCursorPos(cursorPos + text.length);
        inputRef.current?.focus();
      }
    } catch {
      // Clipboard access denied
      setHistory((prev) => [
        ...prev,
        { type: "error", text: "clipboard: permission denied" },
      ]);
    }
  }

  function handleCopy() {
    setContextMenu(null);
    const sel = window.getSelection();
    if (sel && sel.toString()) {
      navigator.clipboard.writeText(sel.toString());
    }
    inputRef.current?.focus();
  }

  function handleSelectAll() {
    setContextMenu(null);
    if (inputRef.current) {
      inputRef.current.select();
      setCursorPos(userInput.length);
    }
  }

  function handleClearFromMenu() {
    setContextMenu(null);
    setHistory([]);
    inputRef.current?.focus();
  }

  function focusInput() {
    if (phase !== "interactive" || !inputRef.current) return;
    // Don't steal focus if user is selecting text
    const sel = window.getSelection();
    if (sel && sel.toString().trim()) return;
    inputRef.current.focus();
  }

  return (
    <div className="w-full relative">
      {/* Theme toggle button */}
      <button
        onClick={cycleTheme}
        className="absolute -top-3 -right-3 z-10 px-2.5 py-1 rounded-full font-mono text-[0.6rem] uppercase tracking-wider border transition-all hover:scale-105 cursor-pointer select-none"
        style={{
          background: "var(--card-bg)",
          borderColor: "var(--card-border)",
          color: "var(--fg-muted)",
        }}
        aria-label="Switch terminal theme"
        title={`Current: ${theme.label}. Click to switch.`}
      >
        {theme.label}
      </button>

      <div
        className="overflow-hidden border transition-all duration-300"
        style={{
          background: theme.bodyBg,
          borderColor: theme.border,
          borderRadius: theme.radius,
        }}
        onClick={focusInput}
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-4 py-2.5 border-b transition-all duration-300"
          style={{ background: theme.headerBg, borderColor: theme.headerBorder }}
        >
          {theme.titleBar}
          <span className="ml-1 font-mono text-xs truncate transition-colors duration-300" style={{ color: theme.textColor }}>
            {theme.titleText}
          </span>
        </div>

        {/* Body */}
        <div
          ref={bodyRef}
          className="p-5 font-mono text-sm leading-relaxed transition-colors duration-300 overflow-y-auto relative terminal-body"
          style={{ minHeight: "200px", maxHeight: "350px" }}
          onContextMenu={handleContextMenu}
        >
          {/* Initial animated command */}
          {phase !== "idle" && (
            <p style={{ color: theme.textColor }}>
              <span style={{ color: theme.promptColor }}>{theme.prompt}</span>{" "}
              {COMMAND_TEXT.slice(0, typedChars)}
              {phase === "typing" && <span className="cursor-blink">▊</span>}
            </p>
          )}

          {/* Animated output lines */}
          {outputLines.map((line, i) => (
            <p
              key={i}
              style={{
                color: theme.textColor,
                opacity: i < visibleOutputs ? 1 : 0,
                transform: i < visibleOutputs ? "translateY(0)" : "translateY(6px)",
                transition: "opacity 0.25s ease, transform 0.25s ease",
                marginTop: i === 0 ? "0.5rem" : undefined,
              }}
            >
              <span style={{ color: theme.arrowColor }}>→</span> {line.text}
            </p>
          ))}

          {/* Success line */}
          <p
            className="mt-2"
            style={{
              color: theme.successColor,
              opacity: showSuccess ? 1 : 0,
              transform: showSuccess ? "translateY(0)" : "translateY(6px)",
              transition: "opacity 0.3s ease, transform 0.3s ease",
            }}
          >
            {SUCCESS_TEXT}
          </p>

          {/* Interactive history */}
          {history.map((line, i) => (
            <p key={`h-${i}`} className="whitespace-pre-wrap" style={{ color: line.type === "error" ? theme.errorColor : theme.textColor }}>
              {line.type === "command" && (
                <><span style={{ color: theme.promptColor }}>{theme.prompt}</span>{" "}</>
              )}
              {line.type === "error" && <span style={{ color: theme.errorColor }}>{line.text}</span>}
              {line.type === "output" && renderLinkedText(line.text, theme)}
              {line.type === "command" && line.text}
            </p>
          ))}

          {/* Interactive input line */}
          {phase === "interactive" && (
            <p className="flex items-center" style={{ color: theme.textColor }}>
              <span style={{ color: theme.promptColor }}>{theme.prompt}</span>
              <span>&nbsp;</span>
              <span className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={userInput}
                  onChange={(e) => {
                    setUserInput(e.target.value);
                    setTimeout(updateCursorPos, 0);
                  }}
                  onKeyDown={(e) => {
                    handleKeyDown(e);
                    setTimeout(updateCursorPos, 0);
                  }}
                  onKeyUp={updateCursorPos}
                  onClick={updateCursorPos}
                  onSelect={updateCursorPos}
                  onPaste={(e) => e.preventDefault()}
                  className="bg-transparent border-none outline-none font-mono text-sm w-full caret-transparent"
                  style={{ color: theme.textColor }}
                  spellCheck={false}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  data-form-type="other"
                  aria-label="Terminal input"
                />
                {/* Custom cursor that follows actual caret position */}
                <span
                  className="absolute top-0 cursor-blink pointer-events-none"
                  style={{
                    left: `${cursorPos}ch`,
                    color: theme.textColor,
                  }}
                >
                  ▊
                </span>
              </span>
            </p>
          )}

          {/* Static final prompt (before interactive mode) */}
          {showFinalPrompt && phase !== "interactive" && (
            <p style={{ color: theme.textColor, opacity: 1 }}>
              <span style={{ color: theme.promptColor }}>{theme.prompt}</span>{" "}
              <span className="cursor-blink">▊</span>
            </p>
          )}

          {/* Right-click context menu */}
          {contextMenu && (
            <div
              className="absolute z-50 rounded-md border shadow-lg py-1 font-mono text-xs min-w-[160px]"
              style={{
                left: contextMenu.x,
                top: contextMenu.y,
                background: "var(--card-bg)",
                borderColor: "var(--card-border)",
                color: "var(--fg-muted)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {contextMenu.hasSelection && (
                <button
                  onClick={handleCopy}
                  className="w-full text-left px-3 py-1.5 hover:bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] transition-colors flex justify-between items-center"
                >
                  <span>Copy</span>
                  <span className="opacity-40 ml-4">⌃C</span>
                </button>
              )}
              <button
                onClick={handlePaste}
                className="w-full text-left px-3 py-1.5 hover:bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] transition-colors flex justify-between items-center"
              >
                <span>Paste</span>
                <span className="opacity-40 ml-4">⌃V</span>
              </button>
              <div className="my-1 border-t" style={{ borderColor: "var(--card-border)" }} />
              <button
                onClick={handleSelectAll}
                className="w-full text-left px-3 py-1.5 hover:bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] transition-colors flex justify-between items-center"
              >
                <span>Select All</span>
                <span className="opacity-40 ml-4">⌃A</span>
              </button>
              <button
                onClick={handleClearFromMenu}
                className="w-full text-left px-3 py-1.5 hover:bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] transition-colors flex justify-between items-center"
              >
                <span>Clear</span>
                <span className="opacity-40 ml-4">⌃L</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
