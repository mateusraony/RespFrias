import sql from '@/lib/db/client'

export async function runJob(
  jobName: string,
  periodKey: string,
  fn: () => Promise<string>
): Promise<{ status: 'success' | 'skipped' | 'error'; message: string }> {
  // Idempotência: evitar duplicatas
  const existing = await sql`
    SELECT id FROM job_runs WHERE job_name = ${jobName} AND period_key = ${periodKey} LIMIT 1
  `
  if (existing.length > 0) {
    return { status: 'skipped', message: `Job ${jobName}/${periodKey} already ran.` }
  }

  try {
    const message = await fn()
    await sql`
      INSERT INTO job_runs (job_name, period_key, status)
      VALUES (${jobName}, ${periodKey}, 'success')
      ON CONFLICT (job_name, period_key) DO NOTHING
    `
    return { status: 'success', message }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    await sql`
      INSERT INTO job_runs (job_name, period_key, status, error_message)
      VALUES (${jobName}, ${periodKey}, 'error', ${errorMessage})
      ON CONFLICT (job_name, period_key) DO UPDATE SET status = 'error', error_message = ${errorMessage}
    `
    return { status: 'error', message: errorMessage }
  }
}

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10) // YYYY-MM-DD
}

export function monthKey(): string {
  return new Date().toISOString().slice(0, 7) // YYYY-MM
}
