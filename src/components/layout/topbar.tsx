'use client'

import { Bell, Search, Menu } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function Topbar() {
  const today = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 lg:px-6 py-3">
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button className="lg:hidden p-2 rounded-lg hover:bg-gray-50" aria-label="Menu">
          <Menu className="w-5 h-5 text-gray-600" />
        </button>

        {/* Search */}
        <div className="flex-1 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            placeholder="Buscar paciente, sessão, relatório..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d7ea8]/20 focus:border-[#0d7ea8]"
          />
        </div>

        {/* Date - hidden on mobile */}
        <span className="hidden md:block text-sm text-gray-500">{today}</span>

        {/* Notifications */}
        <div className="relative">
          <button
            className="p-2 rounded-lg hover:bg-gray-50 relative"
            aria-label="Notificações"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
            >
              3
            </Badge>
          </button>
        </div>

        {/* User */}
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src="" alt="Dr. João Frias" />
            <AvatarFallback className="bg-[#0d7ea8] text-white text-xs">JF</AvatarFallback>
          </Avatar>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-gray-900">Dr. João Frias</p>
            <p className="text-xs text-gray-500">Fisioterapeuta</p>
          </div>
        </div>
      </div>
    </header>
  )
}
