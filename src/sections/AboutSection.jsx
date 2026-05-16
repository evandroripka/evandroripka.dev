import { about } from '../data/siteContent'
import Container from '../components/ui/Container'

export default function AboutSection() {
  return (
    <section id={about.id} className="pp-section pp-about pp-loop-panel" aria-labelledby="about-title">
      <Container>
        <div className="pp-about-layout">
          <div className="pp-section-inner pp-about-copy">
            <p className="pp-section-kicker">{about.kicker}</p>

            <h2 id="about-title" className="pp-section-title">
              {about.title}
            </h2>

            {about.paragraphs.map((paragraph) => (
              <p key={paragraph} className="pp-section-text">
                {paragraph}
              </p>
            ))}

          </div>

          <figure className="pp-about-visual" aria-label="Evandro Ripka portrait">
            <img src={about.image} alt={about.imageAlt} loading="lazy" />
          </figure>
        </div>
      </Container>
    </section>
  )
}
