'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <p className="text-sm text-muted-foreground">Erro ao carregar pacientes. Verifique a conexão com o banco.</p>
      <Button variant="outline" onClick={reset}>Tentar novamente</Button>
    </div>
  )
}
