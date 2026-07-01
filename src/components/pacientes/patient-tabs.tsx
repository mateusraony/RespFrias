'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'

export interface PatientTab {
  key: string
  label: string
  content: React.ReactNode
}

export function PatientTabs({ tabs }: { tabs: PatientTab[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeKey = searchParams.get('tab') ?? tabs[0]?.key
  const activeTab = tabs.find((t) => t.key === activeKey) ?? tabs[0]

  function goTo(key: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', key)
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  return (
    <div>
      <div className="-mx-4 flex gap-1 overflow-x-auto border-b px-4 sm:mx-0 sm:px-0">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => goTo(tab.key)}
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
