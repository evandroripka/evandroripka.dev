import { hero } from '../data/siteContent'
import Button from '../components/ui/Button'
import Container from '../components/ui/Container'

export default function HeroSection() {
  return (
    <section className="pp-hero pp-loop-panel" aria-labelledby="hero-title">
      <video className="pp-hero-video" autoPlay muted loop playsInline>
        <source src={hero.video} type="video/mp4" />
      </video>

      <div className="pp-hero-overlay" />
      <div className="pp-hero-vignette" />

      <Container className="pp-hero-content">
        <h1 id="hero-title" className="pp-hero-title">
          {hero.title}
        </h1>

        <p className="pp-hero-subtitle">{hero.subtitle}</p>

        <Button href={hero.cta.href} icon={hero.cta.icon}>
          {hero.cta.label}
        </Button>
      </Container>
    </section>
  )
}
