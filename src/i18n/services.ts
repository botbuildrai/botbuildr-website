export const SERVICE_IDS = [
  'customer-service',
  'invoicing',
  'leads',
  'website',
  'pitch-deck',
  'app',
  'combo',
] as const

export type ServiceId = (typeof SERVICE_IDS)[number]
