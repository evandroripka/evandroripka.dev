import Button from '../components/ui/Button'
import SectionEyebrow from '../components/ui/SectionEyebrow'
import SectionTitle from '../components/ui/SectionTitle'
import SectionDescription from '../components/ui/SectionDescription'

export default function ContactSection() {
  return (
    <section id="contact" className="px-6 py-24">
      <div className="mx-auto max-w-5xl rounded-panel border border-border bg-surface p-8 text-center md:p-12">
        <SectionEyebrow className="text-center">International Collaboration</SectionEyebrow>

        <SectionTitle>
          Available for international projects and long-term partnerships.
        </SectionTitle>

        <SectionDescription className="mx-auto">
          I help businesses and teams turn ideas into scalable products,
          interactive experiences, and systems that solve real operational needs.
        </SectionDescription>

        <div className="mt-8">
          <Button as="a" href="mailto:youremail@example.com" variant="primary">
            Let’s Talk
          </Button>
        </div>
      </div>
    </section>
  )
}