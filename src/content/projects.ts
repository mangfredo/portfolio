// A write-up section: paragraphs (strings, **bold** allowed) and bullet lists (string arrays)
export type WriteupSection = { heading: string; blocks: (string | string[])[] };

const epriseWriteup: WriteupSection[] = [
  {
    heading: "1. How everything connects",
    blocks: [
      "The easiest way to explain it is that Claude Code is the brain, the MCP tools are what it can do, the Node.js bridge connects everything, and the Chrome extension lets it interact with ePrise.",
      "When I open the side panel, Chrome starts my local Node.js bridge through Native Messaging. The bridge runs Claude Code with restricted permissions and connects it to my custom MCP server.",
      "When Claude wants to do something in ePrise, the request goes through the side panel, which checks whether approval is required based on the current mode and whether the site is production. It then sends the request to the correct tab and frame.",
      "From there, the content scripts handle the actual work inside ePrise. Different scripts handle reading and navigating the database tree, saving and uploading files, working with the Form Designer, and reading or updating fields. I also built a way for Claude to run JavaScript directly on the page so it can inspect the live interface instead of guessing.",
      "Some operations, like PDF processing and updating the extension's theme files, run locally through the bridge rather than inside the browser.",
      "Once the action finishes, the result goes back to Claude and appears in the chat. Each action also gets a success or failure indicator, and the bridge keeps a log.",
    ],
  },
  {
    heading: "2. How I approached the development",
    blocks: [
      "I didn't start by connecting Claude and letting it do everything. I built this in stages because ePrise is a legacy platform, and I needed to understand how it actually worked before allowing an AI agent to interact with it.",
      "**First, I studied the existing platform.**",
      "I manually dumped the pages to understand their structure, looked at the existing userscripts to learn how certain workflows behaved, and examined ePrise's own GET endpoints for reading data. This gave me a reference for how the platform worked instead of relying entirely on what was visible on screen.",
      "**Then I started with read-only capabilities.**",
      "I created tools that allowed Claude to list, read, search, and open items in ePrise. This meant it could explore the platform and understand the data before I gave it the ability to make changes.",
      "**After that, I added actions and safety controls.**",
      "I gradually introduced tools for saving changes, filling fields, copying and uploading files, creating folders, and creating forms and versions. I added approval controls, then introduced Manual and Auto modes, while keeping production operations behind mandatory approval.",
      "I also restricted Claude's permissions. It doesn't have general shell access or unrestricted file editing. Instead, it works through the specific tools I've exposed to it.",
    ],
  },
  {
    heading: "3. The self-correcting UI workflow",
    blocks: [
      "This was one of the more interesting parts of the project.",
      "Initially, I would dump a page and give it to Claude Code so it could help me modify the extension. The problem was that Claude couldn't reliably understand the live page, especially when it had to guess selectors or deal with nested frames.",
      "So I integrated a way for Claude to inspect the actual page.",
      "Now, it can run JavaScript in the browser, inspect the DOM, identify elements and fields, check frames, and try temporary CSS changes directly on the live interface. It can see whether the proposed change actually works before I approve making it permanent.",
      "Once I've approved a working fix, Claude can update the extension's CSS and manifest. Changes are backed up and can be undone.",
      "That changed the workflow from me manually investigating every UI issue and fixing it myself to an iterative process where Claude can inspect the problem, try an approach, check the result, and refine its own implementation.",
    ],
  },
  {
    heading: "4. How I tested and improved it",
    blocks: [
      "I didn't build everything in one go. I added capabilities incrementally, tested them, and used the issues I encountered to guide the next iteration.",
      "For each feature, I planned the implementation, checked the JavaScript for syntax errors, ran headless Chrome tests for the panel logic, and then tested the actual extension against our test environment.",
      "The headless tests use a stubbed Chrome API, so they don't replace testing the real extension. The live tests were important because ePrise has behaviors that aren't easy to reproduce in a simulated environment.",
      "For example:",
      [
        "I found a caching issue where a copied file wasn't immediately visible until the page was reloaded.",
        "I discovered that saving after every field could break the next update because publishing reloaded the page. I changed the workflow to save once at the end.",
        "I found that updating TinyMCE's hidden textarea didn't reliably update the actual editor content, so I had to change how the agent interacted with it.",
      ],
      "Each issue helped me improve the tools and make the workflow more reliable.",
      "I also documented each version in a handoff file, including what changed, how I tested it, and what still needed live verification. That made it easier to continue development across sessions.",
    ],
  },
  {
    heading: "5. What Claude can do inside ePrise",
    blocks: [
      "Once the integration and safety controls were in place, I expanded the MCP tools to cover more complex workflows.",
      "Claude can now:",
      [
        "Create forms and new form versions.",
        "Update form layouts, scripts, and field definitions.",
        "Copy and upload files.",
        "Inspect PDF templates, add fields, and validate field mappings.",
        "Explore unfamiliar parts of the interface.",
        "Follow step-by-step playbooks for portal setup.",
      ],
      "I also built separate PDF tools using pdf.js and pdf-lib, since Claude's restricted environment couldn't directly run the scripts needed for PDF inspection and mapping.",
      "The goal was to give Claude specific, controlled capabilities for working with ePrise instead of giving it unrestricted access to the computer and hoping it would do the right thing.",
    ],
  },
  {
    heading: "6. The result",
    blocks: [
      "The biggest measurable result so far is form creation. A process that previously took around **7–8 hours now takes under 15 minutes in my testing**.",
      "But the broader achievement is the system behind it: I started with a UI modernization project, integrated Claude Code, built a way for it to inspect and improve its own extension implementation, and then expanded it into an agent that can perform actual ePrise operations through custom MCP tools.",
      "That's what I think makes this more than just a chatbot added to a legacy platform.",
    ],
  },
];

export const projects = [
  {
    sheet: "01",
    title: "The ePrise AI Agent",
    why: "ePrise is a legacy platform, and creating a form in it took around 7–8 hours. Dumping pages into an AI didn't fix that: it couldn't reliably read the live interface, guessed selectors, and got lost in nested frames.",
    story:
      "Built a Chrome extension that connects Claude Code to ePrise through a local Node.js bridge (Native Messaging) and custom MCP tools. I built it in stages. First I studied the platform, then added read-only tools, then actions behind approval controls, with Manual and Auto modes and mandatory approval on production. Claude has no general shell access and works only through the tools I exposed. It can inspect the live page, try a fix, and, once I approve it, update its own extension UI, with backups and undo.",
    aftermath:
      "In my testing, one form-creation workflow went from around 7–8 hours to under 15 minutes. Claude can now create forms and versions, update layouts, scripts and field definitions, inspect and map PDF templates, and follow step-by-step playbooks for portal setup. Production changes always need approval.",
    tags: ["Claude Code", "MCP", "Node.js", "Chrome Extension", "Native Messaging", "pdf.js / pdf-lib"],
    metric: "<15 min",
    metricLabel: "tested form workflow (was 7–8 hrs)",
    nda: "Built for internal use at Rival HR. Source code, production access, and live demonstrations are not publicly available. This page gives a high-level overview of the architecture and non-sensitive implementation details.",
    video: null,
    link: null,
    compare: { before: "/eprise_before.png", after: "/eprise_after.png" },
    writeup: epriseWriteup,
  },
  {
    sheet: "02",
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
    compare: null,
    writeup: null,
  },
  {
    sheet: "03",
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
    compare: null,
    writeup: null,
  },
  {
    sheet: "04",
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
    compare: null,
    writeup: null,
  },
];

