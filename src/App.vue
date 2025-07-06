<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";
import { computed, ref } from "vue";
import { 
  HomeIcon,
  Squares2X2Icon,
  TagIcon,
  UsersIcon,
  CheckBadgeIcon,
  ChevronDownIcon,
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/vue/24/outline';

const authStore = useAuthStore();
const router = useRouter();
const showUserMenu = ref(false);

// Kullanıcı görünen adını hesapla
const userDisplayName = computed(() => {
  if (!authStore.user) return "Misafir";
  return authStore.user.firstName && authStore.user.lastName
    ? `${authStore.user.firstName} ${authStore.user.lastName}`
    : authStore.user.username;
});

const handleLogout = () => {
  authStore.logout();
  router.push("/login");
  showUserMenu.value = false;
};

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
};

const closeUserMenu = () => {
  showUserMenu.value = false;
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
    <!-- Navigation Bar -->
    <nav v-if="authStore.isAuthenticated" class="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200/60 shadow-lg shadow-slate-900/5">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16 lg:h-20">
          <!-- Logo ve Marka -->
          <div class="flex-shrink-0">
            <RouterLink to="/" class="group flex items-center space-x-3 hover:scale-105 transition-transform duration-200">
              <div class="text-2xl lg:text-3xl group-hover:scale-110 transition-transform duration-300">🎩</div>
              <h1 class="text-xl lg:text-2xl font-black bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent tracking-tight">
                Papyon AI
              </h1>
            </RouterLink>
          </div>

          <!-- Ana Navigasyon - Desktop -->
          <div class="hidden md:flex items-center space-x-1">
            <RouterLink 
              to="/" 
              class="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-all duration-200 font-medium group"
              active-class="!text-slate-900 !bg-slate-100"
            >
              <HomeIcon class="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              <span>Ana Sayfa</span>
            </RouterLink>
            
            <RouterLink 
              to="/apps" 
              class="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-all duration-200 font-medium group"
              active-class="!text-slate-900 !bg-slate-100"
            >
              <Squares2X2Icon class="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              <span>Uygulamalar</span>
            </RouterLink>
            
            <RouterLink 
              v-if="authStore.isAdmin" 
              to="/app-types" 
              class="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-all duration-200 font-medium group"
              active-class="!text-slate-900 !bg-slate-100"
            >
              <TagIcon class="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              <span>App Tipleri</span>
            </RouterLink>
            
            <RouterLink 
              v-if="authStore.isAdmin" 
              to="/users" 
              class="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-all duration-200 font-medium group"
              active-class="!text-slate-900 !bg-slate-100"
            >
              <UsersIcon class="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              <span>Kullanıcılar</span>
            </RouterLink>
            
            <RouterLink 
              v-if="authStore.isAdmin" 
              to="/roles" 
              class="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-all duration-200 font-medium group"
              active-class="!text-slate-900 !bg-slate-100"
            >
              <CheckBadgeIcon class="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              <span>Roller</span>
            </RouterLink>
          </div>

          <!-- Kullanıcı Menüsü -->
          <div class="relative">
            <button 
              @click="toggleUserMenu" 
              class="flex items-center space-x-3 p-2 rounded-xl hover:bg-slate-100/80 transition-all duration-200 group"
            >
              <!-- User Avatar -->
              <div class="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-white font-bold text-sm lg:text-base shadow-lg group-hover:shadow-xl transition-shadow duration-200">
                {{ userDisplayName.charAt(0).toUpperCase() }}
              </div>
              
              <!-- User Details - Desktop Only -->
              <div class="hidden lg:flex flex-col items-start">
                <span class="text-sm font-semibold text-slate-900 leading-tight">{{ userDisplayName }}</span>
                <span class="text-xs font-medium px-2 py-0.5 rounded-full leading-tight"
                      :class="authStore.isAdmin ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-700'">
                  {{ authStore.isAdmin ? "Admin" : "Kullanıcı" }}
                </span>
              </div>
              
              <!-- Dropdown Arrow -->
              <ChevronDownIcon 
                class="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-all duration-200"
                :class="{ 'rotate-180': showUserMenu }"
              />
            </button>

            <!-- Dropdown Menü -->
            <Transition
              enter-active-class="transition ease-out duration-200"
              enter-from-class="opacity-0 scale-95"
              enter-to-class="opacity-100 scale-100"
              leave-active-class="transition ease-in duration-150"
              leave-from-class="opacity-100 scale-100"
              leave-to-class="opacity-0 scale-95"
            >
              <div v-if="showUserMenu" class="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200/60 overflow-hidden z-50">
                <!-- Backdrop için tıklama alanı -->
                <div @click="closeUserMenu" class="fixed inset-0 z-40"></div>
                
                <div class="relative z-50">
                  <!-- Dropdown Header -->
                  <div class="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-5 border-b border-slate-200/60">
                    <div class="flex items-center space-x-4">
                      <div class="w-14 h-14 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {{ userDisplayName.charAt(0).toUpperCase() }}
                      </div>
                      <div class="flex-1">
                        <h3 class="font-semibold text-slate-900 text-base leading-tight">{{ userDisplayName }}</h3>
                        <p class="text-slate-600 text-sm">{{ authStore.user?.email }}</p>
                        <span class="inline-block mt-1 text-xs font-medium px-2 py-1 rounded-full"
                              :class="authStore.isAdmin ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-700'">
                          {{ authStore.isAdmin ? "Administrator" : "Kullanıcı" }}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Dropdown Menu Items -->
                  <div class="py-2">
                    <button class="w-full flex items-center space-x-3 px-6 py-3 text-left text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors duration-150 group">
                      <UserIcon class="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors duration-150" />
                      <span class="font-medium">Profil Ayarları</span>
                    </button>
                    
                    <button class="w-full flex items-center space-x-3 px-6 py-3 text-left text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors duration-150 group">
                      <Cog6ToothIcon class="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors duration-150" />
                      <span class="font-medium">Genel Ayarlar</span>
                    </button>
                    
                    <div class="border-t border-slate-200 my-2"></div>
                    
                    <button 
                      @click="handleLogout" 
                      class="w-full flex items-center space-x-3 px-6 py-3 text-left text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-150 group"
                    >
                      <ArrowRightOnRectangleIcon class="w-5 h-5 text-red-500 group-hover:text-red-600 transition-colors duration-150" />
                      <span class="font-medium">Güvenli Çıkış</span>
                    </button>
                  </div>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </nav>

    <!-- Ana İçerik -->
    <main :class="authStore.isAuthenticated ? 'pt-6 px-4 sm:px-6 lg:px-8' : ''">
      <div :class="authStore.isAuthenticated ? 'max-w-7xl mx-auto' : ''">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<style scoped>
/* Custom animations for better UX */
.nav-link {
  position: relative;
  overflow: hidden;
}

.nav-link::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: left 0.5s;
}

.nav-link:hover::before {
  left: 100%;
}

/* Smooth transitions for dropdown */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}
</style>
