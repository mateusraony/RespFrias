import { NextResponse } from 'next/server'
import { getAlertCount } from '@/app/actions/alerts'

export const dynamic = 'force-dynamic'

export async function GET() {
  const count = await getAlertCount()
  return NextResponse.json({ count })
}
