import axios from 'axios'

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL

// Axios instance oluştur
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - her istekte token ekle
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('papyon_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - hata yönetimi
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token geçersiz, sadece token'ı temizle
      // Yönlendirme işlemini auth store'a bırak
      localStorage.removeItem('papyon_token')
    }
    return Promise.reject(error)
  }
)

// Auth API fonksiyonları
export const authAPI = {
  // Giriş yap
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', {
      email,
      password,
    })
    return response.data
  },

  // Kayıt ol
  register: async (userData: {
    username: string
    email: string
    password: string
    firstName: string
    lastName: string
  }) => {
    const response = await api.post('/auth/register', userData)
    return response.data
  },

  // Kullanıcı bilgilerini al (me endpoint'i)
  getMe: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },
}

// Kullanıcı API fonksiyonları
export const userAPI = {
  // Kullanıcıları listele
  getUsers: async (params?: {
    page?: number
    limit?: number
    search?: string
    role?: string
  }) => {
    const response = await api.get('/users', { params })
    return response.data
  },

  // Kullanıcı detayını getir
  getUser: async (id: string) => {
    const response = await api.get(`/users/${id}`)
    return response.data
  },

  // Kullanıcı rollerini güncelle
  updateUserRoles: async (id: string, roles: string[]) => {
    const response = await api.put(`/users/${id}/roles`, { roles })
    return response.data
  },

  // Kullanıcıyı deaktif et
  deactivateUser: async (id: string) => {
    const response = await api.patch(`/users/${id}/deactivate`)
    return response.data
  },

  // Kullanıcıyı aktif et
  activateUser: async (id: string) => {
    const response = await api.patch(`/users/${id}/activate`)
    return response.data
  },

  // Kullanıcıyı sil
  deleteUser: async (id: string) => {
    const response = await api.delete(`/users/${id}`)
    return response.data
  },

  // Kendi profilini getir
  getProfile: async () => {
    const response = await api.get('/users/profile')
    return response.data
  },

  // Kendi profilini güncelle
  updateProfile: async (profileData: {
    firstName?: string
    lastName?: string
    username?: string
    phone?: string
    dateOfBirth?: string
    address?: string
  }) => {
    const response = await api.put('/users/profile', profileData)
    return response.data
  },
}

// Rol API fonksiyonları
export const roleAPI = {
  // Rolleri listele
  getRoles: async (params?: {
    page?: number
    limit?: number
    search?: string
  }) => {
    const response = await api.get('/roles', { params })
    return response.data
  },

  // Rol detayını getir
  getRole: async (id: string) => {
    const response = await api.get(`/roles/${id}`)
    return response.data
  },

  // Yeni rol oluştur
  createRole: async (roleData: {
    name: string
    displayName: string
    description: string
    permissions: string[]
    level: number
  }) => {
    const response = await api.post('/roles', roleData)
    return response.data
  },

  // Rol güncelle
  updateRole: async (id: string, roleData: {
    displayName?: string
    description?: string
    permissions?: string[]
    level?: number
    isActive?: boolean
  }) => {
    const response = await api.put(`/roles/${id}`, roleData)
    return response.data
  },

  // Rol sil
  deleteRole: async (id: string) => {
    const response = await api.delete(`/roles/${id}`)
    return response.data
  },
}

// App Types API fonksiyonları
export const appTypeAPI = {
  // Aktif app tiplerini listele (public)
  getAppTypes: async () => {
    const response = await api.get('/app-types')
    return response.data
  },

  // Tüm app tiplerini listele (admin)
  getAllAppTypes: async (params?: {
    page?: number
    limit?: number
    search?: string
  }) => {
    const response = await api.get('/app-types/all', { params })
    return response.data
  },

  // App tipi detayını getir
  getAppType: async (id: string) => {
    const response = await api.get(`/app-types/${id}`)
    return response.data
  },

  // Yeni app tipi oluştur
  createAppType: async (appTypeData: {
    name: string
    displayName: string
    description: string
    features: string[]
    icon: string
    color: string
  }) => {
    const response = await api.post('/app-types', appTypeData)
    return response.data
  },

  // App tipi güncelle
  updateAppType: async (id: string, appTypeData: {
    displayName?: string
    description?: string
    features?: string[]
    icon?: string
    color?: string
    isActive?: boolean
  }) => {
    const response = await api.put(`/app-types/${id}`, appTypeData)
    return response.data
  },

  // App tipi sil
  deleteAppType: async (id: string) => {
    const response = await api.delete(`/app-types/${id}`)
    return response.data
  },

  // Silinmiş app tipini geri yükle
  restoreAppType: async (id: string) => {
    const response = await api.patch(`/app-types/${id}/restore`)
    return response.data
  },
}

// Apps API fonksiyonları
export const appAPI = {
  // Kullanıcının app'lerini listele
  getMyApps: async (params?: {
    page?: number
    limit?: number
    search?: string
    appType?: string
  }) => {
    const response = await api.get('/apps/my', { params })
    return response.data
  },

  // Public app'leri listele
  getPublicApps: async (params?: {
    page?: number
    limit?: number
    search?: string
    appType?: string
  }) => {
    const response = await api.get('/apps/public', { params })
    return response.data
  },

  // App detayını getir
  getApp: async (id: string) => {
    const response = await api.get(`/apps/${id}`)
    return response.data
  },

  // Yeni app oluştur
  createApp: async (appData: {
    name: string
    description: string
    appType: string
    data: any
    isPublic: boolean
    logo?: string
    banner?: string
    location?: {
      address: string
      city: string
      country: string
    }
    contact?: {
      phone: string
      email: string
      website: string
    }
    socialMedia?: {
      facebook?: string
      twitter?: string
      instagram?: string
      linkedin?: string
    }
    settings?: any
  }) => {
    const response = await api.post('/apps', appData)
    return response.data
  },

  // App güncelle
  updateApp: async (id: string, appData: {
    name?: string
    description?: string
    data?: any
    isPublic?: boolean
    logo?: string
    banner?: string
    location?: {
      address: string
      city: string
      country: string
    }
    contact?: {
      phone: string
      email: string
      website: string
    }
    socialMedia?: {
      facebook?: string
      twitter?: string
      instagram?: string
      linkedin?: string
    }
    settings?: any
  }) => {
    const response = await api.put(`/apps/${id}`, appData)
    return response.data
  },

  // App sil
  deleteApp: async (id: string) => {
    const response = await api.delete(`/apps/${id}`)
    return response.data
  },

  // App üyelerini getir
  getAppMembers: async (appId: string) => {
    const response = await api.get(`/apps/${appId}/members`)
    return response.data
  },

  // App'e üye ekle
  addMember: async (appId: string, memberData: {
    userId: string
    role: 'owner' | 'admin' | 'editor' | 'viewer'
  }) => {
    const response = await api.post(`/apps/${appId}/members`, memberData)
    return response.data
  },

  // App'den üye çıkar
  removeMember: async (appId: string, userId: string) => {
    const response = await api.delete(`/apps/${appId}/members/${userId}`)
    return response.data
  },

  // Üye rolünü güncelle
  updateMemberRole: async (appId: string, userId: string, role: 'owner' | 'admin' | 'editor' | 'viewer') => {
    const response = await api.patch(`/apps/${appId}/members/${userId}/role`, { role })
    return response.data
  },

  // App'den ayrıl
  leaveApp: async (appId: string) => {
    const response = await api.post(`/apps/${appId}/leave`)
    return response.data
  },

  // App istatistiklerini getir
  getAppStats: async (appId: string) => {
    const response = await api.get(`/apps/${appId}/stats`)
    return response.data
  },
}

export default api 