export const projects = [
  {
    sheet: "01",
    title: "The Offer Letter Engine",
    why: "I was watching a colleague spend an entire afternoon manually converting a Word document into JavaScript. Same structure every time, same rules, same mistakes. I thought: this should take seconds, not hours.",
    story:
      "Built a parsing engine in Node.js backed by PostgreSQL that takes a Word document containing contract details, extracts the content, applies strict validation rules, and generates production-ready JavaScript — handling complex edge cases across multiple countries and employment types. Code generation completes in roughly 10 seconds. The full end-to-end process takes under 10 minutes, down from 6 hours.",
    aftermath:
      "The company's CTO and Director of Engineering is planning the core logic for integration into the flagship self-service product.",
    tags: ["Node.js", "Django/DRF", "PostgreSQL", "Parsing Engine", "Validation"],
    metric: "97%+",
    metricLabel: "time saved",
    nda: "Due to confidentiality, only a demonstration of the tool's workflow is shown — illustrating how it converts document specs into production-ready code.",
    video: "/offer_letter_tool_demo.mp4",
    link: null,
  },
  {
    sheet: "02",
    title: "Enterprise Workflow Automation Suite",
    why: "Every developer on the team was doing the same 15-click dance through Jira, QA tools, and internal systems — multiple times a day. Nobody questioned it because 'that's just how it works.' I questioned it.",
    story:
      "Developed a suite of browser-based automation scripts (Tampermonkey) to streamline navigation, automate Jira workflows, and integrate internal tools into a unified workflow. DOM manipulation, event interception, handling lazy-loaded elements and dynamic content — all designed to work with existing enterprise tools without any backend changes.",
    aftermath:
      "Independently designed and deployed. Actively used across the team — saving an estimated 2–3 hours of dev time per day when used consistently.",
    tags: ["JavaScript", "Tampermonkey", "DOM Manipulation", "Browser Automation"],
    metric: "10+",
    metricLabel: "tools built",
    nda: null,
    video: null,
    link: { href: "#automation", label: "See all tools" },
  },
  {
    sheet: "03",
    title: "Smart Quote Replacer — VS Code Extension",
    why: "Contract files needed specific typographic quotation marks — straight, curly, styled. Getting them wrong caused rendering issues. Getting them right by hand was tedious and error-prone. So I built an extension that does it automatically.",
    story:
      "A VS Code extension that intelligently replaces escaped quotes with context-aware typographic equivalents. It evaluates surrounding characters to determine correct opening and closing quotation marks, supports preview mode, and adds right-click context menu actions for quick fixes.",
    aftermath:
      "Adopted as a multi-role tool used by both developers and QA engineers, integrated into the team's daily development and review process. Currently on v2.2.",
    tags: ["VS Code Extension", "JavaScript", "Regex", "Developer Tooling"],
    metric: "v2.2",
    metricLabel: "current",
    nda: null,
    video: "/smart_quote_replacer_demo.mp4",
    link: null,
  },
];

