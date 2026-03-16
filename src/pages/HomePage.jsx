import Header from '../components/layout/Header'
import HeroSection from '../sections/HeroSection'
import ProjectsSection from '../sections/ProjectsSection'
import AboutSection from '../sections/AboutSection'
import JourneySection from '../sections/JourneySection'
import ContactSection from '../sections/ContactSection'

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-bg-primary text-text-primary font-body">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute left-0 top-0 h-[500px] w-[500px] rounded-full bg-accent/10 blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-accent/5 blur-[140px]" />
      </div>

      <Header />

      <main className="relative z-10">
        <HeroSection />
        <ProjectsSection />
        <AboutSection />
        <JourneySection />
        <ContactSection />
      </main>
    </div>
  )
}