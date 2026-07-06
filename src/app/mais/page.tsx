import Link from 'next/link'
import {
  Bell,
  FileText,
  DollarSign,
  Settings,
  ChevronRight,
  UserCircle,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const sections = [
  {
    items: [
      { href: '/alertas', label: 'Alertas', description: 'Pacientes que precisam de atenção', icon: Bell, color: 'text-red-500 bg-red-50' },
      { href: '/relatorios', label: 'Relatórios', description: 'Relatórios clínicos e PDF', icon: FileText, color: 'text-purple-500 bg-purple-50' },
    ],
  },
  {
    items: [
      { href: '/financeiro', label: 'Financeiro', description: 'Pagamentos, acordos e fechamento mensal', icon: DollarSign, color: 'text-amber-500 bg-amber-50' },
    ],
  },
  {
    items: [
      { href: '/configuracoes', label: 'Meu Perfil & Configurações', description: 'Nome profissional, CRF, assinatura, sistema', icon: UserCircle, color: 'text-[#0d7ea8] bg-[#0d7ea8]/10' },
      { href: '/configuracoes', label: 'Configurações do Sistema', description: 'Checklist de produção e cron jobs', icon: Settings, color: 'text-gray-500 bg-gray-100' },
    ],
  },
]

export default function MaisPage() {
  return (
    <div className="space-y-5 max-w-lg mx-auto">
      <h1 className="text-xl font-semibold">Mais</h1>

      {sections.map((section, si) => (
        <Card key={si} className="border-0 shadow-sm overflow-hidden">
          <CardContent className="p-0 divide-y">
            {section.items.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href + item.label}
                  href={item.href}
                  className="flex items-center gap-4 px-4 py-4 hover:bg-gray-50 transition-colors group"
                >
                  <div className={`rounded-xl p-2.5 shrink-0 ${item.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{item.label}</p>
                    <p className="text-xs text-gray-500 truncate">{item.description}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 shrink-0" />
                </Link>
              )
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
