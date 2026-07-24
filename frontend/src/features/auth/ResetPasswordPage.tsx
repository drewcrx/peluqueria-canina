import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { resetPassword } from './api'
import { authButtonClass, authInputClass, authLabelClass, AuthLayout } from './AuthLayout'

const schema = z
  .object({
    newPassword: z.string().min(8, 'Mínimo 8 caracteres'),
    confirmPassword: z.string().min(1, 'Requerido'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

type FormValues = z.infer<typeof schema>

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') ?? ''
  const token = searchParams.get('token') ?? ''

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const mutation = useMutation({
    mutationFn: (values: FormValues) => resetPassword(email, token, values.newPassword),
  })

  if (!email || !token) {
    return (
      <AuthLayout
        title="Enlace inválido"
        subtitle="Este enlace de recuperación no es válido o ya expiró."
        footer={
          <Link to="/olvide-mi-contrasena" className="font-semibold text-clay-dark hover:underline">
            Solicitar uno nuevo
          </Link>
        }
      >
        <></>
      </AuthLayout>
    )
  }

  if (mutation.isSuccess) {
    return (
      <AuthLayout
        title="Contraseña actualizada"
        subtitle="Ya puedes iniciar sesión con tu nueva contraseña."
        footer={
          <Link to="/login" className="font-semibold text-clay-dark hover:underline">
            Iniciar sesión
          </Link>
        }
      >
        <div className="flex justify-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sage-light text-sage-dark">
            <CheckCircle2 size={22} />
          </span>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Crea una nueva contraseña" subtitle={`Para la cuenta ${email}`} footer={null}>
      <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="space-y-4">
        <div>
          <label className={authLabelClass}>Nueva contraseña</label>
          <input type="password" {...register('newPassword')} className={authInputClass} />
          {errors.newPassword && <p className="mt-1 text-xs text-red-600">{errors.newPassword.message}</p>}
        </div>

        <div>
          <label className={authLabelClass}>Confirmar contraseña</label>
          <input type="password" {...register('confirmPassword')} className={authInputClass} />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>

        {mutation.isError && (
          <p className="text-sm text-red-600">
            {(mutation.error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
              'No se pudo restablecer la contraseña. El enlace puede haber expirado.'}
          </p>
        )}

        <button type="submit" disabled={mutation.isPending} className={`${authButtonClass} mt-2`}>
          {mutation.isPending ? 'Guardando…' : 'Restablecer contraseña'}
          {!mutation.isPending && <ArrowRight size={16} />}
        </button>
      </form>
    </AuthLayout>
  )
}
