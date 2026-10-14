import IdeShell from "@/components/ide/IdeShell";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Experience from "@/components/Experience";
import Projects from "@/components/Projects";
import PersonalProjects from "@/components/PersonalProjects";
import Decalogue from "@/components/Decalogue";
import Footer from "@/components/Footer";
import "./ide.css";
import "./ide-views.css";
import "./ide-sections.css";

export default function Home() {
  return (
    <IdeShell>
      <Hero />
      <About />
      <Experience />
      <Projects />
      <PersonalProjects />
      <Decalogue />
      <Footer />
    </IdeShell>
  );
}
