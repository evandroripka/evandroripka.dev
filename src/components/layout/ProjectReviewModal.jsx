import { useEffect, useRef, useState } from 'react'

const initialForm = {
  website: '',
  name: '',
  email: '',
  project_link: '',
  project_type: '',
  scope: '',
  message: '',
}

export default function ProjectReviewModal({ isOpen, onClose }) {
  const panelRef = useRef(null)
  const firstFieldRef = useRef(null)
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState({ message: '', type: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const previousOverflow = document.body.style.overflow

    document.body.style.overflow = 'hidden'
    setErrors({})
    setStatus({ message: '', type: '' })

    window.requestAnimationFrame(() => {
      firstFieldRef.current?.focus({ preventScroll: true })
    })

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose()
        return
      }

      if (event.key !== 'Tab' || !panelRef.current) {
        return
      }

      const focusable = panelRef.current.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (!first || !last) {
        return
      }

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))

    setErrors((current) => ({
      ...current,
      [field]: [],
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setErrors({})
    setStatus({ message: 'Sending...', type: '' })
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/public/project-review', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          source_url: window.location.href,
        }),
      })
      const payload = await response.json()

      if (!response.ok) {
        setErrors(payload.errors || {})
        setStatus({ message: payload.message || 'Please review the highlighted fields.', type: 'error' })
        return
      }

      setForm(initialForm)
      setStatus({ message: payload.message || 'Request sent. I will reply soon.', type: 'success' })
    } catch {
      setStatus({ message: 'The message could not be sent right now. Please try again in a moment.', type: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  function fieldError(name) {
    return errors[name]?.[0] || ''
  }

  return (
    <div className="pp-project-modal is-open" role="presentation">
      <div className="pp-project-modal__backdrop" onMouseDown={onClose} />

      <section
        ref={panelRef}
        className="pp-project-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-review-title"
        aria-describedby="project-review-copy"
      >
        <button className="pp-project-modal__close" type="button" aria-label="Close project review form" onClick={onClose}>
          <span />
          <span />
        </button>

        <div className="pp-project-modal__intro">
          <h2 id="project-review-title">Tell me what you are building.</h2>
          <p id="project-review-copy">Share the essential context and I will reply with the clearest next step.</p>
        </div>

        <form className="pp-project-form" onSubmit={handleSubmit} noValidate>
          <input
            className="pp-project-modal__trap"
            type="text"
            name="website"
            tabIndex="-1"
            autoComplete="off"
            aria-hidden="true"
            value={form.website}
            onChange={(event) => updateField('website', event.target.value)}
          />

          <div className="pp-project-form__grid">
            <label className="pp-project-field">
              <span>Name</span>
              <input
                ref={firstFieldRef}
                type="text"
                name="name"
                autoComplete="name"
                value={form.name}
                onChange={(event) => updateField('name', event.target.value)}
                required
              />
              <small>{fieldError('name')}</small>
            </label>

            <label className="pp-project-field">
              <span>Contact email</span>
              <input
                type="email"
                name="email"
                autoComplete="email"
                value={form.email}
                onChange={(event) => updateField('email', event.target.value)}
                required
              />
              <small>{fieldError('email')}</small>
            </label>

            <label className="pp-project-field pp-project-field--wide">
              <span>
                Current project or company link <em>Optional</em>
              </span>
              <input
                type="url"
                name="project_link"
                autoComplete="url"
                placeholder="https://company.com"
                value={form.project_link}
                onChange={(event) => updateField('project_link', event.target.value)}
              />
              <small>{fieldError('project_link')}</small>
            </label>
          </div>

          <fieldset className="pp-project-choice">
            <legend>Project type</legend>
            <div className="pp-project-choice__grid">
              <Choice
                name="project_type"
                value="system_app"
                label="System / App"
                selectedValue={form.project_type}
                onChange={updateField}
              />
              <Choice name="project_type" value="website" label="Website" selectedValue={form.project_type} onChange={updateField} />
              <Choice
                name="project_type"
                value="ecommerce"
                label="Ecommerce"
                selectedValue={form.project_type}
                onChange={updateField}
              />
              <Choice name="project_type" value="other" label="Other" selectedValue={form.project_type} onChange={updateField} />
            </div>
            <small>{fieldError('project_type')}</small>
          </fieldset>

          <fieldset className="pp-project-choice">
            <legend>Scope</legend>
            <div className="pp-project-choice__grid pp-project-choice__grid--three">
              <Choice name="scope" value="new" label="New project" selectedValue={form.scope} onChange={updateField} />
              <Choice name="scope" value="updates" label="Targeted adjustments" selectedValue={form.scope} onChange={updateField} />
              <Choice name="scope" value="refactor" label="Refactor" selectedValue={form.scope} onChange={updateField} />
            </div>
            <small>{fieldError('scope')}</small>
          </fieldset>

          <label className="pp-project-field">
            <span>Brief message</span>
            <textarea
              name="message"
              rows="5"
              required
              placeholder="Tell me about the context, problem, timeline, priorities, and budget or rate expectations."
              value={form.message}
              onChange={(event) => updateField('message', event.target.value)}
            />
            <small>{fieldError('message')}</small>
          </label>

          <div className="pp-project-form__footer">
            <p className={['pp-project-form__status', status.type ? `is-${status.type}` : ''].filter(Boolean).join(' ')} aria-live="polite">
              {status.message}
            </p>
            <button className="pp-button pp-project-form__submit" type="submit" disabled={isSubmitting}>
              <span className="pp-button-content pp-glitch-hover">
                <span>{isSubmitting ? 'Sending...' : 'Request a Project Review'}</span>
              </span>
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

function Choice({ name, value, label, selectedValue, onChange }) {
  return (
    <label>
      <input
        type="radio"
        name={name}
        value={value}
        checked={selectedValue === value}
        onChange={(event) => onChange(name, event.target.value)}
        required
      />
      <span>{label}</span>
    </label>
  )
}
