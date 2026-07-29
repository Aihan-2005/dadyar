import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type RouteContext = {
  params: Promise<{
    path: string[]
  }>
}

type HeadersWithGetSetCookie = Headers & {
  getSetCookie?: () => string[]
}

const METHODS_WITHOUT_BODY = new Set(['GET', 'HEAD'])

const REQUEST_HEADERS_TO_FORWARD = [
  'accept',
  'accept-language',
  'authorization',
  'content-type',
  'cookie',
  'user-agent',
  'x-api-key',
  'x-request-id',
] as const

const RESPONSE_HEADERS_TO_FORWARD = [
  'cache-control',
  'content-disposition',
  'content-language',
  'content-type',
  'etag',
  'expires',
  'last-modified',
  'location',
  'pragma',
  'www-authenticate',
] as const

function getApiBaseUrl(): URL | null {
  const rawApiBaseUrl = process.env.API_BASE_URL?.trim()

  if (!rawApiBaseUrl) {
    return null
  }

  try {
    const normalizedUrl = rawApiBaseUrl.replace(/\/+$/, '')
    return new URL(normalizedUrl)
  } catch {
    return null
  }
}

function getProxyTimeout(): number {
  const configuredTimeout = Number(
    process.env.API_PROXY_TIMEOUT_MS,
  )

  if (
    Number.isFinite(configuredTimeout) &&
    configuredTimeout >= 1_000 &&
    configuredTimeout <= 120_000
  ) {
    return configuredTimeout
  }

  return 20_000
}

function createUpstreamHeaders(
  request: NextRequest,
): Headers {
  const headers = new Headers()

  for (const headerName of REQUEST_HEADERS_TO_FORWARD) {
    const value = request.headers.get(headerName)

    if (value) {
      headers.set(headerName, value)
    }
  }

  const forwardedFor =
    request.headers.get('x-forwarded-for')

  const realIp = request.headers.get('x-real-ip')

  if (forwardedFor) {
    headers.set('x-forwarded-for', forwardedFor)
  } else if (realIp) {
    headers.set('x-forwarded-for', realIp)
  }

  const host = request.headers.get('host')

  if (host) {
    headers.set('x-forwarded-host', host)
  }

  headers.set(
    'x-forwarded-proto',
    request.nextUrl.protocol.replace(':', ''),
  )

  return headers
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}


function rewriteSetCookieForProxy(
  setCookieValue: string,
  upstreamBasePath: string,
): string {
  let rewrittenCookie = setCookieValue.replace(
    /;\s*Domain=[^;]+/gi,
    '',
  )

  const normalizedBasePath =
    upstreamBasePath === '/'
      ? ''
      : upstreamBasePath.replace(/\/$/, '')

  if (normalizedBasePath) {
    const pathPattern = new RegExp(
      `;\\s*Path=${escapeRegExp(
        normalizedBasePath,
      )}(?=/|;|$)([^;]*)`,
      'i',
    )

    rewrittenCookie = rewrittenCookie.replace(
      pathPattern,
      '; Path=/api/proxy$1',
    )
  }

  return rewrittenCookie
}

function createClientHeaders(
  upstreamResponse: Response,
  upstreamBasePath: string,
): Headers {
  const headers = new Headers()

  for (const headerName of RESPONSE_HEADERS_TO_FORWARD) {
    const value =
      upstreamResponse.headers.get(headerName)

    if (value) {
      headers.set(headerName, value)
    }
  }

  const upstreamHeaders =
    upstreamResponse.headers as HeadersWithGetSetCookie

  const setCookieHeaders =
    upstreamHeaders.getSetCookie?.() ?? []

  if (setCookieHeaders.length > 0) {
    for (const cookie of setCookieHeaders) {
      headers.append(
        'set-cookie',
        rewriteSetCookieForProxy(
          cookie,
          upstreamBasePath,
        ),
      )
    }
  } else {
    const fallbackSetCookie =
      upstreamResponse.headers.get('set-cookie')

    if (fallbackSetCookie) {
      headers.append(
        'set-cookie',
        rewriteSetCookieForProxy(
          fallbackSetCookie,
          upstreamBasePath,
        ),
      )
    }
  }

  return headers
}

function getErrorDetails(error: unknown): string {
  if (!(error instanceof Error)) {
    return String(error)
  }

  const cause =
    error.cause instanceof Error
      ? ` | cause: ${error.cause.message}`
      : ''

  return `${error.message}${cause}`
}

async function handler(
  request: NextRequest,
  context: RouteContext,
) {
  const apiBaseUrl = getApiBaseUrl()

  if (!apiBaseUrl) {
    console.error(
      '[API Proxy] API_BASE_URL is missing or invalid',
    )

    return NextResponse.json(
      {
        success: false,
        code: 'API_PROXY_NOT_CONFIGURED',
        message:
          'آدرس بک‌اند تنظیم نشده یا معتبر نیست. فایل frontend/.env.local را بررسی کنید.',
      },
      {
        status: 500,
      },
    )
  }

  const { path } = await context.params

  if (!Array.isArray(path) || path.length === 0) {
    return NextResponse.json(
      {
        success: false,
        code: 'INVALID_PROXY_PATH',
        message: 'مسیر API معتبر نیست.',
      },
      {
        status: 400,
      },
    )
  }

  const encodedPath = path
    .map((segment) => encodeURIComponent(segment))
    .join('/')

  const upstreamUrl = new URL(
    `${apiBaseUrl
      .toString()
      .replace(/\/$/, '')}/${encodedPath}`,
  )

  upstreamUrl.search = request.nextUrl.search

  const abortController = new AbortController()
  const timeout = getProxyTimeout()

  const timeoutId = setTimeout(
    () => abortController.abort(),
    timeout,
  )

  try {
    const requestBody = METHODS_WITHOUT_BODY.has(
      request.method,
    )
      ? undefined
      : await request.arrayBuffer()

    const upstreamResponse = await fetch(upstreamUrl, {
      method: request.method,
      headers: createUpstreamHeaders(request),
      body: requestBody,
      signal: abortController.signal,
      cache: 'no-store',
      redirect: 'manual',
    })

    const responseBody =
      await upstreamResponse.arrayBuffer()

    return new NextResponse(responseBody, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: createClientHeaders(
        upstreamResponse,
        apiBaseUrl.pathname,
      ),
    })
  } catch (error: unknown) {
    const isTimeout =
      error instanceof Error &&
      error.name === 'AbortError'

    console.error(
      '[API Proxy] Upstream request failed',
      {
        method: request.method,
        upstreamUrl: upstreamUrl.toString(),
        timeout,
        error: getErrorDetails(error),
      },
    )

    if (isTimeout) {
      return NextResponse.json(
        {
          success: false,
          code: 'UPSTREAM_TIMEOUT',
          message:
            'سرور بک‌اند در زمان تعیین‌شده پاسخ نداد.',
        },
        {
          status: 504,
        },
      )
    }

    return NextResponse.json(
      {
        success: false,
        code: 'UPSTREAM_UNAVAILABLE',
        message:
          'اتصال به سرور بک‌اند برقرار نشد. مطمئن شوید بک‌اند روی پورت 5000 اجرا شده است.',
        ...(process.env.NODE_ENV === 'development'
          ? {
              details: getErrorDetails(error),
              upstreamUrl: upstreamUrl.toString(),
            }
          : {}),
      },
      {
        status: 502,
      },
    )
  } finally {
    clearTimeout(timeoutId)
  }
}

export const GET = handler
export const HEAD = handler
export const POST = handler
export const PUT = handler
export const PATCH = handler
export const DELETE = handler