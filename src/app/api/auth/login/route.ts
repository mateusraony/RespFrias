import { NextRequest, NextResponse } from 'next/server'
import { deriveSessionToken } from '@/lib/session'
import sql from '@/lib/db/client'

const MAX_ATTEMPTS = 5

function getIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
}

export async function POST(req: NextRequest) {
  const ip = getIp(req)

  await sql`INSERT INTO login_attempts (ip) VALUES (${ip})`

  const [{ count }] = await sql<{ count: string }[]>`
    SELECT COUNT(*)::text AS count
    FROM login_attempts
    WHERE ip = ${ip}
      AND created_at > now() - interval '15 minutes'
  `

  if (Number(count) > MAX_ATTEMPTS) {
    return NextResponse.json({ error: 'Muitas tentativas. Aguarde 15 minutos.' }, { status: 429 })
  }

  const body = await req.json().catch(() => ({}))
  const { password } = body as { password?: string }

  const appPassword = process.env.APP_PASSWORD
  if (!appPassword) {
    return NextResponse.json({ error: 'APP_PASSWORD não configurada.' }, { status: 500 })
  }

  if (!password || password !== appPassword) {
    return NextResponse.json({ error: 'Senha incorreta.' }, { status: 401 })
  }

  await sql`DELETE FROM login_attempts WHERE ip = ${ip}`

  const from = (body as { from?: string }).from ?? '/'
  const safeFrom = from.startsWith('/') && !from.startsWith('//') ? from : '/'

  const sessionToken = await deriveSessionToken(appPassword)
  const res = NextResponse.json({ ok: true, redirect: safeFrom })
  res.cookies.set('respfrias_session', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })
  return res
}
