<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { appTypeAPI } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import { 
  PencilIcon,
  TrashIcon,
  ArrowPathIcon
} from '@heroicons/vue/24/outline';

// Types
interface AppType {
  id: string
  name: string
  displayName: string
  description: string
  features: string[]
  icon: string
  color: string
  isActive: boolean
}

const authStore = useAuthStore()

// State
const appTypes = ref<AppType[]>([])
const loading = ref(false)
const error = ref('')
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const selectedAppType = ref<AppType | null>(null)
const currentPage = ref(1)
const totalPages = ref(1)
const searchQuery = ref('')

// Form data
const formData = ref({
  name: '',
  displayName: '',
  description: '',
  features: [''],
  icon: '',
  color: '#000000'
})

// Computed
const canManageAppTypes = computed(() => {
  return authStore.permissions?.some(permission => permission.name === 'apptype:create') ||
         authStore.permissions?.some(permission => permission.name === 'apptype:update') ||
         authStore.permissions?.some(permission => permission.name === 'apptype:delete')
})

// Methods
const loadAppTypes = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const params = {
      page: currentPage.value,
      limit: 10,
      search: searchQuery.value || undefined
    }
    
    const response = await appTypeAPI.getAllAppTypes(params)
    appTypes.value = response.data
    totalPages.value = response.totalPages
  } catch (err) {
    error.value = 'App tipleri yüklenirken hata oluştu'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const handleCreate = () => {
  formData.value = {
    name: '',
    displayName: '',
    description: '',
    features: [''],
    icon: '',
    color: '#000000'
  }
  showCreateModal.value = true
}

const handleEdit = (appType: AppType) => {
  selectedAppType.value = appType
  formData.value = {
    name: appType.name,
    displayName: appType.displayName,
    description: appType.description,
    features: [...appType.features],
    icon: appType.icon,
    color: appType.color
  }
  showEditModal.value = true
}

const handleDelete = (appType: AppType) => {
  selectedAppType.value = appType
  showDeleteModal.value = true
}

const handleRestore = async (appType: AppType) => {
  try {
    await appTypeAPI.restoreAppType(appType.id)
    await loadAppTypes()
  } catch (err) {
    error.value = 'App tipi geri yüklenirken hata oluştu'
    console.error(err)
  }
}

const submitCreate = async () => {
  try {
    await appTypeAPI.createAppType(formData.value)
    showCreateModal.value = false
    await loadAppTypes()
  } catch (err) {
    error.value = 'App tipi oluşturulurken hata oluştu'
    console.error(err)
  }
}

const submitEdit = async () => {
  try {
    if (selectedAppType.value) {
      await appTypeAPI.updateAppType(selectedAppType.value.id, formData.value)
      showEditModal.value = false
      await loadAppTypes()
    }
  } catch (err) {
    error.value = 'App tipi güncellenirken hata oluştu'
    console.error(err)
  }
}

const submitDelete = async () => {
  try {
    if (selectedAppType.value) {
      await appTypeAPI.deleteAppType(selectedAppType.value.id)
      showDeleteModal.value = false
      await loadAppTypes()
    }
  } catch (err) {
    error.value = 'App tipi silinirken hata oluştu'
    console.error(err)
  }
}

const addFeature = () => {
  formData.value.features.push('')
}

const removeFeature = (index: number) => {
  formData.value.features.splice(index, 1)
}

const handleSearch = () => {
  currentPage.value = 1
  loadAppTypes()
}

const changePage = (page: number) => {
  currentPage.value = page
  loadAppTypes()
}

// Lifecycle
onMounted(() => {
  loadAppTypes()
})
</script>

<template>
  <div class="app-types-view">
    <div class="header">
      <div class="header-content">
        <h1 class="title">App Tipleri</h1>
        <p class="subtitle">Sistemdeki tüm app tiplerini yönetin</p>
      </div>
      
      <div class="header-actions">
        <div class="search-box">
          <input
            v-model="searchQuery"
            @keyup.enter="handleSearch"
            type="text"
            placeholder="App tipi ara..."
            class="search-input"
          />
          <button @click="handleSearch" class="search-button">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
        
        <button
          v-if="canManageAppTypes"
          @click="handleCreate"
          class="create-button"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Yeni App Tipi
        </button>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>App tipleri yükleniyor...</p>
    </div>

    <!-- App Types List -->
    <div v-else class="app-types-grid">
      <div
        v-for="appType in appTypes"
        :key="appType.id"
        class="app-type-card"
        :class="{ 'inactive': !appType.isActive }"
      >
        <div class="card-header">
          <div class="app-type-icon" :style="{ backgroundColor: appType.color }">
            <span class="icon-text">{{ appType.icon }}</span>
          </div>
          <div class="app-type-info">
            <h3 class="app-type-name">{{ appType.displayName }}</h3>
            <p class="app-type-description">{{ appType.description }}</p>
          </div>
          <div class="card-actions">
            <button
              v-if="canManageAppTypes"
              @click="handleEdit(appType)"
              class="action-button edit"
              title="Düzenle"
            >
              <PencilIcon class="w-4 h-4" />
            </button>
            
            <button
              v-if="canManageAppTypes && appType.isActive"
              @click="handleDelete(appType)"
              class="action-button delete"
              title="Sil"
            >
              <TrashIcon class="w-4 h-4" />
            </button>
            
            <button
              v-if="canManageAppTypes && !appType.isActive"
              @click="handleRestore(appType)"
              class="action-button restore"
              title="Geri Yükle"
            >
              <ArrowPathIcon class="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div class="card-content">
          <div class="features-list">
            <h4>Özellikler:</h4>
            <ul>
              <li v-for="feature in appType.features" :key="feature">
                {{ feature }}
              </li>
            </ul>
          </div>
          
          <div class="app-type-meta">
            <span class="meta-item">
              <strong>ID:</strong> {{ appType.name }}
            </span>
            <span class="meta-item">
              <strong>Durum:</strong>
              <span :class="appType.isActive ? 'status-active' : 'status-inactive'">
                {{ appType.isActive ? 'Aktif' : 'Pasif' }}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="pagination">
      <button
        @click="changePage(currentPage - 1)"
        :disabled="currentPage === 1"
        class="pagination-button"
      >
        Önceki
      </button>
      
      <span class="pagination-info">
        Sayfa {{ currentPage }} / {{ totalPages }}
      </span>
      
      <button
        @click="changePage(currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="pagination-button"
      >
        Sonraki
      </button>
    </div>

    <!-- Create Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click="showCreateModal = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2>Yeni App Tipi Oluştur</h2>
          <button @click="showCreateModal = false" class="close-button">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="modal-content">
          <div class="form-group">
            <label>Ad (Teknik):</label>
            <input v-model="formData.name" type="text" placeholder="restaurant" />
          </div>
          
          <div class="form-group">
            <label>Görünen Ad:</label>
            <input v-model="formData.displayName" type="text" placeholder="Restaurant" />
          </div>
          
          <div class="form-group">
            <label>Açıklama:</label>
            <textarea v-model="formData.description" placeholder="Restaurant yönetimi için app tipi"></textarea>
          </div>
          
          <div class="form-group">
            <label>İkon:</label>
            <input v-model="formData.icon" type="text" placeholder="🍽️" />
          </div>
          
          <div class="form-group">
            <label>Renk:</label>
            <input v-model="formData.color" type="color" />
          </div>
          
          <div class="form-group">
            <label>Özellikler:</label>
            <div class="features-input">
              <div
                v-for="(feature, index) in formData.features"
                :key="index"
                class="feature-input-row"
              >
                <input v-model="formData.features[index]" type="text" placeholder="Özellik adı" />
                <button @click="removeFeature(index)" class="remove-feature">Sil</button>
              </div>
              <button @click="addFeature" class="add-feature">Özellik Ekle</button>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="showCreateModal = false" class="cancel-button">İptal</button>
          <button @click="submitCreate" class="submit-button">Oluştur</button>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click="showEditModal = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2>App Tipi Düzenle</h2>
          <button @click="showEditModal = false" class="close-button">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="modal-content">
          <div class="form-group">
            <label>Görünen Ad:</label>
            <input v-model="formData.displayName" type="text" />
          </div>
          
          <div class="form-group">
            <label>Açıklama:</label>
            <textarea v-model="formData.description"></textarea>
          </div>
          
          <div class="form-group">
            <label>İkon:</label>
            <input v-model="formData.icon" type="text" />
          </div>
          
          <div class="form-group">
            <label>Renk:</label>
            <input v-model="formData.color" type="color" />
          </div>
          
          <div class="form-group">
            <label>Özellikler:</label>
            <div class="features-input">
              <div
                v-for="(feature, index) in formData.features"
                :key="index"
                class="feature-input-row"
              >
                <input v-model="formData.features[index]" type="text" />
                <button @click="removeFeature(index)" class="remove-feature">Sil</button>
              </div>
              <button @click="addFeature" class="add-feature">Özellik Ekle</button>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="showEditModal = false" class="cancel-button">İptal</button>
          <button @click="submitEdit" class="submit-button">Güncelle</button>
        </div>
      </div>
    </div>

    <!-- Delete Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
      <div class="modal delete-modal" @click.stop>
        <div class="modal-header">
          <h2>App Tipi Sil</h2>
          <button @click="showDeleteModal = false" class="close-button">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="modal-content">
          <p>
            <strong>{{ selectedAppType?.displayName }}</strong> app tipini silmek istediğinizden emin misiniz?
          </p>
          <p class="warning-text">
            Bu işlem geri alınabilir. App tipi pasif hale getirilecek ve daha sonra geri yüklenebilir.
          </p>
        </div>
        
        <div class="modal-footer">
          <button @click="showDeleteModal = false" class="cancel-button">İptal</button>
          <button @click="submitDelete" class="delete-button">Sil</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app-types-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 2rem;
}

.header-content {
  flex: 1;
}

.title {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
}

.subtitle {
  color: #6c757d;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.search-box {
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 0.5rem;
  overflow: hidden;
}

.search-input {
  border: none;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  outline: none;
  min-width: 250px;
}

.search-button {
  background: none;
  border: none;
  padding: 0.75rem;
  color: #6c757d;
  cursor: pointer;
  transition: color 0.2s;
}

.search-button:hover {
  color: #000000;
}

.create-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #000000;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.create-button:hover {
  background: #333333;
  transform: translateY(-1px);
}

.error-message {
  background: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid #f5c6cb;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #6c757d;
}

.spinner {
  width: 2rem;
  height: 2rem;
  border: 2px solid #e9ecef;
  border-top: 2px solid #000000;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.app-types-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.app-type-card {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 0.75rem;
  overflow: hidden;
  transition: all 0.2s;
}

.app-type-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.app-type-card.inactive {
  opacity: 0.6;
  background: #f8f9fa;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
}

.app-type-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.app-type-info {
  flex: 1;
}

.app-type-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.25rem 0;
}

.app-type-description {
  color: #6c757d;
  font-size: 0.875rem;
  margin: 0;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
}

.action-button {
  background: none;
  border: none;
  padding: 0.5rem;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s;
  color: #6c757d;
}

.action-button:hover {
  background: #f8f9fa;
}

.action-button.edit:hover {
  color: #007bff;
}

.action-button.delete:hover {
  color: #dc3545;
}

.action-button.restore:hover {
  color: #28a745;
}

.card-content {
  padding: 1.5rem;
}

.features-list h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
}

.features-list ul {
  list-style: none;
  padding: 0;
  margin: 0 0 1rem 0;
}

.features-list li {
  padding: 0.25rem 0;
  color: #6c757d;
  font-size: 0.875rem;
}

.app-type-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
}

.meta-item {
  color: #6c757d;
}

.status-active {
  color: #28a745;
  font-weight: 600;
}

.status-inactive {
  color: #dc3545;
  font-weight: 600;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.pagination-button {
  background: white;
  border: 1px solid #e9ecef;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-button:hover:not(:disabled) {
  background: #f8f9fa;
  border-color: #000000;
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  color: #6c757d;
  font-size: 0.875rem;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 0.75rem;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
}

.close-button {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: #6c757d;
  border-radius: 0.25rem;
  transition: all 0.2s;
}

.close-button:hover {
  background: #f8f9fa;
  color: #000000;
}

.modal-content {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e9ecef;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #000000;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.features-input {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.feature-input-row {
  display: flex;
  gap: 0.5rem;
}

.feature-input-row input {
  flex: 1;
}

.remove-feature {
  background: #dc3545;
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background 0.2s;
}

.remove-feature:hover {
  background: #c82333;
}

.add-feature {
  background: #28a745;
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background 0.2s;
  align-self: flex-start;
}

.add-feature:hover {
  background: #218838;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e9ecef;
}

.cancel-button {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.25rem;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
}

.cancel-button:hover {
  background: #5a6268;
}

.submit-button {
  background: #000000;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.25rem;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
}

.submit-button:hover {
  background: #333333;
}

.delete-button {
  background: #dc3545;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.25rem;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
}

.delete-button:hover {
  background: #c82333;
}

.delete-modal .modal-content {
  text-align: center;
}

.warning-text {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .header-actions {
    flex-direction: column;
  }
  
  .search-input {
    min-width: auto;
  }
  
  .app-types-grid {
    grid-template-columns: 1fr;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .card-actions {
    align-self: flex-end;
  }
}
</style> 