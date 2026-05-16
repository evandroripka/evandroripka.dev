import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { highlights, projects } from '../data/siteContent'
import Container from '../components/ui/Container'
import ProjectIcon from '../components/ui/ProjectIcon'
import { usePinnedProjects } from '../hooks/usePinnedProjects'
import { useProjectCursor } from '../hooks/useProjectCursor'

function ProjectCard({ project, onMouseEnter, onMouseLeave, compact = false }) {
  const [hasVideo, setHasVideo] = useState(false)

  function showVideoPreview(event) {
    setHasVideo(true)
    event.currentTarget.play().catch(() => {})
  }

  return (
    <article className={['pp-project-card', compact ? 'pp-project-card--compact' : ''].filter(Boolean).join(' ')}>
      <a
        href={project.href}
        className="pp-project-link"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div className={['pp-project-media', hasVideo ? 'has-video' : ''].filter(Boolean).join(' ')}>
          <img src={project.image} alt={project.alt} loading="lazy" />
          {project.video ? (
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-hidden="true"
              onCanPlay={showVideoPreview}
              onError={() => setHasVideo(false)}
            >
              <source src={project.video} type="video/mp4" />
            </video>
          ) : null}

          {compact ? null : (
            <div className="pp-project-info">
              <div className="pp-project-tech-icon" aria-hidden="true">
                <ProjectIcon name={project.icon} />
              </div>

              <div className="pp-project-info-copy">
                <h3 className="pp-section-title-smaller">{project.title}</h3>
                <p>{project.summary}</p>
              </div>
            </div>
          )}
        </div>
      </a>
    </article>
  )
}

export default function ProjectsSection() {
  const sectionRef = useRef(null)
  const stickyRef = useRef(null)
  const carouselRef = useRef(null)
  const carouselTimelineRef = useRef(null)
  const [homeProjects, setHomeProjects] = useState(projects)
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 960px)').matches)
  const [carouselIndex, setCarouselIndex] = useState(0)
  const { cursorRef, moveCursor, showCursor, hideCursor } = useProjectCursor()

  usePinnedProjects(sectionRef, stickyRef)

  useEffect(() => {
    let isMounted = true

    fetch('/api/public/projects')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Could not load projects')
        }

        return response.json()
      })
      .then((payload) => {
        if (isMounted && Array.isArray(payload.projects) && payload.projects.length > 0) {
          setHomeProjects(payload.projects)
        }
      })
      .catch(() => {})

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    const media = window.matchMedia('(max-width: 960px)')
    const updateMobileState = () => setIsMobile(media.matches)

    updateMobileState()
    media.addEventListener('change', updateMobileState)

    return () => media.removeEventListener('change', updateMobileState)
  }, [])

  useEffect(() => {
    if (!isMobile || homeProjects.length <= 2) {
      return undefined
    }

    const timer = window.setInterval(() => {
      const cards = carouselRef.current ? Array.from(carouselRef.current.querySelectorAll('.pp-project-card')) : []

      carouselTimelineRef.current?.kill()
      carouselTimelineRef.current = gsap.timeline({
        onComplete: () => {
          setCarouselIndex((current) => (current + 1) % homeProjects.length)
        },
      })

      carouselTimelineRef.current.to(cards, {
        autoAlpha: 0,
        y: 18,
        scale: 0.94,
        filter: 'blur(8px)',
        duration: 0.42,
        stagger: 0.07,
        ease: 'power2.inOut',
      })
    }, 3200)

    return () => {
      window.clearInterval(timer)
      carouselTimelineRef.current?.kill()
    }
  }, [homeProjects.length, isMobile])

  useEffect(() => {
    if (!isMobile || !carouselRef.current) {
      return
    }

    const cards = Array.from(carouselRef.current.querySelectorAll('.pp-project-card'))

    gsap.fromTo(
      cards,
      {
        autoAlpha: 0,
        y: -16,
        scale: 1.04,
        filter: 'blur(8px)',
      },
      {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
        duration: 0.64,
        stagger: 0.09,
        ease: 'power3.out',
      },
    )
  }, [carouselIndex, isMobile])

  const mobileProjects = isMobile
    ? [homeProjects[carouselIndex % homeProjects.length], homeProjects[(carouselIndex + 1) % homeProjects.length]].filter(Boolean)
    : homeProjects

  return (
    <section
      ref={sectionRef}
      id={highlights.id}
      className="pp-section pp-projects pp-loop-panel"
      data-panel-pin="self"
      aria-labelledby="projects-title"
      onMouseMove={moveCursor}
    >
      <Container className="pp-projects-grid">
        <aside ref={stickyRef} className="pp-projects-sticky">
          {highlights.kicker ? <p className="pp-section-kicker">{highlights.kicker}</p> : null}

          <h2 id="projects-title" className="pp-section-title">
            {highlights.title}
          </h2>

          <p className="pp-section-text">{highlights.text}</p>
        </aside>

        <div ref={carouselRef} className={['pp-projects-list', isMobile ? 'pp-projects-carousel' : ''].filter(Boolean).join(' ')}>
          {(isMobile ? mobileProjects : homeProjects).map((project) => (
            <ProjectCard
              key={project.slug || project.title}
              project={project}
              onMouseEnter={showCursor}
              onMouseLeave={hideCursor}
              compact={isMobile}
            />
          ))}
        </div>
      </Container>

      <div ref={cursorRef} className="pp-project-cursor">
        {highlights.cursorLabel}
      </div>
    </section>
  )
}
