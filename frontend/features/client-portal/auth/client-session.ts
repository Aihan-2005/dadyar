
const CLIENT_SESSION_STORAGE_KEY =
  'dadyar:client-portal:temporary-session'

const CLIENT_SESSION_VERSION =
  1

const CLIENT_SESSION_TTL_MS =
  8 * 60 * 60 * 1000


const DEFAULT_TEMPORARY_PASSWORD =
  'DadyarClient1405!'

const TEMPORARY_CLIENT_PASSWORD =
  process.env
    .NEXT_PUBLIC_CLIENT_PORTAL_PASSWORD
    ?.trim() ||
  DEFAULT_TEMPORARY_PASSWORD



interface TemporaryClientSession {
  version:
    number

  authenticatedAt:
    number

  expiresAt:
    number
}



function isBrowser(): boolean {
  return (
    typeof window !==
    'undefined'
  )
}



export function validateTemporaryClientPassword(
  password:
    string
): boolean {
  return (
    password ===
    TEMPORARY_CLIENT_PASSWORD
  )
}



export function createTemporaryClientSession(): void {
  if (!isBrowser()) {
    return
  }

  const now =
    Date.now()

  const session:
    TemporaryClientSession = {
      version:
        CLIENT_SESSION_VERSION,

      authenticatedAt:
        now,

      expiresAt:
        now +
        CLIENT_SESSION_TTL_MS,
    }

  window.sessionStorage.setItem(
    CLIENT_SESSION_STORAGE_KEY,
    JSON.stringify(
      session
    )
  )
}



function readTemporaryClientSession():
  TemporaryClientSession | null {
  if (!isBrowser()) {
    return null
  }

  const stored =
    window.sessionStorage.getItem(
      CLIENT_SESSION_STORAGE_KEY
    )

  if (!stored) {
    return null
  }

  try {
    const parsed:
      unknown =
      JSON.parse(
        stored
      )

    if (
      !parsed ||
      typeof parsed !==
        'object'
    ) {
      return null
    }

    const candidate =
      parsed as Partial<TemporaryClientSession>

    if (
      candidate.version !==
        CLIENT_SESSION_VERSION ||
      typeof candidate.authenticatedAt !==
        'number' ||
      typeof candidate.expiresAt !==
        'number'
    ) {
      return null
    }

    return {
      version:
        candidate.version,

      authenticatedAt:
        candidate.authenticatedAt,

      expiresAt:
        candidate.expiresAt,
    }
  } catch {
    return null
  }
}



export function hasValidTemporaryClientSession(): boolean {
  const session =
    readTemporaryClientSession()

  if (!session) {
    clearTemporaryClientSession()

    return false
  }

  if (
    session.expiresAt <=
    Date.now()
  ) {
    clearTemporaryClientSession()

    return false
  }

  return true
}



export function clearTemporaryClientSession(): void {
  if (!isBrowser()) {
    return
  }

  window.sessionStorage.removeItem(
    CLIENT_SESSION_STORAGE_KEY
  )
}