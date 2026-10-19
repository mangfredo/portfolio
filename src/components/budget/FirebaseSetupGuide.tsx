"use client";

import { useState } from "react";
import { ArrowSquareOut, CopySimple, CaretLeft, CaretRight } from "@phosphor-icons/react";
import { FIRESTORE_RULES } from "@/lib/firebaseSync";
import type { ToastType } from "@/hooks/useToast";

interface FirebaseSetupGuideProps {
  /** projectId from a saved config — enables direct links into that project's console */
  projectId?: string;
  onBack: () => void;
  onFinish: () => void;
  onToast: (msg: string, type?: ToastType) => void;
}

const CONSOLE = "https://console.firebase.google.com";

interface Step {
  title: string;
  items: React.ReactNode[];
  link?: { href: string; label: string };
  rules?: boolean;
}

function buildSteps(projectId: string | undefined, host: string): Step[] {
  const project = projectId ? `${CONSOLE}/project/${projectId}` : undefined;
  return [
    {
      title: "Create a Firebase project",
      items: [
        <>Sign in with your Google account and click <b>Create a project</b> (or <b>Get started with a Firebase project</b>).</>,
        <>Enter a name, e.g. <code>laanflow</code>, and accept the terms.</>,
        <>Turn <b>Google Analytics off</b> — LaanFlow doesn&apos;t use it.</>,
        <>Click <b>Create project</b>, wait, then <b>Continue</b>.</>,
        <>The free <b>Spark</b> plan is enough — skip any &ldquo;Upgrade&rdquo; prompts.</>,
      ],
      link: { href: CONSOLE, label: "Open Firebase console" },
    },
    {
      title: "Register a web app",
      items: [
        <>On the project overview, click the <b>Web</b> icon (<code>&lt;/&gt;</code>), or <b>+ Add app → Web</b>.</>,
        <>Give it a nickname, e.g. <code>LaanFlow web</code>. Leave <b>Firebase Hosting</b> unticked.</>,
        <>Click <b>Register app</b> and copy the whole <code>firebaseConfig</code> block.</>,
        <>Skip the <code>npm install</code> step and click <b>Continue to console</b>.</>,
        <>Lost it? <b>Gear icon → Project settings → General → Your apps → SDK setup and configuration → Config</b>.</>,
      ],
      link: project ? { href: `${project}/settings/general`, label: "Open project settings" } : undefined,
    },
    {
      title: "Turn on Google sign-in",
      items: [
        <>In the left sidebar, click the <b>people icon</b> (Authentication), just below the gear.</>,
        <>Open the <b>Sign-in method</b> tab and click <b>Add new provider → Google</b>.</>,
        <>Switch on <b>Enable</b>, choose a <b>support email</b>, then <b>Save</b>.</>,
        <>On the <b>Settings</b> tab → <b>Authorized domains</b>, make sure <code>{host}</code> is listed (<code>localhost</code> is there by default).</>,
      ],
      link: project ? { href: `${project}/authentication/providers`, label: "Open Authentication" } : undefined,
    },
    {
      title: "Create the Firestore database",
      items: [
        <>Click the <b>search icon</b> at the top of the sidebar, type <b>Firestore</b>, and open <b>Firestore Database</b>.</>,
        <>Click <b>Create database</b>. If asked for an edition, choose <b>Standard</b> and keep the ID <code>(default)</code>.</>,
        <>Pick a <b>location</b> near you — it can&apos;t be changed later.</>,
        <>Choose <b>Start in production mode</b> and click <b>Create</b>.</>,
      ],
      link: project ? { href: `${project}/firestore`, label: "Open Firestore" } : undefined,
    },
    {
      title: "Add the security rules",
      items: [
        <>In Firestore, open the <b>Rules</b> tab.</>,
        <>Replace everything with the rules below and click <b>Publish</b>.</>,
        <>These let only you — signed in with Google — read and write your data.</>,
      ],
      link: project ? { href: `${project}/firestore/databases/-default-/rules`, label: "Open Firestore rules" } : undefined,
      rules: true,
    },
    {
      title: "Connect LaanFlow",
      items: [
        <>Paste the <code>firebaseConfig</code> from step 2 and click <b>Save config</b>.</>,
        <>Click <b>Sign in with Google</b> (allow the popup if your browser blocks it).</>,
        <>Choose how to start: upload this browser&apos;s data, or use what&apos;s already in the cloud.</>,
        <>After that, changes sync automatically.</>,
      ],
    },
  ];
}

export default function FirebaseSetupGuide({ projectId, onBack, onFinish, onToast }: FirebaseSetupGuideProps) {
  const [step, setStep] = useState(0);
  const host = typeof window !== "undefined" ? window.location.hostname : "your site";
  const steps = buildSteps(projectId, host);
  const s = steps[step];
  const last = step === steps.length - 1;

  async function copyRules() {
    try { await navigator.clipboard.writeText(FIRESTORE_RULES); onToast("Rules copied", "success"); }
    catch { onToast("Couldn't copy — select the rules manually", "error"); }
  }

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }} aria-hidden="true">
        {steps.map((_, i) => (
          <span key={i} style={{
            height: 4, flex: 1, borderRadius: 2,
            background: i <= step ? "var(--wf-cyan)" : "var(--wf-border)",
            transition: "background 200ms ease",
          }} />
        ))}
      </div>

      <div aria-live="polite">
        <p style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--wf-muted)", margin: "0 0 4px" }}>
          Step {step + 1} of {steps.length}
        </p>
        <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--wf-text)", margin: 0 }}>{s.title}</h3>
      </div>

      <ol style={{ margin: 0, paddingLeft: "1.1rem", display: "grid", gap: 8, fontSize: "0.8rem", lineHeight: 1.55, color: "var(--wf-text)", listStyle: "decimal" }}>
        {s.items.map((item, i) => <li key={i}>{item}</li>)}
      </ol>

      {s.rules && (
        <div style={{ position: "relative" }}>
          <pre className="wf-input wf-input-data" style={{ fontSize: "0.7rem", whiteSpace: "pre", overflowX: "auto", margin: 0 }}>{FIRESTORE_RULES}</pre>
          <button onClick={copyRules} className="wf-icon-btn" title="Copy rules" aria-label="Copy rules"
            style={{ position: "absolute", top: 6, right: 6 }}>
            <CopySimple size={14} />
          </button>
        </div>
      )}

      {s.link && (
        <a href={s.link.href} target="_blank" rel="noopener noreferrer"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.8rem", fontWeight: 600, color: "var(--wf-cyan)" }}>
          {s.link.label} <ArrowSquareOut size={14} />
        </a>
      )}

      <div className="flex gap-3 pt-1">
        <button onClick={() => (step === 0 ? onBack() : setStep(step - 1))}
          className="wf-btn-ghost flex-1 py-2.5" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <CaretLeft size={14} /> {step === 0 ? "Back" : "Previous"}
        </button>
        <button onClick={() => (last ? onFinish() : setStep(step + 1))}
          className="wf-btn-primary flex-1 py-2.5" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          {last ? "Paste my config" : <>Next <CaretRight size={14} /></>}
        </button>
      </div>
    </div>
  );
}
