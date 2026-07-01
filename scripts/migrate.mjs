import postgres from 'postgres'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SEED_FILES = /^0(07|09|12)_seed_/
const ADVISORY_LOCK_ID = 1234567890

async function run() {
  const url = process.env.DATABASE_URL
  if (!url) { console.error('DATABASE_URL not set'); process.exit(1) }

  const sql = postgres(url, { ssl: 'require', connect_timeout: 30, max: 1 })

  // Non-blocking lock: if another instance is already migrating, skip
  const [{ pg_try_advisory_lock: locked }] = await sql`SELECT pg_try_advisory_lock(${ADVISORY_LOCK_ID})`
  if (!locked) {
    console.log('Another instance is running migrations — skipping.')
    await sql.end()
    return
  }
  console.log('Migration lock acquired.')

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `

    const dir = path.join(__dirname, '..', 'supabase/migrations')
    const allFiles = (await fs.readdir(dir)).sort()
    const files = allFiles.filter(f => f.endsWith('.sql') && !SEED_FILES.test(f))

    const appliedRows = await sql`SELECT filename FROM schema_migrations`
    let applied = new Set(appliedRows.map(r => r.filename))

    if (applied.size === 0) {
      const exists = await sql`
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'patients'
        LIMIT 1
      `
      if (exists.length > 0) {
        console.log('Existing database detected — backfilling migration history...')
        for (const file of files) {
          await sql`INSERT INTO schema_migrations (filename) VALUES (${file}) ON CONFLICT DO NOTHING`
        }
        applied = new Set(files)
        console.log('  ✓ Backfill done.')
      }
    }

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

    if (failed) { console.error('Migration failed.'); process.exit(1) }
    console.log('Done.')
  } finally {
    await sql`SELECT pg_advisory_unlock(${ADVISORY_LOCK_ID})`
    await sql.end()
  }
}

const timeout = new Promise(resolve => setTimeout(() => {
  console.warn('Migration timeout (60s) — starting server anyway.')
  resolve()
}, 60_000))

Promise.race([run(), timeout])
