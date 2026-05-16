import fs from 'node:fs/promises'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const uploadDirs = [
  'public/assets/uploads/images',
  'public/assets/uploads/videos',
  'dist/assets/uploads/images',
  'dist/assets/uploads/videos',
]

for (const dir of uploadDirs) {
  await fs.mkdir(dir, { recursive: true })
}

try {
  await execFileAsync('chown', ['-R', 'www-data:www-data', 'public/assets/uploads', 'dist/assets/uploads'])
} catch {
  // Local builds may not run as root or may not have a www-data user.
}
