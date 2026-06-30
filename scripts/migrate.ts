import postgres from 'postgres'
import fs from 'fs/promises'
import path from 'path'

const SEED_FILES = /^0(07|09|12)_seed_/

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' })

const dir = path.join(process.cwd(), 'supabase/migrations')
const allFiles = (await fs.readdir(dir)).sort()
const files = allFiles.filter(f => !SEED_FILES.test(f))

let failed = false
for (const file of files) {
  console.log(`Applying ${file}...`)
  const content = await fs.readFile(path.join(dir, file), 'utf8')
  try {
    await sql.unsafe(content)
    console.log(`  ✓ ${file}`)
  } catch (err) {
    console.error(`  ✗ ${file}:`, (err as Error).message)
    failed = true
    break
  }
}

await sql.end()

if (failed) {
  console.error('Migration failed — database may be partially migrated.')
  process.exit(1)
}
console.log('Done.')
