<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { userAPI, roleAPI } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import { 
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  UserCircleIcon,
  DocumentIcon,
  XMarkIcon,
  CheckIcon,
  TrashIcon
} from '@heroicons/vue/24/outline'

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
  level: number
  permissions?: Permission[]
}

interface User {
  _id: string
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

interface Pagination {
  currentPage: number
  totalPages: number
  totalUsers: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

// Store
const authStore = useAuthStore()

// Reactive state
const users = ref<User[]>([])
const pagination = ref<Pagination>({
  currentPage: 1,
  totalPages: 1,
  totalUsers: 0,
  hasNextPage: false,
  hasPrevPage: false
})

const loading = ref(false)
const error = ref('')

// Filters
const filters = reactive({
  page: 1,
  limit: 10,
  search: '',
  role: ''
})

// Selected user for actions
const selectedUser = ref<User | null>(null)
const showUserModal = ref(false)
const showDeleteModal = ref(false)
const showRoleModal = ref(false)

// Role management
const availableRoles = ref<Role[]>([])
const selectedRoles = ref<string[]>([])
const loadingRoles = ref(false)

// Computed
const userDisplayName = computed(() => (user: User) => {
  return user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}`
    : user.username
})

const formatDate = computed(() => (dateString: string) => {
  return new Date(dateString).toLocaleString('tr-TR')
})

const canManageUsers = computed(() => {
  return authStore.user?.roles?.some(role => 
    role.name === 'SUPER_ADMIN' || role.name === 'ADMIN'
  )
})

// Methods
const fetchUsers = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await userAPI.getUsers(filters)
    users.value = response.data.users
    pagination.value = response.data.pagination
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Kullanıcılar yüklenirken hata oluştu'
  } finally {
    loading.value = false
  }
}

const fetchRoles = async () => {
  loadingRoles.value = true
  try {
    const response = await roleAPI.getRoles()
    availableRoles.value = response.data.roles
  } catch (err: any) {
    console.error('Roller yüklenirken hata:', err)
  } finally {
    loadingRoles.value = false
  }
}

const handleSearch = () => {
  filters.page = 1
  fetchUsers()
}

const handlePageChange = (page: number) => {
  filters.page = page
  fetchUsers()
}

const handleUserAction = (user: User, action: string) => {
  selectedUser.value = user
  
  switch (action) {
    case 'view':
      showUserModal.value = true
      break
    case 'edit-roles':
      // Rol ID'lerini kullan
      selectedRoles.value = user.roles.map(role => role._id)
      showRoleModal.value = true
      break
    case 'delete':
      showDeleteModal.value = true
      break
  }
}

const handleToggleUserStatus = async (user: User) => {
  try {
    if (user.isActive) {
      await userAPI.deactivateUser(user._id)
    } else {
      await userAPI.activateUser(user._id)
    }
    
    // Kullanıcı listesini güncelle
    await fetchUsers()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'İşlem başarısız'
  }
}

const handleUpdateRoles = async () => {
  if (!selectedUser.value) return
  
  try {
    await userAPI.updateUserRoles(selectedUser.value._id, selectedRoles.value)
    showRoleModal.value = false
    await fetchUsers()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Roller güncellenirken hata oluştu'
  }
}

const handleDeleteUser = async () => {
  if (!selectedUser.value) return
  
  try {
    await userAPI.deleteUser(selectedUser.value._id)
    showDeleteModal.value = false
    await fetchUsers()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Kullanıcı silinirken hata oluştu'
  }
}

// Lifecycle
onMounted(() => {
  fetchUsers()
  fetchRoles()
})
</script>

<template>
  <div class="users-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">Kullanıcı Yönetimi</h1>
        <p class="page-description">Sistem kullanıcılarını görüntüleyin ve yönetin</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-section">
      <div class="filters-container">
        <div class="search-box">
          <div class="relative">
            <MagnifyingGlassIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              v-model="filters.search"
              @keyup.enter="handleSearch"
              type="text"
              placeholder="Kullanıcı ara..."
              class="search-input"
            />
          </div>
        </div>
        
        <select v-model="filters.role" @change="handleSearch" class="role-filter">
          <option value="">Tüm Roller</option>
          <option 
            v-for="role in availableRoles" 
            :key="role._id" 
            :value="role.name"
          >
            {{ role.displayName }}
          </option>
        </select>
        
        <button @click="handleSearch" class="search-btn">
          Ara
        </button>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- Users Table -->
    <div class="users-table-container">
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Kullanıcılar yükleniyor...</p>
      </div>

      <div v-else-if="users.length === 0" class="empty-state">
        <div class="empty-icon">
          <ExclamationTriangleIcon class="w-16 h-16 text-slate-300" />
        </div>
        <h3>Kullanıcı Bulunamadı</h3>
        <p>Arama kriterlerinize uygun kullanıcı bulunamadı.</p>
      </div>

      <div v-else class="users-table">
        <table>
          <thead>
            <tr>
              <th>Kullanıcı</th>
              <th>Email</th>
              <th>Roller</th>
              <th>Durum</th>
              <th>Son Giriş</th>
              <th>Kayıt Tarihi</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user._id">
              <td class="user-cell">
                <div class="user-info">
                  <div class="user-avatar">
                    <span class="avatar-text">{{ userDisplayName(user).charAt(0).toUpperCase() }}</span>
                  </div>
                  <div class="user-details">
                    <span class="user-name">{{ userDisplayName(user) }}</span>
                    <span class="user-username">@{{ user.username }}</span>
                  </div>
                </div>
              </td>
              <td>{{ user.email }}</td>
              <td>
                <div class="roles-container">
                  <span 
                    v-for="role in user.roles" 
                    :key="role._id"
                    class="role-badge"
                    :class="role.name.toLowerCase()"
                  >
                    {{ role.displayName }}
                  </span>
                </div>
              </td>
              <td>
                <span 
                  class="status-badge"
                  :class="user.isActive ? 'active' : 'inactive'"
                >
                  {{ user.isActive ? 'Aktif' : 'Pasif' }}
                </span>
              </td>
              <td>{{ formatDate(user.lastLogin) }}</td>
              <td>{{ formatDate(user.createdAt) }}</td>
              <td>
                <div class="actions">
                  <button 
                    @click="handleUserAction(user, 'view')"
                    class="action-btn view-btn"
                    title="Görüntüle"
                  >
                    <EyeIcon class="w-4 h-4" />
                  </button>
                  
                  <button 
                    v-if="canManageUsers"
                    @click="handleUserAction(user, 'edit-roles')"
                    class="action-btn edit-btn"
                    title="Rolleri Düzenle"
                  >
                    <UserCircleIcon class="w-4 h-4" />
                  </button>
                  
                  <button 
                    v-if="canManageUsers"
                    @click="handleToggleUserStatus(user)"
                    class="action-btn"
                    :class="user.isActive ? 'deactivate-btn' : 'activate-btn'"
                    :title="user.isActive ? 'Deaktif Et' : 'Aktif Et'"
                  >
                    <XMarkIcon v-if="user.isActive" class="w-4 h-4" />
                    <CheckIcon v-else class="w-4 h-4" />
                  </button>
                  
                  <button 
                    v-if="canManageUsers && user._id !== authStore.user?.id"
                    @click="handleUserAction(user, 'delete')"
                    class="action-btn delete-btn"
                    title="Sil"
                  >
                    <TrashIcon class="w-4 h-4" />
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
          Toplam {{ pagination.totalUsers }} kullanıcı
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

    <!-- User Detail Modal -->
    <div v-if="showUserModal && selectedUser" class="modal-overlay" @click="showUserModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">
            <DocumentIcon class="w-6 h-6 text-slate-600" />
            Kullanıcı Detayları
          </h3>
          <button @click="showUserModal = false" class="close-btn">
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>
        <div class="modal-body">
          <div class="user-detail-grid">
            <div class="detail-item">
              <label>Ad Soyad:</label>
              <span>{{ userDisplayName(selectedUser) }}</span>
            </div>
            <div class="detail-item">
              <label>Kullanıcı Adı:</label>
              <span>@{{ selectedUser.username }}</span>
            </div>
            <div class="detail-item">
              <label>Email:</label>
              <span>{{ selectedUser.email }}</span>
            </div>
            <div class="detail-item">
              <label>Durum:</label>
              <span class="status-badge" :class="selectedUser.isActive ? 'active' : 'inactive'">
                {{ selectedUser.isActive ? 'Aktif' : 'Pasif' }}
              </span>
            </div>
            <div class="detail-item">
              <label>Roller:</label>
              <div class="roles-container">
                <span 
                  v-for="role in selectedUser.roles" 
                  :key="role._id"
                  class="role-badge"
                  :class="role.name.toLowerCase()"
                >
                  {{ role.displayName }}
                </span>
              </div>
            </div>
            <div class="detail-item">
              <label>Son Giriş:</label>
              <span>{{ formatDate(selectedUser.lastLogin) }}</span>
            </div>
            <div class="detail-item">
              <label>Kayıt Tarihi:</label>
              <span>{{ formatDate(selectedUser.createdAt) }}</span>
            </div>
            <div class="detail-item">
              <label>Güncelleme Tarihi:</label>
              <span>{{ formatDate(selectedUser.updatedAt) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal && selectedUser" class="modal-overlay" @click="showDeleteModal = false">
      <div class="modal-content delete-modal" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">Kullanıcı Sil</h3>
          <button @click="showDeleteModal = false" class="close-btn">
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>
        <div class="modal-body">
          <p>
            <strong>{{ userDisplayName(selectedUser) }}</strong> kullanıcısını silmek istediğinizden emin misiniz?
          </p>
          <p class="warning-text">Bu işlem geri alınamaz!</p>
        </div>
        <div class="modal-footer">
          <button @click="showDeleteModal = false" class="btn-secondary">
            İptal
          </button>
          <button @click="handleDeleteUser" class="btn-danger">
            Sil
          </button>
        </div>
      </div>
    </div>

    <!-- Role Management Modal -->
    <div v-if="showRoleModal && selectedUser" class="modal-overlay" @click="showRoleModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">Rol Düzenle</h3>
          <button @click="showRoleModal = false" class="close-btn">
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>
        <div class="modal-body">
          <p><strong>{{ userDisplayName(selectedUser) }}</strong> kullanıcısının rollerini düzenleyin:</p>
          
          <div v-if="loadingRoles" class="loading-roles">
            <div class="loading-spinner"></div>
            <p>Roller yükleniyor...</p>
          </div>
          
          <div v-else class="role-selection">
            <label 
              v-for="role in availableRoles" 
              :key="role._id"
              class="role-checkbox"
            >
              <input 
                type="checkbox" 
                :value="role._id"
                v-model="selectedRoles"
              />
              <div class="role-info">
                <span class="role-name">{{ role.displayName }}</span>
                <span class="role-level">Seviye: {{ role.level }}</span>
              </div>
            </label>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showRoleModal = false" class="btn-secondary">
            İptal
          </button>
          <button @click="handleUpdateRoles" class="btn-primary">
            Güncelle
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.users-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

/* Header */
.page-header {
  margin-bottom: 2rem;
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

.role-filter {
  padding: 0.75rem 1rem;
  border: 1px solid #e9ecef;
  border-radius: 0.5rem;
  background: white;
  font-size: 0.875rem;
  min-width: 150px;
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
.users-table-container {
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

.users-table {
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

/* User Cell */
.user-cell {
  min-width: 200px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #000000 0%, #333333 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1rem;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.user-name {
  font-weight: 600;
  color: #2c3e50;
}

.user-username {
  font-size: 0.875rem;
  color: #6c757d;
}

/* Roles */
.roles-container {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.role-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.role-badge.super_admin {
  background: #dc3545;
  color: white;
}

.role-badge.admin {
  background: #fd7e14;
  color: white;
}

.role-badge.user {
  background: #6c757d;
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

.action-btn svg {
  width: 1rem;
  height: 1rem;
}

.view-btn {
  background: #007bff;
  color: white;
}

.view-btn:hover {
  background: #0056b3;
}

.edit-btn {
  background: #ffc107;
  color: #212529;
}

.edit-btn:hover {
  background: #e0a800;
}

.activate-btn {
  background: #28a745;
  color: white;
}

.activate-btn:hover {
  background: #1e7e34;
}

.deactivate-btn {
  background: #6c757d;
  color: white;
}

.deactivate-btn:hover {
  background: #545b62;
}

.delete-btn {
  background: #dc3545;
  color: white;
}

.delete-btn:hover {
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

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.375rem;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background: #f8f9fa;
}

.close-btn svg {
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

/* User Detail Grid */
.user-detail-grid {
  display: grid;
  gap: 1rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f8f9fa;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-item label {
  font-weight: 600;
  color: #2c3e50;
  min-width: 120px;
}

/* Role Selection */
.role-selection {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
}

.loading-roles {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  color: #6c757d;
}

.role-checkbox {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.75rem;
  border-radius: 0.5rem;
  transition: background-color 0.2s;
  border: 1px solid #e9ecef;
}

.role-checkbox:hover {
  background: #f8f9fa;
}

.role-checkbox input[type="checkbox"] {
  width: 1.25rem;
  height: 1.25rem;
  margin: 0;
}

.role-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.role-name {
  font-weight: 600;
  color: #2c3e50;
}

.role-level {
  font-size: 0.875rem;
  color: #6c757d;
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
  .users-page {
    padding: 1rem;
  }
  
  .filters-container {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box {
    order: 1;
  }
  
  .role-filter {
    order: 2;
  }
  
  .search-btn {
    order: 3;
  }
  
  .users-table {
    font-size: 0.875rem;
  }
  
  th, td {
    padding: 0.75rem 0.5rem;
  }
  
  .user-cell {
    min-width: 150px;
  }
  
  .user-avatar {
    width: 2rem;
    height: 2rem;
    font-size: 0.875rem;
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
  
  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .detail-item label {
    min-width: auto;
  }
}
</style> 