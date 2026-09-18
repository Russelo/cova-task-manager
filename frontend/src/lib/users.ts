import api from './api'

export interface CurrentUser {
  firstName: string
  lastName: string
  email: string
}

export async function getCurrentUser(): Promise<CurrentUser> {
  const { data } = await api.get<CurrentUser>('/users/me')
  return data
}
