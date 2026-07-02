'use client'

import dynamic from 'next/dynamic'
import { ChartErrorBoundary } from '@/components/ui/chart-error-boundary'
import type { Session } from '@/types'

const SessionCharts = dynamic(
  () => import('./session-charts').then((m) => m.SessionCharts),
  { ssr: false, loading: () => <div className="h-40 animate-pulse rounded-md bg-muted" /> }
)

export function SessionChartsWrapper({ sessions }: { sessions: Session[] }) {
  return (
    <ChartErrorBoundary>
      <SessionCharts sessions={sessions} />
    </ChartErrorBoundary>
  )
}
