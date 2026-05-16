import { Buffer } from 'node:buffer'
import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const apiDir = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(apiDir, '..')
const maxUploadBytes = 50 * 1024 * 1024
const allowedUploads = {
  image: {
    folder: 'images',
    types: {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
    },
  },
  video: {
    folder: 'videos',
    types: {
      'video/mp4': 'mp4',
      'video/webm': 'webm',
      'video/quicktime': 'mov',
    },
  },
}

export async function handleAdminUpload(request) {
  const contentType = String(request.headers['content-type'] || '')
  const boundary = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i)?.[1] || contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i)?.[2]

  if (!boundary) {
    throw httpError('Upload requests must use multipart/form-data.', 415)
  }

  const body = await rawRequestBody(request, maxUploadBytes)
  const parts = parseMultipart(body, boundary)
  const kind = stringField(parts, 'kind')
  const file = parts.find((part) => part.filename && part.data?.length > 0)
  const uploadKind = Object.hasOwn(allowedUploads, kind) ? kind : inferKind(file?.mime)

  if (!file) {
    throw httpError('Choose a file before uploading.', 422)
  }

  if (!uploadKind) {
    throw httpError('Unsupported upload type.', 422)
  }

  const uploadConfig = allowedUploads[uploadKind]
  const extension = uploadConfig.types[file.mime]

  if (!extension) {
    const accepted = uploadKind === 'image' ? 'JPG, PNG, WEBP, or GIF' : 'MP4, WEBM, or MOV'
    throw httpError(`Invalid ${uploadKind} file. Use ${accepted}.`, 422)
  }

  const baseName = slugFileName(file.filename)
  const filename = `${Date.now()}-${crypto.randomBytes(5).toString('hex')}-${baseName}.${extension}`
  const publicPath = `/assets/uploads/${uploadConfig.folder}/${filename}`

  await writeUploadFile(`public${publicPath}`, file.data)
  await writeUploadFile(`dist${publicPath}`, file.data)

  return {
    message: 'Upload completed.',
    path: publicPath,
    filename,
    kind: uploadKind,
    mime: file.mime,
    size: file.data.length,
  }
}

async function rawRequestBody(request, limit) {
  const chunks = []
  let size = 0

  for await (const chunk of request) {
    size += chunk.length

    if (size > limit) {
      throw httpError('The uploaded file is too large.', 413)
    }

    chunks.push(chunk)
  }

  return Buffer.concat(chunks)
}

function parseMultipart(body, boundary) {
  const chunks = splitBuffer(body, Buffer.from(`--${boundary}`))
  const parts = []

  for (const chunk of chunks) {
    let part = trimBoundaryChunk(chunk)

    if (!part || part.length === 0 || part.equals(Buffer.from('--'))) {
      continue
    }

    const separator = part.indexOf(Buffer.from('\r\n\r\n'))

    if (separator === -1) {
      continue
    }

    const headerText = part.slice(0, separator).toString('utf8')
    const data = trimTrailingNewline(part.slice(separator + 4))
    const disposition = headerText.match(/content-disposition:\s*form-data;([^\r\n]+)/i)?.[1] || ''
    const name = disposition.match(/name="([^"]+)"/i)?.[1] || ''
    const filename = disposition.match(/filename="([^"]*)"/i)?.[1] || ''
    const mime = headerText.match(/content-type:\s*([^\r\n]+)/i)?.[1]?.trim().toLowerCase() || ''

    if (name) {
      parts.push({ name, filename, mime, data })
    }
  }

  return parts
}

function splitBuffer(buffer, separator) {
  const chunks = []
  let offset = 0
  let index = buffer.indexOf(separator, offset)

  while (index !== -1) {
    chunks.push(buffer.slice(offset, index))
    offset = index + separator.length
    index = buffer.indexOf(separator, offset)
  }

  chunks.push(buffer.slice(offset))

  return chunks
}

function trimBoundaryChunk(chunk) {
  let part = chunk

  if (part.slice(0, 2).equals(Buffer.from('\r\n'))) {
    part = part.slice(2)
  }

  if (part.slice(0, 2).equals(Buffer.from('--'))) {
    return null
  }

  return part
}

function trimTrailingNewline(buffer) {
  if (buffer.slice(-2).equals(Buffer.from('\r\n'))) {
    return buffer.slice(0, -2)
  }

  return buffer
}

function stringField(parts, name) {
  const part = parts.find((item) => item.name === name && !item.filename)

  return part ? part.data.toString('utf8').trim() : ''
}

function inferKind(mime) {
  if (allowedUploads.image.types[mime]) {
    return 'image'
  }

  if (allowedUploads.video.types[mime]) {
    return 'video'
  }

  return ''
}

function slugFileName(filename) {
  const basename = path.basename(filename || 'upload', path.extname(filename || '')).toLowerCase()
  const slug = basename.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

  return slug || 'asset'
}

async function writeUploadFile(relativePath, data) {
  const destination = path.join(rootDir, relativePath)
  const uploadRoot = path.join(rootDir, relativePath.startsWith('dist') ? 'dist/assets/uploads' : 'public/assets/uploads')

  if (!destination.startsWith(uploadRoot)) {
    throw httpError('Invalid upload path.', 400)
  }

  await fs.mkdir(path.dirname(destination), { recursive: true })
  await fs.writeFile(destination, data, { flag: 'wx' })
}

function httpError(message, status) {
  const error = new Error(message)
  error.status = status

  return error
}
