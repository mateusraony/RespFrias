import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'
import { MobileNav } from '@/components/layout/mobile-nav'
import { getProfile } from '@/app/actions/profile'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile()
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          name={profile?.full_name ?? 'Fisioterapeuta'}
          title={profile?.title ?? 'Ft.'}
        />
        <main className="flex-1 p-4 lg:p-6 pb-24 lg:pb-6">{children}</main>
      </div>
      <MobileNav />
    </div>
  )
}
