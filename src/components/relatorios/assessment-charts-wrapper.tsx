'use client'

import dynamic from 'next/dynamic'
import type { Assessment } from '@/types'

const AssessmentCharts = dynamic(
  () => import('./assessment-charts').then((m) => m.AssessmentCharts),
  { ssr: false, loading: () => <div className="h-40 animate-pulse rounded-md bg-muted" /> }
)

export function AssessmentChartsWrapper({ assessments }: { assessments: Assessment[] }) {
  return <AssessmentCharts assessments={assessments} />
}
