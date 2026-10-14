// Copy that used to live inline in Hero, About, section headers and Footer.
// Wording is kept verbatim from the pre-redesign components.

export const profile = {
  name: "Tristan Sereño",
  shortName: "T.Sereño",
  role: "Software Engineer · Full-Stack Developer",
  location: "Philippines · Remote",
  email: "tristansereno@gmail.com",
  linkedin: "https://www.linkedin.com/in/tristan-sere%C3%B1o-9b1b662a3/",
  photo: "/profile.jpg",
};

export const hero = {
  lines: [
    { words: ["I", "build", "the", "tools"], accent: false },
    { words: ["that", "build", "the"], accent: false },
    { words: ["product."], accent: true },
  ],
  // Rendered as: before + <strong>highlight</strong> + after
  intro: {
    before:
      "5+ years turning complex business problems into clean, fast systems. One recent project cut a 6-hour manual process down to under 10 minutes — a ",
    highlight: "97% efficiency gain",
    after: " that freed the team to focus on work that actually matters.",
  },
  ctas: [
    { href: "#work", label: "See the work", primary: true },
    { href: "#automation", label: "Automation suite", primary: false },
  ],
  terminalNote: "↑ this used to take 6 hours by hand",
  terminalHint: "try typing \"help\" ↑",
};

export const about = {
  label: "About",
  heading: "Engineer who ships real impact",
  paragraphs: [
    "I work across the full stack with TypeScript, Node.js, and React — but my real focus is automation and internal tooling. I like finding the slow, repetitive process that everyone just accepts, and replacing it with something that runs in seconds.",
    "Based in the Philippines, working remotely with teams across timezones. I'm comfortable async, I communicate clearly, and I don't need hand-holding to get things done.",
  ],
  // Last paragraph ends with an emphasised word
  closing: {
    before:
      "I care about the craft. Clean code, semantic HTML, accessible interfaces, fast load times. Not because a checklist says so, but because that's what separates software that works from software that ",
    emphasis: "lasts",
    after: ".",
  },
  stackLabel: "Core Stack",
};

export const sections = {
  experience: { heading: "Where I've worked", educationLabel: "Education", certificationsLabel: "Certifications" },
  work: {
    heading: "War Stories",
    intro:
      "Not a list of features. These are the problems I found, the systems I built to solve them, and what happened after.",
    aftermathLabel: "Aftermath:",
  },
  projects: {
    heading: "Client & Personal Work",
    intro:
      "Freelance builds, published apps, and side projects — each one started because something needed to exist and didn't.",
  },
  automation: {
    heading: "Workflow Automation Systems",
    intro:
      "Built at Rival HR — a collection of production-used browser automation scripts that eliminate repetitive QA and development tasks.",
    nda: "These tools were developed under NDA for internal use. Source code and live demos cannot be shared publicly.",
    impactLabel: "IMPACT",
  },
};

export const contact = {
  heading: "Let's build something.",
  body: "I'm open to full-time roles, contract work, and interesting freelance projects. If you have a problem that needs solving, I'd like to hear about it.",
  builtWith: "Next.js · Tailwind · Vercel",
};
