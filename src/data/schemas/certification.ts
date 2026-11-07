import { z } from 'zod'
import { httpsUrlSchema, idSchema, orderSchema, yearMonthSchema } from './primitives'

export const certificationSchema = z
  .object({
    id: idSchema,
    order: orderSchema,
    title: z.string().min(1),
    provider: z.string().min(1),
    issuedMonth: yearMonthSchema,
    href: httpsUrlSchema,
  })
  .strict()

export type CertificationDocument = z.infer<typeof certificationSchema>
export type CertificationEntry = Omit<CertificationDocument, 'id'> & {
  credentialId: string
  date: { es: string; en: string }
}
