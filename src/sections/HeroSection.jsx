import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import Button from '../components/ui/Button'

export default function HeroSection() {
  const sectionRef = useRef(null)
  const eyebrowRef = useRef(null)
  const titleRef = useRef(null)
  const textRef = useRef(null)
  const buttonsRef = useRef(null)
  const visualRef = useRef(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: {
          ease: 'power3.out',
        },
      })

      tl.fromTo(
        eyebrowRef.current,
        { autoAlpha: 0, y: 24 },
        { autoAlpha: 1, y: 0, duration: 0.7 }
      )
        .fromTo(
          titleRef.current,
          { autoAlpha: 0, y: 32 },
          { autoAlpha: 1, y: 0, duration: 0.9 },
          '-=0.35'
        )
        .fromTo(
          textRef.current,
          { autoAlpha: 0, y: 24 },
          { autoAlpha: 1, y: 0, duration: 0.8 },
          '-=0.45'
        )
        .fromTo(
          buttonsRef.current,
          { autoAlpha: 0, y: 20 },
          { autoAlpha: 1, y: 0, duration: 0.7 },
          '-=0.45'
        )
        .fromTo(
          visualRef.current,
          { autoAlpha: 0, scale: 0.96, y: 24 },
          { autoAlpha: 1, scale: 1, y: 0, duration: 1 },
          '-=0.7'
        )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-screen items-center overflow-hidden px-6"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,211,238,0.08),transparent_50%)]" />

      <div className="mx-auto grid max-w-content gap-12 pt-32 md:grid-cols-2 md:items-center">
        <div className="relative z-10">
          <p
            ref={eyebrowRef}
            className="mb-5 text-sm uppercase tracking-[0.3em] text-accent"
          >
            Software Engineer • Product Builder • Creative Developer
          </p>

          <h1
            ref={titleRef}
            className="max-w-3xl font-display text-5xl font-bold leading-[1.05] md:text-7xl"
          >
            Evandro Ripka
          </h1>

          <p
            ref={textRef}
            className="mt-6 max-w-2xl text-lg leading-8 text-text-secondary"
          >
            Building scalable systems, digital products, and immersive experiences
            — from real-world marketplaces to narrative game worlds.
          </p>

          <div ref={buttonsRef} className="mt-10 flex flex-wrap gap-4">
            <Button as="a" href="#projects" variant="primary">
              View Projects
            </Button>

            <Button as="a" href="/experience" variant="secondary">
              Enter Immersive Experience
            </Button>
          </div>
        </div>

        <div
          ref={visualRef}
          className="relative h-[460px] rounded-panel border border-border bg-surface shadow-glow"
        >
          <div className="absolute inset-0 rounded-panel bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.14),transparent_65%)]" />
          <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.3)_1px,transparent_1px)] [background-size:40px_40px]" />
          <div className="absolute inset-0 flex items-center justify-center text-muted">
            WebGL Experience Placeholder
          </div>
        </div>
      </div>
    </section>
  )
}