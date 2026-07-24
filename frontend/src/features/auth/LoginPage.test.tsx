import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderWithProviders, screen } from '../../test/test-utils'
import { LoginPage } from './LoginPage'

describe('LoginPage', () => {
  it('renders the email and password fields', () => {
    renderWithProviders(<LoginPage />)
    expect(screen.getByRole('heading', { name: 'Bienvenido de nuevo' })).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /ingresar/i })).toBeInTheDocument()
  })

  it('shows validation errors when submitted empty', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginPage />)

    await user.click(screen.getByRole('button', { name: /ingresar/i }))

    expect(await screen.findAllByText('Requerido')).toHaveLength(2)
  })

  it('links to the registration and forgot-password pages', () => {
    renderWithProviders(<LoginPage />)
    expect(screen.getByRole('link', { name: /regístrala/i })).toHaveAttribute('href', '/registro')
    expect(screen.getByRole('link', { name: /olvidaste tu contraseña/i })).toHaveAttribute(
      'href',
      '/olvide-mi-contrasena',
    )
  })
})
