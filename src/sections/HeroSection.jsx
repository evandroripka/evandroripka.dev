import Button from '../components/ui/Button'

export default function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,211,238,0.08),transparent_50%)]" />

      <div className="mx-auto grid max-w-content gap-12 pt-32 md:grid-cols-2 md:items-center">
        <div className="relative z-10">
          <p className="mb-5 text-sm uppercase tracking-[0.3em] text-accent">
            Software Engineer • Product Builder • Interactive Creator
          </p>

          <h1 className="max-w-3xl font-display text-5xl font-bold leading-[1.05] md:text-7xl">
            Building systems,
            products and immersive
            digital experiences.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-text-secondary">
            From enterprise-grade platforms to real-time interactive environments,
            I design and engineer solutions that combine technical depth,
            visual thinking, and business impact.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Button as="a" href="#projects" variant="primary">
              Explore Work
            </Button>

            <Button as="a" href="/experience" variant="secondary">
              Full Interactive Experience
            </Button>
          </div>
        </div>

        <div className="relative h-[460px] rounded-panel border border-border bg-surface shadow-glow">
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