import SectionEyebrow from '../components/ui/SectionEyebrow'
import SectionTitle from '../components/ui/SectionTitle'
import { featuredProjects } from '../data/featuredProjects'

export default function ProjectsSection() {
  return (
    <section id="projects" className="px-6 py-24">
      <div className="mx-auto max-w-content">
        <div className="mb-12">
          <SectionEyebrow>Selected Projects</SectionEyebrow>
          <SectionTitle>Systems, products, and immersive ideas.</SectionTitle>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featuredProjects.map((project) => (
            <article
              key={project.slug}
              className="rounded-card border border-border bg-surface p-6 transition hover:-translate-y-1 hover:border-border-strong"
            >
              <p className="mb-3 text-xs uppercase tracking-[0.2em] text-accent">
                {project.category}
              </p>

              <h3 className="text-2xl font-semibold">{project.title}</h3>

              <p className="mt-4 text-sm leading-7 text-text-secondary">
                {project.description}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {project.stack.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-border px-3 py-1 text-xs text-text-secondary"
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