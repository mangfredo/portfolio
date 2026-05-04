import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Projects from "@/components/Projects";
import PersonalProjects from "@/components/PersonalProjects";
import Decalogue from "@/components/Decalogue";
import Footer from "@/components/Footer";
import RevealObserver from "@/components/RevealObserver";
import CursorGlow from "@/components/CursorGlow";
import SelectionInverter from "@/components/SelectionInverter";

export default function Home() {
  return (
    <>
      <SelectionInverter />
      <RevealObserver />
      <CursorGlow />
      <Navbar />
      <main className="flex-1">
        <Hero />
        <About />
        <Projects />
        <PersonalProjects />
        <Decalogue />
      </main>
      <Footer />
    </>
  );
}
