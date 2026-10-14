"use client";

import { useState } from "react";
import EditorFile, { Mark } from "./ide/EditorFile";
import { contact, profile } from "@/content/profile";

const DEFAULT_SUBJECT = "Hello from your portfolio";

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="cj-copy"
      onClick={() => {
        navigator.clipboard?.writeText(value).then(() => {
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1500);
        });
      }}
      aria-label={`Copy ${label}`}
    >
      {copied ? "✓ copied" : "copy"}
    </button>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();
  const [message, setMessage] = useState("");

  // No backend — the message is handed to the visitor's mail app or to Gmail on the web
  function push(via: "app" | "gmail" = "app") {
    const text = message.trim();
    if (!text) return;
    const [first, ...rest] = text.split("\n");
    const subject = encodeURIComponent(rest.length ? first : DEFAULT_SUBJECT);
    const body = encodeURIComponent(rest.length ? rest.join("\n").trim() : text);
    const to = encodeURIComponent(profile.email);

    if (via === "gmail") {
      window.open(
        `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${subject}&body=${body}`,
        "_blank",
        "noopener,noreferrer"
      );
    } else {
      window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
    }
  }

  return (
    <>
      <EditorFile id="contact" label="Contact">
        <p className="ln ide-comment mb-3">{"// contact.json"}</p>
        <h2 className="ln ide-h2 mb-4">
          <Mark>##</Mark>
          {contact.heading}
        </h2>
        <p className="ln ide-lead mb-8">{contact.body}</p>

        <div className="ln contact-grid">
          {/* ── Source Control panel ── */}
          <form
            className="scm"
            onSubmit={(e) => {
              e.preventDefault();
              push();
            }}
            aria-label="Send a message"
          >
            <div className="scm__head">
              <span>Source Control</span>
              <span className="scm__branch" aria-hidden="true">
                ⎇ main
              </span>
            </div>
            <label className="sr-only" htmlFor="scm-message">
              Message
            </label>
            <textarea
              id="scm-message"
              className="scm__input"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  push();
                }
              }}
              placeholder={"Message (Ctrl+Enter to commit)\n\nFirst line becomes the subject."}
            />
            <div className="scm__actions">
              <button type="submit" className="ide-btn ide-btn--primary scm__push" disabled={!message.trim()}>
                <span aria-hidden="true">✓</span> Commit &amp; Push
              </button>
              <button
                type="button"
                className="ide-btn scm__push"
                disabled={!message.trim()}
                onClick={() => push("gmail")}
              >
                <span aria-hidden="true">↗</span> Push via Gmail
              </button>
            </div>
            <p className="scm__note">
              Commit &amp; Push opens your email app; Push via Gmail opens Gmail in a new tab. Both are addressed to{" "}
              {profile.email}.
            </p>
          </form>

          {/* ── contact.json ── */}
          <div className="ide-pane contact-json">
            <div className="ide-pane__bar">
              <span className="ide-ficon ide-ficon--json" aria-hidden="true">
                {"{}"}
              </span>
              <span className="ide-pane__bar-title">contact.json</span>
            </div>
            <div className="ide-code">
              <div className="ide-code__line">
                <span className="tok-punct">{"{"}</span>
              </div>
              <div className="ide-code__line">
                <span className="ide-code__content" style={{ paddingLeft: "2ch" }}>
                  <span className="tok-key">&quot;email&quot;</span>
                  <span className="tok-punct">: </span>
                  <a href={`mailto:${profile.email}`}>&quot;{profile.email}&quot;</a>
                  <span className="tok-punct">,</span>
                  <CopyButton value={profile.email} label="email address" />
                </span>
              </div>
              <div className="ide-code__line">
                <span className="ide-code__content" style={{ paddingLeft: "2ch" }}>
                  <span className="tok-key">&quot;linkedin&quot;</span>
                  <span className="tok-punct">: </span>
                  <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">
                    &quot;LinkedIn ↗&quot;
                  </a>
                  <CopyButton value={profile.linkedin} label="LinkedIn URL" />
                </span>
              </div>
              <div className="ide-code__line">
                <span className="tok-punct">{"}"}</span>
              </div>
            </div>
          </div>
        </div>
      </EditorFile>

      <footer className="ide-footer" aria-label="Footer">
        {`// © ${year} ${profile.shortName} · ${contact.builtWith}`}
      </footer>
    </>
  );
}
