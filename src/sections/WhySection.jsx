import { useEffect, useRef, useState } from 'react'
import { whyMe } from '../data/siteContent'
import Container from '../components/ui/Container'
import { useWhyMeInteractions } from '../hooks/useWhyMeInteractions'

export default function WhySection() {
  const sectionRef = useRef(null)
  const videoLayerRef = useRef(null)
  const videoRef = useRef(null)
  const chairRef = useRef(null)
  const [activeCardId, setActiveCardId] = useState(null)
  const [isCardHovered, setIsCardHovered] = useState(false)
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia('(min-width: 1024px)').matches)
  const activeCard = whyMe.cards.find((card) => card.id === activeCardId)

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)')
    const updateDesktopState = () => setIsDesktop(media.matches)

    updateDesktopState()
    media.addEventListener('change', updateDesktopState)

    return () => media.removeEventListener('change', updateDesktopState)
  }, [])

  useWhyMeInteractions({
    sectionRef,
    videoLayerRef,
    videoRef,
    chairRef,
    cards: whyMe.cards,
    chairFrames: whyMe.scene.chairFrames,
    isDesktop,
  })

  function activateDesktopCard(cardId) {
    if (!isDesktop) {
      return
    }

    setActiveCardId(cardId)
    setIsCardHovered(true)
  }

  function deactivateDesktopCard() {
    if (!isDesktop) {
      return
    }

    setIsCardHovered(false)
  }

  function toggleMobileCard(cardId) {
    if (isDesktop) {
      return
    }

    const isOpen = activeCardId === cardId

    setActiveCardId(isOpen ? null : cardId)
    setIsCardHovered(!isOpen)
  }

  return (
    <section
      ref={sectionRef}
      id={whyMe.id}
      className={['pp-section pp-loop-panel pp-why-me', isCardHovered ? 'is-why-card-hovered' : ''].filter(Boolean).join(' ')}
      data-panel-pin="self"
      aria-labelledby="why-title"
    >
      <div ref={videoLayerRef} className="pp-why-me-video-layer" aria-hidden="true" data-why-video-layer>
        <video ref={videoRef} className="pp-why-me-video" muted loop playsInline preload="metadata" data-why-video>
          <source src="" type="video/mp4" />
        </video>
        <div className="pp-why-me-video-overlay" />
      </div>

      {isDesktop ? (
        <div className="pp-why-me-scene" aria-hidden="true">
          <img
            className="pp-why-me-desk"
            src={whyMe.scene.desk}
            alt={whyMe.scene.deskAlt}
            width="4000"
            height="1712"
            loading="lazy"
            decoding="async"
          />
          <img
            ref={chairRef}
            className="pp-why-me-chair"
            src={whyMe.scene.chairFrames[0]}
            alt={whyMe.scene.chairAlt}
            width="400"
            height="537"
            loading="lazy"
            decoding="async"
            data-raising-chair-frame
          />
        </div>
      ) : null}

      <Container>
        <header className="pp-section-header pp-section-header--center has-text-centered">
          <p className="pp-section-kicker">{whyMe.kicker}</p>
          <h2 id="why-title" className="pp-section-title">
            {whyMe.title}
          </h2>
        </header>

        <div className="columns is-variable is-8 pp-split-columns pp-split-hollow-desktop pp-why-me-layout">
          <div className="column is-half pp-split-column pp-why-me-cards">
            {whyMe.cards.map((card) => {
              const isExpanded = !isDesktop && activeCardId === card.id

              return (
                <article
                  key={card.id}
                  className={['pp-why-card', isExpanded ? 'is-expanded' : ''].filter(Boolean).join(' ')}
                  data-why-video-target={card.id}
                  tabIndex="0"
                  role="button"
                  aria-expanded={isExpanded}
                  onMouseEnter={() => activateDesktopCard(card.id)}
                  onMouseLeave={deactivateDesktopCard}
                  onFocus={() => activateDesktopCard(card.id)}
                  onBlur={deactivateDesktopCard}
                  onClick={() => toggleMobileCard(card.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      toggleMobileCard(card.id)
                    }
                  }}
                >
                  <div className="pp-why-card-heading">
                    <span className="pp-why-card-index">{card.index}</span>
                    <h3 className="pp-why-card-title">{card.title}</h3>
                  </div>

                  {isExpanded ? (
                    <div className="pp-why-accordion-panel">
                      {card.details.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                  ) : null}
                </article>
              )
            })}
          </div>

          <div className="column is-half pp-split-column pp-why-copy-column">
            {isDesktop && isCardHovered && activeCard ? (
              <article key={activeCard.id} className="pp-why-hover-copy" aria-live="polite">
                {activeCard.details.map((paragraph) => (
                  <p key={paragraph} className="pp-why-hover-text">
                    {paragraph}
                  </p>
                ))}
              </article>
            ) : null}
          </div>
        </div>
      </Container>
    </section>
  )
}
