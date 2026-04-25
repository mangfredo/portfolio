"use client";

import { useEffect } from "react";

export default function SelectionInverter() {
  useEffect(() => {
    function handleSelection() {
      const sel = window.getSelection();
      const hasSelection = sel && sel.toString().length > 0;

      document.querySelectorAll(".sel-btn").forEach((el) => {
        if (hasSelection && sel!.containsNode(el, true)) {
          el.classList.add("sel-btn-active");
        } else {
          el.classList.remove("sel-btn-active");
        }
      });
    }

    document.addEventListener("selectionchange", handleSelection);
    return () => document.removeEventListener("selectionchange", handleSelection);
  }, []);

  return null;
}
