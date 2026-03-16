import Button from '../components/ui/Button'

export default function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden px-6">
      <div className="mx-auto grid max-w-content gap-10 pt-24 md:grid-cols-2 md:items-center">
        <div>
          <p className="mb-4 text-sm uppercase tracking-[0.25em] text-accent">
            Software Engineer • Product Builder • Interactive Experience Creator
          </p>

          <h1 className="max-w-3xl font-display text-5xl font-bold leading-tight md:text-7xl">
            From sketches to scalable systems.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-text-secondary md:text-lg">
            I build digital products, real-world systems, and immersive web experiences
            that combine engineering, design, and business thinking.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Button as="a" href="#projects" variant="primary">
              View Projects
            </Button>

            <Button as="a" href="/experience" variant="secondary">
              Enter Full Experience
            </Button>
          </div>
        </div>

        <div className="relative h-[420px] rounded-panel border border-border bg-surface shadow-glow">
          <div className="absolute inset-0 rounded-panel bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.12),transparent_60%)]" />
          <div className="absolute inset-0 flex items-center justify-center text-muted">
            WebGL Scene Placeholder
          </div>
        </div>
      </div>
    </section>
  )
}