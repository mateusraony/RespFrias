'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import sql from '@/lib/db/client'
import type { ActionResult } from '@/types'

export interface ProfessionalProfile {
  id: string
  full_name: string
  title: string
  crf_number?: string
  specialty?: string
  phone?: string
  email?: string
  address?: string
  city?: string
  signature_line?: string
  created_at: string
  updated_at: string
}

const profileSchema = z.object({
  full_name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  title: z.string().min(1, 'Título é obrigatório'),
  crf_number: z.string().optional(),
  specialty: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  signature_line: z.string().optional(),
})

export async function getProfile(): Promise<ProfessionalProfile | null> {
  try {
    const rows = await sql`SELECT * FROM professional_profile ORDER BY created_at LIMIT 1`
    return (rows[0] as ProfessionalProfile) ?? null
  } catch {
    return null
  }
}

export async function upsertProfile(formData: FormData): Promise<ActionResult<void>> {
  const parsed = profileSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const { full_name, title, crf_number, specialty, phone, email, address, city, signature_line } = parsed.data

  try {
    const existing = await sql`SELECT id FROM professional_profile LIMIT 1`
    if (existing.length > 0) {
      await sql`
        UPDATE professional_profile SET
          full_name = ${full_name},
          title = ${title},
          crf_number = ${crf_number ?? null},
          specialty = ${specialty ?? null},
          phone = ${phone ?? null},
          email = ${email ?? null},
          address = ${address ?? null},
          city = ${city ?? null},
          signature_line = ${signature_line ?? null},
          updated_at = now()
        WHERE id = ${existing[0].id as string}
      `
    } else {
      await sql`
        INSERT INTO professional_profile (full_name, title, crf_number, specialty, phone, email, address, city, signature_line)
        VALUES (${full_name}, ${title}, ${crf_number ?? null}, ${specialty ?? null}, ${phone ?? null}, ${email ?? null}, ${address ?? null}, ${city ?? null}, ${signature_line ?? null})
      `
    }
    revalidatePath('/configuracoes')
    revalidatePath('/', 'layout')
    return { success: true, data: undefined }
  } catch (err) {
    console.error('upsertProfile error:', err)
    return { success: false, error: 'Erro ao salvar perfil.' }
  }
}
