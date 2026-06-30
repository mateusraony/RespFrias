import postgres from 'postgres'
import fs from 'fs/promises'
import path from 'path'

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' })

const dir = path.join(process.cwd(), 'supabase/migrations')
const files = (await fs.readdir(dir)).sort()

for (const file of files) {
  console.log(`Applying ${file}...`)
  const content = await fs.readFile(path.join(dir, file), 'utf8')
  try {
    await sql.unsafe(content)
    console.log(`  ✓ ${file}`)
  } catch (err) {
    console.error(`  ✗ ${file}:`, (err as Error).message)
  }
}

await sql.end()
console.log('Done.')
