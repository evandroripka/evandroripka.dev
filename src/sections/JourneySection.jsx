import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import SectionEyebrow from '../components/ui/SectionEyebrow'
import SectionTitle from '../components/ui/SectionTitle'
import useReveal from '../hooks/useReveal'

gsap.registerPlugin(ScrollTrigger)

export default function JourneySection() {
  const sectionRef = useRef(null)
  const itemsRef = useRef([])

  const steps = [
    'Art, drawing, and anime as the first creative foundation',
    'Computer maintenance and technical problem solving',
    'Teaching Excel, PowerPoint, Photoshop, and game development',
    'Design specialization with Adobe tools, color theory, and typography',
    'WordPress, front-end, PHP, MySQL, Bootstrap, and jQuery',
    'Custom systems, marketplaces, LMS products, and immersive worlds',
  ]

  useReveal(sectionRef, {
    y: 50,
    duration: 1,
    start: 'top 84%',
  })

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        itemsRef.current,
        {
          autoAlpha: 0,
          y: 24,
        },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.75,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            once: true,
          },
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="journey" className="px-6 py-24">
      <div className="mx-auto max-w-content">
        <SectionEyebrow>Career Journey</SectionEyebrow>
        <SectionTitle>A progression from creativity to complex systems.</SectionTitle>

        <div className="mt-12 grid gap-4">
          {steps.map((step, index) => (
            <div
              key={step}
              ref={(el) => {
                itemsRef.current[index] = el
              }}
              className="group rounded-[24px] border border-border bg-surface p-5 transition-all duration-300 hover:-translate-y-[2px] hover:border-border-strong hover:shadow-glow"
            >
              <span className="mr-3 text-accent transition-colors duration-300 group-hover:text-white">
                0{index + 1}
              </span>
              <span className="text-text-secondary transition-colors duration-300 group-hover:text-text-primary">
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}