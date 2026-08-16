import axios, {
  AxiosError,
  AxiosHeaders,
  InternalAxiosRequestConfig,
} from 'axios'

const API_BASE_URL =
  '/api/proxy'

const API_TIMEOUT_MS =
  25_000

type ApiErrorBody = {
  success?: unknown
  message?: unknown
  error?: unknown
  errors?: unknown
  issue?: unknown
  issues?: unknown
  detail?: unknown
  details?: unknown
  code?: unknown
}

type ApiEnvelope<T> = {
  success: boolean
  data: T
  message?: string
}

type RefreshResponseData = {
  accessToken: string
  accessTokenExpiresIn: number
}

type AuthBridge = {
  getAccessToken:
    () => string | null

  setAccessToken:
    (
      accessToken: string
    ) => void  clearSession:
    () => void
}

type RetryableRequestConfig =
  InternalAxiosRequestConfig & {
    _retry?: boolean
  }

let authBridge: AuthBridge = {
  getAccessToken:
    () => null,

  setAccessToken:
    () => undefined,

  clearSession:
    () => undefined,
}

let refreshPromise:
  Promise<string> | null =
  null

export function configureApiAuth(
  bridge: AuthBridge
): void {
  authBridge = bridge
}

export const api =
  axios.create({
    baseURL:
      API_BASE_URL,

    timeout:
      API_TIMEOUT_MS,

    withCredentials:
      true,

    headers: {
      Accept:
        'application/json',

 'Content-Type':
        'application/json',
    },
  })

const refreshClient =
  axios.create({
    baseURL:
      API_BASE_URL,

    timeout:
      API_TIMEOUT_MS,

    withCredentials:
      true,

    headers: {
      Accept:
        'application/json',

      'Content-Type':
        'application/json',
    },
  })

function isRefreshExcludedEndpoint(
  url?: string
): boolean {
  if (!url) {
    return false
  }

  const excludedEndpoints = [
    '/auth/login',
    '/auth/signup',
    '/auth/refresh',
    '/auth/logout',
  ]

  return excludedEndpoints.some(
    (endpoint) =>
      url.includes(
        endpoint
      )
  )
}

function getRefreshAccessToken(
  response:
    ApiEnvelope<RefreshResponseData>
): string {
  const accessToken =
    response.data
      ?.accessToken

  if (
    response.success !==
      true ||
    typeof accessToken !==
      'string' ||
    accessToken
      .trim()
      .length === 0
  ) {
    throw new Error(
      'پاسخ refresh token معتبر نیست.'
    )
  }

  return accessToken
}

function requestNewAccessToken():
  Promise<string> {
  if (!refreshPromise) {
    refreshPromise =
      refreshClient
        .post<
          ApiEnvelope<RefreshResponseData>
        >(
          '/auth/refresh'
        )
        .then(
          (response) => {
            const accessToken =
              getRefreshAccessToken(
           response.data
              )

            authBridge
              .setAccessToken(
                accessToken
              )

            return accessToken
          }
        )
        .finally(
          () => {
            refreshPromise =
              null
          }
        )
  }

  return refreshPromise
}

api.interceptors.request.use(
  (config) => {
    const accessToken =
      authBridge
        .getAccessToken()

    if (accessToken) {
      config.headers.set(
        'Authorization',
        `Bearer ${accessToken}`
      )
    }

    return config
  },

  (error: unknown) =>
    Promise.reject(
      error
    )
)

api.interceptors.response.use(
  (response) =>
    response,async (
    error:
      AxiosError<ApiErrorBody>
  ) => {
    const originalRequest =
      error.config as
        | RetryableRequestConfig
        | undefined

    const shouldTryRefresh =
      error.response
        ?.status ===
        401 &&
      originalRequest !==
        undefined &&
      originalRequest
        ._retry !==
        true &&
      !isRefreshExcludedEndpoint(
        originalRequest.url
      )

    if (
      !shouldTryRefresh ||
      !originalRequest
    ) {
      return Promise.reject(
        error
      )
    }

    originalRequest._retry =
      true

    try {
      const accessToken =
        await requestNewAccessToken()

      originalRequest.headers =
        AxiosHeaders.from(
          originalRequest
            .headers
        )

            originalRequest
.headers
        .set(
          'Authorization',
          `Bearer ${accessToken}`
        )

      return api.request(
        originalRequest
      )
    } catch (
      refreshError:
        unknown
    ) {
      const refreshWasRejected =
        axios.isAxiosError(
          refreshError
        ) &&
        (
          refreshError
            .response
            ?.status ===
            401 ||
          refreshError
            .response
            ?.status ===
            403
        )

      const refreshResponseWasInvalid =
        !axios.isAxiosError(
          refreshError
        )

      if (
        refreshWasRejected ||
        refreshResponseWasInvalid
      ) {
        authBridge
          .clearSession()
      } return Promise.reject(
        refreshError
      )
    }
  }
)

function getString(
  value: unknown
): string | null {
  if (
    typeof value !==
    'string'
  ) {
    return null
  }

  const normalizedValue =
    value.trim()

  return normalizedValue
    .length > 0
    ? normalizedValue
    : null
}

function extractNestedErrorMessage(
  value: unknown
): string | null {
  if (
    !value ||
    typeof value !==
      'object'
  ) {
    return null
  }

  const record =
    value as Record<
      string,
      unknown
    >
return (
    getString(
      record.message
    ) ??
    getString(
      record.error
    ) ??
    getString(
      record.detail
    )
  )
}

function extractArrayErrorMessage(
  value: unknown
): string | null {
  if (
    !Array.isArray(
      value
    )
  ) {
    return null
  }

  for (
    const item of value
  ) {
    const directMessage =
      getString(item)

    if (directMessage) {
      return directMessage
    }
 const nestedMessage =
      extractNestedErrorMessage(
        item
      )

    if (nestedMessage) {
      return nestedMessage
    }
  }

  return null
}

function extractDetailsErrorMessage(
  value: unknown
): string | null {
  const directMessage =
    getString(value)

  if (directMessage) {
    return directMessage
  }

  const arrayMessage =
    extractArrayErrorMessage(
      value
    )

  if (arrayMessage) {
    return arrayMessage
  }
return extractNestedErrorMessage(
    value
  )
}

function getResponseErrorMessage(
  responseData:
    | ApiErrorBody
    | undefined
): string | null {
  if (!responseData) {
    return null
  }

  const code =
    getString(
      responseData.code
    )

  /*
   * Backend Zod validation response:
   *
   * {
   *   success: false,
   *   code: "VALIDATION_ERROR",
   *   message: "اطلاعات ارسال‌شده معتبر نیست",
   *   issues: [
   *     {
   *       path: "password",
   *       message: "رمز عبور باید حداقل ۸ کاراکتر باشد"
   *     }
   *   ]
   * }
   *
   * برای validation باید issue واقعی
   * بر پیام عمومی */
  if (
    code ===
    'VALIDATION_ERROR'
  ) {
    const validationMessage =
      extractArrayErrorMessage(
        responseData.issues
      )

    if (
      validationMessage
    ) {
      return validationMessage
    }
  }

  /*
   * اگر backend دیگری issues برگرداند
   * ولی code متفاوت باشد، باز هم
   * جزئیات از message عمومی مفیدتر است.
   */
  const issueMessage =
    extractArrayErrorMessage(
      responseData.issues
    )

  if (issueMessage) {
    return issueMessage
  }
  const singleIssueMessage =
    extractNestedErrorMessage(
      responseData.issue
    )

  if (
    singleIssueMessage
  ) {
    return singleIssueMessage
  }

  const errorsMessage =
    extractArrayErrorMessage(
      responseData.errors
    )

  if (
    errorsMessage
  ) {
    return errorsMessage
  }

  const detailsMessage =
    extractDetailsErrorMessage(
      responseData.details
    )

  if (
    detailsMessage
  ) {
    return detailsMessage
  }

  return (
    getString(
      responseData.message
    ) ??
    getString(
      responseData.error
    ) ??
    extractNestedErrorMessage(
      responseData.error
    ) ??
    getString(
      responseData.detail
    )
  )
}

export function getApiErrorMessage(
  error: unknown,
  fallbackMessage =
    'خطایی رخ داد. دوباره تلاش کنید.'
): string {
  if (
    !axios.isAxiosError<
      ApiErrorBody
    >(error)
  ) {
    return (
      error instanceof
        Error &&
      error.message
        ? error.message
        : fallbackMessage
    )
  }

  const serverMessage =
    getResponseErrorMessage(
      error.response
        ?.data
    )

  if (serverMessage) {
    return serverMessage
  }

  if (
    error.code ===
      'ECONNABORTED' ||
    error.code ===
      'ETIMEDOUT'
  ) {
    return 'زمان اتصال به سرور به پایان رسید. دوباره تلاش کنید.'
  }

  if (!error.response) {
    return 'ارتباط با سرور برقرار نشد. وضعیت بک‌اند را بررسی کنید.'
  }

  switch (
    error.response.status
  ) {
    case 400:
      return 'اطلاعات ارسال‌شده معتبر نیست.'

    case 401:
      return 'اطلاعات ورود اشتباه است یا نشست شما منقضی شده است.'

    case 403: return 'شما اجازه انجام این عملیات را ندارید.'

    case 404:
      return 'آدرس API پیدا نشد.'

    case 409:
      return 'کاربری با این اطلاعات قبلاً ثبت شده است.'

    case 422:
      return 'اطلاعات فرم مورد قبول سرور نیست.'

    case 429:
      return 'تعداد درخواست‌ها زیاد است. کمی بعد دوباره تلاش کنید.'

    case 500:
      return 'در سرور بک‌اند خطایی رخ داده است.'

    case 502:
      return 'فرانت‌اند نتوانست به بک‌اند متصل شود.'

    case 503:
      return 'سرویس بک‌اند موقتاً در دسترس نیست.'

    case 504:
      return 'سرور بک‌اند در زمان تعیین‌شده پاسخ نداد.'

    default:
      return fallbackMessage
  }
}