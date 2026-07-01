import { getProfile } from '@/app/actions/profile'
import { Topbar } from './topbar'

export async function TopbarServer() {
  const profile = await getProfile()
  return (
    <Topbar
      name={profile?.full_name ?? 'Fisioterapeuta'}
      title={profile?.title ?? 'Ft.'}
    />
  )
}
