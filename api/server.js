import bcrypt from 'bcryptjs'
import { Buffer } from 'node:buffer'
import crypto from 'node:crypto'
import http from 'node:http'
import process from 'node:process'
import { appConfig } from './config.js'
import { authDb, closeDatabases, projectsDb } from './database.js'
import { sendProjectReviewEmail } from './mail.js'
import { prepareProjectReview } from './projectReview.js'
import { adminProjectPayload, prepareProjectUpdate, projectPayload } from './projects.js'
import { handleAdminUpload } from './uploads.js'

const config = appConfig()
const sessionMaxAge = 60 * 60 * 12
const projectReviewThrottle = new Map()

const server = http.createServer(async (request, response) => {
  try {
    await routeRequest(request, response)
  } catch (error) {
    if (error.status) {
      jsonResponse(response, { message: error.message }, error.status)
      return
    }

    console.error(`API error: ${error.stack || error.message}`)
    jsonResponse(response, { message: 'The server could not complete the request.' }, 500)
  }
})

server.listen(config.server.port, config.server.host, () => {
  console.log(`API listening on http://${config.server.host}:${config.server.port}`)
})

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)

async function routeRequest(request, response) {
  if (request.method === 'OPTIONS') {
    response.writeHead(204, responseHeaders())
    response.end()
    return
  }

  const url = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`)
  const path = url.pathname.replace(/^\/api\/?/, '').replace(/^\/|\/$/g, '')
  const segments = path === '' ? [] : path.split('/')

  if (request.method === 'GET' && segments.length === 1 && segments[0] === 'health') {
    const [[adminCount]] = await authDb.query('SELECT COUNT(*) AS total FROM admin_users')
    const [[projectCount]] = await projectsDb.query('SELECT COUNT(*) AS total FROM projects')

    jsonResponse(response, {
      status: 'ok',
      app: config.appName,
      database: config.db.database,
      adminUsers: Number(adminCount.total),
      projects: Number(projectCount.total),
    })
    return
  }

  if (request.method === 'GET' && segments.length === 2 && segments[0] === 'public' && segments[1] === 'projects') {
    const [rows] = await projectsDb.query(
      'SELECT * FROM projects WHERE is_featured = 1 ORDER BY sort_order ASC, title ASC',
    )

    jsonResponse(response, {
      projects: rows.map(projectPayload),
    })
    return
  }

  if (request.method === 'GET' && segments.length === 3 && segments[0] === 'public' && segments[1] === 'projects') {
    const [rows] = await projectsDb.execute('SELECT * FROM projects WHERE slug = :slug LIMIT 1', {
      slug: segments[2],
    })

    if (rows.length === 0) {
      jsonResponse(response, { message: 'Project not found.' }, 404)
      return
    }

    jsonResponse(response, {
      project: projectPayload(rows[0]),
    })
    return
  }

  if (request.method === 'POST' && segments.length === 2 && segments[0] === 'public' && segments[1] === 'project-review') {
    if (!allowProjectReviewRequest(request)) {
      jsonResponse(response, { message: 'Please wait a moment before sending another request.' }, 429)
      return
    }

    const payload = await requestBody(request)
    const prepared = prepareProjectReview(payload, payload.source_url || request.headers.referer)

    if (prepared.spam) {
      jsonResponse(response, { message: 'Request sent. I will reply soon.' })
      return
    }

    if (prepared.errors) {
      jsonResponse(
        response,
        {
          message: 'Please review the highlighted fields.',
          errors: prepared.errors,
        },
        422,
      )
      return
    }

    try {
      await sendProjectReviewEmail(config, prepared.data)
    } catch (error) {
      console.error(`Mail error: ${error.stack || error.message}`)
      jsonResponse(response, { message: 'The message could not be sent right now. Please try again in a moment.' }, 500)
      return
    }

    jsonResponse(response, { message: 'Request sent. I will reply soon.' })
    return
  }

  if (request.method === 'GET' && segments.length === 2 && segments[0] === 'auth' && segments[1] === 'session') {
    const user = await currentAdmin(request)

    jsonResponse(response, {
      authenticated: user !== null,
      user,
    })
    return
  }

  if (request.method === 'POST' && segments.length === 2 && segments[0] === 'auth' && segments[1] === 'login') {
    const payload = await requestBody(request)
    const email = requiredString(payload.email, 'email')
    const password = requiredString(payload.password, 'password')
    const [rows] = await authDb.execute(
      'SELECT id, name, email, password_hash FROM admin_users WHERE email = :email LIMIT 1',
      { email },
    )
    const user = rows[0]

    if (!user || !(await verifyPassword(password, user.password_hash))) {
      jsonResponse(response, { message: 'Invalid credentials.' }, 422)
      return
    }

    setSessionCookie(request, response, Number(user.id))

    jsonResponse(response, {
      message: 'Signed in successfully.',
      user: publicAdmin(user),
    })
    return
  }

  if (request.method === 'POST' && segments.length === 2 && segments[0] === 'auth' && segments[1] === 'logout') {
    clearSessionCookie(request, response)
    jsonResponse(response, { message: 'Signed out successfully.' })
    return
  }

  if (segments[0] === 'admin') {
    const user = await requireAdmin(request, response)

    if (!user) {
      return
    }

    if (request.method === 'POST' && segments.length === 2 && segments[1] === 'uploads') {
      jsonResponse(response, await handleAdminUpload(request), 201)
      return
    }

    if (request.method === 'GET' && segments.length === 2 && segments[1] === 'projects') {
      const [rows] = await projectsDb.query('SELECT * FROM projects ORDER BY sort_order ASC, title ASC')

      jsonResponse(response, {
        user,
        projects: rows.map(adminProjectPayload),
      })
      return
    }

    if (request.method === 'GET' && segments.length === 3 && segments[1] === 'projects') {
      const project = await adminProjectByIdentifier(segments[2])

      if (!project) {
        jsonResponse(response, { message: 'Project not found.' }, 404)
        return
      }

      jsonResponse(response, {
        user,
        project: adminProjectPayload(project),
      })
      return
    }

    if (request.method === 'PUT' && segments.length === 3 && segments[1] === 'projects') {
      const project = await adminProjectByIdentifier(segments[2])

      if (!project) {
        jsonResponse(response, { message: 'Project not found.' }, 404)
        return
      }

      const prepared = prepareProjectUpdate(await requestBody(request))

      if (prepared.errors) {
        jsonResponse(
          response,
          {
            message: 'Please review the highlighted fields.',
            errors: prepared.errors,
          },
          422,
        )
        return
      }

      const [slugRows] = await projectsDb.execute('SELECT id FROM projects WHERE slug = :slug AND id <> :id LIMIT 1', {
        id: Number(project.id),
        slug: prepared.data.slug,
      })

      if (slugRows.length > 0) {
        jsonResponse(
          response,
          {
            message: 'Please review the highlighted fields.',
            errors: {
              slug: 'Another project already uses this slug.',
            },
          },
          422,
        )
        return
      }

      await projectsDb.execute(
        `UPDATE projects
          SET slug = :slug,
              sort_order = :sort_order,
              is_featured = :is_featured,
              title = :title,
              label = :label,
              meta_title = :meta_title,
              meta_description = :meta_description,
              subtitle = :subtitle,
              role = :role,
              cta_label = :cta_label,
              cover = :cover,
              stack = :stack,
              home_copy = :home_copy,
              hero_copy = :hero_copy,
              snapshot = :snapshot,
              sections = :sections,
              built = :built,
              integrations = :integrations,
              media = :media,
              outcome = :outcome,
              final_cta = :final_cta
        WHERE id = :id`,
        {
          ...prepared.data,
          id: Number(project.id),
        },
      )

      const updated = await adminProjectByIdentifier(String(project.id))

      jsonResponse(response, {
        message: 'Project saved successfully.',
        project: adminProjectPayload(updated),
      })
      return
    }

    jsonResponse(response, { message: 'Endpoint not found.' }, 404)
    return
  }

  jsonResponse(response, { message: 'Endpoint not found.' }, 404)
}

async function requireAdmin(request, response) {
  const user = await currentAdmin(request)

  if (!user) {
    jsonResponse(response, { message: 'Authentication required.' }, 401)
    return null
  }

  return user
}

async function adminProjectByIdentifier(identifier) {
  if (/^\d+$/.test(identifier)) {
    const [rows] = await projectsDb.execute('SELECT * FROM projects WHERE id = :id LIMIT 1', {
      id: Number(identifier),
    })

    return rows[0] || null
  }

  const [rows] = await projectsDb.execute('SELECT * FROM projects WHERE slug = :slug LIMIT 1', {
    slug: identifier,
  })

  return rows[0] || null
}

async function currentAdmin(request) {
  const session = verifySession(parseCookies(request.headers.cookie || '')[config.sessionName])

  if (!session) {
    return null
  }

  const [rows] = await authDb.execute('SELECT id, name, email FROM admin_users WHERE id = :id LIMIT 1', {
    id: session.id,
  })

  return rows[0] ? publicAdmin(rows[0]) : null
}

function publicAdmin(user) {
  return {
    id: Number(user.id),
    name: user.name,
    email: user.email,
  }
}

async function requestBody(request) {
  const chunks = []
  let size = 0

  for await (const chunk of request) {
    size += chunk.length

    if (size > 4 * 1024 * 1024) {
      const error = new Error('Request body is too large.')
      error.status = 413
      throw error
    }

    chunks.push(chunk)
  }

  if (chunks.length === 0) {
    return {}
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    return {}
  }
}

function requiredString(value, field) {
  if (typeof value !== 'string' || value.trim() === '') {
    const error = new Error(`The "${field}" field is required.`)
    error.status = 422
    throw error
  }

  return value.trim()
}

async function verifyPassword(password, hash) {
  const normalizedHash = typeof hash === 'string' ? hash.replace(/^\$2y\$/, '$2b$') : ''

  return bcrypt.compare(password, normalizedHash)
}

function setSessionCookie(request, response, adminId) {
  const expiresAt = Math.floor(Date.now() / 1000) + sessionMaxAge
  const payload = base64UrlEncode(JSON.stringify({ id: adminId, exp: expiresAt }))
  const signature = sign(payload)

  response.setHeader('Set-Cookie', serializeCookie(config.sessionName, `${payload}.${signature}`, request, sessionMaxAge))
}

function clearSessionCookie(request, response) {
  response.setHeader('Set-Cookie', serializeCookie(config.sessionName, '', request, 0))
}

function verifySession(token) {
  if (!token || !config.sessionSecret) {
    return null
  }

  const [payload, signature] = token.split('.')

  if (!payload || !signature || !timingSafeEqual(signature, sign(payload))) {
    return null
  }

  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))

    if (!Number.isInteger(decoded.id) || decoded.exp < Math.floor(Date.now() / 1000)) {
      return null
    }

    return decoded
  } catch {
    return null
  }
}

function sign(value) {
  return crypto.createHmac('sha256', config.sessionSecret).update(value).digest('base64url')
}

function timingSafeEqual(left, right) {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)

  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer)
}

function parseCookies(cookieHeader) {
  return Object.fromEntries(
    cookieHeader
      .split(';')
      .map((cookie) => cookie.trim())
      .filter(Boolean)
      .map((cookie) => {
        const separator = cookie.indexOf('=')

        if (separator === -1) {
          return [cookie, '']
        }

        return [cookie.slice(0, separator), decodeURIComponent(cookie.slice(separator + 1))]
      }),
  )
}

function serializeCookie(name, value, request, maxAge) {
  const secure = request.headers['x-forwarded-proto'] === 'https' || request.socket.encrypted
  const pieces = [
    `${name}=${encodeURIComponent(value)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAge}`,
  ]

  if (secure) {
    pieces.push('Secure')
  }

  return pieces.join('; ')
}

function base64UrlEncode(value) {
  return Buffer.from(value).toString('base64url')
}

function jsonResponse(response, payload, status = 200) {
  response.writeHead(status, responseHeaders())
  response.end(JSON.stringify(payload))
}

function responseHeaders() {
  return {
    'Content-Type': 'application/json; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
  }
}

function allowProjectReviewRequest(request) {
  const now = Date.now()
  const key = request.headers['x-forwarded-for']?.split(',')[0]?.trim() || request.socket.remoteAddress || 'unknown'
  const recent = (projectReviewThrottle.get(key) || []).filter((timestamp) => now - timestamp < 60 * 1000)

  if (recent.length >= 6) {
    projectReviewThrottle.set(key, recent)
    return false
  }

  recent.push(now)
  projectReviewThrottle.set(key, recent)

  return true
}

async function shutdown() {
  server.close(async () => {
    await closeDatabases()
    process.exit(0)
  })
}
