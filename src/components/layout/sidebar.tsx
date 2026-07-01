'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard,
  Users,
  Calendar,
  Activity,
  FileText,
  DollarSign,
  Bell,
  Settings,
  Wind,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/pacientes', label: 'Pacientes', icon: Users },
  { href: '/agenda', label: 'Agenda', icon: Calendar },
  { href: '/sessoes', label: 'Sessões', icon: Activity },
  { href: '/relatorios', label: 'Relatórios', icon: FileText },
  { href: '/financeiro', label: 'Financeiro', icon: DollarSign },
  { href: '/alertas', label: 'Alertas', icon: Bell, dynamicBadge: true },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [alertCount, setAlertCount] = useState(0)

  useEffect(() => {
    fetch('/api/alerts/count')
      .then((r) => r.json())
      .then((d) => setAlertCount(d.count ?? 0))
      .catch(() => {})
  }, [pathname])

  return (
    <aside className="hidden lg:flex flex-col w-56 min-h-screen bg-white border-r border-gray-100 py-6">
      {/* Logo */}
      <div className="px-4 mb-8">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#0d7ea8] flex items-center justify-center">
            <Wind className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-gray-900 text-lg">RespFrias</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          const badge = item.dynamicBadge ? alertCount : 0
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-[#0d7ea8]/10 text-[#0d7ea8]'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {badge > 0 && (
                <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">
                  {badge}
                </Badge>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 mt-6 pt-6 border-t border-gray-100">
        <p className="text-xs text-gray-400 italic leading-snug">Respiração é vida.</p>
        <p className="text-xs text-gray-400 italic">Gestão é cuidado.</p>
        <p className="text-xs text-gray-500 mt-2 font-medium">RespFrias</p>
        <p className="text-xs text-gray-400">Fisioterapia Respiratória</p>
      </div>
    </aside>
  )
}
