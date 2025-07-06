import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { authAPI } from '@/services/api'

export interface Role {
  id: string
  name: string
  displayName: string
  description: string
}

export interface Permission {
  id: string
  name: string
  displayName: string
  category: string
  resource: string
  action: string
}

export interface User {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  isActive: boolean
  lastLogin: string
  createdAt: string
  updatedAt: string
  roles: Role[]
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const permissions = ref<Permission[]>([])
  const token = ref<string | null>(localStorage.getItem('papyon_token'))
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value && !!token.value)
  const isAdmin = computed(() => user.value?.roles?.some(role => role.name === 'SUPER_ADMIN') || false)
  
  // Yetki kontrolü için computed property'ler
  const hasPermission = computed(() => (permissionName: string) => {
    return permissions.value.some(permission => permission.name === permissionName)
  })

  const hasRole = computed(() => (roleName: string) => {
    return user.value?.roles?.some(role => role.name === roleName) || false
  })

  const login = async (email: string, password: string) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await authAPI.login(email, password)
      
      // API'den gelen response yapısı: { success, message, data: { user, token } }
      const { data } = response
      const { user: userData, token: authToken } = data
      
      user.value = userData
      token.value = authToken
      localStorage.setItem('papyon_token', authToken)
      
      // API'den gelen permissions varsa onları da set et
      if (data.permissions) {
        permissions.value = data.permissions
      }
      
    } catch (err: unknown) {
      // API'den gelen hata mesajını al
      const errorResponse = err as { response?: { data?: { message?: string; success?: boolean } } }
      const errorMessage = errorResponse?.response?.data?.message || 
        (err instanceof Error ? err.message : 'Giriş sırasında bir hata oluştu')
      error.value = errorMessage
      throw new Error(errorMessage)
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    user.value = null
    permissions.value = []
    token.value = null
    localStorage.removeItem('papyon_token')
    error.value = null
  }

  const register = async (email: string, password: string, name: string) => {
    isLoading.value = true
    error.value = null

    try {
      // İsimi firstName ve lastName olarak ayır
      const nameParts = name.trim().split(' ')
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''
      const username = email.split('@')[0] // E-posta adresinden username oluştur

      const response = await authAPI.register({
        username,
        email,
        password,
        firstName,
        lastName
      })
      
      // API'den gelen response yapısı: { success, message, data: { user, token } }
      const { data } = response
      const { user: userData, token: authToken } = data
      
      user.value = userData
      token.value = authToken
      localStorage.setItem('papyon_token', authToken)

      // API'den gelen permissions varsa onları da set et
      if (data.permissions) {
        permissions.value = data.permissions
      }

    } catch (err: unknown) {
      // API'den gelen hata mesajını al
      const errorResponse = err as { response?: { data?: { message?: string; success?: boolean } } }
      const errorMessage = errorResponse?.response?.data?.message || 
        (err instanceof Error ? err.message : 'Kayıt sırasında bir hata oluştu')
      error.value = errorMessage
      throw new Error(errorMessage)
    } finally {
      isLoading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  // Sayfa yenilendiğinde token varsa kullanıcıyı restore et
  const restoreAuth = async () => {
    if (token.value && !user.value) {
      try {
        await fetchUserData()
      } catch {
        // Token geçersiz, temizle
        logout()
      }
    }
  }

  // Kullanıcı bilgilerini ve yetkilerini getir
  const fetchUserData = async () => {
    if (!token.value) return

    try {
      const response = await authAPI.getMe()
      const { data } = response
      
      if (data.user) {
        user.value = data.user
      }
      
      if (data.permissions) {
        permissions.value = data.permissions
      }
    } catch (err) {
      console.error('Kullanıcı bilgileri alınamadı:', err)
      // Token geçersiz olabilir, logout yap
      logout()
      throw err
    }
  }

  return {
    user,
    permissions,
    token,
    isLoading,
    error,
    isAuthenticated,
    isAdmin,
    hasPermission,
    hasRole,
    login,
    logout,
    register,
    clearError,
    restoreAuth,
    fetchUserData
  }
}) 