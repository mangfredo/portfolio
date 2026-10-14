import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Experience from "@/components/Experience";
import Projects from "@/components/Projects";
import PersonalProjects from "@/components/PersonalProjects";
import Decalogue from "@/components/Decalogue";
import Footer from "@/components/Footer";
import RevealObserver from "@/components/RevealObserver";

export default function Home() {
  return (
    <div className="eva-root">
      <RevealObserver />
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
    </div>
  );
}
