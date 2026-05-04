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

// Phases: idle -> typing -> output -> done
type Phase = "idle" | "typing" | "output" | "done";

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
  const cancelRef = useRef(false);

  const theme = themes[themeIndex];

  const runAnimation = useCallback(() => {
    cancelRef.current = false;
    setPhase("typing");
    setTypedChars(0);
    setVisibleOutputs(0);
    setShowSuccess(false);
    setShowFinalPrompt(false);

    // Phase 1: Typewriter for command
    let charIdx = 0;
    function typeNext() {
      if (cancelRef.current) return;
      charIdx++;
      setTypedChars(charIdx);
      if (charIdx < COMMAND_TEXT.length) {
        setTimeout(typeNext, 10 + Math.random() * 15);
      } else {
        // Command done, pause then show outputs
        setTimeout(showOutputs, 400);
      }
    }

    // Phase 2: Output lines appear with realistic delays (totaling ~8.2s)
    function showOutputs() {
      if (cancelRef.current) return;
      setPhase("output");
      let lineIdx = 0;

      function nextLine() {
        if (cancelRef.current) return;
        lineIdx++;
        setVisibleOutputs(lineIdx);
        if (lineIdx < outputLines.length) {
          // Use the current line's delay before showing the next one
          setTimeout(nextLine, outputLines[lineIdx].delay);
        } else {
          // All outputs shown, show success after a beat
          setTimeout(() => {
            if (cancelRef.current) return;
            setShowSuccess(true);
            setTimeout(() => {
              if (cancelRef.current) return;
              setShowFinalPrompt(true);
              setPhase("done");
              onComplete?.();
            }, 300);
          }, 350);
        }
      }

      // Show first line immediately, then wait its delay before the next
      setTimeout(() => {
        if (cancelRef.current) return;
        nextLine();
        // Wait the first line's processing time before showing line 2
      }, 100);
    }

    setTimeout(typeNext, 200);
  }, []);

  // Start animation when startTyping becomes true
  useEffect(() => {
    if (startTyping && phase === "idle") {
      runAnimation();
    }
  }, [startTyping, phase, runAnimation]);

  function cycleTheme() {
    cancelRef.current = true;
    setThemeIndex((prev) => (prev + 1) % themes.length);
    // Show everything instantly — no replay animation
    setTypedChars(COMMAND_TEXT.length);
    setVisibleOutputs(outputLines.length);
    setShowSuccess(true);
    setShowFinalPrompt(true);
    setPhase("done");
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
        <div className="p-5 font-mono text-sm leading-relaxed transition-colors duration-300" style={{ minHeight: "200px" }}>
          {/* Command line with typewriter */}
          {phase !== "idle" && (
            <p style={{ color: theme.textColor }}>
              <span style={{ color: theme.promptColor }}>{theme.prompt}</span>{" "}
              {COMMAND_TEXT.slice(0, typedChars)}
              {phase === "typing" && <span className="cursor-blink">▊</span>}
            </p>
          )}

          {/* Output lines */}
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

          {/* Final prompt with cursor */}
          <p
            style={{
              color: theme.textColor,
              opacity: showFinalPrompt ? 1 : 0,
              transition: "opacity 0.2s ease",
            }}
          >
            <span style={{ color: theme.promptColor }}>{theme.prompt}</span>{" "}
            <span className="cursor-blink">▊</span>
          </p>
        </div>
      </div>
    </div>
  );
}
