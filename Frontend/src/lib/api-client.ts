// OASIS API Client - Fetch wrapper with JWT auth and auto-refresh

const API_BASE = '/api/v1'

export interface ApiError {
  success: false
  error: string
  message?: string
  details?: Record<string, string>
}

export interface ApiSuccess<T> {
  success: true
  data: T
  message?: string
}

export interface PaginatedData<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

// Token management
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('oasis_access_token')
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('oasis_refresh_token')
}

export function getFamilyMemberId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('oasis_acting_family_id')
}

export function setFamilyMemberId(id: string | null) {
  if (typeof window === 'undefined') return
  if (id) {
    localStorage.setItem('oasis_acting_family_id', id)
  } else {
    localStorage.removeItem('oasis_acting_family_id')
  }
}

export function setTokens(accessToken: string, refreshToken: string) {
  if (typeof window === 'undefined') return
  localStorage.setItem('oasis_access_token', accessToken)
  localStorage.setItem('oasis_refresh_token', refreshToken)
  
  // Also set cookies for backend compatibility through proxies
  document.cookie = `access_token=${accessToken}; path=/; max-age=3600; SameSite=Lax`
  document.cookie = `refresh_token=${refreshToken}; path=/; max-age=604800; SameSite=Lax`
}

export function clearTokens() {
  if (typeof window === 'undefined') return
  localStorage.removeItem('oasis_access_token')
  localStorage.removeItem('oasis_refresh_token')
  localStorage.removeItem('oasis_user')
  localStorage.removeItem('oasis_acting_family_id')

  // Clear cookies
  document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
  document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
}

export function setUser(user: any) {
  if (typeof window === 'undefined') return
  localStorage.setItem('oasis_user', JSON.stringify(user))
}

export function getStoredUser(): any | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('oasis_user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// Refresh token logic
let isRefreshing = false
let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  if (isRefreshing && refreshPromise) return refreshPromise

  const refreshToken = getRefreshToken()
  if (!refreshToken) return null

  isRefreshing = true
  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })
      if (!res.ok) {
        clearTokens()
        return null
      }
      const json = await res.json()
      if (json.success && json.data) {
        setTokens(json.data.accessToken, json.data.refreshToken)
        return json.data.accessToken
      }
      clearTokens()
      return null
    } catch {
      clearTokens()
      return null
    } finally {
      isRefreshing = false
      refreshPromise = null
    }
  })()

  return refreshPromise
}

// Main fetch wrapper
export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit & { skipAuth?: boolean } = {}
): Promise<ApiResponse<T>> {
  const { skipAuth, ...fetchOptions } = options

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string> || {}),
  }

  // Attach auth token
  if (!skipAuth) {
    const token = getAccessToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    // Attach Family Member Context if active
    const familyId = getFamilyMemberId()
    if (familyId) {
      headers['X-Family-Member-ID'] = familyId
    }
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`

  // 8 s timeout — prevents infinite loading spinner on mobile / slow networks
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 8000)

  try {
    const res = await fetch(url, {
      ...fetchOptions,
      headers,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    // If 401, try to refresh token and retry
    if (res.status === 401 && !skipAuth) {
      const newToken = await refreshAccessToken()
      if (newToken) {
        headers['Authorization'] = `Bearer ${newToken}`
        const retryRes = await fetch(url, { ...fetchOptions, headers })
        try {
          const text = await retryRes.text()
          return text ? JSON.parse(text) : ({ success: true, data: {} as any })
        } catch {
          return { success: false, error: 'Error de autenticación' }
        }
      }
      // Refresh failed - will be handled by auth store
      return { success: false, error: 'Sesión expirada. Por favor inicia sesión de nuevo.' }
    }

    // Safely parse JSON - handle non-JSON responses (404 HTML, etc)
    try {
      const text = await res.text()
      const json = text ? JSON.parse(text) : {}
      return json
    } catch {
      return { success: false, error: `Error del servidor (${res.status})` }
    }
  } catch (error: any) {
    return { success: false, error: error.message || 'Error de conexión' }
  }
}

// Convenience methods
export const api = {
  get: <T = any>(endpoint: string, params?: Record<string, any>) => {
    let url = endpoint
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value))
        }
      })
      const qs = searchParams.toString()
      if (qs) url += `?${qs}`
    }
    return apiFetch<T>(url, { method: 'GET' })
  },

  post: <T = any>(endpoint: string, body?: any) =>
    apiFetch<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T = any>(endpoint: string, body?: any) =>
    apiFetch<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T = any>(endpoint: string, body?: any) =>
    apiFetch<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T = any>(endpoint: string) =>
    apiFetch<T>(endpoint, { method: 'DELETE' }),
}
