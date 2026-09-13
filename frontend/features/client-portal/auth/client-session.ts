
import { useAuthStore } from '@/store/auth.store'
import { getClientFullName } from '@/features/client-portal/data/client-profile.repository'

export interface ClientPortalAccount {
  id: string
  fullName: string
  phone: string
  createdAt: string
}

export function normalizeClientPhone(value: string): string {
  return value
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
    .replace(/\D/g, '')
    .slice(0, 11)
}

function toClientPortalAccount(): ClientPortalAccount | null {
  const user = useAuthStore.getState().user

  if (!user || user.role !== 'CLIENT') {
    return null
  }

  return {
    id: user.id,
    fullName: getClientFullName(user.id),
    phone: user.phone ?? '',

    createdAt: new Date().toISOString(),
  }
}

export function getCurrentClientPortalAccount(): ClientPortalAccount | null {
  return toClientPortalAccount()
}

export function hasClientPortalSession(): boolean {
  return Boolean(getCurrentClientPortalAccount())
}

export function clearClientPortalSession(): void {
  void useAuthStore.getState().logout()
}

export function subscribeClientPortalAuth(listener: () => void): () => void {
  return useAuthStore.subscribe(listener)
}


export const hasValidTemporaryClientSession = hasClientPortalSession
export const clearTemporaryClientSession = clearClientPortalSession