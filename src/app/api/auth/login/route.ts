import { NextRequest, NextResponse } from 'next/server'

const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000 // 15 minutes

const attempts = new Map<string, { count: number; resetAt: number }>()

function getIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
}

export async function POST(req: NextRequest) {
  const ip = getIp(req)
  const now = Date.now()

  const record = attempts.get(ip)
  if (record && now < record.resetAt) {
    if (record.count >= MAX_ATTEMPTS) {
      return NextResponse.json({ error: 'Muitas tentativas. Aguarde 15 minutos.' }, { status: 429 })
    }
    record.count++
  } else {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS })
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

  // Clear attempts on success
  attempts.delete(ip)

  const from = (body as { from?: string }).from ?? '/'
  const safeFrom = from.startsWith('/') && !from.startsWith('//') ? from : '/'

  const res = NextResponse.json({ ok: true, redirect: safeFrom })
  res.cookies.set('respfrias_session', appPassword, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  })
  return res
}
