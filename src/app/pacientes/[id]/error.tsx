'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <p className="text-sm text-muted-foreground">Erro ao carregar dados do paciente.</p>
      <Button variant="outline" onClick={reset}>Tentar novamente</Button>
      <details className="mt-2 text-left max-w-lg w-full">
        <summary className="text-xs text-muted-foreground cursor-pointer select-none">Detalhes técnicos</summary>
        <pre className="mt-2 text-xs bg-muted p-3 rounded overflow-auto max-h-40 whitespace-pre-wrap break-all">{error.message}</pre>
      </details>
    </div>
  )
}
