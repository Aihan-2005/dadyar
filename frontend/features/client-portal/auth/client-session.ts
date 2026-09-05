export interface ClientPortalAccount {
  id: string
  fullName: string
  phone: string
  createdAt: string
}

interface StoredClientPortalAccount extends ClientPortalAccount {
  passwordHash: string
}

interface ClientPortalSession {
  version: 2
  accountId: string
  authenticatedAt: number
  expiresAt: number
}

interface RegisterClientInput {
  fullName: string
  phone: string
  password: string
}

interface LoginClientInput {
  phone: string
  password: string
}

const ACCOUNTS_STORAGE_KEY =
  'dadyar:client-portal:accounts:v1'

const SESSION_STORAGE_KEY =
  'dadyar:client-portal:session:v2'

const AUTH_CHANGE_EVENT =
  'dadyar:client-portal:auth-changed'

const SESSION_TTL_MS =
  7 * 24 * 60 * 60 * 1000

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

export function normalizeClientPhone(
  value: string
): string {
  return value
    .replace(/[۰-۹]/g, (digit) =>
      String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit))
    )
    .replace(/[٠-٩]/g, (digit) =>
      String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit))
    )
    .replace(/\D/g, '')
    .slice(0, 11)
}

function createId(): string {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID()
  }

  return `client-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`
}

async function hashPassword(
  password: string
): Promise<string> {
  if (
    typeof crypto === 'undefined' ||
    !crypto.subtle
  ) {
    throw new Error(
      'مرورگر شما از قابلیت امنیتی مورد نیاز پشتیبانی نمی‌کند.'
    )
  }

  const encoded =
    new TextEncoder().encode(password)

  const buffer =
    await crypto.subtle.digest(
      'SHA-256',
      encoded
    )

  return Array.from(
    new Uint8Array(buffer)
  )
    .map((byte) =>
      byte.toString(16).padStart(2, '0')
    )
    .join('')
}

function readAccounts():
  StoredClientPortalAccount[] {
  if (!isBrowser()) {
    return []
  }

  const raw =
    window.localStorage.getItem(
      ACCOUNTS_STORAGE_KEY
    )

  if (!raw) {
    return []
  }

  try {
    const parsed: unknown =
      JSON.parse(raw)

    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed as StoredClientPortalAccount[]
  } catch {
    return []
  }
}

function writeAccounts(
  accounts: StoredClientPortalAccount[]
): void {
  if (!isBrowser()) {
    return
  }

  window.localStorage.setItem(
    ACCOUNTS_STORAGE_KEY,
    JSON.stringify(accounts)
  )
}

function readSession():
  ClientPortalSession | null {
  if (!isBrowser()) {
    return null
  }

  const raw =
    window.localStorage.getItem(
      SESSION_STORAGE_KEY
    )

  if (!raw) {
    return null
  }

  try {
    const parsed: unknown =
      JSON.parse(raw)

    if (
      !parsed ||
      typeof parsed !== 'object'
    ) {
      return null
    }

    const candidate =
      parsed as Partial<ClientPortalSession>

    if (
      candidate.version !== 2 ||
      typeof candidate.accountId !== 'string' ||
      typeof candidate.authenticatedAt !== 'number' ||
      typeof candidate.expiresAt !== 'number'
    ) {
      window.localStorage.removeItem(
        SESSION_STORAGE_KEY
      )

      return null
    }

    if (
      candidate.expiresAt <=
      Date.now()
    ) {
      window.localStorage.removeItem(
        SESSION_STORAGE_KEY
      )

      return null
    }

    return candidate as ClientPortalSession
  } catch {
    window.localStorage.removeItem(
      SESSION_STORAGE_KEY
    )

    return null
  }
}

function notifyAuthChanged(): void {
  if (!isBrowser()) {
    return
  }

  window.dispatchEvent(
    new Event(
      AUTH_CHANGE_EVENT
    )
  )
}

function createSession(
  accountId: string
): void {
  if (!isBrowser()) {
    return
  }

  const now =
    Date.now()

  const session:
    ClientPortalSession = {
      version: 2,
      accountId,
      authenticatedAt: now,
      expiresAt:
        now +
        SESSION_TTL_MS,
    }

  window.localStorage.setItem(
    SESSION_STORAGE_KEY,
    JSON.stringify(session)
  )

  notifyAuthChanged()
}

export function getCurrentClientPortalAccount():
  ClientPortalAccount | null {
  const session =
    readSession()

  if (!session) {
    return null
  }

  const account =
    readAccounts().find(
      (item) =>
        item.id ===
        session.accountId
    )

  if (!account) {
    clearClientPortalSession()
    return null
  }

  return {
    id: account.id,
    fullName: account.fullName,
    phone: account.phone,
    createdAt: account.createdAt,
  }
}

export function hasClientPortalSession():
  boolean {
  return Boolean(
    getCurrentClientPortalAccount()
  )
}

export async function registerClientPortalAccount(
  input: RegisterClientInput
): Promise<ClientPortalAccount> {
  if (!isBrowser()) {
    throw new Error(
      'امکان ثبت‌نام وجود ندارد.'
    )
  }

  const fullName =
    input.fullName.trim()

  const phone =
    normalizeClientPhone(
      input.phone
    )

  const password =
    input.password

  if (fullName.length < 3) {
    throw new Error(
      'نام و نام خانوادگی را کامل وارد کنید.'
    )
  }

  if (!/^09\d{9}$/.test(phone)) {
    throw new Error(
      'شماره موبایل معتبر وارد کنید.'
    )
  }

  if (
    password.length < 8 ||
    password.length > 64
  ) {
    throw new Error(
      'رمز عبور باید بین ۸ تا ۶۴ کاراکتر باشد.'
    )
  }

  const accounts =
    readAccounts()

  if (
    accounts.some(
      (account) =>
        account.phone === phone
    )
  ) {
    throw new Error(
      'با این شماره موبایل قبلاً حساب ایجاد شده است.'
    )
  }

  const passwordHash =
    await hashPassword(
      password
    )

  const account:
    StoredClientPortalAccount = {
      id: createId(),
      fullName,
      phone,
      passwordHash,
      createdAt:
        new Date().toISOString(),
    }

  writeAccounts([
    account,
    ...accounts,
  ])

  createSession(
    account.id
  )

  return {
    id: account.id,
    fullName: account.fullName,
    phone: account.phone,
    createdAt: account.createdAt,
  }
}

export async function loginClientPortalAccount(
  input: LoginClientInput
): Promise<ClientPortalAccount> {
  const phone =
    normalizeClientPhone(
      input.phone
    )

  if (!/^09\d{9}$/.test(phone)) {
    throw new Error(
      'شماره موبایل معتبر وارد کنید.'
    )
  }

  if (!input.password) {
    throw new Error(
      'رمز عبور را وارد کنید.'
    )
  }

  const account =
    readAccounts().find(
      (item) =>
        item.phone === phone
    )

  if (!account) {
    throw new Error(
      'شماره موبایل یا رمز عبور صحیح نیست.'
    )
  }

  const passwordHash =
    await hashPassword(
      input.password
    )

  if (
    passwordHash !==
    account.passwordHash
  ) {
    throw new Error(
      'شماره موبایل یا رمز عبور صحیح نیست.'
    )
  }

  createSession(
    account.id
  )

  return {
    id: account.id,
    fullName: account.fullName,
    phone: account.phone,
    createdAt: account.createdAt,
  }
}

export function clearClientPortalSession():
  void {
  if (!isBrowser()) {
    return
  }

  window.localStorage.removeItem(
    SESSION_STORAGE_KEY
  )

  notifyAuthChanged()
}

export function subscribeClientPortalAuth(
  listener: () => void
): () => void {
  if (!isBrowser()) {
    return () => undefined
  }

  const handleChange =
    () => {
      listener()
    }

  const handleStorage =
    (event: StorageEvent) => {
      if (
        event.key ===
          SESSION_STORAGE_KEY ||
        event.key ===
          ACCOUNTS_STORAGE_KEY
      ) {
        listener()
      }
    }

  window.addEventListener(
    AUTH_CHANGE_EVENT,
    handleChange
  )

  window.addEventListener(
    'storage',
    handleStorage
  )

  return () => {
    window.removeEventListener(
      AUTH_CHANGE_EVENT,
      handleChange
    )

    window.removeEventListener(
      'storage',
      handleStorage
    )
  }
}





export const hasValidTemporaryClientSession =
  hasClientPortalSession

export const clearTemporaryClientSession =
  clearClientPortalSession