<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { appAPI } from '@/services/api'
import QRCodeStyling from 'qr-code-styling'

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
  isVisible?: boolean
}

interface MenuItem {
  name: string
  price: string
  description?: string
  isVisible?: boolean
}

const route = useRoute()
const router = useRouter()

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

// JSON import/export için state
const showJsonImport = ref(false)
const jsonImportText = ref('')
const jsonImportError = ref<string | null>(null)

// QR Kod oluşturma için state
const qrUrl = ref('')
const qrSize = ref(300)
const qrDotsColor = ref('#000000')
const qrBackgroundColor = ref('#ffffff')
const qrDotsType = ref<'rounded' | 'dots' | 'classy' | 'classy-rounded' | 'square' | 'extra-rounded'>('rounded')
const qrCornersSquareColor = ref('#000000')
const qrCornersSquareType = ref<'dot' | 'square' | 'extra-rounded'>('square')
const qrCornersDotColor = ref('#000000')
const qrCornersDotType = ref<'dot' | 'square'>('dot')
const qrLogoFile = ref<File | null>(null)
const qrLogoUrl = ref<string>('')
const qrLogoSize = ref(0.4)
const qrMargin = ref(10)
const qrErrorCorrectionLevel = ref<'L' | 'M' | 'Q' | 'H'>('M')
const qrCodeInstance = ref<QRCodeStyling | null>(null)
const qrContainer = ref<HTMLElement | null>(null)

// Veri düzenleme için state
const editingField = ref<string | null>(null)
const editingFieldValue = ref('')
const fieldError = ref<string | null>(null)

// Computed properties
const hasMenu = computed(() => {
  return app.value?.data?.menu && Array.isArray(app.value.data.menu) && app.value.data.menu.length > 0
})

const menuStats = computed(() => {
  if (!hasMenu.value) return { categories: 0, items: 0, visibleCategories: 0, visibleItems: 0 }
  
  const menu = app.value!.data!.menu as MenuCategory[]
  const categories = menu.length
  const items = menu.reduce((total, category) => total + category.items.length, 0)
  
  const visibleCategories = menu.filter(category => category.isVisible !== false).length
  const visibleItems = menu.reduce((total, category) => {
    if (category.isVisible === false) return total
    return total + category.items.filter(item => item.isVisible !== false).length
  }, 0)
  
  return { categories, items, visibleCategories, visibleItems }
})

const canEdit = computed(() => true) // Geçici olarak herkese düzenleme izni ver
const canDelete = computed(() => true) // Geçici olarak herkese silme izni ver

const filteredAppData = computed(() => {
  if (!app.value?.data) return {}
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
            isVisible: true,
            items: [
              {
                name: "Türk Kahvesi",
                price: "₺25.00",
                description: "Geleneksel Türk kahvesi",
                isVisible: true
              },
              {
                name: "Çay",
                price: "₺15.00",
                description: "Bergamot aromalı",
                isVisible: true
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
      items: [],
      isVisible: true
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
    price: newItem.value.price.trim(),
    isVisible: true
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

// Visibility toggle fonksiyonları
const toggleCategoryVisibility = async (categoryIndex: number) => {
  if (!app.value?.data?.menu || !Array.isArray(app.value.data.menu) || !canEdit.value) return
  
  const menu = app.value.data.menu
  if (!menu[categoryIndex]) return
  
  menu[categoryIndex].isVisible = !menu[categoryIndex].isVisible
  await saveMenuData()
}

const toggleItemVisibility = async (categoryIndex: number, itemIndex: number) => {
  if (!app.value?.data?.menu || !Array.isArray(app.value.data.menu) || !canEdit.value) return
  
  const menu = app.value.data.menu
  if (!menu[categoryIndex] || !menu[categoryIndex].items[itemIndex]) return
  
  menu[categoryIndex].items[itemIndex].isVisible = !menu[categoryIndex].items[itemIndex].isVisible
  await saveMenuData()
}

// JSON Import/Export fonksiyonları
const exportMenuAsJson = async () => {
  if (!app.value?.data?.menu) return
  
  try {
    const menuJson = JSON.stringify(app.value.data.menu, null, 2)
    await navigator.clipboard.writeText(menuJson)
    alert('Menü JSON formatında panoya kopyalandı!')
  } catch (err) {
    console.error('Kopyalama hatası:', err)
    alert('Menü kopyalanırken bir hata oluştu')
  }
}

const importMenuFromJson = async () => {
  if (!app.value || !canEdit.value) return
  
  try {
    jsonImportError.value = null
    const parsedMenu = JSON.parse(jsonImportText.value)
    
    // Basit validasyon
    if (!Array.isArray(parsedMenu)) {
      jsonImportError.value = 'Menü bir dizi (array) olmalıdır'
      return
    }
    
    // Menüyü güncelle
    if (!app.value.data) app.value.data = {}
    app.value.data.menu = parsedMenu
    
    await saveMenuData()
    
    // Başarılı olursa formu kapat ve temizle
    showJsonImport.value = false
    jsonImportText.value = ''
    alert('Menü başarıyla içe aktarıldı!')
    
  } catch (err) {
    console.error('JSON parse hatası:', err)
    jsonImportError.value = 'Geçersiz JSON formatı. Lütfen doğru formatta bir JSON girin.'
  }
}

const cancelJsonImport = () => {
  showJsonImport.value = false
  jsonImportText.value = ''
  jsonImportError.value = null
}

// QR Kod fonksiyonları
const generateQRCode = async () => {
  if (!qrUrl.value.trim()) {
    alert('Lütfen bir URL girin')
    return
  }

  await nextTick()

  if (qrContainer.value) {
    qrContainer.value.innerHTML = ''

    const options: Record<string, unknown> = {
      width: qrSize.value,
      height: qrSize.value,
      type: 'svg',
      data: qrUrl.value,
      margin: qrMargin.value,
      qrOptions: {
        typeNumber: 0,
        mode: 'Byte',
        errorCorrectionLevel: qrErrorCorrectionLevel.value
      },
      imageOptions: {
        hideBackgroundDots: true,
        imageSize: qrLogoSize.value,
        margin: 5,
        crossOrigin: 'anonymous'
      },
      dotsOptions: {
        color: qrDotsColor.value,
        type: qrDotsType.value
      },
      backgroundOptions: {
        color: qrBackgroundColor.value
      },
      cornersSquareOptions: {
        color: qrCornersSquareColor.value,
        type: qrCornersSquareType.value
      },
      cornersDotOptions: {
        color: qrCornersDotColor.value,
        type: qrCornersDotType.value
      }
    }

    if (qrLogoUrl.value) {
      options.image = qrLogoUrl.value
    }

    qrCodeInstance.value = new QRCodeStyling(options)
    qrCodeInstance.value.append(qrContainer.value)
  }
}

const handleLogoUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      alert('Logo boyutu 2MB\'dan küçük olmalıdır')
      return
    }
    
    qrLogoFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
      qrLogoUrl.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const removeLogo = () => {
  qrLogoFile.value = null
  qrLogoUrl.value = ''
}

const downloadQRCode = (format: 'png' | 'svg' | 'jpeg' | 'webp') => {
  if (!qrCodeInstance.value) {
    alert('Önce QR kod oluşturun')
    return
  }

  const extension = format
  const fileName = `qr-code-${Date.now()}.${extension}`

  qrCodeInstance.value.download({
    name: fileName,
    extension: extension
  })
}

const resetQRSettings = () => {
  qrUrl.value = app.value?.qr_url || ''
  qrSize.value = 300
  qrDotsColor.value = '#000000'
  qrBackgroundColor.value = '#ffffff'
  qrDotsType.value = 'rounded'
  qrCornersSquareColor.value = '#000000'
  qrCornersSquareType.value = 'square'
  qrCornersDotColor.value = '#000000'
  qrCornersDotType.value = 'dot'
  qrLogoFile.value = null
  qrLogoUrl.value = ''
  qrLogoSize.value = 0.4
  qrMargin.value = 10
  qrErrorCorrectionLevel.value = 'M'
  
  if (qrContainer.value) {
    qrContainer.value.innerHTML = ''
  }
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
            @click="activeTab = 'qr'"
            :class="activeTab === 'qr' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors"
          >
            📱 QR Kod Oluştur
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
                  <dd class="text-lg font-medium text-gray-900">{{ menuStats.visibleCategories }}/{{ menuStats.categories }}</dd>
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
                  <dd class="text-lg font-medium text-gray-900">{{ menuStats.visibleItems }}/{{ menuStats.items }}</dd>
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
            <div class="flex items-center gap-4">
              <!-- JSON İşlemleri -->
              <div v-if="canEdit" class="flex gap-2">
                <button 
                  v-if="hasMenu"
                  @click="exportMenuAsJson"
                  class="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                  title="Menüyü JSON olarak dışa aktar"
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  JSON Olarak Kopyala
                </button>
                <button 
                  @click="showJsonImport = true"
                  class="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                  title="JSON'dan menü yükle"
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  JSON'dan Yükle
                </button>
              </div>
              <div v-if="hasMenu" class="text-right border-l border-gray-300 pl-4">
                <p class="text-sm text-gray-500">
                  {{ menuStats.categories }} kategori ({{ menuStats.visibleCategories }} görünür), 
                  {{ menuStats.items }} ürün ({{ menuStats.visibleItems }} görünür)
                </p>
              </div>
            </div>
          </div>

          <!-- JSON Import Modal -->
          <div v-if="showJsonImport" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
                <div>
                  <h4 class="text-lg font-semibold text-gray-900">JSON'dan Menü Yükle</h4>
                  <p class="text-sm text-gray-500">Menüyü JSON formatında yapıştırın</p>
                </div>
                <button 
                  @click="cancelJsonImport"
                  class="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div class="p-6 space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    JSON Verisi
                  </label>
                  <textarea
                    v-model="jsonImportText"
                    placeholder='[{"category": "İçecekler", "isVisible": true, "items": [{"name": "Çay", "price": "₺15.00", "description": "Bergamot aromalı", "isVisible": true}]}]'
                    rows="20"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                  ></textarea>
                  <p class="text-xs text-gray-500 mt-1">
                    Menünüz bir dizi (array) olmalı ve her kategori "category", "isVisible" ve "items" alanlarına sahip olmalıdır.
                  </p>
                </div>
                
                <div v-if="jsonImportError" class="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div class="flex items-start gap-2">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p class="text-sm text-red-700">{{ jsonImportError }}</p>
                  </div>
                </div>
                
                <div class="flex gap-3 pt-4">
                  <button 
                    @click="importMenuFromJson"
                    :disabled="!jsonImportText.trim()"
                    class="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-5 h-5">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Menüyü Yükle
                  </button>
                  <button 
                    @click="cancelJsonImport"
                    class="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium transition-colors"
                  >
                    İptal
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Menü içeriği -->
          <div v-if="hasMenu" class="space-y-6">
            <!-- Mevcut Kategoriler -->
            <div v-for="(category, categoryIndex) in (app.data!.menu as MenuCategory[])" :key="categoryIndex" 
                 :class="category.isVisible === false ? 'border border-gray-300 rounded-lg overflow-hidden bg-gray-50 opacity-60' : 'border border-gray-200 rounded-lg overflow-hidden'">
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
                  <div v-else class="flex-1 flex items-center gap-3">
                    <h4 :class="category.isVisible === false ? 'text-lg font-semibold text-gray-500 line-through' : 'text-lg font-semibold text-gray-900'">
                      {{ category.category }}
                      <span v-if="category.isVisible === false" class="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">GİZLİ</span>
                    </h4>
                    <button 
                      @click="toggleCategoryVisibility(categoryIndex)"
                      :class="category.isVisible !== false ? 'text-green-600 hover:bg-green-100' : 'text-gray-400 hover:bg-gray-100'"
                      class="p-1 rounded-lg transition-colors"
                      :title="category.isVisible !== false ? 'Görünür - Gizlemek için tıklayın' : 'Gizli - Göstermek için tıklayın'"
                    >
                      <svg v-if="category.isVisible !== false" fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <svg v-else fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    </button>
                  </div>
                  
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
                    :class="item.isVisible === false ? 'bg-gray-100 rounded-lg p-4 border border-gray-300 opacity-60' : 'bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-colors'"
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
                        <h5 :class="item.isVisible === false ? 'font-semibold text-gray-500 mb-1 line-through' : 'font-semibold text-gray-900 mb-1'">
                          {{ item.name }}
                          <span v-if="item.isVisible === false" class="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">GİZLİ</span>
                        </h5>
                        <p v-if="item.description" :class="item.isVisible === false ? 'text-sm text-gray-400 leading-relaxed mb-2' : 'text-sm text-gray-600 leading-relaxed mb-2'">{{ item.description }}</p>
                      </div>
                      <div class="flex items-center gap-4">
                        <div class="text-lg font-bold text-blue-600">{{ item.price }}</div>
                        <div v-if="canEdit" class="flex gap-2 items-center">
                          <!-- Visibility Toggle -->
                          <button 
                            @click="toggleItemVisibility(categoryIndex, itemIndex)"
                            :class="item.isVisible !== false ? 'text-green-600 hover:bg-green-100' : 'text-gray-400 hover:bg-gray-100'"
                            class="p-1 rounded-lg transition-colors"
                            :title="item.isVisible !== false ? 'Görünür - Gizlemek için tıklayın' : 'Gizli - Göstermek için tıklayın'"
                          >
                            <svg v-if="item.isVisible !== false" fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-4 h-4">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <svg v-else fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-4 h-4">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                            </svg>
                          </button>
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

      <!-- QR Kod Oluştur -->
      <div v-else-if="activeTab === 'qr'" class="space-y-6">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="mb-6">
            <h3 class="text-lg font-medium text-gray-900 mb-2">📱 QR Kod Oluşturucu</h3>
            <p class="text-sm text-gray-500">Özelleştirilmiş QR kodunuzu oluşturun ve indirin</p>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Sol Panel - Ayarlar -->
            <div class="space-y-6">
              <!-- URL Girişi -->
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">
                  URL <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="qrUrl"
                  type="url"
                  placeholder="https://example.com"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p class="text-xs text-gray-500">QR kod ile erişilmesini istediğiniz URL'yi girin</p>
              </div>

              <!-- Boyut -->
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">
                  Boyut: {{ qrSize }}x{{ qrSize }}px
                </label>
                <input
                  v-model.number="qrSize"
                  type="range"
                  min="200"
                  max="800"
                  step="50"
                  class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div class="flex justify-between text-xs text-gray-500">
                  <span>200px</span>
                  <span>800px</span>
                </div>
              </div>

              <!-- Renkler -->
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700">QR Kod Rengi</label>
                  <div class="flex gap-2">
                    <input
                      v-model="qrDotsColor"
                      type="color"
                      class="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-300"
                    />
                    <input
                      v-model="qrDotsColor"
                      type="text"
                      class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    />
                  </div>
                </div>
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700">Arkaplan Rengi</label>
                  <div class="flex gap-2">
                    <input
                      v-model="qrBackgroundColor"
                      type="color"
                      class="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-300"
                    />
                    <input
                      v-model="qrBackgroundColor"
                      type="text"
                      class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    />
                  </div>
                </div>
              </div>

              <!-- Nokta Stili -->
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">Nokta Stili</label>
                <select
                  v-model="qrDotsType"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="rounded">Yuvarlatılmış</option>
                  <option value="dots">Noktalar</option>
                  <option value="classy">Şık</option>
                  <option value="classy-rounded">Şık Yuvarlatılmış</option>
                  <option value="square">Kare</option>
                  <option value="extra-rounded">Ekstra Yuvarlatılmış</option>
                </select>
              </div>

              <!-- Köşe Kareleri -->
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700">Köşe Kare Rengi</label>
                  <div class="flex gap-2">
                    <input
                      v-model="qrCornersSquareColor"
                      type="color"
                      class="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-300"
                    />
                    <input
                      v-model="qrCornersSquareColor"
                      type="text"
                      class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    />
                  </div>
                </div>
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700">Köşe Kare Stili</label>
                  <select
                    v-model="qrCornersSquareType"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="square">Kare</option>
                    <option value="dot">Nokta</option>
                    <option value="extra-rounded">Ekstra Yuvarlatılmış</option>
                  </select>
                </div>
              </div>

              <!-- Köşe Noktaları -->
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700">Köşe Nokta Rengi</label>
                  <div class="flex gap-2">
                    <input
                      v-model="qrCornersDotColor"
                      type="color"
                      class="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-300"
                    />
                    <input
                      v-model="qrCornersDotColor"
                      type="text"
                      class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    />
                  </div>
                </div>
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700">Köşe Nokta Stili</label>
                  <select
                    v-model="qrCornersDotType"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="dot">Nokta</option>
                    <option value="square">Kare</option>
                  </select>
                </div>
              </div>

              <!-- Logo Yükleme -->
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">Logo (İsteğe Bağlı)</label>
                <div v-if="qrLogoUrl" class="mb-3 relative inline-block">
                  <img :src="qrLogoUrl" alt="Logo" class="w-20 h-20 object-contain border border-gray-300 rounded-lg" />
                  <button
                    @click="removeLogo"
                    class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                    title="Logoyu kaldır"
                  >
                    ✕
                  </button>
                </div>
                <input
                  @change="handleLogoUpload"
                  type="file"
                  accept="image/*"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p class="text-xs text-gray-500">Maksimum 2MB. PNG, JPG, SVG formatları desteklenir</p>
              </div>

              <!-- Logo Boyutu -->
              <div v-if="qrLogoUrl" class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">
                  Logo Boyutu: {{ Math.round(qrLogoSize * 100) }}%
                </label>
                <input
                  v-model.number="qrLogoSize"
                  type="range"
                  min="0.2"
                  max="0.6"
                  step="0.05"
                  class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div class="flex justify-between text-xs text-gray-500">
                  <span>20%</span>
                  <span>60%</span>
                </div>
              </div>

              <!-- Gelişmiş Ayarlar -->
              <div class="border-t border-gray-200 pt-4 space-y-4">
                <h4 class="font-semibold text-gray-900">Gelişmiş Ayarlar</h4>
                
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700">
                    Kenar Boşluğu: {{ qrMargin }}px
                  </label>
                  <input
                    v-model.number="qrMargin"
                    type="range"
                    min="0"
                    max="50"
                    step="5"
                    class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div class="flex justify-between text-xs text-gray-500">
                    <span>0px</span>
                    <span>50px</span>
                  </div>
                </div>

                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700">Hata Düzeltme Seviyesi</label>
                  <select
                    v-model="qrErrorCorrectionLevel"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="L">Düşük (7%)</option>
                    <option value="M">Orta (15%)</option>
                    <option value="Q">Yüksek (25%)</option>
                    <option value="H">Çok Yüksek (30%)</option>
                  </select>
                  <p class="text-xs text-gray-500">Yüksek seviye, hasarlı QR kodların okunabilmesini sağlar</p>
                </div>
              </div>

              <!-- Butonlar -->
              <div class="flex gap-3 pt-4">
                <button
                  @click="generateQRCode"
                  :disabled="!qrUrl.trim()"
                  class="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition-colors"
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  QR Kod Oluştur
                </button>
                <button
                  @click="resetQRSettings"
                  class="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-semibold transition-colors"
                  title="Ayarları sıfırla"
                >
                  🔄
                </button>
              </div>
            </div>

            <!-- Sağ Panel - Önizleme ve İndirme -->
            <div class="space-y-6">
              <div class="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 flex items-center justify-center min-h-[400px]">
                <div v-if="qrCodeInstance" class="text-center">
                  <div ref="qrContainer" class="inline-block"></div>
                </div>
                <div v-else class="text-center text-gray-500">
                  <div class="text-6xl mb-4">📱</div>
                  <p class="text-lg font-medium mb-2">QR Kod Önizlemesi</p>
                  <p class="text-sm">Ayarları yapın ve "QR Kod Oluştur" butonuna tıklayın</p>
                </div>
              </div>

              <!-- İndirme Butonları -->
              <div v-if="qrCodeInstance" class="space-y-4">
                <h4 class="font-semibold text-gray-900">QR Kodu İndir</h4>
                <div class="grid grid-cols-2 gap-3">
                  <button
                    @click="downloadQRCode('png')"
                    class="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-5 h-5">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    PNG
                  </button>
                  <button
                    @click="downloadQRCode('svg')"
                    class="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-5 h-5">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    SVG
                  </button>
                  <button
                    @click="downloadQRCode('jpeg')"
                    class="flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium transition-colors"
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-5 h-5">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    JPEG
                  </button>
                  <button
                    @click="downloadQRCode('webp')"
                    class="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-5 h-5">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    WEBP
                  </button>
                </div>
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p class="text-sm text-blue-800">
                    <strong>💡 İpucu:</strong> SVG formatı vektör tabanlıdır ve her boyutta keskin kalır. Baskı işleri için önerilir.
                  </p>
                </div>
              </div>

              <!-- Kullanım Önerileri -->
              <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
                <h4 class="font-semibold text-gray-900 mb-2">📋 Kullanım Önerileri</h4>
                <ul class="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li>Logo eklerken yüksek hata düzeltme seviyesi kullanın</li>
                  <li>Arkaplan ile QR kod rengi arasında yeterli kontrast olmalı</li>
                  <li>Küçük boyutlarda kullanacaksanız 300x300px yeterlidir</li>
                  <li>Baskı için minimum 400x400px boyut önerilir</li>
                  <li>QR kodu test ettikten sonra kullanmaya başlayın</li>
                </ul>
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
                    :value="app?._id" 
                    readonly 
                    class="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Tür</label>
                  <input 
                    :value="app?.type?.name || 'Bilinmeyen Tür'" 
                    readonly 
                    class="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">QR Kod URL</label>
                  <div class="flex gap-2">
                    <input 
                      :value="app?.qr_url || 'QR kod yok'" 
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
                    :value="formatDate(app?.createdAt || '')" 
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