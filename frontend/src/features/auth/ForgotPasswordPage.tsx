import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { forgotPassword } from './api'
import { authButtonClass, authInputClass, authLabelClass, AuthLayout } from './AuthLayout'

const schema = z.object({ email: z.string().min(1, 'Requerido').email('Correo inválido') })
type FormValues = z.infer<typeof schema>

export function ForgotPasswordPage() {
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const mutation = useMutation({
    mutationFn: (values: FormValues) => forgotPassword(values.email),
    onSuccess: (result) => setDevResetUrl(result.resetUrl),
  })

  if (mutation.isSuccess) {
    return (
      <AuthLayout
        title="Revisa tu correo"
        subtitle="Si ese correo existe, te enviamos un enlace para restablecer tu contraseña."
        footer={
          <Link to="/login" className="font-semibold text-clay-dark hover:underline">
            Volver a iniciar sesión
          </Link>
        }
      >
        <div className="flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sage-light text-sage-dark">
            <CheckCircle2 size={22} />
          </span>
          {devResetUrl && (
            <div className="mt-5 w-full rounded-xl border border-sand-dark bg-cream-dark/50 p-4 text-left text-sm">
              <p className="mb-1 font-medium text-ink">Modo desarrollo — todavía no hay envío real de correo:</p>
              <Link to={devResetUrl} className="break-all text-clay-dark hover:underline">
                {devResetUrl}
              </Link>
            </div>
          )}
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="¿Olvidaste tu contraseña?"
      subtitle="Ingresa tu correo y te ayudamos a recuperar el acceso."
      footer={
        <Link to="/login" className="font-semibold text-clay-dark hover:underline">
          Volver a iniciar sesión
        </Link>
      }
    >
      <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="space-y-4">
        <div>
          <label className={authLabelClass}>Correo</label>
          <input type="email" {...register('email')} className={authInputClass} />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
        </div>

        <button type="submit" disabled={mutation.isPending} className={`${authButtonClass} mt-2`}>
          {mutation.isPending ? 'Enviando…' : 'Enviar enlace de recuperación'}
          {!mutation.isPending && <ArrowRight size={16} />}
        </button>
      </form>
    </AuthLayout>
  )
}
