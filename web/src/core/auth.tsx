import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

export interface AuthUser {
  id: string
  email: string
  fullName: string
  role: 'client' | 'admin'
  phone?: string
}

interface AuthState {
  token: string
  user: AuthUser
}

interface AuthCtx {
  token: string | null
  user: AuthUser | null
  login: (email: string, password: string) => Promise<AuthUser>
  register: (fullName: string, email: string, password: string, phone?: string) => Promise<AuthUser>
  logout: () => void
}

const LS_KEY = 'sana-auth'
const Ctx = createContext<AuthCtx>({
  token: null,
  user: null,
  login: async () => {
    throw new Error('no provider')
  },
  register: async () => {
    throw new Error('no provider')
  },
  logout: () => {},
})

export const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api'

async function authCall(path: string, body: Record<string, unknown>): Promise<AuthState> {
  const res = await fetch(`${API_BASE}/auth/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = (await res.json()) as { accessToken?: string; user?: Record<string, unknown>; message?: string }
  if (!res.ok || !data.accessToken || !data.user) {
    throw new Error(data.message ?? 'AUTH_FAILED')
  }
  const u = data.user as { _id?: string; id?: string; email: string; fullName: string; role: 'client' | 'admin'; phone?: string }
  return {
    token: data.accessToken,
    user: {
      id: u._id ?? u.id ?? '',
      email: u.email,
      fullName: u.fullName,
      role: u.role,
      phone: u.phone,
    },
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState | null>(() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      return raw ? (JSON.parse(raw) as AuthState) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    if (state) localStorage.setItem(LS_KEY, JSON.stringify(state))
    else localStorage.removeItem(LS_KEY)
  }, [state])

  const login = useCallback(async (email: string, password: string) => {
    const s = await authCall('login', { email, password })
    setState(s)
    return s.user
  }, [])

  const register = useCallback(async (fullName: string, email: string, password: string, phone?: string) => {
    const s = await authCall('register', { fullName, email, password, phone })
    setState(s)
    return s.user
  }, [])

  const logout = useCallback(() => setState(null), [])

  return (
    <Ctx.Provider value={{ token: state?.token ?? null, user: state?.user ?? null, login, register, logout }}>
      {children}
    </Ctx.Provider>
  )
}

/** fetch with Bearer token — throws Error(message) on non-2xx */
export async function apiAuth(
  path: string,
  token: string,
  options: { method?: string; body?: unknown } = {},
): Promise<unknown> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  const data = (await res.json()) as unknown
  if (!res.ok) {
    const msg = (data as { message?: string })?.message ?? String(res.status)
    throw new Error(msg)
  }
  return data
}

export function useAuth() {
  return useContext(Ctx)
}
