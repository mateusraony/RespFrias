'use client'

import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ChartErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-40 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
          Não foi possível carregar o gráfico.
        </div>
      )
    }
    return this.props.children
  }
}
