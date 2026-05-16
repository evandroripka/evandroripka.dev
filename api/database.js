import mysql from 'mysql2/promise'
import { appConfig } from './config.js'

const config = appConfig()

export const authDb = mysql.createPool(config.db)
export const projectsDb = mysql.createPool(config.projectsDb)

export async function closeDatabases() {
  await Promise.all([authDb.end(), projectsDb.end()])
}
