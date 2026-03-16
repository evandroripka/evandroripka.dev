import SectionEyebrow from '../components/ui/SectionEyebrow'
import SectionTitle from '../components/ui/SectionTitle'

export default function AboutSection() {
  return (
    <section id="about" className="px-6 py-24">
      <div className="mx-auto max-w-content">
        <SectionEyebrow>What Makes Me Different</SectionEyebrow>

        <SectionTitle className="max-w-4xl">
          I combine visual thinking, technical depth, teaching experience, and
          business-oriented product building.
        </SectionTitle>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-card border border-border bg-surface p-6">
            <h3 className="text-xl font-semibold">Creative + Technical</h3>
            <p className="mt-3 leading-7 text-text-secondary">
              My path started in drawing, design, and visual storytelling, then
              expanded into hardware, development, systems architecture, and
              product execution.
            </p>
          </div>

          <div className="rounded-card border border-border bg-surface p-6">
            <h3 className="text-xl font-semibold">Built for Real Operations</h3>
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