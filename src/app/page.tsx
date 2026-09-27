import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Experience from "@/components/Experience";
import Projects from "@/components/Projects";
import PersonalProjects from "@/components/PersonalProjects";
import Decalogue from "@/components/Decalogue";
import Footer from "@/components/Footer";
import RevealObserver from "@/components/RevealObserver";
import SheetFrame from "@/components/SheetFrame";

export default function Home() {
  return (
    <>
      <RevealObserver />
      {/* Sheet-frame corner registration ticks — decorative, hidden < 600px */}
      <SheetFrame />
      <Navbar />
      <main className="flex-1">
        <Hero />
        <About />
        <Experience />
        <Projects />
        <PersonalProjects />
        <Decalogue />
      </main>
      <Footer />
    </>
  );
}
