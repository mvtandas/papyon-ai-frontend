<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { appAPI } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

// Types
interface App {
  _id: string
  id?: string
  name: string
  description: string
  logo?: string
  banner?: string
  isPublic: boolean
  isActive: boolean
  type?: {
    name: string
  }
  qr_url?: string
  location?: {
    address?: string
    city?: string
    country?: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  contact?: {
    phone?: string
    email?: string
    website?: string
  }
  socialMedia?: {
    instagram?: string
    facebook?: string
    twitter?: string
    linkedin?: string
  }
  settings?: {
    theme?: string
    language?: string
    timezone?: string
  }
  stats?: {
    views?: number
    totalOrders?: number
    monthlyRevenue?: number
  }
  owner?: {
    _id: string
    username: string
    firstName: string
    lastName: string
    avatar?: string
    email: string
  }
  members?: Array<{
    user: {
      _id: string
      username: string
      firstName: string
      lastName: string
      avatar?: string
      email: string
    }
    role: 'owner' | 'admin' | 'editor' | 'viewer'
    addedAt: string
  }>
  data?: {
    menu?: MenuCategory[]
    members?: Array<{
      id: string
      name: string
      email: string
      role: string
    }>
    owner?: {
      id: string
      name: string
      email: string
    }
    [key: string]: unknown
  }
  createdAt: string
  updatedAt: string
  created_at?: string
}

interface MenuCategory {
  category: string
  items: MenuItem[]
}

interface MenuItem {
  name: string
  price: string
  description?: string
}

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// State
const app = ref<App | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const activeTab = ref('overview')

// Menü düzenleme için state
const editingCategory = ref<number | null>(null)
const editingItem = ref<{ categoryIndex: number; itemIndex: number } | null>(null)
const newCategory = ref({ category: '', items: [] as MenuItem[] })
const newItem = ref({ name: '', price: '', description: '' })

// Veri düzenleme için state
const editingField = ref<string | null>(null)
const editingFieldValue = ref('')
const fieldError = ref<string | null>(null)

// Computed properties
const hasMenu = computed(() => {
  return app.value?.data?.menu && Array.isArray(app.value.data.menu) && app.value.data.menu.length > 0
})

const menuStats = computed(() => {
  if (!hasMenu.value) return { categories: 0, items: 0 }
  
  const menu = app.value!.data!.menu as MenuCategory[]
  const categories = menu.length
  const items = menu.reduce((total, category) => total + category.items.length, 0)
  
  return { categories, items }
})

const canEdit = computed(() => true) // Geçici olarak herkese düzenleme izni ver
const canDelete = computed(() => true) // Geçici olarak herkese silme izni ver

const filteredAppData = computed(() => {
  if (!app.value?.data) return {}
  
  const { menu, ...otherData } = app.value.data
  return otherData
})

// Helper fonksiyonlar
const formatFieldName = (field: string): string => {
  const fieldNames: Record<string, string> = {
    location: 'Konum Bilgileri',
    contact: 'İletişim Bilgileri',
    socialMedia: 'Sosyal Medya',
    settings: 'Ayarlar',
    stats: 'İstatistikler',
    owner: 'Sahip Bilgileri',
    members: 'Üye Bilgileri'
  }
  return fieldNames[field] || field.charAt(0).toUpperCase() + field.slice(1)
}

const getFieldDescription = (field: string): string => {
  const descriptions: Record<string, string> = {
    location: 'Adres, koordinat ve konum bilgileri',
    contact: 'Telefon, e-posta ve iletişim bilgileri', 
    socialMedia: 'Sosyal medya hesapları ve bağlantıları',
    settings: 'Uygulama ayarları ve yapılandırmalar',
    stats: 'Görüntülenme ve kullanım istatistikleri',
    owner: 'Uygulama sahibi bilgileri',
    members: 'Uygulama üyeleri ve rolleri'
  }
  return descriptions[field] || 'Bu alanın açıklaması mevcut değil'
}

const editField = (field: string, value: unknown) => {
  editingField.value = field
  editingFieldValue.value = JSON.stringify(value, null, 2)
  fieldError.value = null
}

const cancelFieldEdit = () => {
  editingField.value = null
  editingFieldValue.value = ''
  fieldError.value = null
}

const copyToClipboard = async (text: string | number) => {
  try {
    await navigator.clipboard.writeText(String(text))
    alert('Panoya kopyalandı!')
  } catch (err) {
    console.error('Kopyalama hatası:', err)
  }
}

const formatDate = (dateString?: string | number): string => {
  if (!dateString) return 'Bilinmiyor'
  return new Date(String(dateString)).toLocaleDateString('tr-TR')
}

const removeMember = async (index: number) => {
  if (!app.value?.data?.members || !Array.isArray(app.value.data.members)) return
  
  if (confirm('Bu üyeyi çıkarmak istediğinizden emin misiniz?')) {
    try {
      app.value.data.members.splice(index, 1)
      await appAPI.updateApp(app.value._id, { data: app.value.data })
      alert('Üye başarıyla çıkarıldı')
    } catch (err) {
      console.error('Üye çıkarma hatası:', err)
      alert('Üye çıkarılırken bir hata oluştu')
    }
  }
}

const confirmDeleteApp = async () => {
  if (!app.value) return
  
  const confirmText = prompt('Uygulamayı silmek için "SİL" yazın:')
  if (confirmText === 'SİL') {
    try {
      loading.value = true
      await appAPI.deleteApp(app.value._id)
      alert('Uygulama başarıyla silindi')
      router.push('/apps')
    } catch (err) {
      console.error('Silme hatası:', err)
      alert('Uygulama silinirken bir hata oluştu')
    } finally {
      loading.value = false
    }
  }
}

// Methods
const loadApp = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const appId = route.params.id as string
    const response = await appAPI.getApp(appId)
    app.value = response.data
    
    // Eğer app.data yoksa örnek veri ekle
    if (app.value && !app.value.data) {
      app.value.data = {
        location: {
          address: "Örnek Mah. Örnek Sok. No:1",
          city: "İstanbul",
          country: "Türkiye",
          coordinates: { lat: 41.0082, lng: 28.9784 }
        },
        contact: {
          phone: "+90 555 123 4567",
          email: "info@example.com",
          website: "https://example.com"
        },
        socialMedia: {
          instagram: "@example",
          facebook: "example",
          twitter: "@example"
        },
        settings: {
          theme: "light",
          language: "tr",
          timezone: "Europe/Istanbul"
        },
        stats: {
          views: 1234,
          totalOrders: 56,
          monthlyRevenue: 12500
        },
        owner: {
          id: "owner123",
          name: "Ahmet Yılmaz",
          email: "ahmet@example.com"
        },
        members: [
          {
            id: "member1",
            name: "Ayşe Demir",
            email: "ayse@example.com",
            role: "admin"
          }
        ],
        menu: [
          {
            category: "İçecekler",
            items: [
              {
                name: "Türk Kahvesi",
                price: "₺25.00",
                description: "Geleneksel Türk kahvesi"
              },
              {
                name: "Çay",
                price: "₺15.00",
                description: "Bergamot aromalı"
              }
            ]
          }
        ]
      }
    }
    
  } catch (err) {
    error.value = 'App yüklenirken hata oluştu'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const saveField = async (field: string) => {
  if (!app.value || !canEdit.value) return
  
  let parsedValue: unknown = editingFieldValue.value
  
  // JSON string'i parse et
  try {
    parsedValue = JSON.parse(editingFieldValue.value)
    fieldError.value = null
  } catch {
    fieldError.value = 'Geçersiz JSON formatı'
    return
  }
  
  try {
    loading.value = true
    
    // Data alanı için özel işlem
    if (!app.value.data) app.value.data = {}
    app.value.data[field] = parsedValue
    
    await appAPI.updateApp(app.value._id, { data: app.value.data })
    
    editingField.value = null
    editingFieldValue.value = ''
    alert('Başarıyla kaydedildi!')
    
  } catch (err) {
    console.error('Güncelleme hatası:', err)
    fieldError.value = 'Güncelleme sırasında hata oluştu'
  } finally {
    loading.value = false
  }
}

const saveMenuData = async () => {
  if (!app.value || !canEdit.value) return
  
  try {
    await appAPI.updateApp(app.value._id, { data: app.value.data })
  } catch (err) {
    console.error('Menü güncelleme hatası:', err)
    alert('Menü güncellenirken bir hata oluştu')
  }
}

// Menü yönetimi
const addCategory = async () => {
  if (!app.value || !canEdit.value) return
  
  if (!newCategory.value.category.trim()) return
  
  if (!app.value.data) app.value.data = {}
  if (!app.value.data.menu) app.value.data.menu = []
  
  if (Array.isArray(app.value.data.menu)) {
    app.value.data.menu.push({
      category: newCategory.value.category.trim(),
      items: []
    })
  }
  
  newCategory.value.category = ''
  await saveMenuData()
}

const deleteCategory = async (categoryIndex: number) => {
  if (!app.value?.data?.menu || !Array.isArray(app.value.data.menu) || !canEdit.value) return
  if (!confirm('Bu kategoriyi ve tüm ürünlerini silmek istediğinizden emin misiniz?')) return
  
  app.value.data.menu.splice(categoryIndex, 1)
  await saveMenuData()
}

const updateCategoryName = async (categoryIndex: number, newName: string) => {
  if (!app.value?.data?.menu || !Array.isArray(app.value.data.menu) || !canEdit.value) return
  
  const menu = app.value.data.menu
  if (menu[categoryIndex]) {
    menu[categoryIndex].category = newName
  }
  editingCategory.value = null
  await saveMenuData()
}

const addItem = async (categoryIndex: number) => {
  if (!app.value?.data?.menu || !Array.isArray(app.value.data.menu) || !canEdit.value) return
  if (!newItem.value.name.trim() || !newItem.value.price.trim()) return
  
  const menu = app.value.data.menu
  if (!menu[categoryIndex]) return
  
  const item: MenuItem = {
    name: newItem.value.name.trim(),
    price: newItem.value.price.trim()
  }
  
  if (newItem.value.description.trim()) {
    item.description = newItem.value.description.trim()
  }
  
  menu[categoryIndex].items.push(item)
  newItem.value = { name: '', price: '', description: '' }
  await saveMenuData()
}

const updateItem = async (categoryIndex: number, itemIndex: number, updatedItem: MenuItem) => {
  if (!app.value?.data?.menu || !Array.isArray(app.value.data.menu) || !canEdit.value) return
  
  const menu = app.value.data.menu
  if (!menu[categoryIndex] || !menu[categoryIndex].items[itemIndex]) return
  
  menu[categoryIndex].items[itemIndex] = updatedItem
  editingItem.value = null
  await saveMenuData()
}

const deleteItem = async (categoryIndex: number, itemIndex: number) => {
  if (!app.value?.data?.menu || !Array.isArray(app.value.data.menu) || !canEdit.value) return
  if (!confirm('Bu ürünü silmek istediğinizden emin misiniz?')) return
  
  const menu = app.value.data.menu
  if (!menu[categoryIndex]) return
  
  menu[categoryIndex].items.splice(itemIndex, 1)
  await saveMenuData()
}

// Sıralama fonksiyonları
const moveCategoryUp = async (categoryIndex: number) => {
  if (!app.value?.data?.menu || !Array.isArray(app.value.data.menu) || !canEdit.value || categoryIndex === 0) return
  
  const menu = app.value.data.menu
  ;[menu[categoryIndex - 1], menu[categoryIndex]] = [menu[categoryIndex], menu[categoryIndex - 1]]
  
  await saveMenuData()
}

const moveCategoryDown = async (categoryIndex: number) => {
  if (!app.value?.data?.menu || !Array.isArray(app.value.data.menu) || !canEdit.value) return
  
  const menu = app.value.data.menu
  if (categoryIndex === menu.length - 1) return
  
  ;[menu[categoryIndex], menu[categoryIndex + 1]] = [menu[categoryIndex + 1], menu[categoryIndex]]
  
  await saveMenuData()
}

const moveItemUp = async (categoryIndex: number, itemIndex: number) => {
  if (!app.value?.data?.menu || !Array.isArray(app.value.data.menu) || !canEdit.value || itemIndex === 0) return
  
  const menu = app.value.data.menu
  if (!menu[categoryIndex]) return
  
  const items = menu[categoryIndex].items
  ;[items[itemIndex - 1], items[itemIndex]] = [items[itemIndex], items[itemIndex - 1]]
  
  await saveMenuData()
}

const moveItemDown = async (categoryIndex: number, itemIndex: number) => {
  if (!app.value?.data?.menu || !Array.isArray(app.value.data.menu) || !canEdit.value) return
  
  const menu = app.value.data.menu
  if (!menu[categoryIndex]) return
  
  const items = menu[categoryIndex].items
  if (itemIndex === items.length - 1) return
  
  ;[items[itemIndex], items[itemIndex + 1]] = [items[itemIndex + 1], items[itemIndex]]
  
  await saveMenuData()
}

const deleteApp = async () => {
  if (!app.value || !canDelete.value) return
  if (!confirm('Bu app\'i tamamen silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) return
  
  try {
    await appAPI.deleteApp(app.value._id)
    router.push('/apps')
  } catch (err) {
    error.value = 'App silinirken hata oluştu'
    console.error(err)
  }
}

const goBack = () => {
  router.push('/apps')
}

// Lifecycle
onMounted(() => {
  loadApp()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Sol taraf -->
          <div class="flex items-center space-x-4">
            <button 
              @click="goBack" 
              class="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span class="hidden sm:block">Geri Dön</span>
            </button>
            
            <div class="h-8 w-px bg-gray-300"></div>
            
            <!-- App Info -->
            <div v-if="app" class="flex items-center space-x-3">
              <div class="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                <img v-if="app.logo" :src="app.logo" :alt="app.name" class="w-full h-full object-cover" />
                <div v-else class="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                  {{ app.name.charAt(0).toUpperCase() }}
                </div>
              </div>
              <div>
                <h1 class="text-lg font-semibold text-gray-900">{{ app.name }}</h1>
                <p class="text-sm text-gray-500 hidden sm:block">{{ app.description }}</p>
              </div>
            </div>
          </div>

          <!-- Sağ taraf -->
          <div v-if="app" class="flex items-center space-x-3">
            <!-- Status -->
            <div class="flex items-center space-x-2">
              <span :class="app.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" class="px-2 py-1 rounded-full text-xs font-medium">
                {{ app.isActive ? 'Aktif' : 'Pasif' }}
              </span>
              <span :class="app.isPublic ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'" class="px-2 py-1 rounded-full text-xs font-medium">
                {{ app.isPublic ? 'Herkese Açık' : 'Özel' }}
              </span>
            </div>

            <!-- Actions -->
            <div class="flex items-center space-x-2">
              <button
                v-if="canEdit"
                @click="router.push(`/apps/${app._id}/edit`)"
                class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span class="hidden sm:block">Düzenle</span>
              </button>
              
              <button
                v-if="canDelete"
                @click="deleteApp"
                class="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span class="hidden sm:block">Sil</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
        {{ error }}
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-16 text-gray-500">
      <div class="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mb-4"></div>
      <p>App yükleniyor...</p>
    </div>

    <!-- Main Content -->
    <div v-else-if="app" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Tabs -->
      <div class="border-b border-gray-200 mb-6">
        <nav class="flex space-x-8">
          <button
            @click="activeTab = 'overview'"
            :class="activeTab === 'overview' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors"
          >
            📊 Genel Bakış
          </button>
          <button
            @click="activeTab = 'menu'"
            :class="activeTab === 'menu' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors"
          >
            🍽️ Menü Yönetimi
          </button>
          <button
            @click="activeTab = 'data'"
            :class="activeTab === 'data' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors"
          >
            📄 Veri Yönetimi
          </button>
          <button
            @click="activeTab = 'settings'"
            :class="activeTab === 'settings' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors"
          >
            ⚙️ Ayarlar
          </button>
        </nav>
      </div>

      <!-- Tab Content -->
      
      <!-- Genel Bakış -->
      <div v-if="activeTab === 'overview'" class="space-y-6">
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-5 h-5 text-white">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Görüntülenme</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ app.stats?.views || 0 }}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-5 h-5 text-white">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Kategoriler</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ menuStats.categories }}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-5 h-5 text-white">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Ürünler</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ menuStats.items }}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-5 h-5 text-white">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Üyeler</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ app.members?.length || 0 }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Info -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Basic Info -->
          <div class="bg-white rounded-lg shadow">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-medium text-gray-900">Temel Bilgiler</h3>
            </div>
            <div class="p-6 space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">App Adı</label>
                <p class="mt-1 text-sm text-gray-900">{{ app.name }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Açıklama</label>
                <p class="mt-1 text-sm text-gray-900">{{ app.description }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Oluşturulma Tarihi</label>
                <p class="mt-1 text-sm text-gray-900">{{ formatDate(app.createdAt) }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Son Güncelleme</label>
                <p class="mt-1 text-sm text-gray-900">{{ formatDate(app.updatedAt) }}</p>
              </div>
            </div>
          </div>

          <!-- Contact Info -->
          <div class="bg-white rounded-lg shadow">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-medium text-gray-900">İletişim Bilgileri</h3>
            </div>
            <div class="p-6 space-y-4">
              <div v-if="app.location?.address">
                <label class="block text-sm font-medium text-gray-700">Adres</label>
                <p class="mt-1 text-sm text-gray-900">{{ app.location.address }}</p>
                <p v-if="app.location.city" class="text-sm text-gray-900">{{ app.location.city }}, {{ app.location.country }}</p>
              </div>
              <div v-if="app.contact?.phone">
                <label class="block text-sm font-medium text-gray-700">Telefon</label>
                <p class="mt-1 text-sm text-gray-900">{{ app.contact.phone }}</p>
              </div>
              <div v-if="app.contact?.email">
                <label class="block text-sm font-medium text-gray-700">E-posta</label>
                <p class="mt-1 text-sm text-gray-900">{{ app.contact.email }}</p>
              </div>
              <div v-if="app.contact?.website">
                <label class="block text-sm font-medium text-gray-700">Website</label>
                <a :href="app.contact.website" target="_blank" class="mt-1 text-sm text-blue-600 hover:text-blue-800">{{ app.contact.website }}</a>
              </div>
              <div v-if="!app.location?.address && !app.contact?.phone && !app.contact?.email && !app.contact?.website" class="text-sm text-gray-500 italic">
                Henüz iletişim bilgisi eklenmemiş.
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Menü Yönetimi -->
      <div v-else-if="activeTab === 'menu'" class="space-y-6">
        <!-- Menü Header -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex justify-between items-center mb-4">
            <div>
              <h3 class="text-lg font-medium text-gray-900">🍽️ Menü Yönetimi</h3>
              <p class="text-sm text-gray-500">Kategoriler ve ürünleri yönetin</p>
            </div>
            <div v-if="hasMenu" class="text-right">
              <p class="text-sm text-gray-500">{{ menuStats.categories }} kategori, {{ menuStats.items }} ürün</p>
            </div>
          </div>

          <!-- Menü içeriği -->
          <div v-if="hasMenu" class="space-y-6">
            <!-- Mevcut Kategoriler -->
            <div v-for="(category, categoryIndex) in (app.data!.menu as MenuCategory[])" :key="categoryIndex" class="border border-gray-200 rounded-lg overflow-hidden">
              <!-- Kategori Başlığı -->
              <div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div class="flex justify-between items-center">
                  <div v-if="editingCategory === categoryIndex" class="flex-1 flex gap-3">
                    <input
                      v-model="category.category"
                      @keydown.enter="updateCategoryName(categoryIndex, category.category)"
                      @blur="updateCategoryName(categoryIndex, category.category)"
                      class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Kategori adı"
                    />
                    <button 
                      @click="updateCategoryName(categoryIndex, category.category)" 
                      class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                    >
                      Kaydet
                    </button>
                  </div>
                  <h4 v-else class="text-lg font-semibold text-gray-900 flex-1">{{ category.category }}</h4>
                  
                  <div v-if="canEdit" class="flex gap-2">
                    <!-- Sıralama Butonları -->
                    <div class="flex flex-col gap-1">
                      <button 
                        v-if="categoryIndex > 0"
                        @click="moveCategoryUp(categoryIndex)" 
                        class="p-1 text-gray-600 hover:bg-gray-200 rounded"
                        title="Yukarı taşı"
                      >
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-4 h-4">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <button 
                        v-if="categoryIndex < (app.data!.menu as MenuCategory[]).length - 1"
                        @click="moveCategoryDown(categoryIndex)" 
                        class="p-1 text-gray-600 hover:bg-gray-200 rounded"
                        title="Aşağı taşı"
                      >
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-4 h-4">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                    
                    <div class="w-px bg-gray-300 mx-1"></div>
                    
                    <!-- Düzenleme Butonları -->
                    <button 
                      v-if="editingCategory !== categoryIndex"
                      @click="editingCategory = categoryIndex" 
                      class="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                      title="Kategoriyi düzenle"
                    >
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button 
                      @click="deleteCategory(categoryIndex)" 
                      class="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                      title="Kategoriyi sil"
                    >
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              <!-- Ürünler -->
              <div class="p-6">
                <div v-if="category.items.length > 0" class="space-y-4 mb-6">
                  <div
                    v-for="(item, itemIndex) in category.items"
                    :key="itemIndex"
                    class="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    <!-- Düzenleme Modu -->
                    <div v-if="editingItem?.categoryIndex === categoryIndex && editingItem?.itemIndex === itemIndex" class="space-y-4">
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-1">Ürün Adı</label>
                          <input
                            v-model="item.name"
                            placeholder="Ürün adı"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-1">Fiyat</label>
                          <input
                            v-model="item.price"
                            placeholder="₺400.00"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Açıklama (İsteğe bağlı)</label>
                        <textarea
                          v-model="item.description"
                          placeholder="Ürün açıklaması..."
                          rows="3"
                          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        ></textarea>
                      </div>
                      <div class="flex gap-3">
                        <button 
                          @click="updateItem(categoryIndex, itemIndex, item)" 
                          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                        >
                          Kaydet
                        </button>
                        <button 
                          @click="editingItem = null" 
                          class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium"
                        >
                          İptal
                        </button>
                      </div>
                    </div>
                    
                    <!-- Görüntüleme Modu -->
                    <div v-else class="flex justify-between items-start">
                      <div class="flex-1 pr-4">
                        <h5 class="font-semibold text-gray-900 mb-1">{{ item.name }}</h5>
                        <p v-if="item.description" class="text-sm text-gray-600 leading-relaxed mb-2">{{ item.description }}</p>
                      </div>
                      <div class="flex items-center gap-4">
                        <div class="text-lg font-bold text-blue-600">{{ item.price }}</div>
                        <div v-if="canEdit" class="flex gap-2 items-center">
                          <!-- Sıralama Butonları -->
                          <div class="flex flex-col gap-1">
                            <button 
                              v-if="itemIndex > 0"
                              @click="moveItemUp(categoryIndex, itemIndex)" 
                              class="p-1 text-gray-600 hover:bg-gray-200 rounded"
                              title="Yukarı taşı"
                            >
                              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-3 h-3">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                              </svg>
                            </button>
                            <button 
                              v-if="itemIndex < category.items.length - 1"
                              @click="moveItemDown(categoryIndex, itemIndex)" 
                              class="p-1 text-gray-600 hover:bg-gray-200 rounded"
                              title="Aşağı taşı"
                            >
                              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-3 h-3">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          </div>
                          
                          <div class="w-px bg-gray-300 h-8"></div>
                          
                          <!-- Düzenleme Butonları -->
                          <button 
                            @click="editingItem = { categoryIndex, itemIndex }" 
                            class="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                            title="Ürünü düzenle"
                          >
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-4 h-4">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button 
                            @click="deleteItem(categoryIndex, itemIndex)" 
                            class="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                            title="Ürünü sil"
                          >
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-4 h-4">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Yeni Ürün Ekle -->
                <div v-if="canEdit" class="bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg p-6">
                  <h6 class="text-sm font-semibold text-blue-800 mb-4">{{ category.category }} kategorisine yeni ürün ekle</h6>
                  <div class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-medium text-blue-700 mb-1">Ürün Adı *</label>
                        <input
                          v-model="newItem.name"
                          placeholder="Ürün adı"
                          class="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-blue-700 mb-1">Fiyat *</label>
                        <input
                          v-model="newItem.price"
                          placeholder="₺400.00"
                          class="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-blue-700 mb-1">Açıklama</label>
                      <textarea
                        v-model="newItem.description"
                        placeholder="Ürün açıklaması (isteğe bağlı)"
                        rows="2"
                        class="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      ></textarea>
                    </div>
                    <button 
                      @click="addItem(categoryIndex)"
                      :disabled="!newItem.name.trim() || !newItem.price.trim()"
                      class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                    >
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                      </svg>
                      Ürün Ekle
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Yeni Kategori Ekle -->
          <div v-if="canEdit" class="bg-green-50 border-2 border-dashed border-green-300 rounded-lg p-6 mt-6">
            <h5 class="text-lg font-semibold text-green-800 mb-4">🆕 Yeni Kategori Ekle</h5>
            <div class="flex gap-4">
              <input
                v-model="newCategory.category"
                @keydown.enter="addCategory"
                placeholder="Kategori adı (örn: Kokteyl, Bira, Ana Yemekler)"
                class="flex-1 px-4 py-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button 
                @click="addCategory"
                :disabled="!newCategory.category.trim()"
                class="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold whitespace-nowrap"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Kategori Ekle
              </button>
            </div>
          </div>
          
          <!-- Menü Boşsa -->
          <div v-if="!hasMenu" class="text-center py-16">
            <div class="text-6xl mb-6">🍽️</div>
            <h4 class="text-2xl font-semibold text-gray-900 mb-4">Menü Henüz Oluşturulmamış</h4>
            <p class="text-gray-600 mb-8 max-w-md mx-auto">İlk kategoriyi ekleyerek menünüzü oluşturmaya başlayın. Kategoriler halinde düzenlenmiş ürünlerinizi kolayca yönetebilirsiniz.</p>
            <div v-if="canEdit" class="max-w-md mx-auto">
              <div class="flex gap-3">
                <input
                  v-model="newCategory.category"
                  @keydown.enter="addCategory"
                  placeholder="İlk kategori adı (örn: Kokteyl)"
                  class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button 
                  @click="addCategory"
                  :disabled="!newCategory.category.trim()"
                  class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
                >
                  Başla
                </button>
              </div>
            </div>
            <div v-else class="text-gray-500">
              <p>Bu menüyü görüntüleme yetkiniz bulunmuyor.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Veri Yönetimi -->
      <div v-else-if="activeTab === 'data'" class="space-y-6">
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-6">📊 Veri Yönetimi</h3>
          
          <!-- JSON Editör -->
          <div class="space-y-6">
            <div v-for="(value, field) in filteredAppData" :key="field" class="border border-gray-200 rounded-lg overflow-hidden">
              <div class="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h4 class="font-semibold text-gray-900 capitalize">{{ formatFieldName(String(field)) }}</h4>
                <p class="text-sm text-gray-600">{{ getFieldDescription(String(field)) }}</p>
              </div>
              <div class="p-4">
                <div v-if="editingField === field" class="space-y-4">
                  <textarea
                    v-model="editingFieldValue"
                    :placeholder="`${formatFieldName(String(field))} verilerini JSON formatında düzenleyin...`"
                    rows="10"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  ></textarea>
                  <div v-if="fieldError" class="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p class="text-sm text-red-700">{{ fieldError }}</p>
                  </div>
                  <div class="flex gap-3">
                    <button 
                      @click="saveField(String(field))" 
                      class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                    >
                      Kaydet
                    </button>
                    <button 
                      @click="cancelFieldEdit" 
                      class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium"
                    >
                      İptal
                    </button>
                  </div>
                </div>
                <div v-else>
                  <div class="bg-gray-100 rounded-lg p-4 font-mono text-sm max-h-64 overflow-y-auto">
                    <pre class="whitespace-pre-wrap">{{ JSON.stringify(value, null, 2) }}</pre>
                  </div>
                  <div v-if="canEdit" class="mt-3">
                    <button 
                      @click="editField(String(field), value)" 
                      class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                    >
                      Düzenle
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Ayarlar -->
      <div v-else-if="activeTab === 'settings'" class="space-y-6">
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-6">⚙️ Uygulama Ayarları</h3>
          
          <!-- Genel Bilgiler -->
          <div class="space-y-6">
            <div class="border border-gray-200 rounded-lg p-6">
              <h4 class="font-semibold text-gray-900 mb-4">Genel Bilgiler</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Uygulama ID</label>
                  <input 
                    :value="app?.id" 
                    readonly 
                    class="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Tür</label>
                  <input 
                    :value="app?.type?.name" 
                    readonly 
                    class="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">QR Kod URL</label>
                  <div class="flex gap-2">
                    <input 
                      :value="app?.qr_url" 
                      readonly 
                      class="flex-1 px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600"
                    />
                    <button 
                      @click="copyToClipboard(app?.qr_url || '')"
                      class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      title="Kopyala"
                    >
                      📋
                    </button>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Oluşturulma Tarihi</label>
                  <input 
                    :value="formatDate(app?.created_at)" 
                    readonly 
                    class="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600"
                  />
                </div>
              </div>
            </div>

            <!-- Sahip ve Üyeler -->
            <div class="border border-gray-200 rounded-lg p-6">
              <h4 class="font-semibold text-gray-900 mb-4">Sahip ve Üyeler</h4>
              
              <!-- Sahip -->
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">Sahip</label>
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {{ (app?.data?.owner?.name || 'SA').charAt(0).toUpperCase() }}
                    </div>
                    <div>
                      <p class="font-medium text-gray-900">{{ app?.data?.owner?.name || 'Sahip' }}</p>
                      <p class="text-sm text-gray-600">{{ app?.data?.owner?.email || 'E-posta bilgisi yok' }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Üyeler -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Üyeler</label>
                <div v-if="app?.data?.members && app.data.members.length > 0" class="space-y-3">
                  <div 
                    v-for="(member, index) in app.data.members" 
                    :key="index"
                    class="bg-gray-50 border border-gray-200 rounded-lg p-4"
                  >
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {{ (member.name || 'Ü').charAt(0).toUpperCase() }}
                        </div>
                        <div>
                          <p class="font-medium text-gray-900">{{ member.name || 'İsimsiz Üye' }}</p>
                          <p class="text-sm text-gray-600">{{ member.email || 'E-posta bilgisi yok' }}</p>
                        </div>
                      </div>
                      <div v-if="canDelete" class="flex gap-2">
                        <span class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          {{ member.role || 'Üye' }}
                        </span>
                        <button 
                          @click="removeMember(index)"
                          class="p-1 text-red-600 hover:bg-red-100 rounded"
                          title="Üyeyi çıkar"
                        >
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-4 h-4">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="text-center py-8 text-gray-500">
                  <p>Henüz üye eklenmemiş</p>
                </div>
              </div>
            </div>

            <!-- Tehlikeli İşlemler -->
            <div v-if="canDelete" class="border border-red-200 rounded-lg p-6 bg-red-50">
              <h4 class="font-semibold text-red-900 mb-4">⚠️ Tehlikeli İşlemler</h4>
              <div class="space-y-4">
                <div>
                  <h5 class="font-medium text-red-900 mb-2">Uygulamayı Sil</h5>
                  <p class="text-sm text-red-700 mb-4">
                    Bu işlem geri alınamaz. Uygulama ve tüm verileri kalıcı olarak silinecektir.
                  </p>
                  <button 
                    @click="confirmDeleteApp"
                    class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                  >
                    Uygulamayı Sil
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 