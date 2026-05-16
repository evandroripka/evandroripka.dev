import { useEffect, useMemo, useState } from 'react'
import BrandMark from '../components/ui/BrandMark'

const panels = [
  { id: 'overview', label: 'Overview' },
  { id: 'assets', label: 'Assets' },
  { id: 'home', label: 'Home' },
  { id: 'case', label: 'Case page' },
  { id: 'cards', label: 'Cards' },
  { id: 'media', label: 'Media' },
  { id: 'seo', label: 'SEO' },
]

const defaultProject = {
  id: null,
  slug: '',
  sort_order: 0,
  is_featured: true,
  title: '',
  label: '',
  meta_title: '',
  meta_description: '',
  subtitle: '',
  role: '',
  cta_label: '',
  cover: {
    image: '',
    hover_video: '',
    background_image: '',
    background_video: '',
    alt: '',
  },
  stack: [],
  home_copy: [],
  hero_copy: [],
  snapshot: {},
  sections: {},
  built: [],
  integrations: [],
  media: [],
  outcome: [],
  final_cta: {
    title: '',
    copy: '',
    cta: '',
  },
}

export default function AdminDashboard() {
  const [session, setSession] = useState({ status: 'loading', user: null })
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [loginError, setLoginError] = useState('')
  const [projects, setProjects] = useState([])
  const [selectedProjectId, setSelectedProjectId] = useState(null)
  const [draft, setDraft] = useState(null)
  const [activePanel, setActivePanel] = useState('overview')
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingProjects, setIsLoadingProjects] = useState(false)
  const [notice, setNotice] = useState({ type: '', text: '' })
  const [fieldErrors, setFieldErrors] = useState({})

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) || null,
    [projects, selectedProjectId],
  )
  const isDirty = useMemo(() => {
    if (!draft || !selectedProject) {
      return false
    }

    return JSON.stringify(draft) !== JSON.stringify(selectedProject)
  }, [draft, selectedProject])

  useEffect(() => {
    document.title = 'Admin - Evandro Ripka'

    let isMounted = true

    async function loadInitialProjects(user) {
      setIsLoadingProjects(true)

      try {
        const response = await fetch('/api/admin/projects', { credentials: 'same-origin' })

        if (!response.ok) {
          throw new Error('Could not load projects.')
        }

        const payload = await response.json()
        const nextProjects = Array.isArray(payload.projects) ? payload.projects.map(normalizeProject) : []
        const nextSelected = nextProjects[0] || null

        if (!isMounted) {
          return
        }

        setProjects(nextProjects)
        setSelectedProjectId(nextSelected?.id || null)
        setDraft(nextSelected ? cloneProject(nextSelected) : null)
        setSession({ status: 'authenticated', user: payload.user || user })
      } catch {
        if (isMounted) {
          setNotice({ type: 'error', text: 'Could not load projects right now.' })
        }
      } finally {
        if (isMounted) {
          setIsLoadingProjects(false)
        }
      }
    }

    fetch('/api/auth/session', { credentials: 'same-origin' })
      .then((response) => response.json())
      .then((payload) => {
        if (!isMounted) {
          return
        }

        if (payload.authenticated) {
          setSession({ status: 'authenticated', user: payload.user })
          loadInitialProjects(payload.user)
          return
        }

        setSession({ status: 'unauthenticated', user: null })
      })
      .catch(() => {
        if (isMounted) {
          setSession({ status: 'unauthenticated', user: null })
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  async function loadProjects(preferredProjectId = selectedProjectId) {
    setIsLoadingProjects(true)
    setNotice({ type: '', text: '' })

    try {
      const response = await fetch('/api/admin/projects', { credentials: 'same-origin' })

      if (response.status === 401) {
        setSession({ status: 'unauthenticated', user: null })
        return
      }

      if (!response.ok) {
        throw new Error('Could not load projects.')
      }

      const payload = await response.json()
      const nextProjects = Array.isArray(payload.projects) ? payload.projects.map(normalizeProject) : []
      const nextSelected = nextProjects.find((project) => project.id === preferredProjectId) || nextProjects[0] || null

      setProjects(nextProjects)
      setSelectedProjectId(nextSelected?.id || null)
      setDraft(nextSelected ? cloneProject(nextSelected) : null)
      setSession({ status: 'authenticated', user: payload.user || session.user })
    } catch {
      setNotice({ type: 'error', text: 'Could not load projects right now.' })
    } finally {
      setIsLoadingProjects(false)
    }
  }

  async function handleLogin(event) {
    event.preventDefault()
    setLoginError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginForm),
      })
      const payload = await response.json()

      if (!response.ok) {
        setLoginError(payload.message || 'Invalid credentials.')
        return
      }

      setSession({ status: 'authenticated', user: payload.user })
      await loadProjects()
    } catch {
      setLoginError('The dashboard could not sign in right now.')
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'same-origin',
    }).catch(() => {})

    setSession({ status: 'unauthenticated', user: null })
    setProjects([])
    setSelectedProjectId(null)
    setDraft(null)
  }

  function selectProject(projectId) {
    const project = projects.find((item) => item.id === projectId)

    if (!project) {
      return
    }

    setSelectedProjectId(project.id)
    setDraft(cloneProject(project))
    setActivePanel('overview')
    setFieldErrors({})
    setNotice({ type: '', text: '' })
  }

  async function saveProject(event) {
    event.preventDefault()

    if (!draft || !draft.id) {
      return
    }

    setIsSaving(true)
    setFieldErrors({})
    setNotice({ type: '', text: '' })

    try {
      const response = await fetch(`/api/admin/projects/${draft.id}`, {
        method: 'PUT',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(draft),
      })
      const payload = await response.json()

      if (response.status === 401) {
        setSession({ status: 'unauthenticated', user: null })
        return
      }

      if (response.status === 422) {
        setFieldErrors(payload.errors || {})
        setNotice({ type: 'error', text: payload.message || 'Please review the highlighted fields.' })
        return
      }

      if (!response.ok) {
        throw new Error('Could not save project.')
      }

      const updatedProject = normalizeProject(payload.project)

      setProjects((current) => current.map((project) => (project.id === updatedProject.id ? updatedProject : project)))
      setSelectedProjectId(updatedProject.id)
      setDraft(cloneProject(updatedProject))
      setNotice({ type: 'success', text: 'Project saved.' })
    } catch {
      setNotice({ type: 'error', text: 'The project could not be saved right now.' })
    } finally {
      setIsSaving(false)
    }
  }

  function updateField(field, value) {
    setDraft((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function updateNested(group, field, value) {
    setDraft((current) => ({
      ...current,
      [group]: {
        ...current[group],
        [field]: value,
      },
    }))
  }

  function updateList(field, nextItems) {
    setDraft((current) => ({
      ...current,
      [field]: nextItems,
    }))
  }

  function updateObject(field, nextValue) {
    setDraft((current) => ({
      ...current,
      [field]: nextValue,
    }))
  }

  if (session.status === 'loading') {
    return <AdminLoading />
  }

  if (session.status !== 'authenticated') {
    return (
      <AdminLogin
        form={loginForm}
        error={loginError}
        onChange={(field, value) => setLoginForm((current) => ({ ...current, [field]: value }))}
        onSubmit={handleLogin}
      />
    )
  }

  return (
    <div className="pp-admin-shell">
      <aside className="pp-admin-sidebar">
        <a className="pp-admin-brand" href="/" aria-label="Back to website">
          <BrandMark />
          <span>Portfolio CMS</span>
        </a>

        <div className="pp-admin-sidebar-section">
          <p className="pp-admin-sidebar-kicker">Projects</p>
          <div className="pp-admin-project-nav" aria-label="Project list">
            {projects.map((project) => (
              <button
                key={project.id}
                type="button"
                className={['pp-admin-project-tab', project.id === selectedProjectId ? 'is-active' : ''].filter(Boolean).join(' ')}
                onClick={() => selectProject(project.id)}
              >
                <span>{project.title}</span>
                <small>{project.slug}</small>
              </button>
            ))}
          </div>
        </div>

        <div className="pp-admin-sidebar-footer">
          <div>
            <span>{session.user?.name || 'Admin'}</span>
            <small>{session.user?.email}</small>
          </div>
          <button type="button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="pp-admin-main">
        <header className="pp-admin-topbar">
          <div>
            <p className="pp-admin-kicker">Dashboard</p>
            <h1>{draft?.title || 'Projects'}</h1>
          </div>
          <div className="pp-admin-topbar-actions">
            <a className="pp-admin-secondary-button" href={draft?.slug ? `/projects/${draft.slug}` : '/'} target="_blank" rel="noreferrer">
              Preview
            </a>
            <button className="pp-admin-primary-button" type="submit" form="project-editor" disabled={!draft || isSaving || !isDirty}>
              {isSaving ? 'Saving...' : isDirty ? 'Save changes' : 'Saved'}
            </button>
          </div>
        </header>

        {notice.text ? <p className={`pp-admin-notice is-${notice.type}`}>{notice.text}</p> : null}

        {isLoadingProjects ? (
          <div className="pp-admin-empty">Loading projects.</div>
        ) : draft ? (
          <form id="project-editor" className="pp-admin-editor" onSubmit={saveProject}>
            <nav className="pp-admin-panel-nav" aria-label="Editor sections">
              {panels.map((panel) => (
                <button
                  key={panel.id}
                  type="button"
                  className={activePanel === panel.id ? 'is-active' : ''}
                  onClick={() => setActivePanel(panel.id)}
                >
                  {panel.label}
                </button>
              ))}
            </nav>

            <div className="pp-admin-panel">
              {activePanel === 'overview' ? (
                <OverviewPanel draft={draft} errors={fieldErrors} onField={updateField} onList={updateList} />
              ) : null}
              {activePanel === 'assets' ? <AssetsPanel draft={draft} onNested={updateNested} /> : null}
              {activePanel === 'home' ? <HomePanel draft={draft} onList={updateList} /> : null}
              {activePanel === 'case' ? <CasePanel draft={draft} onList={updateList} onObject={updateObject} onNested={updateNested} /> : null}
              {activePanel === 'cards' ? <CardsPanel draft={draft} onList={updateList} /> : null}
              {activePanel === 'media' ? <MediaPanel draft={draft} onList={updateList} /> : null}
              {activePanel === 'seo' ? <SeoPanel draft={draft} errors={fieldErrors} onField={updateField} /> : null}
            </div>
          </form>
        ) : (
          <div className="pp-admin-empty">No projects found.</div>
        )}
      </main>
    </div>
  )
}

function AdminLoading() {
  return (
    <div className="pp-admin-auth">
      <div className="pp-admin-auth-panel">
        <BrandMark />
        <p className="pp-admin-kicker">Portfolio CMS</p>
        <h1>Loading dashboard.</h1>
      </div>
    </div>
  )
}

function AdminLogin({ form, error, onChange, onSubmit }) {
  return (
    <div className="pp-admin-auth">
      <form className="pp-admin-auth-panel" onSubmit={onSubmit}>
        <BrandMark />
        <p className="pp-admin-kicker">Portfolio CMS</p>
        <h1>Sign in.</h1>

        <Field label="Email" value={form.email} onChange={(value) => onChange('email', value)} autoComplete="email" />
        <Field
          label="Password"
          type="password"
          value={form.password}
          onChange={(value) => onChange('password', value)}
          autoComplete="current-password"
        />

        {error ? <p className="pp-admin-notice is-error">{error}</p> : null}

        <button className="pp-admin-primary-button" type="submit">
          Enter dashboard
        </button>
      </form>
    </div>
  )
}

function OverviewPanel({ draft, errors, onField, onList }) {
  return (
    <>
      <PanelHeader title="Project overview" subtitle="Core details shared by the home list and the project page." />
      <div className="pp-admin-grid">
        <Field label="Title" value={draft.title} error={errors.title} onChange={(value) => onField('title', value)} />
        <Field label="Slug" value={draft.slug} error={errors.slug} onChange={(value) => onField('slug', slugifyInput(value))} />
        <Field label="Label" value={draft.label} onChange={(value) => onField('label', value)} wide />
        <Field label="Subtitle" value={draft.subtitle} onChange={(value) => onField('subtitle', value)} multiline rows={4} wide />
        <Field label="Role" value={draft.role} onChange={(value) => onField('role', value)} multiline rows={3} wide />
        <Field label="CTA label" value={draft.cta_label} onChange={(value) => onField('cta_label', value)} />
        <Field label="Sort order" type="number" value={draft.sort_order} onChange={(value) => onField('sort_order', value)} />
        <label className="pp-admin-check">
          <input type="checkbox" checked={draft.is_featured} onChange={(event) => onField('is_featured', event.target.checked)} />
          <span>Show on home</span>
        </label>
      </div>

      <StringList title="Stack" items={draft.stack} itemLabel="Technology" onChange={(items) => onList('stack', items)} compact />
    </>
  )
}

function AssetsPanel({ draft, onNested }) {
  return (
    <>
      <PanelHeader title="Assets" subtitle="Paths used by covers, previews, hero backgrounds, and videos." />
      <div className="pp-admin-grid">
        <AssetField
          label="Cover image"
          value={draft.cover.image}
          kind="image"
          alt={draft.cover.alt || draft.title}
          onChange={(value) => onNested('cover', 'image', value)}
        />
        <AssetField
          label="Hover video"
          value={draft.cover.hover_video}
          kind="video"
          video
          onChange={(value) => onNested('cover', 'hover_video', value)}
        />
        <AssetField
          label="Background image"
          value={draft.cover.background_image}
          kind="image"
          alt={draft.cover.alt || draft.title}
          onChange={(value) => onNested('cover', 'background_image', value)}
        />
        <AssetField
          label="Background video"
          value={draft.cover.background_video}
          kind="video"
          video
          onChange={(value) => onNested('cover', 'background_video', value)}
        />
        <Field label="Alt text" value={draft.cover.alt} onChange={(value) => onNested('cover', 'alt', value)} wide />
      </div>
    </>
  )
}

function HomePanel({ draft, onList }) {
  return (
    <>
      <PanelHeader title="Home copy" subtitle="Text used by the selected work cards on the homepage." />
      <StringList title="Home paragraphs" items={draft.home_copy} itemLabel="Paragraph" onChange={(items) => onList('home_copy', items)} />
    </>
  )
}

function CasePanel({ draft, onList, onObject, onNested }) {
  return (
    <>
      <PanelHeader title="Case page" subtitle="Hero copy, snapshot, story sections, outcome, and final CTA." />
      <StringList title="Hero paragraphs" items={draft.hero_copy} itemLabel="Hero paragraph" onChange={(items) => onList('hero_copy', items)} />
      <KeyValueEditor title="Snapshot" items={draft.snapshot} onChange={(items) => onObject('snapshot', items)} />
      <SectionsEditor sections={draft.sections} onChange={(sections) => onObject('sections', sections)} />
      <StringList title="Outcome" items={draft.outcome} itemLabel="Outcome paragraph" onChange={(items) => onList('outcome', items)} />

      <section className="pp-admin-block">
        <h2>Final CTA</h2>
        <div className="pp-admin-grid">
          <Field label="Title" value={draft.final_cta.title} onChange={(value) => onNested('final_cta', 'title', value)} />
          <Field label="Button" value={draft.final_cta.cta} onChange={(value) => onNested('final_cta', 'cta', value)} />
          <Field label="Copy" value={draft.final_cta.copy} onChange={(value) => onNested('final_cta', 'copy', value)} multiline rows={4} wide />
        </div>
      </section>
    </>
  )
}

function CardsPanel({ draft, onList }) {
  return (
    <>
      <PanelHeader title="Cards" subtitle="Reusable cards shown inside the project case study." />
      <CardList title="What I built" items={draft.built} onChange={(items) => onList('built', items)} />
      <CardList title="Stack and integrations" items={draft.integrations} onChange={(items) => onList('integrations', items)} />
    </>
  )
}

function MediaPanel({ draft, onList }) {
  return (
    <>
      <PanelHeader title="Media" subtitle="Media cards prepared for screenshots, videos, diagrams, or captions." />
      <MediaList items={draft.media} onChange={(items) => onList('media', items)} />
    </>
  )
}

function SeoPanel({ draft, onField }) {
  return (
    <>
      <PanelHeader title="SEO" subtitle="Browser title and search description for the exclusive project page." />
      <div className="pp-admin-grid">
        <Field label="Meta title" value={draft.meta_title} onChange={(value) => onField('meta_title', value)} wide />
        <Field label="Meta description" value={draft.meta_description} onChange={(value) => onField('meta_description', value)} multiline rows={5} wide />
      </div>
    </>
  )
}

function PanelHeader({ title, subtitle }) {
  return (
    <div className="pp-admin-panel-header">
      <p className="pp-admin-kicker">Editor</p>
      <h2>{title}</h2>
      <p>{subtitle}</p>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', multiline = false, rows = 3, wide = false, error, ...props }) {
  const Component = multiline ? 'textarea' : 'input'

  return (
    <label className={['pp-admin-field', wide ? 'is-wide' : ''].filter(Boolean).join(' ')}>
      <span>{label}</span>
      <Component
        type={multiline ? undefined : type}
        rows={multiline ? rows : undefined}
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
        {...props}
      />
      {error ? <small>{error}</small> : null}
    </label>
  )
}

function StringList({ title, items, itemLabel, onChange, compact = false }) {
  const safeItems = items.length > 0 ? items : ['']

  function updateItem(index, value) {
    onChange(safeItems.map((item, itemIndex) => (itemIndex === index ? value : item)))
  }

  function removeItem(index) {
    onChange(safeItems.filter((_, itemIndex) => itemIndex !== index))
  }

  return (
    <section className="pp-admin-block">
      <BlockHeader title={title} onAdd={() => onChange([...items, ''])} />
      <div className="pp-admin-repeat">
        {safeItems.map((item, index) => (
          <div key={`${title}-${index}`} className="pp-admin-repeat-row">
            <Field
              label={`${itemLabel} ${index + 1}`}
              value={item}
              onChange={(value) => updateItem(index, value)}
              multiline={!compact}
              rows={compact ? undefined : 4}
              wide
            />
            <button type="button" className="pp-admin-icon-button" onClick={() => removeItem(index)} aria-label={`Remove ${itemLabel} ${index + 1}`}>
              Remove
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}

function KeyValueEditor({ title, items, onChange }) {
  const entries = Object.entries(items).length > 0 ? Object.entries(items) : [['', '']]

  function updateEntry(index, key, value) {
    const nextEntries = entries.map((entry, entryIndex) => (entryIndex === index ? [key, value] : entry))
    onChange(Object.fromEntries(nextEntries))
  }

  function removeEntry(index) {
    onChange(Object.fromEntries(entries.filter((_, entryIndex) => entryIndex !== index)))
  }

  return (
    <section className="pp-admin-block">
      <BlockHeader title={title} onAdd={() => onChange({ ...items, '': '' })} />
      <div className="pp-admin-repeat">
        {entries.map(([key, value], index) => (
          <div key={`${title}-${index}`} className="pp-admin-repeat-row pp-admin-repeat-row--split">
            <Field label="Label" value={key} onChange={(nextKey) => updateEntry(index, nextKey, value)} />
            <Field label="Value" value={value} onChange={(nextValue) => updateEntry(index, key, nextValue)} />
            <button type="button" className="pp-admin-icon-button" onClick={() => removeEntry(index)}>
              Remove
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}

function SectionsEditor({ sections, onChange }) {
  const entries = Object.entries(sections).length > 0 ? Object.entries(sections) : [['', ['']]]

  function updateSection(index, nextTitle, nextParagraphs) {
    const nextEntries = entries.map((entry, entryIndex) => (entryIndex === index ? [nextTitle, nextParagraphs] : entry))
    onChange(Object.fromEntries(nextEntries))
  }

  function removeSection(index) {
    onChange(Object.fromEntries(entries.filter((_, entryIndex) => entryIndex !== index)))
  }

  return (
    <section className="pp-admin-block">
      <BlockHeader title="Story sections" onAdd={() => onChange({ ...sections, '': [''] })} />
      <div className="pp-admin-section-list">
        {entries.map(([title, paragraphs], index) => (
          <article key={`section-${index}`} className="pp-admin-subpanel">
            <div className="pp-admin-subpanel-head">
              <Field label="Section title" value={title} onChange={(value) => updateSection(index, value, paragraphs)} />
              <button type="button" className="pp-admin-icon-button" onClick={() => removeSection(index)}>
                Remove
              </button>
            </div>
            <StringList
              title="Paragraphs"
              itemLabel="Paragraph"
              items={paragraphs}
              onChange={(items) => updateSection(index, title, items)}
            />
          </article>
        ))}
      </div>
    </section>
  )
}

function CardList({ title, items, onChange }) {
  const safeItems = items.length > 0 ? items : [{ title: '', text: '' }]

  function updateCard(index, field, value) {
    onChange(safeItems.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item)))
  }

  function removeCard(index) {
    onChange(safeItems.filter((_, itemIndex) => itemIndex !== index))
  }

  return (
    <section className="pp-admin-block">
      <BlockHeader title={title} onAdd={() => onChange([...items, { title: '', text: '' }])} />
      <div className="pp-admin-card-list">
        {safeItems.map((item, index) => (
          <article key={`${title}-${index}`} className="pp-admin-subpanel">
            <div className="pp-admin-subpanel-head">
              <p>{String(index + 1).padStart(2, '0')}</p>
              <button type="button" className="pp-admin-icon-button" onClick={() => removeCard(index)}>
                Remove
              </button>
            </div>
            <Field label="Title" value={item.title} onChange={(value) => updateCard(index, 'title', value)} />
            <Field label="Text" value={item.text} onChange={(value) => updateCard(index, 'text', value)} multiline rows={4} />
          </article>
        ))}
      </div>
    </section>
  )
}

function MediaList({ items, onChange }) {
  const safeItems = items.length > 0 ? items : [{ title: '', caption: '', image: '', video: '', alt: '' }]

  function updateMedia(index, field, value) {
    onChange(safeItems.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item)))
  }

  function removeMedia(index) {
    onChange(safeItems.filter((_, itemIndex) => itemIndex !== index))
  }

  return (
    <section className="pp-admin-block">
      <BlockHeader title="Media cards" onAdd={() => onChange([...items, { title: '', caption: '', image: '', video: '', alt: '' }])} />
      <div className="pp-admin-card-list">
        {safeItems.map((item, index) => (
          <article key={`media-${index}`} className="pp-admin-subpanel">
            <div className="pp-admin-subpanel-head">
              <p>{String(index + 1).padStart(2, '0')}</p>
              <button type="button" className="pp-admin-icon-button" onClick={() => removeMedia(index)}>
                Remove
              </button>
            </div>
            <div className="pp-admin-grid">
              <Field label="Title" value={item.title} onChange={(value) => updateMedia(index, 'title', value)} />
              <Field label="Alt text" value={item.alt || ''} onChange={(value) => updateMedia(index, 'alt', value)} />
              <Field label="Caption" value={item.caption} onChange={(value) => updateMedia(index, 'caption', value)} multiline rows={4} wide />
              <AssetField
                label="Image"
                value={item.image || ''}
                kind="image"
                alt={item.alt || item.title}
                onChange={(value) => updateMedia(index, 'image', value)}
              />
              <AssetField
                label="Video"
                value={item.video || ''}
                kind="video"
                video
                onChange={(value) => updateMedia(index, 'video', value)}
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function BlockHeader({ title, onAdd }) {
  return (
    <div className="pp-admin-block-header">
      <h2>{title}</h2>
      <button type="button" className="pp-admin-secondary-button" onClick={onAdd}>
        Add
      </button>
    </div>
  )
}

function AssetField({ label, value, kind, onChange, alt = '', video = false }) {
  return (
    <div className="pp-admin-upload-field">
      <Field label={`${label} path`} value={value || ''} onChange={onChange} />
      <div className="pp-admin-upload-actions">
        <UploadControl kind={kind} hasValue={Boolean(value)} onUploaded={onChange} />
        <small>Paste a path manually or upload a new {kind}.</small>
      </div>
      <AssetPreview value={value} video={video} alt={alt} />
    </div>
  )
}

function UploadControl({ kind, hasValue, onUploaded }) {
  const [state, setState] = useState({ status: 'idle', message: '' })
  const accept = kind === 'video' ? 'video/mp4,video/webm,video/quicktime' : 'image/jpeg,image/png,image/webp,image/gif'
  const label = state.status === 'uploading' ? 'Uploading...' : `${hasValue ? 'Replace' : 'Upload'} ${kind}`

  async function handleFileChange(event) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const formData = new FormData()
    formData.append('kind', kind)
    formData.append('file', file)

    setState({ status: 'uploading', message: '' })

    try {
      const response = await fetch('/api/admin/uploads', {
        method: 'POST',
        credentials: 'same-origin',
        body: formData,
      })
      const payload = await response.json()

      if (!response.ok) {
        setState({ status: 'error', message: payload.message || 'Upload failed.' })
        return
      }

      onUploaded(payload.path)
      setState({ status: 'success', message: 'Uploaded. Save changes to attach it.' })
    } catch {
      setState({ status: 'error', message: 'Upload failed.' })
    } finally {
      event.target.value = ''
    }
  }

  return (
    <>
      <label className={['pp-admin-upload-button', state.status === 'uploading' ? 'is-uploading' : ''].filter(Boolean).join(' ')}>
        <input type="file" accept={accept} disabled={state.status === 'uploading'} onChange={handleFileChange} />
        <span>{label}</span>
      </label>
      {state.message ? <small className={`pp-admin-upload-status is-${state.status}`}>{state.message}</small> : null}
    </>
  )
}

function AssetPreview({ value, alt = '', video = false }) {
  const src = assetUrl(value)

  if (!src) {
    return <div className="pp-admin-asset-preview is-empty">No preview</div>
  }

  return (
    <div className="pp-admin-asset-preview">
      {video || /\.(mp4|webm|mov)$/i.test(src) ? (
        <video src={src} muted controls playsInline />
      ) : (
        <img src={src} alt={alt} loading="lazy" />
      )}
    </div>
  )
}

function normalizeProject(project) {
  const cover = valueObject(project.cover)
  const finalCta = valueObject(project.final_cta)

  return {
    ...defaultProject,
    ...project,
    id: Number(project.id),
    sort_order: Number(project.sort_order || 0),
    is_featured: Boolean(project.is_featured),
    cta_label: project.cta_label || project.cta || '',
    cover: {
      ...defaultProject.cover,
      ...cover,
      image: cover.image || '',
      hover_video: cover.hover_video || '',
      background_image: cover.background_image || '',
      background_video: cover.background_video || '',
      alt: cover.alt || '',
    },
    stack: stringList(project.stack),
    home_copy: stringList(project.home_copy),
    hero_copy: stringList(project.hero_copy),
    snapshot: valueObject(project.snapshot),
    sections: sectionObject(project.sections),
    built: cardList(project.built),
    integrations: cardList(project.integrations),
    media: mediaList(project.media),
    outcome: stringList(project.outcome),
    final_cta: {
      ...defaultProject.final_cta,
      ...finalCta,
    },
  }
}

function cloneProject(project) {
  return JSON.parse(JSON.stringify(project))
}

function valueObject(value) {
  return value && !Array.isArray(value) && typeof value === 'object' ? value : {}
}

function stringList(value) {
  return Array.isArray(value) ? value.map((item) => String(item || '')) : []
}

function cardList(value) {
  return Array.isArray(value)
    ? value.map((item) => ({
        title: item?.title || '',
        text: item?.text || '',
      }))
    : []
}

function mediaList(value) {
  return Array.isArray(value)
    ? value.map((item) => ({
        title: item?.title || '',
        caption: item?.caption || '',
        image: item?.image || '',
        video: item?.video || '',
        alt: item?.alt || '',
      }))
    : []
}

function sectionObject(value) {
  if (!value || Array.isArray(value) || typeof value !== 'object') {
    return {}
  }

  return Object.fromEntries(Object.entries(value).map(([title, paragraphs]) => [title, stringList(paragraphs)]))
}

function slugifyInput(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+/, '')
}

function assetUrl(value) {
  const path = String(value || '').trim()

  if (!path) {
    return ''
  }

  if (/^(https?:)?\/\//.test(path) || path.startsWith('/')) {
    return path
  }

  if (path.startsWith('images/')) {
    return `/assets/${path}`
  }

  return `/${path.replace(/^\/+/, '')}`
}
