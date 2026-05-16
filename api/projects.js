const projectIcons = {
  'bubble-clean': 'shield',
  'pressplay-lms': 'screen',
}

export function projectPayload(row) {
  const cover = parseJson(row.cover, {})
  const homeCopy = parseJson(row.home_copy, [])
  const summary = Array.isArray(homeCopy) ? homeCopy.filter((item) => typeof item === 'string').join(' ').trim() : ''
  const image = normalizeAssetPath(cover.image)
  const video = normalizeAssetPath(cover.hover_video)
  const backgroundImage = normalizeAssetPath(cover.background_image)
  const backgroundVideo = normalizeAssetPath(cover.background_video)

  return {
    id: Number(row.id),
    slug: row.slug,
    title: row.title,
    label: row.label,
    meta_title: row.meta_title,
    meta_description: row.meta_description,
    subtitle: row.subtitle,
    role: row.role,
    cta: row.cta_label,
    href: `/projects/${row.slug}`,
    image,
    video,
    alt: cover.alt || row.title,
    icon: projectIcon(row.slug),
    summary: summary || row.subtitle,
    cover: {
      ...cover,
      image,
      hover_video: video,
      background_image: backgroundImage,
      background_video: backgroundVideo,
    },
    stack: parseJson(row.stack, []),
    home_copy: homeCopy,
    hero_copy: parseJson(row.hero_copy, []),
    snapshot: orderedObject(parseJson(row.snapshot, {}), ['Type', 'Role', 'Stack', 'Deliverables']),
    sections: orderedObject(parseJson(row.sections, {}), ['Context', 'Challenge', 'Solution']),
    built: parseJson(row.built, []),
    integrations: parseJson(row.integrations, []),
    media: mediaPayload(parseJson(row.media, [])),
    outcome: parseJson(row.outcome, []),
    final_cta: parseJson(row.final_cta, {}),
  }
}

export function adminProjectPayload(row) {
  return {
    ...projectPayload(row),
    sort_order: Number(row.sort_order || 0),
    is_featured: Boolean(row.is_featured),
    cta_label: row.cta_label,
    cover: parseJson(row.cover, {}),
    stack: parseJson(row.stack, []),
    home_copy: parseJson(row.home_copy, []),
    hero_copy: parseJson(row.hero_copy, []),
    snapshot: parseJson(row.snapshot, {}),
    sections: parseJson(row.sections, {}),
    built: parseJson(row.built, []),
    integrations: parseJson(row.integrations, []),
    media: parseJson(row.media, []),
    outcome: parseJson(row.outcome, []),
    final_cta: parseJson(row.final_cta, {}),
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

export function prepareProjectUpdate(payload) {
  const errors = {}
  const slug = slugValue(payload.slug)
  const title = stringValue(payload.title)

  if (!slug) {
    errors.slug = 'Use lowercase letters, numbers, and hyphens only.'
  }

  if (!title) {
    errors.title = 'The project title is required.'
  }

  if (Object.keys(errors).length > 0) {
    return { errors }
  }

  return {
    data: {
      slug,
      sort_order: integerValue(payload.sort_order),
      is_featured: payload.is_featured ? 1 : 0,
      title,
      label: stringValue(payload.label),
      meta_title: stringValue(payload.meta_title),
      meta_description: stringValue(payload.meta_description),
      subtitle: stringValue(payload.subtitle),
      role: stringValue(payload.role),
      cta_label: stringValue(payload.cta_label || payload.cta),
      cover: JSON.stringify(coverValue(payload.cover)),
      stack: JSON.stringify(stringArray(payload.stack)),
      home_copy: JSON.stringify(stringArray(payload.home_copy)),
      hero_copy: JSON.stringify(stringArray(payload.hero_copy)),
      snapshot: JSON.stringify(stringObject(payload.snapshot)),
      sections: JSON.stringify(sectionObject(payload.sections)),
      built: JSON.stringify(cardArray(payload.built)),
      integrations: JSON.stringify(cardArray(payload.integrations)),
      media: JSON.stringify(mediaArray(payload.media)),
      outcome: JSON.stringify(stringArray(payload.outcome)),
      final_cta: JSON.stringify(finalCtaValue(payload.final_cta)),
    },
  }
}

export function parseJson(value, fallback) {
  if (value === null || value === undefined) {
    return fallback
  }

  if (typeof value !== 'string') {
    return value
  }

  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

function stringValue(value) {
  if (value === null || value === undefined) {
    return ''
  }

  return String(value).trim()
}

function nullableString(value) {
  const normalized = stringValue(value)

  return normalized === '' ? null : normalized
}

function slugValue(value) {
  const slug = stringValue(value).toLowerCase()

  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ? slug : ''
}

function integerValue(value) {
  const number = Number.parseInt(value, 10)

  if (!Number.isFinite(number) || number < 0) {
    return 0
  }

  return Math.min(number, 65535)
}

function stringArray(value) {
  return Array.isArray(value) ? value.map(stringValue).filter(Boolean) : []
}

function stringObject(value) {
  if (!value || Array.isArray(value) || typeof value !== 'object') {
    return {}
  }

  return Object.fromEntries(
    Object.entries(value)
      .map(([key, item]) => [stringValue(key), stringValue(item)])
      .filter(([key, item]) => key && item),
  )
}

function coverValue(value) {
  const cover = !value || Array.isArray(value) || typeof value !== 'object' ? {} : value

  return {
    image: nullableString(cover.image),
    hover_video: nullableString(cover.hover_video),
    background_image: nullableString(cover.background_image),
    background_video: nullableString(cover.background_video),
    alt: stringValue(cover.alt),
  }
}

function sectionObject(value) {
  if (!value || Array.isArray(value) || typeof value !== 'object') {
    return {}
  }

  return Object.fromEntries(
    Object.entries(value)
      .map(([title, paragraphs]) => [stringValue(title), stringArray(paragraphs)])
      .filter(([title, paragraphs]) => title && paragraphs.length > 0),
  )
}

function cardArray(value) {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((item) => ({
      title: stringValue(item?.title),
      text: stringValue(item?.text),
    }))
    .filter((item) => item.title || item.text)
}

function mediaArray(value) {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((item) => ({
      title: stringValue(item?.title),
      caption: stringValue(item?.caption),
      image: nullableString(item?.image),
      video: nullableString(item?.video),
      alt: stringValue(item?.alt),
    }))
    .filter((item) => item.title || item.caption || item.image || item.video)
}

function finalCtaValue(value) {
  const finalCta = !value || Array.isArray(value) || typeof value !== 'object' ? {} : value

  return {
    title: stringValue(finalCta.title),
    copy: stringValue(finalCta.copy),
    cta: stringValue(finalCta.cta),
  }
}

function normalizeAssetPath(assetPath) {
  if (typeof assetPath !== 'string' || assetPath.trim() === '') {
    return null
  }

  if (/^(https?:)?\/\//.test(assetPath) || assetPath.startsWith('/')) {
    return assetPath
  }

  if (assetPath.startsWith('images/')) {
    return `/assets/${assetPath.replace(/^\/+/, '')}`
  }

  return `/${assetPath.replace(/^\/+/, '')}`
}

function orderedObject(data, preferredOrder) {
  if (!data || Array.isArray(data) || typeof data !== 'object') {
    return {}
  }

  const ordered = {}

  for (const key of preferredOrder) {
    if (Object.hasOwn(data, key)) {
      ordered[key] = data[key]
    }
  }

  for (const [key, value] of Object.entries(data)) {
    if (!Object.hasOwn(ordered, key)) {
      ordered[key] = value
    }
  }

  return ordered
}

function mediaPayload(media) {
  if (!Array.isArray(media)) {
    return []
  }

  return media.map((item) => ({
    ...item,
    image: normalizeAssetPath(item?.image),
    video: normalizeAssetPath(item?.video),
  }))
}

function projectIcon(slug) {
  return projectIcons[slug] || 'layers'
}
