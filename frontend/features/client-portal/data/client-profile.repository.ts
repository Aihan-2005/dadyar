import { api } from '@/lib/api'

const CACHE_KEY_PREFIX = 'dadyar:client-portal:fullname-cache:'

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

function readCachedFullName(userId: string): string {
  if (!isBrowser()) return ''
  return window.localStorage.getItem(CACHE_KEY_PREFIX + userId) ?? ''
}

function writeCachedFullName(userId: string, fullName: string): void {
  if (!isBrowser()) return
  window.localStorage.setItem(CACHE_KEY_PREFIX + userId, fullName)
}

export async function saveClientFullName(
  userId: string,
  fullName: string
): Promise<void> {
  writeCachedFullName(userId, fullName)

  try {

    await api.patch('/clients/me/profile', { fullName })
  } catch {

  }
}

export function getClientFullName(userId: string): string {
  return readCachedFullName(userId)
}