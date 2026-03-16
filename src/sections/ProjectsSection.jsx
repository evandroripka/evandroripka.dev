import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import SectionEyebrow from '../components/ui/SectionEyebrow'
import SectionTitle from '../components/ui/SectionTitle'
import { featuredProjects } from '../data/featuredProjects'
import useReveal from '../hooks/useReveal'

gsap.registerPlugin(ScrollTrigger)

export default function ProjectsSection() {
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
          y: 40,
        },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.12,
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
    <section ref={sectionRef} id="projects" className="px-6 py-24">
      <div className="mx-auto max-w-content">
        <div className="mb-12">
          <SectionEyebrow>Selected Projects</SectionEyebrow>
          <SectionTitle>Systems, products, and immersive ideas.</SectionTitle>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featuredProjects.map((project, index) => (
            <article
              key={project.slug}
              ref={(el) => {
                cardsRef.current[index] = el
              }}
              className="group rounded-card border border-border bg-surface p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-border-strong hover:shadow-glow"
            >
              <p className="mb-3 text-xs uppercase tracking-[0.2em] text-accent">
                {project.category}
              </p>

              <h3 className="text-2xl font-semibold text-text-primary transition-colors duration-300 group-hover:text-white">
                {project.title}
              </h3>

              <p className="mt-4 text-sm leading-7 text-text-secondary">
                {project.description}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {project.stack.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-border px-3 py-1 text-xs text-text-secondary transition-all duration-300 group-hover:border-border-strong group-hover:text-text-primary"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}