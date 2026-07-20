import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().min(1, 'Requerido').email('Correo inválido'),
  password: z.string().min(1, 'Requerido'),
})

export type LoginFormValues = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
    companyName: z.string().min(2, 'Ingresa el nombre de tu peluquería'),
    ownerFullName: z.string().min(2, 'Ingresa tu nombre completo'),
    ownerEmail: z.string().min(1, 'Requerido').email('Correo inválido'),
    ownerPassword: z.string().min(8, 'Mínimo 8 caracteres'),
    confirmPassword: z.string().min(1, 'Requerido'),
  })
  .refine((data) => data.ownerPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

export type RegisterFormValues = z.infer<typeof registerSchema>
