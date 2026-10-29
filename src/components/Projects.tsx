"use client";

import { useState } from "react";
import Image from "next/image";
import LazyVideo from "./LazyVideo";
import BeforeAfter from "./BeforeAfter";
import EditorFile, { Mark } from "./ide/EditorFile";
import { slugify } from "./ide/files";
import { projects } from "@/content/projects";
import { profile, sections } from "@/content/profile";
import { splitEmphasis } from "@/lib/emphasis";

type Project = (typeof projects)[number];

function Emphasis({ text }: { text: string }) {
  return (
    <>
      {splitEmphasis(text).map((s, i) => (s.em ? <strong key={i}>{s.text}</strong> : s.text))}
    </>
  );
}

function Avatar() {
  return (
    <span className="pr-avatar" aria-hidden="true">
      <Image src={profile.photo} alt="" width={28} height={28} />
    </span>
  );
}

// One war story as a merged pull request: problem → change → review
function PullRequest({ p }: { p: Project }) {
  const slug = slugify(p.title);
  const hasFiles = !!(p.video || p.nda || p.writeup);
  const [tab, setTab] = useState<"conversation" | "files">("conversation");
  const tabId = (t: string) => `pr-${slug}-${t}`;

  return (
    <article id={`work-${slug}`} className="pr ln" style={{ scrollMarginTop: "calc(var(--ide-top) + 1rem)" }}>
      <header className="pr__head">
        <h3 className="pr__title">
          {p.title} <span className="pr__num">#{p.sheet}</span>
        </h3>
        <div className="pr__meta">
          <span className="pr__state">
            <span aria-hidden="true">⑂</span> Merged
          </span>
          <span className="pr__check" aria-label={`${p.metric} ${p.metricLabel}`}>
            <span aria-hidden="true">✓</span> <strong>{p.metric}</strong> {p.metricLabel}
          </span>
          <span className="pr__branch" aria-hidden="true">
            {slug} → main
          </span>
        </div>
      </header>

      {hasFiles && (
        <div className="pr__tabs" role="tablist" aria-label={`${p.title} pull request`}>
          {(["conversation", "files"] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              id={tabId(`${t}-tab`)}
              aria-selected={tab === t}
              aria-controls={tabId(t)}
              className="pr__tab"
              onClick={() => setTab(t)}
            >
              {t === "conversation" ? "Conversation" : "Files changed"}
            </button>
          ))}
        </div>
      )}

      {/* Both panels stay in the DOM so all text is indexed */}
      <div
        id={tabId("conversation")}
        role={hasFiles ? "tabpanel" : undefined}
        aria-labelledby={hasFiles ? tabId("conversation-tab") : undefined}
        hidden={tab !== "conversation"}
        className="pr__body"
      >
        <ol className="pr-thread">
          <li className="pr-comment">
            <Avatar />
            <div className="pr-comment__box">
              <p className="pr-comment__by">
                <strong>{profile.name}</strong> opened this · <span className="pr-tag">problem</span>
              </p>
              <blockquote className="pr-comment__text pr-comment__text--quote">{p.why}</blockquote>
            </div>
          </li>
          <li className="pr-comment">
            <Avatar />
            <div className="pr-comment__box">
              <p className="pr-comment__by">
                <strong>{profile.name}</strong> pushed the fix · <span className="pr-tag">solution</span>
              </p>
              <p className="pr-comment__text">{p.story}</p>
            </div>
          </li>
          {p.compare && (
            <li className="pr-comment">
              <Avatar />
              <div className="pr-comment__box">
                <p className="pr-comment__by">
                  <strong>{profile.name}</strong> attached a screenshot · <span className="pr-tag">before / after</span>
                </p>
                <BeforeAfter before={p.compare.before} after={p.compare.after} title={p.title} />
              </div>
            </li>
          )}
          <li className="pr-comment pr-comment--review">
            <span className="pr-review-icon" aria-hidden="true">
              ✓
            </span>
            <div className="pr-comment__box">
              <p className="pr-comment__by">
                <span className="story__label">{sections.work.aftermathLabel}</span>
                <span className="pr-approved">approved</span>
              </p>
              <p className="pr-comment__text">{p.aftermath}</p>
            </div>
          </li>
        </ol>
      </div>

      {hasFiles && (
        <div
          id={tabId("files")}
          role="tabpanel"
          aria-labelledby={tabId("files-tab")}
          hidden={tab !== "files"}
          className="pr__body"
        >
          {p.nda && (
            <div className="ide-warn mb-4">
              <span className="ide-warn__icon" aria-hidden="true">
                ⚠
              </span>
              <p>{p.nda}</p>
            </div>
          )}
          {p.video && tab === "files" && (
            <div className="story__preview" style={{ marginTop: 0 }}>
              <div className="ide-pane__bar">
                <span aria-hidden="true">▶</span>
                <span className="ide-pane__bar-title">Preview</span>
                <span className="tok-com">{p.video.replace("/", "")}</span>
              </div>
              <LazyVideo src={p.video} className="overflow-hidden" />
            </div>
          )}
          {p.writeup && (
            <div className="story__preview" style={p.nda ? undefined : { marginTop: 0 }}>
              <div className="ide-pane__bar">
                <span aria-hidden="true">📄</span>
                <span className="ide-pane__bar-title">HOW_I_BUILT_IT.md</span>
              </div>
              <div className="pr-writeup">
                <h4>How I Built {p.title.replace(/^The /, "the ")}</h4>
                {p.writeup.map((sec) => (
                  <section key={sec.heading}>
                    <h5>{sec.heading}</h5>
                    {sec.blocks.map((b, i) =>
                      Array.isArray(b) ? (
                        <ul key={i}>
                          {b.map((item) => (
                            <li key={item}>
                              <Emphasis text={item} />
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p key={i}>
                          <Emphasis text={b} />
                        </p>
                      )
                    )}
                  </section>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <footer className="pr__foot">
        <span className="pr__labels-title">Labels</span>
        {p.tags.map((t) => (
          <span key={t} className="pr-label">
            {t}
          </span>
        ))}
        {p.video && tab === "conversation" && (
          <button type="button" className="ide-link pr__demo" onClick={() => setTab("files")}>
            ▶ Watch demo
          </button>
        )}
        {p.writeup && tab === "conversation" && (
          <button type="button" className="ide-link pr__demo" onClick={() => setTab("files")}>
            📄 Read the write-up
          </button>
        )}
        {p.link && (
          <a href={p.link.href} className="ide-link pr__demo">
            {p.link.label} →
          </a>
        )}
      </footer>
    </article>
  );
}

export default function Projects() {
  return (
    <EditorFile id="work" label="Work">
      <p className="ln ide-comment mb-3">
        <span className="tok-kw" style={{ fontStyle: "normal" }}>$</span> gh pr list --state merged
      </p>
      <h2 className="ln ide-h2 mb-4">
        <Mark>##</Mark>
        {sections.work.heading}
      </h2>
      <p className="ln ide-lead mb-12">{sections.work.intro}</p>

      {projects.map((p) => (
        <PullRequest key={p.sheet} p={p} />
      ))}
    </EditorFile>
  );
}
