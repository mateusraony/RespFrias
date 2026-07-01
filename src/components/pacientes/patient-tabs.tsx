'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

export interface PatientTab {
  key: string
  label: string
  content: React.ReactNode
}

export function PatientTabs({
  tabs,
  defaultTab,
}: {
  tabs: PatientTab[]
  defaultTab?: string
}) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.key)
  const activeTab = tabs.find((t) => t.key === active) ?? tabs[0]

  return (
    <div>
      <div className="-mx-4 flex gap-1 overflow-x-auto border-b px-4 sm:mx-0 sm:px-0">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActive(tab.key)}
            className={cn(
              'shrink-0 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors',
              activeTab?.key === tab.key
                ? 'border-[#0d7ea8] text-[#0d7ea8]'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="pt-4">{activeTab?.content}</div>
    </div>
  )
}
