<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { appAPI, appTypeAPI } from "@/services/api";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";
import {
  EyeIcon,
  PencilIcon,
  UsersIcon,
  TrashIcon,
} from "@heroicons/vue/24/outline";

// Types
interface App {
  _id: string
  name: string
  description: string
  logo?: string
  banner?: string
  isPublic: boolean
  isActive: boolean
  role: 'owner' | 'admin' | 'editor' | 'viewer'
  appType?: string | {
    _id: string
    id?: string
  }
  appTypeName?: string
  location?: {
    address?: string
    city?: string
    country?: string
  }
  contact?: {
    phone?: string
    email?: string
    website?: string
  }
  data?: Record<string, unknown>
}

interface AppType {
  _id: string
  name: string
  displayName: string
  description: string
  features?: Array<{
    name: string
    description: string
    isRequired: boolean
  }>
}

interface Member {
  userId: string
  userName: string
  userEmail: string
  role: 'owner' | 'admin' | 'editor' | 'viewer'
}

interface DataField {
  key: string;
  label: string;
  type: string;
  value: string;
  isRequired: boolean;
}

const authStore = useAuthStore();
const router = useRouter();

// State
const apps = ref<App[]>([]);
const appTypes = ref<AppType[]>([]);
const loading = ref(false);
const error = ref("");
const showCreateModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const showMembersModal = ref(false);
const selectedApp = ref<App | null>(null);
const currentPage = ref(1);
const totalPages = ref(1);
const searchQuery = ref("");
const selectedAppType = ref("");
const viewMode = ref("my"); // 'my' veya 'public'

// Members modal state
const members = ref<Member[]>([]);
const membersLoading = ref(false);
const showAddMemberModal = ref(false);
const newMemberData = ref({
  userId: "",
  role: "viewer" as const,
});

// Data form state
const dataFields = ref<DataField[]>([]);
const showDataEditor = ref(false);

// Form data
const formData = ref({
  name: "",
  description: "",
  appType: "",
  isPublic: false,
  data: {} as Record<string, unknown>,
  logo: "",
  banner: "",
  location: {
    address: "",
    city: "",
    country: "",
  },
  contact: {
    phone: "",
    email: "",
    website: "",
  },
});

// Computed
const canCreateApps = computed(() => {
  return authStore.isAuthenticated;
});

const getAppDataPreview = computed(() => {
  return (app: App) => {
    if (!app.data || Object.keys(app.data).length === 0) {
      return "Veri yok";
    }

    const dataKeys = Object.keys(app.data);
    const previewItems = dataKeys.slice(0, 2).map((key) => {
      const value = app.data![key];
      return `${key}: ${typeof value === "string" ? value.substring(0, 20) : JSON.stringify(value).substring(0, 20)}${typeof value === "string" && value.length > 20 ? "..." : ""}`;
    });

    if (dataKeys.length > 2) {
      previewItems.push(`+${dataKeys.length - 2} daha`);
    }

    return previewItems.join(", ");
  };
});

// Methods
const loadApps = async () => {
  loading.value = true;
  error.value = "";

  try {
    const params = {
      page: currentPage.value,
      limit: 10,
      search: searchQuery.value || undefined,
      appType: selectedAppType.value || undefined,
    };

    const response =
      viewMode.value === "my"
        ? await appAPI.getMyApps(params)
        : await appAPI.getPublicApps(params);

    apps.value = response.data;
    totalPages.value = response.totalPages;
  } catch (err) {
    error.value = "App'ler yüklenirken hata oluştu";
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const loadAppTypes = async () => {
  try {
    const response = await appTypeAPI.getAppTypes();
    appTypes.value = response.data;
  } catch (err) {
    console.error("App tipleri yüklenemedi:", err);
  }
};

const handleAppTypeChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  if (target) {
    formData.value.appType = target.value;
    const selectedType = appTypes.value.find(type => type._id === target.value);
    if (selectedType) {
      dataFields.value = selectedType.features?.map(feature => ({
        key: feature.name,
        label: feature.description,
        type: "text",
        value: '',
        isRequired: feature.isRequired
      })) || [];
    }
  }
};

const handleDataFieldChange = (key: string, event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target) {
    formData.value.data[key] = target.value;
  }
};

const closeDataEditor = () => {
  showDataEditor.value = false;
};

const saveDataChanges = () => {
  // Data alanındaki değişiklikleri formData'ya kaydet
  dataFields.value.forEach((field) => {
    formData.value.data[field.key] = field.value;
  });
  closeDataEditor();
};

const handleCreate = () => {
  // Form verilerini sıfırla
  formData.value = {
    name: "",
    description: "",
    appType: "",
    isPublic: false,
    data: {},
    logo: "",
    banner: "",
    location: { address: "", city: "", country: "" },
    contact: { phone: "", email: "", website: "" },
  };

  // Data alanlarını temizle
  dataFields.value = [];

  // Hata mesajını temizle
  error.value = "";

  // Modal'ı aç
  showCreateModal.value = true;
};

const handleEdit = (app: App) => {
  console.log('Editing app:', app);
  console.log('App type from app object:', app.appType);
  
  selectedApp.value = app;
  
  // appType obje mi yoksa string mi kontrol et
  const appTypeId = typeof app.appType === 'object' && app.appType !== null 
    ? app.appType._id || app.appType.id 
    : app.appType || '';
  
  formData.value = {
    name: app.name,
    description: app.description,
    appType: appTypeId || "",
    isPublic: app.isPublic,
    data: { ...app.data },
    logo: app.logo || "",
    banner: app.banner || "",
    location: { 
      address: app.location?.address || "", 
      city: app.location?.city || "", 
      country: app.location?.country || "" 
    },
    contact: { 
      phone: app.contact?.phone || "", 
      email: app.contact?.email || "", 
      website: app.contact?.website || "" 
    },
  };

  console.log('Form data appType:', formData.value.appType);

  // App tipine göre data alanlarını yükle
  if (appTypeId) {
    const selectedType = appTypes.value.find(
      (type) => type._id === appTypeId
    );
    console.log('Found selected type:', selectedType);
    if (selectedType && selectedType.features) {
      dataFields.value = selectedType.features.map((feature) => ({
        key: feature.name,
        label: feature.description,
        type: "text",
        value: (app.data?.[feature.name] as string) || "",
        isRequired: feature.isRequired,
      }));
    }
  }

  showEditModal.value = true;
};

const handleDelete = (app: App) => {
  selectedApp.value = app;
  showDeleteModal.value = true;
};

const handleMembers = (app: App) => {
  selectedApp.value = app;
  showMembersModal.value = true;
  loadMembers();
};

const loadMembers = async () => {
  if (!selectedApp.value) return;

  membersLoading.value = true;
  try {
    const response = await appAPI.getAppMembers(selectedApp.value._id);
    members.value = response.data;
  } catch (err) {
    error.value = "Üyeler yüklenirken hata oluştu";
    console.error(err);
  } finally {
    membersLoading.value = false;
  }
};

const handleAddMember = () => {
  newMemberData.value = {
    userId: "",
    role: "viewer" as const,
  };
  showAddMemberModal.value = true;
};

const submitAddMember = async () => {
  if (!selectedApp.value) return;
  
  try {
    await appAPI.addMember(selectedApp.value._id, newMemberData.value);
    showAddMemberModal.value = false;
    await loadMembers();
  } catch (err) {
    error.value = "Üye eklenirken hata oluştu";
    console.error(err);
  }
};

const handleRemoveMember = async (userId: string) => {
  if (!confirm("Bu üyeyi çıkarmak istediğinizden emin misiniz?")) return;
  if (!selectedApp.value) return;

  try {
    await appAPI.removeMember(selectedApp.value._id, userId);
    await loadMembers();
  } catch (err) {
    error.value = "Üye çıkarılırken hata oluştu";
    console.error(err);
  }
};

const handleUpdateMemberRole = async (userId: string, event: Event) => {
  if (!selectedApp.value) return;
  
  const target = event.target as HTMLSelectElement;
  if (!target) return;
  
  const newRole = target.value as 'owner' | 'admin' | 'editor' | 'viewer';
  
  try {
    await appAPI.updateMemberRole(selectedApp.value._id, userId, newRole);
    await loadMembers();
  } catch (err) {
    error.value = "Üye rolü güncellenirken hata oluştu";
    console.error(err);
  }
};

const handleLeaveApp = async () => {
  if (!confirm("Bu app'den ayrılmak istediğinizden emin misiniz?")) return;
  if (!selectedApp.value) return;

  try {
    await appAPI.leaveApp(selectedApp.value._id);
    showMembersModal.value = false;
    await loadApps();
  } catch (err) {
    error.value = "App'den ayrılırken hata oluştu";
    console.error(err);
  }
};

const submitCreate = async () => {
  try {
    // Form validasyonu
    if (!formData.value.name.trim()) {
      error.value = "App adı gereklidir";
      return;
    }

    if (!formData.value.appType) {
      error.value = "App tipi seçilmelidir";
      return;
    }

    // App oluştururken tüm gerekli alanları gönder
    const createData = {
      name: formData.value.name,
      description: formData.value.description,
      appType: formData.value.appType,
      isPublic: formData.value.isPublic,
      data: {},
      logo: formData.value.logo,
      banner: formData.value.banner,
      location: formData.value.location,
      contact: formData.value.contact,
    };

    await appAPI.createApp(createData);
    showCreateModal.value = false;
    await loadApps();
  } catch (err) {
    error.value = "App oluşturulurken hata oluştu";
    console.error(err);
  }
};

const submitEdit = async () => {
  if (!selectedApp.value) return;
  
  try {
    await appAPI.updateApp(selectedApp.value._id, formData.value);
    showEditModal.value = false;
    await loadApps();
  } catch (err) {
    error.value = "App güncellenirken hata oluştu";
    console.error(err);
  }
};

const submitDelete = async () => {
  if (!selectedApp.value) return;
  
  try {
    await appAPI.deleteApp(selectedApp.value._id);
    showDeleteModal.value = false;
    await loadApps();
  } catch (err) {
    error.value = "App silinirken hata oluştu";
    console.error(err);
  }
};

const handleSearch = () => {
  currentPage.value = 1;
  loadApps();
};

const changePage = (page: number) => {
  currentPage.value = page;
  loadApps();
};

const switchViewMode = (mode: string) => {
  viewMode.value = mode;
  currentPage.value = 1;
  loadApps();
};

const handleViewDetails = (app: App) => {
  router.push(`/apps/${app._id}`);
};

// Lifecycle
onMounted(() => {
  loadApps();
  loadAppTypes();
});
</script>

<template>
  <div class="apps-view">
    <div class="header">
      <div class="header-content">
        <h1 class="title">Uygulamalar</h1>
        <p class="subtitle">App'lerinizi yönetin ve keşfedin</p>
      </div>

      <div class="header-actions">
        <div class="view-tabs">
          <button
            @click="switchViewMode('my')"
            :class="{ active: viewMode === 'my' }"
            class="tab-button"
          >
            Benim App'lerim
          </button>
          <button
            @click="switchViewMode('public')"
            :class="{ active: viewMode === 'public' }"
            class="tab-button"
          >
            Public App'ler
          </button>
        </div>

        <div class="search-filters">
          <div class="search-box">
            <input
              v-model="searchQuery"
              @keyup.enter="handleSearch"
              type="text"
              placeholder="App ara..."
              class="search-input"
            />
            <button @click="handleSearch" class="search-button">
              <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>

          <select
            v-model="selectedAppType"
            @change="handleSearch"
            class="filter-select"
          >
            <option value="">Tüm Tipler</option>
            <option
              v-for="appType in appTypes"
              :key="appType._id"
              :value="appType._id"
            >
              {{ appType.displayName }}
            </option>
          </select>
        </div>

        <button
          v-if="canCreateApps && viewMode === 'my'"
          @click="handleCreate"
          class="create-button"
        >
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Yeni App
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
      <p>App'ler yükleniyor...</p>
    </div>

    <!-- Apps List -->
    <div v-else class="apps-grid">
      <div v-for="app in apps" :key="app._id" class="app-card">
        <div class="card-header">
          <div class="app-logo">
            <img v-if="app.logo" :src="app.logo" :alt="app.name" />
            <div v-else class="app-logo-placeholder">
              {{ app.name.charAt(0).toUpperCase() }}
            </div>
          </div>
          <div class="app-info">
            <h3 class="app-name">{{ app.name }}</h3>
            <p class="app-description">{{ app.description }}</p>
            <div class="app-meta">
              <span class="app-type">{{ app.appTypeName }}</span>
              <span
                class="app-visibility"
                :class="app.isPublic ? 'public' : 'private'"
              >
                {{ app.isPublic ? "Public" : "Private" }}
              </span>
            </div>
          </div>
          <div class="card-actions">
            <button
              class="view-btn"
              @click="handleViewDetails(app)"
              title="Detayları Görüntüle"
            >
              <EyeIcon class="w-4 h-4" />
            </button>
            <button class="edit-btn" @click="handleEdit(app)" title="Düzenle">
              <PencilIcon class="w-4 h-4" />
            </button>
            <button
              class="members-btn"
              @click="handleMembers(app)"
              title="Üyeleri Yönet"
            >
              <UsersIcon class="w-4 h-4" />
            </button>
            <button class="delete-btn" @click="handleDelete(app)" title="Sil">
              <TrashIcon class="w-4 h-4" />
            </button>
          </div>
        </div>

        <div class="card-content">
          <div class="app-details">
            <div v-if="app.location?.address" class="detail-item">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>{{ app.location.address }}</span>
            </div>

            <div v-if="app.contact?.phone" class="detail-item">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              <span>{{ app.contact.phone }}</span>
            </div>

            <div class="detail-item data-preview">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span>{{ getAppDataPreview(app) }}</span>
            </div>
          </div>

          <div class="app-role">
            <span class="role-badge" :class="app.role">
              {{
                app.role === "owner"
                  ? "Sahip"
                  : app.role === "admin"
                    ? "Admin"
                    : app.role === "editor"
                      ? "Editör"
                      : "Görüntüleyici"
              }}
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

    <!-- Create/Edit Modal -->
    <div
      v-if="showCreateModal || showEditModal"
      class="modal-overlay"
      @click="
        showCreateModal = false;
        showEditModal = false;
      "
    >
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2>{{ showCreateModal ? "Yeni App Oluştur" : "App Düzenle" }}</h2>
          <button
            @click="
              showCreateModal = false;
              showEditModal = false;
            "
            class="close-button"
          >
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div class="modal-content">
          <div class="form-group">
            <label>App Adı: <span class="required">*</span></label>
            <input
              v-model="formData.name"
              type="text"
              placeholder="App adı"
              required
            />
          </div>

          <div class="form-group">
            <label>Açıklama:</label>
            <textarea
              v-model="formData.description"
              placeholder="App açıklaması"
            ></textarea>
          </div>

          <div class="form-group">
            <label>App Tipi: <span class="required">*</span></label>
            <select
              v-model="formData.appType"
              @change="handleAppTypeChange"
              required
            >
              <option value="">App tipi seçin</option>
              <option
                v-for="appType in appTypes"
                :key="appType._id"
                :value="appType._id"
              >
                {{ appType.displayName }}
              </option>
            </select>
            <small
              v-if="formData.appType"
              style="color: green; margin-top: 0.25rem"
            >
              Seçilen tip: {{ appTypes.find(type => type._id === formData.appType)?.displayName || formData.appType }}
            </small>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input v-model="formData.isPublic" type="checkbox" />
              <span>Public App</span>
            </label>
          </div>

          <div class="form-group">
            <label>Logo URL:</label>
            <input
              v-model="formData.logo"
              type="url"
              placeholder="https://example.com/logo.png"
            />
          </div>

          <div class="form-group">
            <label>Banner URL:</label>
            <input
              v-model="formData.banner"
              type="url"
              placeholder="https://example.com/banner.png"
            />
          </div>

          <div class="form-section">
            <h3>Konum Bilgileri</h3>
            <div class="form-row">
              <div class="form-group">
                <label>Adres:</label>
                <input
                  v-model="formData.location.address"
                  type="text"
                  placeholder="Adres"
                />
              </div>
              <div class="form-group">
                <label>Şehir:</label>
                <input
                  v-model="formData.location.city"
                  type="text"
                  placeholder="Şehir"
                />
              </div>
            </div>
            <div class="form-group">
              <label>Ülke:</label>
              <input
                v-model="formData.location.country"
                type="text"
                placeholder="Ülke"
              />
            </div>
          </div>

          <div class="form-section">
            <h3>İletişim Bilgileri</h3>
            <div class="form-row">
              <div class="form-group">
                <label>Telefon:</label>
                <input
                  v-model="formData.contact.phone"
                  type="tel"
                  placeholder="+90 212 123 45 67"
                />
              </div>
              <div class="form-group">
                <label>E-posta:</label>
                <input
                  v-model="formData.contact.email"
                  type="email"
                  placeholder="info@app.com"
                />
              </div>
            </div>
            <div class="form-group">
              <label>Website:</label>
              <input
                v-model="formData.contact.website"
                type="url"
                placeholder="https://app.com"
              />
            </div>
          </div>

        </div>

        <div class="modal-footer">
          <button
            @click="
              showCreateModal = false;
              showEditModal = false;
            "
            class="cancel-button"
          >
            İptal
          </button>
          <button
            @click="showCreateModal ? submitCreate() : submitEdit()"
            class="submit-button"
          >
            {{ showCreateModal ? "Oluştur" : "Güncelle" }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Modal -->
    <div
      v-if="showDeleteModal"
      class="modal-overlay"
      @click="showDeleteModal = false"
    >
      <div class="modal delete-modal" @click.stop>
        <div class="modal-header">
          <h2>App Sil</h2>
          <button @click="showDeleteModal = false" class="close-button">
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div class="modal-content">
          <p>
            <strong>{{ selectedApp?.name }}</strong> app'ini silmek
            istediğinizden emin misiniz?
          </p>
          <p class="warning-text">
            Bu işlem geri alınamaz. App ve tüm verileri kalıcı olarak
            silinecektir.
          </p>
        </div>

        <div class="modal-footer">
          <button @click="showDeleteModal = false" class="cancel-button">
            İptal
          </button>
          <button @click="submitDelete" class="delete-button">Sil</button>
        </div>
      </div>
    </div>

    <!-- Members Modal -->
    <div
      v-if="showMembersModal"
      class="modal-overlay"
      @click="showMembersModal = false"
    >
      <div class="modal members-modal" @click.stop>
        <div class="modal-header">
          <h2>{{ selectedApp?.name }} - Üyeler</h2>
          <button @click="showMembersModal = false" class="close-button">
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div class="modal-content">
          <div class="members-header">
            <button @click="handleAddMember" class="add-member-button">
              <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Üye Ekle
            </button>

            <button
              v-if="
                selectedApp?.role !== 'owner' &&
                !authStore.user?.roles?.some(
                  (role) => role.name === 'SUPER_ADMIN'
                )
              "
              @click="handleLeaveApp"
              class="leave-app-button"
            >
              <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              App'den Ayrıl
            </button>
          </div>

          <div v-if="membersLoading" class="members-loading">
            <div class="spinner"></div>
            <p>Üyeler yükleniyor...</p>
          </div>

          <div v-else class="members-list">
            <div
              v-for="member in members"
              :key="member.userId"
              class="member-item"
            >
              <div class="member-info">
                <div class="member-avatar">
                  <span>{{
                    member.userName?.charAt(0).toUpperCase() || "U"
                  }}</span>
                </div>
                <div class="member-details">
                  <h4>{{ member.userName || "Bilinmeyen Kullanıcı" }}</h4>
                  <p>{{ member.userEmail }}</p>
                </div>
              </div>

              <div class="member-actions">
                <select
                  v-if="
                    (selectedApp?.role === 'owner' ||
                      authStore.user?.roles?.some(
                        (role) => role.name === 'SUPER_ADMIN'
                      )) &&
                    member.role !== 'owner'
                  "
                  :value="member.role"
                  @change="handleUpdateMemberRole(member.userId, $event)"
                  class="role-select"
                >
                  <option value="admin">Admin</option>
                  <option value="editor">Editör</option>
                  <option value="viewer">Görüntüleyici</option>
                </select>

                <span v-else class="role-badge" :class="member.role">
                  {{
                    member.role === "owner"
                      ? "Sahip"
                      : member.role === "admin"
                        ? "Admin"
                        : member.role === "editor"
                          ? "Editör"
                          : "Görüntüleyici"
                  }}
                </span>

                <button
                  v-if="
                    (selectedApp?.role === 'owner' ||
                      authStore.user?.roles?.some(
                        (role) => role.name === 'SUPER_ADMIN'
                      )) &&
                    member.role !== 'owner'
                  "
                  @click="handleRemoveMember(member.userId)"
                  class="remove-member-button"
                  title="Üyeyi Çıkar"
                >
                  <svg
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Member Modal -->
    <div
      v-if="showAddMemberModal"
      class="modal-overlay"
      @click="showAddMemberModal = false"
    >
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2>Üye Ekle</h2>
          <button @click="showAddMemberModal = false" class="close-button">
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div class="modal-content">
          <div class="form-group">
            <label>Kullanıcı ID:</label>
            <input
              v-model="newMemberData.userId"
              type="text"
              placeholder="Kullanıcı ID'si"
            />
          </div>

          <div class="form-group">
            <label>Rol:</label>
            <select v-model="newMemberData.role">
              <option value="admin">Admin</option>
              <option value="editor">Editör</option>
              <option value="viewer">Görüntüleyici</option>
            </select>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="showAddMemberModal = false" class="cancel-button">
            İptal
          </button>
          <button @click="submitAddMember" class="submit-button">Ekle</button>
        </div>
      </div>
    </div>

    <!-- Data Editor Modal -->
    <div v-if="showDataEditor" class="modal-overlay" @click="closeDataEditor">
      <div class="modal data-editor-modal" @click.stop>
        <div class="modal-header">
          <h2>App Veri Alanlarını Düzenle</h2>
          <button @click="closeDataEditor" class="close-button">
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div class="modal-content">
          <div class="data-editor-info">
            <p>App tipine göre tanımlanan veri alanlarını düzenleyin:</p>
          </div>

          <div class="data-fields">
            <div
              v-for="field in dataFields"
              :key="field.key"
              class="data-field"
            >
              <label :for="field.key">
                {{ field.label }}
                <span v-if="field.isRequired" class="required">*</span>
              </label>
              <input
                :id="field.key"
                v-model="field.value"
                :type="field.type"
                :placeholder="field.label"
                :required="field.isRequired"
                @input="handleDataFieldChange(field.key, $event)"
              />
            </div>
          </div>

          <div v-if="dataFields.length === 0" class="no-data-fields">
            <p>Bu app tipi için henüz veri alanı tanımlanmamış.</p>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closeDataEditor" class="cancel-button">İptal</button>
          <button @click="saveDataChanges" class="submit-button">Kaydet</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.apps-view {
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
  flex-direction: column;
  gap: 1rem;
  align-items: flex-end;
}

.view-tabs {
  display: flex;
  background: #f8f9fa;
  border-radius: 0.5rem;
  padding: 0.25rem;
}

.tab-button {
  background: none;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  color: #6c757d;
}

.tab-button.active {
  background: #000000;
  color: white;
}

.search-filters {
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

.filter-select {
  padding: 0.75rem 1rem;
  border: 1px solid #e9ecef;
  border-radius: 0.5rem;
  background: white;
  font-size: 0.875rem;
  outline: none;
  cursor: pointer;
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
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.apps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.app-card {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 0.75rem;
  overflow: hidden;
  transition: all 0.2s;
}

.app-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
}

.app-logo {
  width: 3rem;
  height: 3rem;
  border-radius: 0.5rem;
  overflow: hidden;
  flex-shrink: 0;
}

.app-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.app-logo-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #000000 0%, #333333 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1.25rem;
}

.app-info {
  flex: 1;
}

.app-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.25rem 0;
}

.app-description {
  color: #6c757d;
  font-size: 0.875rem;
  margin: 0 0 0.5rem 0;
}

.app-meta {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.app-type {
  background: #f8f9fa;
  color: #6c757d;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.app-visibility {
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.app-visibility.public {
  background: #d4edda;
  color: #155724;
}

.app-visibility.private {
  background: #f8d7da;
  color: #721c24;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
}

.card-content {
  padding: 1.5rem;
}

.app-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6c757d;
  font-size: 0.875rem;
}

.detail-item svg {
  width: 1rem;
  height: 1rem;
}

.detail-item.data-preview {
  background: #f8f9fa;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
}

.detail-item.data-preview span {
  color: #495057;
  font-weight: 500;
}

.app-role {
  display: flex;
  justify-content: flex-end;
}

.role-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.role-badge.owner {
  background: #000000;
  color: white;
}

.role-badge.admin {
  background: #dc3545;
  color: white;
}

.role-badge.editor {
  background: #007bff;
  color: white;
}

.role-badge.viewer {
  background: #6c757d;
  color: white;
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
  max-width: 600px;
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
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e9ecef;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #000000;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: auto;
  margin: 0;
}

.form-section {
  margin-bottom: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.form-section h3 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
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

/* Members Modal Styles */
.members-modal {
  max-width: 700px;
}

.members-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.add-member-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #28a745;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.add-member-button:hover {
  background: #218838;
}

.leave-app-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #dc3545;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.leave-app-button:hover {
  background: #c82333;
}

.members-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #6c757d;
}

.members-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.member-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid #e9ecef;
  border-radius: 0.5rem;
  background: #f8f9fa;
}

.member-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.member-avatar {
  width: 2.5rem;
  height: 2.5rem;
  background: linear-gradient(135deg, #000000 0%, #333333 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1rem;
}

.member-details h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
}

.member-details p {
  margin: 0;
  font-size: 0.875rem;
  color: #6c757d;
}

.member-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.role-select {
  padding: 0.5rem;
  border: 1px solid #e9ecef;
  border-radius: 0.25rem;
  background: white;
  font-size: 0.875rem;
  outline: none;
  cursor: pointer;
}

.role-select:focus {
  border-color: #000000;
}

.remove-member-button {
  background: #dc3545;
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: background 0.2s;
}

.remove-member-button:hover {
  background: #c82333;
}

.remove-member-button svg {
  width: 1rem;
  height: 1rem;
}

/* Data Editor Styles */
.data-section {
  margin-top: 1rem;
}

.data-preview {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 0.5rem;
}

.data-info {
  color: #6c757d;
  font-size: 0.875rem;
  margin: 0;
}

.data-edit-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #007bff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 0.875rem;
}

.data-edit-button:hover {
  background: #0056b3;
}

.data-editor-modal {
  max-width: 600px;
}

.data-editor-info {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 0.5rem;
  border-left: 4px solid #007bff;
}

.data-editor-info p {
  margin: 0;
  color: #495057;
  font-size: 0.875rem;
}

.data-fields {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.data-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.data-field label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.875rem;
}

.data-field input {
  padding: 0.75rem;
  border: 1px solid #e9ecef;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.data-field input:focus {
  outline: none;
  border-color: #007bff;
}

.no-data-fields {
  text-align: center;
  padding: 2rem;
  color: #6c757d;
}

.no-data-fields p {
  margin: 0;
  font-style: italic;
}

/* Responsive */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions {
    align-items: stretch;
  }

  .search-filters {
    flex-direction: column;
  }

  .search-input {
    min-width: auto;
  }

  .apps-grid {
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

  .form-row {
    grid-template-columns: 1fr;
  }

  .members-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .member-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .member-actions {
    align-self: stretch;
    justify-content: space-between;
  }
}

.required {
  color: #dc3545;
  font-weight: 700;
}
</style>
