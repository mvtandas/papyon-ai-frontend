<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { roleAPI } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

// Types
interface Permission {
  _id: string
  name: string
  displayName: string
  category: string
}

interface Role {
  _id: string
  name: string
  displayName: string
  description: string
  isActive: boolean
  isSystem: boolean
  level: number
  createdAt: string
  updatedAt: string
  permissions: Permission[]
  createdBy?: {
    _id: string
    username: string
    firstName: string
    lastName: string
  }
}

interface Pagination {
  currentPage: number
  totalPages: number
  totalRoles: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

// Store
const authStore = useAuthStore()

// Reactive state
const roles = ref<Role[]>([])
const pagination = ref<Pagination>({
  currentPage: 1,
  totalPages: 1,
  totalRoles: 0,
  hasNextPage: false,
  hasPrevPage: false
})

const loading = ref(false)
const error = ref('')

// Filters
const filters = reactive({
  page: 1,
  limit: 10,
  search: ''
})

// Modal states
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const selectedRole = ref<Role | null>(null)

// Form data
const formData = reactive({
  name: '',
  displayName: '',
  description: '',
  level: 0,
  permissions: [] as string[]
})

const formErrors = ref<Record<string, string>>({})

// Computed
const formatDate = computed(() => (dateString: string) => {
  return new Date(dateString).toLocaleString('tr-TR')
})

const canManageRoles = computed(() => {
  return authStore.user?.roles?.some(role => 
    role.name === 'SUPER_ADMIN' || role.name === 'ADMIN'
  )
})

// Methods
const fetchRoles = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await roleAPI.getRoles(filters)
    roles.value = response.data.roles
    pagination.value = response.data.pagination
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Roller yüklenirken hata oluştu'
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  filters.page = 1
  fetchRoles()
}

const handlePageChange = (page: number) => {
  filters.page = page
  fetchRoles()
}

const resetForm = () => {
  formData.name = ''
  formData.displayName = ''
  formData.description = ''
  formData.level = 0
  formData.permissions = []
  formErrors.value = {}
}

const handleCreateRole = () => {
  resetForm()
  showCreateModal.value = true
}

const handleEditRole = (role: Role) => {
  selectedRole.value = role
  formData.name = role.name
  formData.displayName = role.displayName
  formData.description = role.description
  formData.level = role.level
  formData.permissions = role.permissions.map(p => p._id)
  showEditModal.value = true
}

const handleDeleteRole = (role: Role) => {
  selectedRole.value = role
  showDeleteModal.value = true
}

const validateForm = () => {
  formErrors.value = {}
  
  if (!formData.name.trim()) {
    formErrors.value.name = 'Rol adı gereklidir'
  } else if (formData.name.length < 3) {
    formErrors.value.name = 'Rol adı en az 3 karakter olmalıdır'
  }
  
  if (!formData.displayName.trim()) {
    formErrors.value.displayName = 'Görünen ad gereklidir'
  }
  
  if (!formData.description.trim()) {
    formErrors.value.description = 'Açıklama gereklidir'
  }
  
  if (formData.level < 0) {
    formErrors.value.level = 'Seviye 0 veya daha büyük olmalıdır'
  }
  
  return Object.keys(formErrors.value).length === 0
}

const submitCreateRole = async () => {
  if (!validateForm()) return
  
  try {
    await roleAPI.createRole(formData)
    showCreateModal.value = false
    await fetchRoles()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Rol oluşturulurken hata oluştu'
  }
}

const submitEditRole = async () => {
  if (!selectedRole.value || !validateForm()) return
  
  try {
    await roleAPI.updateRole(selectedRole.value._id, {
      displayName: formData.displayName,
      description: formData.description,
      level: formData.level,
      permissions: formData.permissions
    })
    showEditModal.value = false
    await fetchRoles()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Rol güncellenirken hata oluştu'
  }
}

const submitDeleteRole = async () => {
  if (!selectedRole.value) return
  
  try {
    await roleAPI.deleteRole(selectedRole.value._id)
    showDeleteModal.value = false
    await fetchRoles()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Rol silinirken hata oluştu'
  }
}

// Lifecycle
onMounted(() => {
  fetchRoles()
})
</script>

<template>
  <div class="roles-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">Rol Yönetimi</h1>
        <p class="page-description">Sistem rollerini görüntüleyin ve yönetin</p>
      </div>
      <button 
        v-if="canManageRoles"
        @click="handleCreateRole" 
        class="create-btn"
      >
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Yeni Rol
      </button>
    </div>

    <!-- Filters -->
    <div class="filters-section">
      <div class="filters-container">
        <div class="search-box">
          <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="filters.search"
            @keyup.enter="handleSearch"
            type="text"
            placeholder="Rol ara..."
            class="search-input"
          />
        </div>
        
        <button @click="handleSearch" class="search-btn">
          Ara
        </button>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- Roles Table -->
    <div class="roles-table-container">
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Roller yükleniyor...</p>
      </div>

      <div v-else-if="roles.length === 0" class="empty-state">
        <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3>Rol Bulunamadı</h3>
        <p>Arama kriterlerinize uygun rol bulunamadı.</p>
      </div>

      <div v-else class="roles-table">
        <table>
          <thead>
            <tr>
              <th>Rol</th>
              <th>Açıklama</th>
              <th>Seviye</th>
              <th>Durum</th>
              <th>Yetkiler</th>
              <th>Oluşturulma</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="role in roles" :key="role._id">
              <td class="role-cell">
                <div class="role-info">
                  <div class="role-header">
                    <span class="role-name">{{ role.displayName }}</span>
                    <span class="role-code">{{ role.name }}</span>
                  </div>
                  <div class="role-meta">
                    <span v-if="role.isSystem" class="system-badge">Sistem</span>
                    <span v-else class="custom-badge">Özel</span>
                  </div>
                </div>
              </td>
              <td>{{ role.description }}</td>
              <td>
                <span class="level-badge">{{ role.level }}</span>
              </td>
              <td>
                <span 
                  class="status-badge"
                  :class="role.isActive ? 'active' : 'inactive'"
                >
                  {{ role.isActive ? 'Aktif' : 'Pasif' }}
                </span>
              </td>
              <td>
                <div class="permissions-container">
                  <span 
                    v-for="permission in role.permissions.slice(0, 3)" 
                    :key="permission._id"
                    class="permission-badge"
                  >
                    {{ permission.displayName }}
                  </span>
                  <span v-if="role.permissions.length > 3" class="more-badge">
                    +{{ role.permissions.length - 3 }} daha
                  </span>
                </div>
              </td>
              <td>{{ formatDate(role.createdAt) }}</td>
              <td>
                <div class="actions">
                  <button 
                    @click="handleEditRole(role)"
                    class="action-btn edit-btn"
                    title="Düzenle"
                    :disabled="role.isSystem"
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  
                  <button 
                    @click="handleDeleteRole(role)"
                    class="action-btn delete-btn"
                    title="Sil"
                    :disabled="role.isSystem"
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.totalPages > 1" class="pagination">
      <button 
        @click="handlePageChange(pagination.currentPage - 1)"
        :disabled="!pagination.hasPrevPage"
        class="pagination-btn"
      >
        Önceki
      </button>
      
      <div class="page-numbers">
        <span class="page-info">
          Sayfa {{ pagination.currentPage }} / {{ pagination.totalPages }}
        </span>
        <span class="total-info">
          Toplam {{ pagination.totalRoles }} rol
        </span>
      </div>
      
      <button 
        @click="handlePageChange(pagination.currentPage + 1)"
        :disabled="!pagination.hasNextPage"
        class="pagination-btn"
      >
        Sonraki
      </button>
    </div>

    <!-- Create Role Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click="showCreateModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Yeni Rol Oluştur</h3>
          <button @click="showCreateModal = false" class="modal-close">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitCreateRole" class="role-form">
            <div class="form-group">
              <label for="name">Rol Adı *</label>
              <input
                id="name"
                v-model="formData.name"
                type="text"
                placeholder="ADMIN"
                class="form-input"
                :class="{ 'error': formErrors.name }"
              />
              <span v-if="formErrors.name" class="error-text">{{ formErrors.name }}</span>
            </div>
            
            <div class="form-group">
              <label for="displayName">Görünen Ad *</label>
              <input
                id="displayName"
                v-model="formData.displayName"
                type="text"
                placeholder="Yönetici"
                class="form-input"
                :class="{ 'error': formErrors.displayName }"
              />
              <span v-if="formErrors.displayName" class="error-text">{{ formErrors.displayName }}</span>
            </div>
            
            <div class="form-group">
              <label for="description">Açıklama *</label>
              <textarea
                id="description"
                v-model="formData.description"
                placeholder="Rol açıklaması..."
                class="form-textarea"
                :class="{ 'error': formErrors.description }"
                rows="3"
              ></textarea>
              <span v-if="formErrors.description" class="error-text">{{ formErrors.description }}</span>
            </div>
            
            <div class="form-group">
              <label for="level">Seviye *</label>
              <input
                id="level"
                v-model.number="formData.level"
                type="number"
                min="0"
                max="100"
                class="form-input"
                :class="{ 'error': formErrors.level }"
              />
              <span v-if="formErrors.level" class="error-text">{{ formErrors.level }}</span>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button @click="showCreateModal = false" class="btn-secondary">
            İptal
          </button>
          <button @click="submitCreateRole" class="btn-primary">
            Oluştur
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Role Modal -->
    <div v-if="showEditModal && selectedRole" class="modal-overlay" @click="showEditModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Rol Düzenle</h3>
          <button @click="showEditModal = false" class="modal-close">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitEditRole" class="role-form">
            <div class="form-group">
              <label for="editName">Rol Adı</label>
              <input
                id="editName"
                v-model="formData.name"
                type="text"
                class="form-input"
                disabled
              />
              <small class="help-text">Sistem rolleri düzenlenemez</small>
            </div>
            
            <div class="form-group">
              <label for="editDisplayName">Görünen Ad *</label>
              <input
                id="editDisplayName"
                v-model="formData.displayName"
                type="text"
                class="form-input"
                :class="{ 'error': formErrors.displayName }"
              />
              <span v-if="formErrors.displayName" class="error-text">{{ formErrors.displayName }}</span>
            </div>
            
            <div class="form-group">
              <label for="editDescription">Açıklama *</label>
              <textarea
                id="editDescription"
                v-model="formData.description"
                class="form-textarea"
                :class="{ 'error': formErrors.description }"
                rows="3"
              ></textarea>
              <span v-if="formErrors.description" class="error-text">{{ formErrors.description }}</span>
            </div>
            
            <div class="form-group">
              <label for="editLevel">Seviye *</label>
              <input
                id="editLevel"
                v-model.number="formData.level"
                type="number"
                min="0"
                max="100"
                class="form-input"
                :class="{ 'error': formErrors.level }"
              />
              <span v-if="formErrors.level" class="error-text">{{ formErrors.level }}</span>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button @click="showEditModal = false" class="btn-secondary">
            İptal
          </button>
          <button @click="submitEditRole" class="btn-primary">
            Güncelle
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal && selectedRole" class="modal-overlay" @click="showDeleteModal = false">
      <div class="modal-content delete-modal" @click.stop>
        <div class="modal-header">
          <h3>Rolü Sil</h3>
          <button @click="showDeleteModal = false" class="modal-close">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <p>
            <strong>{{ selectedRole.displayName }}</strong> rolünü silmek istediğinizden emin misiniz?
          </p>
          <p class="warning-text">Bu işlem geri alınamaz!</p>
        </div>
        <div class="modal-footer">
          <button @click="showDeleteModal = false" class="btn-secondary">
            İptal
          </button>
          <button @click="submitDeleteRole" class="btn-danger">
            Sil
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.roles-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.header-content {
  flex: 1;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
}

.page-description {
  color: #6c757d;
  margin: 0;
}

.create-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #000000;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.create-btn:hover {
  background: #333333;
}

.create-btn svg {
  width: 1.25rem;
  height: 1.25rem;
}

/* Filters */
.filters-section {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.filters-container {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.search-box {
  position: relative;
  flex: 1;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.25rem;
  height: 1.25rem;
  color: #6c757d;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #e9ecef;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #000000;
}

.search-btn {
  padding: 0.75rem 1.5rem;
  background: #000000;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-btn:hover {
  background: #333333;
}

/* Error Message */
.error-message {
  background: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid #f5c6cb;
}

/* Table */
.roles-table-container {
  background: white;
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.loading-state, .empty-state {
  padding: 3rem;
  text-align: center;
  color: #6c757d;
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 2px solid #e9ecef;
  border-top: 2px solid #000000;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-icon {
  width: 3rem;
  height: 3rem;
  margin-bottom: 1rem;
  color: #6c757d;
}

.roles-table {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e9ecef;
}

th {
  background: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Role Cell */
.role-cell {
  min-width: 200px;
}

.role-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.role-header {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.role-name {
  font-weight: 600;
  color: #2c3e50;
}

.role-code {
  font-size: 0.875rem;
  color: #6c757d;
  font-family: monospace;
}

.role-meta {
  display: flex;
  gap: 0.5rem;
}

.system-badge, .custom-badge {
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.system-badge {
  background: #dc3545;
  color: white;
}

.custom-badge {
  background: #28a745;
  color: white;
}

/* Level */
.level-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
  background: #000000;
  color: white;
}

/* Status */
.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-badge.active {
  background: #28a745;
  color: white;
}

.status-badge.inactive {
  background: #6c757d;
  color: white;
}

/* Permissions */
.permissions-container {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  align-items: center;
}

.permission-badge {
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: #f8f9fa;
  color: #6c757d;
  border: 1px solid #e9ecef;
}

.more-badge {
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: #6c757d;
  color: white;
}

/* Actions */
.actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn svg {
  width: 1rem;
  height: 1rem;
}

.edit-btn {
  background: #ffc107;
  color: #212529;
}

.edit-btn:hover:not(:disabled) {
  background: #e0a800;
}

.delete-btn {
  background: #dc3545;
  color: white;
}

.delete-btn:hover:not(:disabled) {
  background: #c82333;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  padding: 1rem;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.pagination-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #e9ecef;
  background: white;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  background: #f8f9fa;
  border-color: #000000;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.page-info {
  font-weight: 600;
  color: #2c3e50;
}

.total-info {
  font-size: 0.875rem;
  color: #6c757d;
}

/* Modals */
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

.modal-content {
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

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.375rem;
  transition: background-color 0.2s;
}

.modal-close:hover {
  background: #f8f9fa;
}

.modal-close svg {
  width: 1.25rem;
  height: 1.25rem;
  color: #6c757d;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e9ecef;
}

/* Form */
.role-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #2c3e50;
}

.form-input, .form-textarea {
  padding: 0.75rem;
  border: 1px solid #e9ecef;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.form-input:focus, .form-textarea:focus {
  outline: none;
  border-color: #000000;
}

.form-input.error, .form-textarea.error {
  border-color: #dc3545;
}

.form-input:disabled {
  background: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.error-text {
  color: #dc3545;
  font-size: 0.875rem;
}

.help-text {
  color: #6c757d;
  font-size: 0.875rem;
}

/* Buttons */
.btn-primary, .btn-secondary, .btn-danger {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #000000;
  color: white;
}

.btn-primary:hover {
  background: #333333;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
}

/* Delete Modal */
.delete-modal .modal-body {
  text-align: center;
}

.warning-text {
  color: #dc3545;
  font-weight: 600;
  margin-top: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .roles-page {
    padding: 1rem;
  }
  
  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .create-btn {
    justify-content: center;
  }
  
  .filters-container {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box {
    order: 1;
  }
  
  .search-btn {
    order: 2;
  }
  
  .roles-table {
    font-size: 0.875rem;
  }
  
  th, td {
    padding: 0.75rem 0.5rem;
  }
  
  .role-cell {
    min-width: 150px;
  }
  
  .actions {
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .action-btn {
    width: 1.75rem;
    height: 1.75rem;
  }
  
  .modal-content {
    width: 95%;
    margin: 1rem;
  }
}
</style> 