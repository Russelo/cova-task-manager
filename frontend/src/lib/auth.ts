import api from './api'

export interface RegisterPayload {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
}

export interface LoginPayload {
  email: string
  password: string
}

interface AuthResponse {
  token: string
}

export async function register(payload: RegisterPayload): Promise<string> {
  const { data } = await api.post<AuthResponse>('/auth/register', payload)
  return data.token
}

export async function login(payload: LoginPayload): Promise<string> {
  const { data } = await api.post<AuthResponse>('/auth/login', payload)
  return data.token
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout')
}
