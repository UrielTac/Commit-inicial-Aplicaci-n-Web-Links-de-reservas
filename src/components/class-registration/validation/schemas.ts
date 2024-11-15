import * as z from 'zod'

export const authSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  phone: z.string().optional(),
  dni: z.string().optional()
})

export type AuthFormData = z.infer<typeof authSchema> 