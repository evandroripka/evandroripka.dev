import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import Button from '../components/ui/Button'
import SectionEyebrow from '../components/ui/SectionEyebrow'
import SectionTitle from '../components/ui/SectionTitle'
import SectionDescription from '../components/ui/SectionDescription'

gsap.registerPlugin(ScrollTrigger)

export default function ContactSection() {
  const sectionRef = useRef(null)
  const cardRef = useRef(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        {
          autoAlpha: 0,
          y: 50,
          scale: 0.98,
        },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 78%',
            once: true,
          },
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="contact" className="px-6 py-24">
      <div
        ref={cardRef}
        className="mx-auto max-w-5xl rounded-panel border border-border bg-surface p-8 text-center md:p-12"
      >
        <SectionEyebrow className="text-center">
          International Collaboration
        </SectionEyebrow>

        <SectionTitle>
          Available for international projects and long-term partnerships.
        </SectionTitle>

        <SectionDescription className="mx-auto">
          I help businesses and teams turn ideas into scalable products,
          interactive experiences, and systems that solve real operational needs.
        </SectionDescription>

        <div className="mt-8">
          <Button as="a" href="mailto:youremail@example.com" variant="primary">
            Let&apos;s Talk
          </Button>
        </div>
      </div>
    </section>
  )
}