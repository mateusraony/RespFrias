'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { upsertProfile } from '@/app/actions/profile'
import type { ProfessionalProfile } from '@/app/actions/profile'

export function ProfileForm({ profile }: { profile: ProfessionalProfile | null }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const result = await upsertProfile(new FormData(e.currentTarget))
    setLoading(false)
    if (!result.success) {
      toast.error(result.error)
    } else {
      toast.success('Perfil salvo com sucesso.')
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="full_name">Nome completo *</Label>
          <Input
            id="full_name"
            name="full_name"
            required
            defaultValue={profile?.full_name ?? ''}
            placeholder="Ex: Izabella Frias Loureiro"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="title">Título profissional *</Label>
          <Input
            id="title"
            name="title"
            required
            defaultValue={profile?.title ?? 'Ft.'}
            placeholder="Ex: Ft., Dr., Dra."
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="crf_number">Registro CRF</Label>
          <Input
            id="crf_number"
            name="crf_number"
            defaultValue={profile?.crf_number ?? ''}
            placeholder="Ex: CREFITO-2 / 123456-F"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="specialty">Especialidade</Label>
          <Input
            id="specialty"
            name="specialty"
            defaultValue={profile?.specialty ?? ''}
            placeholder="Ex: Fisioterapia Respiratória"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Telefone / WhatsApp</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={profile?.phone ?? ''}
            placeholder="(21) 99999-9999"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail profissional</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={profile?.email ?? ''}
            placeholder="contato@exemplo.com"
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="address">Endereço do consultório</Label>
          <Input
            id="address"
            name="address"
            defaultValue={profile?.address ?? ''}
            placeholder="Rua, número, complemento"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="city">Cidade / UF</Label>
          <Input
            id="city"
            name="city"
            defaultValue={profile?.city ?? ''}
            placeholder="Rio de Janeiro – RJ"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="signature_line">Linha de assinatura nos relatórios</Label>
        <Textarea
          id="signature_line"
          name="signature_line"
          rows={3}
          defaultValue={profile?.signature_line ?? ''}
          placeholder="Ex: Izabella Frias Loureiro · Ft. · CREFITO-2 / 123456-F · Fisioterapia Respiratória"
        />
        <p className="text-xs text-muted-foreground">
          Aparece no rodapé dos PDFs e no campo De: dos e-mails. Se deixar vazio, será gerada automaticamente.
        </p>
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar perfil'}
        </Button>
      </div>
    </form>
  )
}
