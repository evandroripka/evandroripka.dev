import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const apiDir = path.dirname(fileURLToPath(import.meta.url))
const localConfigPath = path.join(apiDir, 'config.local.json')

export function appConfig() {
  if (!fs.existsSync(localConfigPath)) {
    throw new Error('API configuration not found. Create api/config.local.json before starting the API.')
  }

  const config = JSON.parse(fs.readFileSync(localConfigPath, 'utf8'))

  return {
    appName: config.appName || 'Evandro Ripka Staging Base',
    sessionName: config.sessionName || 'evandro_stage_base',
    sessionSecret: config.sessionSecret,
    server: {
      host: config.server?.host || process.env.HOST || '127.0.0.1',
      port: Number(config.server?.port || process.env.PORT || 3001),
    },
    db: normalizeDatabaseConfig(config.db),
    projectsDb: normalizeDatabaseConfig(config.projectsDb || config.db),
    contact: {
      email: config.contact?.email || config.mail?.to || 'hi@evandroripka.dev',
    },
    mail: normalizeMailConfig(config.mail || {}),
  }
}

function normalizeDatabaseConfig(database) {
  if (!database) {
    throw new Error('Missing database configuration.')
  }

  return {
    socketPath: database.socketPath || database.socket || undefined,
    host: database.host || '127.0.0.1',
    port: Number(database.port || 3306),
    database: database.database,
    user: database.user || database.username,
    password: database.password,
    charset: 'utf8mb4',
    waitForConnections: true,
    connectionLimit: 10,
    namedPlaceholders: true,
  }
}

function normalizeMailConfig(mail) {
  return {
    host: mail.host,
    port: Number(mail.port || 465),
    secure:
      mail.secure === undefined
        ? mail.scheme
          ? mail.scheme === 'smtps'
          : Number(mail.port || 465) === 465
        : Boolean(mail.secure),
    auth: {
      user: mail.user || mail.username,
      pass: mail.password || mail.pass,
    },
    from: {
      address: mail.fromAddress || mail.from_address || mail.from,
      name: mail.fromName || mail.from_name || 'Evandro Ripka Website',
    },
  }
}
