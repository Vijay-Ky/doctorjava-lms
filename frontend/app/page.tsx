import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import TrustStrip from "@/components/TrustStrip";
import WhyUs from "@/components/WhyUs";
import Platform from "@/components/Platform";
import Timeline from "@/components/Timeline";
import Course from "@/components/Course";
import TechStack from "@/components/TechStack";
import Projects from "@/components/Projects";
import Placements from "@/components/Placements";
import Mentors from "@/components/Mentors";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <TrustStrip />
        <WhyUs />
        <Platform />
        <Timeline />
        <Course />
        <TechStack />
        <Projects />
        <Placements />
        <Mentors />
        <Testimonials />
        <FAQ />
        <Contact />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
