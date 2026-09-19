"use client";

import { useEffect, useRef } from "react";
import { X } from "@phosphor-icons/react";

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
      className="wf-modal-overlay"
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
    >
      <div className="wf-modal">
        <div className="wf-modal-title">
          <span>{title}</span>
          <button
            onClick={onClose}
            className="wf-icon-btn"
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
