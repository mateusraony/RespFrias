'use client'

import { useState, useEffect, useRef } from 'react'
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
  const [visible, setVisible] = useState(true)
  const prevActive = useRef(active)
  const activeTab = tabs.find((t) => t.key === active) ?? tabs[0]

  function switchTab(key: string) {
    if (key === active) return
    setVisible(false)
    setTimeout(() => {
      prevActive.current = key
      setActive(key)
      setVisible(true)
    }, 120)
  }

  // sync when defaultTab changes (e.g. URL param on mount)
  useEffect(() => {
    if (defaultTab && defaultTab !== active) {
      setActive(defaultTab)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultTab])

  return (
    <div>
      <div className="-mx-4 flex gap-1 overflow-x-auto border-b px-4 sm:mx-0 sm:px-0">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => switchTab(tab.key)}
            className={cn(
              'shrink-0 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-all duration-200',
              activeTab?.key === tab.key
                ? 'border-[#0d7ea8] text-[#0d7ea8]'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div
        className="pt-4 transition-all duration-150"
        style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(4px)' }}
      >
        {activeTab?.content}
      </div>
    </div>
  )
}
