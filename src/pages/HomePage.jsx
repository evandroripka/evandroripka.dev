import Header from '../components/layout/Header'
import HeroSection from '../sections/HeroSection'
import ProjectsSection from '../sections/ProjectsSection'
import AboutSection from '../sections/AboutSection'
import JourneySection from '../sections/JourneySection'
import ContactSection from '../sections/ContactSection'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary font-body">
      <Header />
      <main>
        <HeroSection />
        <ProjectsSection />
        <AboutSection />
        <JourneySection />
        <ContactSection />
      </main>
    </div>
  )
}