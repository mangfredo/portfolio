import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Projects from "@/components/Projects";
import PersonalProjects from "@/components/PersonalProjects";
import Decalogue from "@/components/Decalogue";
import Infrastructure from "@/components/Infrastructure";
import Footer from "@/components/Footer";
import SelectionInverter from "@/components/SelectionInverter";

export default function Home() {
  return (
    <>
      <SelectionInverter />
      <Navbar />
      <main className="flex-1">
        <Hero />
        <About />
        <Projects />
        <PersonalProjects />
        <Decalogue />
        <Infrastructure />
      </main>
      <Footer />
    </>
  );
}
