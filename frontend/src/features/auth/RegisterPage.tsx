import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { ArrowRight, Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { authButtonClass, authInputClass, authLabelClass, AuthLayout } from './AuthLayout'
import { useAuth } from './AuthContext'
import { registerTenant } from './api'
import { registerSchema, type RegisterFormValues } from './schemas'

export function RegisterPage() {
  const navigate = useNavigate()
  const { setUser } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) })

  const mutation = useMutation({
    mutationFn: registerTenant,
    onSuccess: (user) => {
      setUser(user)
      navigate('/dashboard')
    },
  })

  return (
    <AuthLayout
      title="Registra tu peluquería"
      subtitle="Crea tu cuenta y ten tu agenda funcionando en minutos."
      eyebrow={
        <span className="flex items-center gap-1.5">
          <Sparkles size={13} className="text-clay-dark" />
          14 días de prueba gratis en el Plan Básico
        </span>
      }
      cardClassName="max-w-lg"
      footer={
        <>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-semibold text-clay-dark hover:underline">
            Inicia sesión
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="space-y-4">
        <Field label="Nombre de la peluquería" error={errors.companyName?.message}>
          <input {...register('companyName')} className={authInputClass} />
        </Field>

        <Field label="Tu nombre completo" error={errors.ownerFullName?.message}>
          <input {...register('ownerFullName')} className={authInputClass} />
        </Field>

        <Field label="Correo" error={errors.ownerEmail?.message}>
          <input type="email" {...register('ownerEmail')} className={authInputClass} />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Contraseña" error={errors.ownerPassword?.message}>
            <input type="password" {...register('ownerPassword')} className={authInputClass} />
          </Field>

          <Field label="Confirmar contraseña" error={errors.confirmPassword?.message}>
            <input type="password" {...register('confirmPassword')} className={authInputClass} />
          </Field>
        </div>

        {mutation.isError && (
          <p className="text-sm text-red-600">
            {(mutation.error as { response?: { data?: { message?: string } } })?.response?.data
              ?.message ?? 'No se pudo completar el registro.'}
          </p>
        )}

        <button type="submit" disabled={mutation.isPending} className={`${authButtonClass} mt-2`}>
          {mutation.isPending ? 'Creando cuenta…' : 'Crear cuenta'}
          {!mutation.isPending && <ArrowRight size={16} />}
        </button>
      </form>
    </AuthLayout>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: ReactNode
}) {
  return (
    <div>
      <label className={authLabelClass}>{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
