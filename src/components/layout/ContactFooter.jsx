import { useRef } from 'react'
import { contactFooter } from '../../data/siteContent'
import { useFooterMotion } from '../../hooks/useFooterMotion'
import BrandMark from '../ui/BrandMark'
import Container from '../ui/Container'

function FooterIcon({ type }) {
  if (type === 'github') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M12 2.75a9.25 9.25 0 0 0-2.93 18.03c.46.08.63-.2.63-.44v-1.62c-2.57.56-3.11-1.1-3.11-1.1-.42-1.07-1.03-1.35-1.03-1.35-.84-.58.06-.57.06-.57.93.07 1.42.96 1.42.96.83 1.41 2.17 1 2.7.77.08-.6.32-1 .58-1.23-2.05-.23-4.2-1.03-4.2-4.56 0-1.01.36-1.83.95-2.47-.1-.23-.41-1.17.09-2.44 0 0 .78-.25 2.55.95a8.8 8.8 0 0 1 4.64 0c1.77-1.2 2.55-.95 2.55-.95.5 1.27.19 2.21.09 2.44.59.64.95 1.46.95 2.47 0 3.54-2.16 4.32-4.21 4.55.33.29.63.85.63 1.72v2.55c0 .24.17.53.64.44A9.25 9.25 0 0 0 12 2.75Z" />
      </svg>
    )
  }

  if (type === 'email') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M4 6.5h16v11H4z" />
        <path d="m4 7 8 6 8-6" />
      </svg>
    )
  }

  if (type === 'telegram') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M20.92 4.38 3.82 10.97c-1.17.47-1.16 1.13-.21 1.42l4.39 1.37 1.68 5.15c.22.61.11.85.74.85.48 0 .69-.22.96-.48l2.3-2.24 4.79 3.54c.88.49 1.52.24 1.74-.82l3.15-14.82c.32-1.29-.49-1.87-1.44-1.56Zm-12.2 9.07 10.01-6.32c.5-.3.96-.14.58.2l-8.57 7.73-.33 3.49-1.69-5.1Z" />
      </svg>
    )
  }

  if (type === 'chat') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M5 5.5h14v9.5H9.5L5 19.25V5.5Z" />
        <path d="M8.5 9h7" />
        <path d="M8.5 12h4.5" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M6.94 8.98v10.04H3.62V8.98h3.32Z" />
      <path d="M5.28 7.61a1.94 1.94 0 1 1 0-3.88 1.94 1.94 0 0 1 0 3.88Z" />
      <path d="M20.38 19.02h-3.31v-5.18c0-1.23-.02-2.82-1.72-2.82-1.72 0-1.98 1.34-1.98 2.73v5.27h-3.31V8.98h3.18v1.37h.05c.44-.84 1.52-1.72 3.13-1.72 3.35 0 3.96 2.2 3.96 5.06v5.33Z" />
    </svg>
  )
}

function iconType(label) {
  return label.toLowerCase()
}

export default function ContactFooter({ onProjectReviewOpen = () => {} }) {
  const footerRef = useRef(null)
  const gridRef = useRef(null)

  useFooterMotion(footerRef, gridRef)

  return (
    <>
      <footer ref={footerRef} className="pp-footer" id={contactFooter.id} data-footer-bounce>
        <Container ref={gridRef} className="pp-footer-grid">
          <nav className="pp-footer-column pp-footer-social" aria-label="Social links">
            <p className="pp-footer-label">Social</p>

            {contactFooter.social.map((item) => (
              <a key={item.label} className="pp-footer-link" href={item.href} target="_blank" rel="noopener noreferrer">
                <span className="pp-footer-link-text pp-glitch-hover">{item.label}</span>
                <span className="pp-footer-icon" aria-hidden="true">
                  <FooterIcon type={iconType(item.label)} />
                </span>
              </a>
            ))}
          </nav>

          <div className="pp-footer-brand">
            <div className="pp-footer-logo" aria-label={contactFooter.brand}>
              <BrandMark />
            </div>
            <p className="pp-footer-subtitle">{contactFooter.subtitle}</p>
          </div>

          <div className="pp-footer-column pp-footer-contact">
            <p className="pp-footer-label">Contact</p>

            <a className="pp-footer-link" href={`mailto:${contactFooter.email}`}>
              <span className="pp-footer-icon" aria-hidden="true">
                <FooterIcon type="email" />
              </span>
              <span className="pp-footer-link-text pp-glitch-hover">{contactFooter.email}</span>
            </a>

            <a className="pp-footer-link" href={contactFooter.telegram.href} target="_blank" rel="noopener noreferrer">
              <span className="pp-footer-icon" aria-hidden="true">
                <FooterIcon type="telegram" />
              </span>
              <span className="pp-footer-link-text pp-glitch-hover">{contactFooter.telegram.label}</span>
            </a>
          </div>
        </Container>
      </footer>

      <button className="pp-button pp-footer-contact-button" type="button" aria-haspopup="dialog" onClick={onProjectReviewOpen}>
        <span className="pp-button-content pp-glitch-hover">
          <span>Let's make it real</span>
          <span className="pp-footer-chat-icon">
            <FooterIcon type="chat" />
          </span>
        </span>
      </button>
    </>
  )
}
