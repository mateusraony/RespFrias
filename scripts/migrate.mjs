import postgres from 'postgres'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SEED_FILES = /^0(07|09|12)_seed_/

async function run() {
  const url = process.env.DATABASE_URL
  if (!url) { console.error('DATABASE_URL not set'); process.exit(1) }

  const sql = postgres(url, { ssl: 'require', connect_timeout: 30 })

  // Create tracking table if needed
  await sql`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `

  const dir = path.join(__dirname, '..', 'supabase/migrations')
  const allFiles = (await fs.readdir(dir)).sort()
  const files = allFiles.filter(f => f.endsWith('.sql') && !SEED_FILES.test(f))

  const applied = new Set(
    (await sql`SELECT filename FROM schema_migrations`).map(r => r.filename)
  )

  let failed = false
  for (const file of files) {
    if (applied.has(file)) { console.log(`  - ${file} (already applied)`); continue }
    console.log(`Applying ${file}...`)
    const content = await fs.readFile(path.join(dir, file), 'utf8')
    try {
      await sql.unsafe(content)
      await sql`INSERT INTO schema_migrations (filename) VALUES (${file})`
      console.log(`  ✓ ${file}`)
    } catch (err) {
      console.error(`  ✗ ${file}:`, err.message)
      failed = true
      break
    }
  }

  await sql.end()
  if (failed) { console.error('Migration failed.'); process.exit(1) }
  console.log('Done.')
}

run()
