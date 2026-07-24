import { render, screen } from '@testing-library/react'
import { Users } from 'lucide-react'
import { describe, expect, it } from 'vitest'
import { EmptyState } from './EmptyState'

describe('EmptyState', () => {
  it('renders the title', () => {
    render(<EmptyState icon={Users} title="Todavía no tienes clientes registrados." />)
    expect(screen.getByText('Todavía no tienes clientes registrados.')).toBeInTheDocument()
  })

  it('renders an optional description', () => {
    render(<EmptyState icon={Users} title="Sin clientes" description="Compártelo con tus clientes." />)
    expect(screen.getByText('Compártelo con tus clientes.')).toBeInTheDocument()
  })

  it('renders an optional action', () => {
    render(<EmptyState icon={Users} title="Sin clientes" action={<button>Agregar</button>} />)
    expect(screen.getByRole('button', { name: 'Agregar' })).toBeInTheDocument()
  })
})
