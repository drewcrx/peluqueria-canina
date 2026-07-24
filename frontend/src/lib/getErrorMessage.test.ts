import { describe, expect, it } from 'vitest'
import { getErrorMessage } from './getErrorMessage'

describe('getErrorMessage', () => {
  it('extracts the message from an axios-like error response', () => {
    const error = { response: { data: { message: 'El correo ya está registrado.' } } }
    expect(getErrorMessage(error, 'fallback')).toBe('El correo ya está registrado.')
  })

  it('falls back when there is no response message', () => {
    expect(getErrorMessage(new Error('network error'), 'No se pudo completar la acción.')).toBe(
      'No se pudo completar la acción.',
    )
  })

  it('falls back when the error is not an object', () => {
    expect(getErrorMessage(null, 'fallback')).toBe('fallback')
    expect(getErrorMessage(undefined, 'fallback')).toBe('fallback')
  })
})
