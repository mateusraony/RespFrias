'use client'

import dynamic from 'next/dynamic'
import type { Session } from '@/types'

const SessionCharts = dynamic(
  () => import('./session-charts').then((m) => m.SessionCharts),
  { ssr: false, loading: () => <div className="h-40 animate-pulse rounded-md bg-muted" /> }
)

export function SessionChartsWrapper({ sessions }: { sessions: Session[] }) {
  return <SessionCharts sessions={sessions} />
}
