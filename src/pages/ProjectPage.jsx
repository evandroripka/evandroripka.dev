import { useEffect, useRef, useState } from 'react'
import ContactFooter from '../components/layout/ContactFooter'
import Header from '../components/layout/Header'
import Button from '../components/ui/Button'
import Container from '../components/ui/Container'
import { usePowerGlitch } from '../hooks/usePowerGlitch'

export default function ProjectPage({ slug, onProjectReviewOpen }) {
  const pageRef = useRef(null)
  const [projectState, setProjectState] = useState({ slug, project: null, status: 'loading' })
  const isCurrentProject = projectState.slug === slug
  const project = isCurrentProject ? projectState.project : null
  const status = isCurrentProject ? projectState.status : 'loading'

  usePowerGlitch(pageRef)

  useEffect(() => {
    let isMounted = true

    fetch(`/api/public/projects/${encodeURIComponent(slug)}`)
      .then((response) => {
        if (response.status === 404) {
          if (isMounted) {
            setProjectState({ slug, project: null, status: 'missing' })
          }
          return null
        }

        if (!response.ok) {
          throw new Error('Could not load project')
        }

        return response.json()
      })
      .then((payload) => {
        if (!isMounted || !payload?.project) {
          return
        }

        setProjectState({ slug, project: payload.project, status: 'ready' })
      })
      .catch(() => {
        if (isMounted) {
          setProjectState({ slug, project: null, status: 'error' })
        }
      })

    return () => {
      isMounted = false
    }
  }, [slug])

  useEffect(() => {
    if (!project) {
      return
    }

    document.title = project.meta_title || `${project.title} - Evandro Ripka`
    setMetaDescription(project.meta_description || project.subtitle)
  }, [project])

  if (status === 'missing') {
    return (
      <ProjectShell pageRef={pageRef} onProjectReviewOpen={onProjectReviewOpen}>
        <EmptyProjectState title="Project not found." text="The project you are looking for is not available here yet." />
      </ProjectShell>
    )
  }

  if (status === 'error') {
    return (
      <ProjectShell pageRef={pageRef} onProjectReviewOpen={onProjectReviewOpen}>
        <EmptyProjectState title="Could not load this project." text="The project page could not be loaded right now." />
      </ProjectShell>
    )
  }

  if (!project) {
    return (
      <ProjectShell pageRef={pageRef} onProjectReviewOpen={onProjectReviewOpen}>
        <section className="pp-section pp-project-loading" aria-live="polite">
          <Container>
            <p className="pp-section-kicker">Loading project</p>
            <h1 className="pp-section-title">Preparing the case study.</h1>
          </Container>
        </section>
      </ProjectShell>
    )
  }

  const heroBackgroundVideo = project.cover?.background_video
  const heroBackgroundImage = project.cover?.background_image || project.cover?.image

  return (
    <ProjectShell pageRef={pageRef} onProjectReviewOpen={onProjectReviewOpen}>
      <section className="pp-hero pp-project-hero">
        {heroBackgroundVideo ? (
          <video className="pp-project-hero-media" autoPlay muted loop playsInline preload="metadata" aria-hidden="true">
            <source src={heroBackgroundVideo} type="video/mp4" />
          </video>
        ) : heroBackgroundImage ? (
          <img className="pp-project-hero-media" src={heroBackgroundImage} alt="" aria-hidden="true" />
        ) : null}
        <div className="pp-hero-grid" aria-hidden="true" />
        <div className="pp-hero-overlay" />
        <div className="pp-hero-vignette" />

        <Container className="pp-hero-content">
          <p className="pp-section-kicker">{project.label}</p>
          <h1 className="pp-hero-title">{project.title}</h1>
          <p className="pp-hero-subtitle">{project.subtitle}</p>

          <div className="pp-hero-copy">
            {project.hero_copy.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <div className="pp-hero-actions">
            <button className="pp-button" type="button" onClick={onProjectReviewOpen}>
              <span className="pp-button-content pp-glitch-hover">
                <span>Request a project review</span>
              </span>
            </button>
            <Button href="/#work" className="pp-button-ghost">
              Back to selected work
            </Button>
          </div>
        </Container>
      </section>

      <section className="pp-section pp-section--compact">
        <Container>
          <SectionHeading kicker="Project Snapshot" title="The shape of the work." />
          <MetaGrid items={project.snapshot} />
        </Container>
      </section>

      {Object.entries(project.sections).map(([title, paragraphs], index) => (
        <section key={title} className="pp-section pp-case-section">
          <Container className="pp-case-layout">
            <div>
              <p className="pp-section-kicker">{String(index + 1).padStart(2, '0')}</p>
              <h2 className="pp-section-title-smaller">{title}</h2>
            </div>
            <div>
              {paragraphs.map((paragraph) => (
                <p key={paragraph} className="pp-section-text">
                  {paragraph}
                </p>
              ))}
            </div>
          </Container>
        </section>
      ))}

      <section className="pp-section">
        <Container>
          <SectionHeading
            kicker="What I Built"
            title="A reusable system of workflows, roles, and product logic."
            intro="Each module exists because it supports a real behavior inside the product, not because it looks good in a checklist."
          />
          <ItemGrid items={project.built} />
        </Container>
      </section>

      <section className="pp-section pp-section--soft">
        <Container>
          <SectionHeading kicker="Stack & Integrations" title="The technical foundation." />
          <ItemGrid items={project.integrations} columns="two" />
        </Container>
      </section>

      <section className="pp-section">
        <Container>
          <SectionHeading
            kicker="Media Breakdown"
            title="Screens worth reviewing next."
            intro="These slots are ready for the final screenshots, videos, or diagrams when you want to replace the interface placeholders."
          />
          <div className="pp-media-grid">
            {project.media.map((media) => {
              const hasVisual = media.image || media.video

              return (
                <article key={media.title} className="pp-media-card">
                  <div className={['pp-media-card__visual', hasVisual ? 'has-asset' : ''].filter(Boolean).join(' ')} aria-hidden="true">
                    {media.video ? (
                      <video src={media.video} autoPlay muted loop playsInline preload="metadata" />
                    ) : media.image ? (
                      <img src={media.image} alt={media.alt || ''} loading="lazy" />
                    ) : (
                      <>
                        <span />
                        <span />
                        <span />
                      </>
                    )}
                  </div>
                  <div className="pp-media-card__body">
                    <h3>{media.title}</h3>
                    <p>{media.caption}</p>
                  </div>
                </article>
              )
            })}
          </div>
        </Container>
      </section>

      <section className="pp-section pp-outcome">
        <Container className="pp-case-layout">
          <div>
            <p className="pp-section-kicker">Outcome</p>
            <h2 className="pp-section-title-smaller">What changed.</h2>
          </div>
          <div>
            {project.outcome.map((paragraph) => (
              <p key={paragraph} className="pp-section-text">
                {paragraph}
              </p>
            ))}
          </div>
        </Container>
      </section>

      <section id="contact" className="pp-section pp-final-cta">
        <Container>
          <div className="pp-final-cta__panel">
            <p className="pp-section-kicker">Next Step</p>
            <h2 className="pp-section-title-smaller">{project.final_cta.title}</h2>
            <p className="pp-section-text">{project.final_cta.copy}</p>
            <button className="pp-button" type="button" onClick={onProjectReviewOpen}>
              <span className="pp-button-content pp-glitch-hover">
                <span>{project.final_cta.cta}</span>
              </span>
            </button>
          </div>
        </Container>
      </section>
    </ProjectShell>
  )
}

function ProjectShell({ pageRef, onProjectReviewOpen, children }) {
  return (
    <div ref={pageRef} className="pp-site">
      <Header />
      <main>{children}</main>
      <ContactFooter onProjectReviewOpen={onProjectReviewOpen} />
    </div>
  )
}

function EmptyProjectState({ title, text }) {
  return (
    <section className="pp-section pp-project-empty">
      <Container>
        <p className="pp-section-kicker">Project page</p>
        <h1 className="pp-section-title">{title}</h1>
        <p className="pp-section-text">{text}</p>
        <Button href="/#work" className="pp-button-ghost">
          Back to selected work
        </Button>
      </Container>
    </section>
  )
}

function SectionHeading({ kicker, title, intro }) {
  return (
    <div className="pp-section-header">
      {kicker ? <p className="pp-section-kicker">{kicker}</p> : null}
      {title ? <h2 className="pp-section-title">{title}</h2> : null}
      {intro ? <p className="pp-section-text">{intro}</p> : null}
    </div>
  )
}

function MetaGrid({ items }) {
  return (
    <dl className="pp-snapshot-grid">
      {Object.entries(items).map(([label, value]) => (
        <div key={label} className="pp-snapshot-item">
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  )
}

function ItemGrid({ items, columns = 'auto' }) {
  return (
    <div className={`pp-item-grid pp-item-grid--${columns}`}>
      {items.map((item) => (
        <article key={item.title} className="pp-info-card">
          <h3>{item.title}</h3>
          <p>{item.text}</p>
        </article>
      ))}
    </div>
  )
}

function setMetaDescription(content) {
  let tag = document.querySelector('meta[name="description"]')

  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute('name', 'description')
    document.head.appendChild(tag)
  }

  tag.setAttribute('content', content || '')
}
