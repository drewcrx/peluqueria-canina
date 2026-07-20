import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Registra tu peluquería</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">14 días de prueba gratis en el Plan Básico</p>
        </div>

        <form
          onSubmit={handleSubmit((values) => mutation.mutate(values))}
          className="space-y-4 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700"
        >
          <Field label="Nombre de la peluquería" error={errors.companyName?.message}>
            <input {...register('companyName')} className={inputClass} />
          </Field>

          <Field label="Tu nombre completo" error={errors.ownerFullName?.message}>
            <input {...register('ownerFullName')} className={inputClass} />
          </Field>

          <Field label="Correo" error={errors.ownerEmail?.message}>
            <input type="email" {...register('ownerEmail')} className={inputClass} />
          </Field>

          <Field label="Contraseña" error={errors.ownerPassword?.message}>
            <input type="password" {...register('ownerPassword')} className={inputClass} />
          </Field>

          <Field label="Confirmar contraseña" error={errors.confirmPassword?.message}>
            <input type="password" {...register('confirmPassword')} className={inputClass} />
          </Field>

          {mutation.isError && (
            <p className="text-sm text-red-500">
              {(mutation.error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
                'No se pudo completar el registro.'}
            </p>
          )}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full rounded-md bg-indigo-600 text-white py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {mutation.isPending ? 'Creando cuenta…' : 'Crear cuenta'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-indigo-600 hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}

const inputClass =
  'w-full rounded-md border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500'

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}
