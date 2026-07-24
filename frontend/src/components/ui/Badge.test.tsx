import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Badge } from './Badge'

describe('Badge', () => {
  it('renders its content', () => {
    render(<Badge>Activo</Badge>)
    expect(screen.getByText('Activo')).toBeInTheDocument()
  })

  it('defaults to the neutral tone', () => {
    render(<Badge>Activo</Badge>)
    expect(screen.getByText('Activo')).toHaveClass('bg-sand')
  })

  it('applies the requested tone', () => {
    render(<Badge tone="sage">Completada</Badge>)
    expect(screen.getByText('Completada')).toHaveClass('bg-sage-light', 'text-sage-dark')
  })
})
