import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { ArrowRight } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { authButtonClass, authInputClass, authLabelClass, AuthLayout } from './AuthLayout'
import { useAuth } from './AuthContext'
import { login } from './api'
import { loginSchema, type LoginFormValues } from './schemas'
import { ROLE_PLATFORM_ADMIN } from './types'

export function LoginPage() {
  const navigate = useNavigate()
  const { user, isLoading, setUser } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (user) => {
      setUser(user)
      navigate(user.roles.includes(ROLE_PLATFORM_ADMIN) ? '/admin' : '/dashboard')
    },
  })

  // La app empaquetada abre directo en /login (ver capacitor.config.ts) — si la sesión ya es
  // válida (cookie viva de una visita anterior), saltamos el formulario en vez de mostrarlo.
  if (!isLoading && user) {
    return <Navigate to={user.roles.includes(ROLE_PLATFORM_ADMIN) ? '/admin' : '/dashboard'} replace />
  }

  return (
    <AuthLayout
      title="Bienvenido de nuevo"
      subtitle="Ingresa a tu peluquería para ver tu agenda de hoy."
      footer={
        <>
          ¿Tu peluquería aún no está registrada?{' '}
          <Link to="/registro" className="font-semibold text-clay-dark hover:underline">
            Regístrala
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="space-y-4">
        <div>
          <label className={authLabelClass}>Correo</label>
          <input type="email" {...register('email')} className={authInputClass} />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className={authLabelClass}>Contraseña</label>
            <Link to="/olvide-mi-contrasena" className="mb-1.5 text-xs font-medium text-clay-dark hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <input type="password" {...register('password')} className={authInputClass} />
          {errors.password && (
            <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
          )}
        </div>

        {mutation.isError && (
          <p className="text-sm text-red-600">
            {(mutation.error as { response?: { data?: { message?: string } } })?.response?.data
              ?.message ?? 'No se pudo iniciar sesión.'}
          </p>
        )}

        <button type="submit" disabled={mutation.isPending} className={`${authButtonClass} mt-2`}>
          {mutation.isPending ? 'Ingresando…' : 'Ingresar'}
          {!mutation.isPending && <ArrowRight size={16} />}
        </button>
      </form>
    </AuthLayout>
  )
}
