import { useRef } from 'react'
import ContactFooter from '../components/layout/ContactFooter'
import Header from '../components/layout/Header'
import { usePowerGlitch } from '../hooks/usePowerGlitch'
import AboutSection from '../sections/AboutSection'
import HeroSection from '../sections/HeroSection'
import ProjectsSection from '../sections/ProjectsSection'
import WhySection from '../sections/WhySection'

export default function HomePage({ onProjectReviewOpen }) {
  const pageRef = useRef(null)

  usePowerGlitch(pageRef)

  return (
    <div ref={pageRef} className="pp-site">
      <Header />
      <main>
        <HeroSection />
        <AboutSection />
        <ProjectsSection />
        <WhySection />
      </main>
      <ContactFooter onProjectReviewOpen={onProjectReviewOpen} />
    </div>
  )
}
