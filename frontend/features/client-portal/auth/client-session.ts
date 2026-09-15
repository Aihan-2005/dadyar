import {
  clearClientFullNameCache,
  getClientFullName,
  getClientProfile,
  subscribeClientProfile,
} from '@/features/client-portal/data/client-profile.repository'

import {
  useAuthStore,
} from '@/store/auth.store'


export interface ClientPortalAccount {
  id: string
  fullName: string
  phone: string
  createdAt: string
}


export function normalizeClientPhone(
  value:
    string,
): string {
  return value
    .replace(
      /[۰-۹]/g,

      (
        digit,
      ) =>
        String(
          '۰۱۲۳۴۵۶۷۸۹'.indexOf(
            digit,
          ),
        ),
    )
    .replace(
      /[٠-٩]/g,

      (
        digit,
      ) =>
        String(
          '٠١٢٣٤٥٦٧٨٩'.indexOf(
            digit,
          ),
        ),
    )
    .replace(
      /\D/g,

      '',
    )
    .slice(
      0,

      11,
    )
}


function toClientPortalAccount(
  fullNameOverride?:
    string,
): ClientPortalAccount | null {
  const user =
    useAuthStore
      .getState()
      .user

  if (
    !user ||
    user.role !==
      'CLIENT'
  ) {
    return null
  }

  return {
    id:
      user.id,

    fullName:
      fullNameOverride ??
      getClientFullName(
        user.id,
      ),

    phone:
      user.phone ??
      '',

    createdAt:
      '',
  }
}


export function getCurrentClientPortalAccount():
  ClientPortalAccount | null {
  return toClientPortalAccount()
}


export async function hydrateCurrentClientPortalAccount(): Promise<
  ClientPortalAccount | null
> {
  const user =
    useAuthStore
      .getState()
      .user

  if (
    !user ||
    user.role !==
      'CLIENT'
  ) {
    return null
  }

  /*
   * این قسمت source of truth را
   * از Backend دریافت می‌کند.
   */
  const profile =
    await getClientProfile(
      user.id,
    )

  return toClientPortalAccount(
    profile?.fullName ??
      '',
  )
}


export function hasClientPortalSession(): boolean {
  return Boolean(
    getCurrentClientPortalAccount(),
  )
}


export function clearClientPortalSession(): void {
  const user =
    useAuthStore
      .getState()
      .user

  if (
    user?.role ===
    'CLIENT'
  ) {
    clearClientFullNameCache(
      user.id,
    )
  }

  void useAuthStore
    .getState()
    .logout()
}


export function subscribeClientPortalAuth(
  listener:
    () => void,
): () => void {
  const unsubscribeAuth =
    useAuthStore.subscribe(
      listener,
    )

  const unsubscribeProfile =
    subscribeClientProfile(
      listener,
    )

  return () => {
    unsubscribeAuth()

    unsubscribeProfile()
  }
}


export const hasValidTemporaryClientSession =
  hasClientPortalSession

export const clearTemporaryClientSession =
  clearClientPortalSession