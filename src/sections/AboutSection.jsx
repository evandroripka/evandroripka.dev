import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import SectionEyebrow from '../components/ui/SectionEyebrow'
import SectionTitle from '../components/ui/SectionTitle'
import useReveal from '../hooks/useReveal'

gsap.registerPlugin(ScrollTrigger)

export default function AboutSection() {
  const sectionRef = useRef(null)
  const cardsRef = useRef([])

  useReveal(sectionRef, {
    y: 50,
    duration: 1,
    start: 'top 82%',
  })

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardsRef.current,
        {
          autoAlpha: 0,
          y: 30,
        },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.14,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 72%',
            once: true,
          },
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="about" className="px-6 py-24">
      <div className="mx-auto max-w-content">
        <SectionEyebrow>What Makes Me Different</SectionEyebrow>

        <SectionTitle className="max-w-4xl">
          I combine visual thinking, technical depth, teaching experience, and
          business-oriented product building.
        </SectionTitle>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div
            ref={(el) => {
              cardsRef.current[0] = el
            }}
            className="rounded-card border border-border bg-surface p-6 transition duration-300 hover:border-border-strong hover:shadow-glow"
          >
            <h3 className="text-xl font-semibold text-text-primary">
              Creative + Technical
            </h3>
            <p className="mt-3 leading-7 text-text-secondary">
              My path started in drawing, design, and visual storytelling, then
              expanded into hardware, development, systems architecture, and
              product execution.
            </p>
          </div>

          <div
            ref={(el) => {
              cardsRef.current[1] = el
            }}
            className="rounded-card border border-border bg-surface p-6 transition duration-300 hover:border-border-strong hover:shadow-glow"
          >
            <h3 className="text-xl font-semibold text-text-primary">
              Built for Real Operations
            </h3>
            <p className="mt-3 leading-7 text-text-secondary">
              I do not build only interfaces. I build workflows, admin systems,
              automations, and platforms that support real users, teams, and
              business operations.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}