const projectTypeLabels = {
  system_app: 'System / App',
  website: 'Website',
  ecommerce: 'Ecommerce',
  other: 'Other',
}

const scopeLabels = {
  new: 'New project',
  updates: 'Targeted adjustments',
  refactor: 'Refactor',
}

export function prepareProjectReview(payload, sourceUrl) {
  if (isFilled(payload.website)) {
    return { spam: true }
  }

  const errors = {}
  const name = stringValue(payload.name)
  const email = stringValue(payload.email)
  const projectType = stringValue(payload.project_type)
  const scope = stringValue(payload.scope)
  const briefing = stringValue(payload.message)
  const projectLink = normalizeProjectLink(payload.project_link)

  if (!name) {
    addError(errors, 'name', 'The name field is required.')
  } else if (name.length > 120) {
    addError(errors, 'name', 'The name field must not be greater than 120 characters.')
  }

  if (!email) {
    addError(errors, 'email', 'The contact email field is required.')
  } else if (email.length > 190 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    addError(errors, 'email', 'The contact email field must be a valid email address.')
  }

  if (projectLink.error) {
    addError(errors, 'project_link', 'The Current project or company link field must be a valid URL.')
  }

  if (!Object.hasOwn(projectTypeLabels, projectType)) {
    addError(errors, 'project_type', 'The project type field is required.')
  }

  if (!Object.hasOwn(scopeLabels, scope)) {
    addError(errors, 'scope', 'The scope field is required.')
  }

  if (!briefing) {
    addError(errors, 'message', 'The brief message field is required.')
  } else if (briefing.length < 20) {
    addError(errors, 'message', 'The brief message field must be at least 20 characters.')
  } else if (briefing.length > 5000) {
    addError(errors, 'message', 'The brief message field must not be greater than 5000 characters.')
  }

  if (Object.keys(errors).length > 0) {
    return { errors }
  }

  return {
    data: {
      name,
      email,
      projectLink: projectLink.value,
      projectType: projectTypeLabels[projectType],
      scope: scopeLabels[scope],
      briefing,
      sourceUrl: stringValue(sourceUrl) || 'Not provided',
      submittedAt: new Date().toISOString(),
    },
  }
}

function normalizeProjectLink(value) {
  const trimmed = stringValue(value)

  if (!trimmed) {
    return { value: null }
  }

  if (trimmed.length > 255) {
    return { error: true }
  }

  const normalized = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`

  try {
    const parsed = new URL(normalized)

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { error: true }
    }

    return { value: parsed.toString() }
  } catch {
    return { error: true }
  }
}

function stringValue(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function isFilled(value) {
  return stringValue(value) !== ''
}

function addError(errors, field, message) {
  errors[field] ||= []
  errors[field].push(message)
}
