"use client";

import { useEffect, useRef } from "react";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ title, onClose, children }: ModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6"
      style={{ background: "rgba(11,19,37,0.6)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
    >
      <div
        className="w-full max-w-sm rounded-xl border p-6"
        style={{
          background: "#FFFFFF",
          borderColor: "#E2E8F0",
          boxShadow: "0 20px 40px rgba(11,19,37,0.18)",
        }}
      >
        <div className="flex items-center justify-between mb-5">
          <h3
            className="font-semibold text-base"
            style={{ color: "#0F172A", fontFamily: "var(--bt-font-ui, Inter, sans-serif)" }}
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-xs transition-colors hover:bg-gray-100"
            style={{ color: "#64748B" }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
