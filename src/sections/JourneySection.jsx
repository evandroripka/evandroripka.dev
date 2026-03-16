import SectionEyebrow from '../components/ui/SectionEyebrow'
import SectionTitle from '../components/ui/SectionTitle'

export default function JourneySection() {
  const steps = [
    'Art, drawing, and anime as the first creative foundation',
    'Computer maintenance and technical problem solving',
    'Teaching Excel, PowerPoint, Photoshop, and game development',
    'Design specialization with Adobe tools, color theory, and typography',
    'WordPress, front-end, PHP, MySQL, Bootstrap, and jQuery',
    'Custom systems, marketplaces, LMS products, and immersive worlds',
  ]

  return (
    <section id="journey" className="px-6 py-24">
      <div className="mx-auto max-w-content">
        <SectionEyebrow>Career Journey</SectionEyebrow>
        <SectionTitle>A progression from creativity to complex systems.</SectionTitle>

        <div className="mt-12 grid gap-4">
          {steps.map((step, index) => (
            <div
              key={step}
              className="rounded-[24px] border border-border bg-surface p-5"
            >
              <span className="mr-3 text-accent">0{index + 1}</span>
              <span className="text-text-secondary">{step}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}