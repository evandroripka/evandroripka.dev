import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import mysql from 'mysql2/promise'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
const configPath = path.join(root, 'api/config.local.json')
const seedPath = path.join(root, 'database/mysql/seeds/projects.json')

if (!fs.existsSync(configPath)) {
  console.error(`Missing API config at ${configPath}.`)
  process.exit(1)
}

if (!fs.existsSync(seedPath)) {
  console.error(`Missing project seed at ${seedPath}.`)
  process.exit(1)
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
const database = config.projectsDb || config.db
const projects = JSON.parse(fs.readFileSync(seedPath, 'utf8'))
const connection = await mysql.createConnection({
  socketPath: database.socketPath || database.socket || undefined,
  host: database.host || '127.0.0.1',
  port: Number(database.port || 3306),
  database: database.database,
  user: database.user || database.username,
  password: database.password,
  charset: 'utf8mb4',
  namedPlaceholders: true,
})

const sql = `
  INSERT INTO projects (
    slug,
    sort_order,
    is_featured,
    title,
    label,
    meta_title,
    meta_description,
    subtitle,
    role,
    cta_label,
    cover,
    stack,
    home_copy,
    hero_copy,
    snapshot,
    sections,
    built,
    integrations,
    media,
    outcome,
    final_cta
  ) VALUES (
    :slug,
    :sort_order,
    1,
    :title,
    :label,
    :meta_title,
    :meta_description,
    :subtitle,
    :role,
    :cta_label,
    :cover,
    :stack,
    :home_copy,
    :hero_copy,
    :snapshot,
    :sections,
    :built,
    :integrations,
    :media,
    :outcome,
    :final_cta
  )
  ON DUPLICATE KEY UPDATE
    sort_order = VALUES(sort_order),
    is_featured = VALUES(is_featured),
    title = VALUES(title),
    label = VALUES(label),
    meta_title = VALUES(meta_title),
    meta_description = VALUES(meta_description),
    subtitle = VALUES(subtitle),
    role = VALUES(role),
    cta_label = VALUES(cta_label),
    cover = VALUES(cover),
    stack = VALUES(stack),
    home_copy = VALUES(home_copy),
    hero_copy = VALUES(hero_copy),
    snapshot = VALUES(snapshot),
    sections = VALUES(sections),
    built = VALUES(built),
    integrations = VALUES(integrations),
    media = VALUES(media),
    outcome = VALUES(outcome),
    final_cta = VALUES(final_cta)
`

let sortOrder = 1

for (const [slug, project] of Object.entries(projects)) {
  await connection.execute(sql, {
    slug,
    sort_order: sortOrder,
    title: project.title || '',
    label: project.label || '',
    meta_title: project.meta_title || '',
    meta_description: project.meta_description || '',
    subtitle: project.subtitle || '',
    role: project.role || '',
    cta_label: project.cta || '',
    cover: JSON.stringify(project.cover || {}),
    stack: JSON.stringify(project.stack || []),
    home_copy: JSON.stringify(project.home_copy || []),
    hero_copy: JSON.stringify(project.hero_copy || []),
    snapshot: JSON.stringify(project.snapshot || {}),
    sections: JSON.stringify(project.sections || {}),
    built: JSON.stringify(project.built || []),
    integrations: JSON.stringify(project.integrations || []),
    media: JSON.stringify(project.media || []),
    outcome: JSON.stringify(project.outcome || []),
    final_cta: JSON.stringify(project.final_cta || {}),
  })

  sortOrder += 1
}

await connection.end()

console.log(`Imported ${sortOrder - 1} legacy projects.`)
