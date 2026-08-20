import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Tracks from "@/components/sections/Tracks";
import Timeline from "@/components/sections/Timeline";
import Prizes from "@/components/sections/Prizes";
import Sponsors from "@/components/sections/Sponsors";
import FAQ from "@/components/sections/FAQ";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-white overflow-x-hidden text-slate-900">
      <Navbar />
      <Hero />
      <About />
      <Tracks />
      <Timeline />

      <Sponsors />
      <FAQ />
      <Contact />
      <Footer />
    </main>
  );
}
