<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center px-6 py-12">
    <div class="w-full max-w-lg">
      <!-- Logo ve Başlık -->
      <div class="text-center mb-12">
        <div class="flex items-center justify-center space-x-4 mb-6">
          <div class="text-5xl transform hover:scale-110 transition-transform duration-300">🎩</div>
          <h1 class="text-4xl font-black text-gray tracking-tight">Papyon AI</h1>
        </div>
        <p class="text-lg text-gray-600 font-medium ">Yapay Zeka Destekli Platformuna Hoş Geldiniz</p>
      </div>

      <!-- Ana Kart -->
      <div class="bg-white rounded-2xl shadow-2xl border border-gray-100 p-10 mb-8 transform hover:shadow-3xl transition-all duration-300">
        <!-- Tab Sistemi -->
        <div class="flex bg-gray-100 rounded-xl p-2 mb-8">
          <button 
            type="button" 
            :class="[
              'flex-1 py-4 px-6 text-base font-semibold rounded-lg transition-all duration-300',
              mode === 'login' 
                ? 'bg-white text-gray shadow-lg transform scale-105' 
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            ]"
            @click="mode = 'login'"
          >
            Giriş Yap
          </button>
          <button 
            type="button" 
            :class="[
              'flex-1 py-4 px-6 text-base font-semibold rounded-lg transition-all duration-300',
              mode === 'register' 
                ? 'bg-white text-gray shadow-lg transform scale-105' 
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            ]"
            @click="mode = 'register'"
          >
            Kayıt Ol
          </button>
        </div>

        <!-- Hata Mesajı -->
        <div v-if="authStore.error" class="bg-red-50 border-l-4 border-red-400 rounded-lg p-6 mb-8">
          <div class="flex justify-between items-start">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <p class="ml-3 text-red-800 font-medium">{{ authStore.error }}</p>
            </div>
            <button @click="authStore.clearError()" class="text-red-400 hover:text-red-600 transition-colors duration-200">
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-8">
          <!-- Ad Soyad (Sadece kayıt için) -->
          <div v-if="mode === 'register'" class="space-y-3">
            <label for="name" class="block text-base font-semibold text-gray-800">
              Ad Soyad
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                id="name"
                v-model="form.name"
                type="text"
                placeholder="Adınız ve soyadınız"
                required
                class="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl text-gray placeholder-gray-500 
                       focus:outline-none focus:ring-4 focus:ring-gray-900/20 focus:border-gray-900
                       transition-all duration-300 text-lg"
              />
            </div>
          </div>

          <!-- E-posta -->
          <div class="space-y-3">
            <label for="email" class="block text-base font-semibold text-gray-800">
              E-posta
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
              <input
                id="email"
                v-model="form.email"
                type="email"
                placeholder="ornek@papyon.ai"
                required
                class="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl text-gray placeholder-gray-500 
                       focus:outline-none focus:ring-4 focus:ring-gray-900/20 focus:border-gray-900
                       transition-all duration-300 text-lg"
              />
            </div>
          </div>

          <!-- Şifre -->
          <div class="space-y-3">
            <label for="password" class="block text-base font-semibold text-gray-800">
              Şifre
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                id="password"
                v-model="form.password"
                type="password"
                placeholder="••••••••"
                required
                class="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl text-gray placeholder-gray-500 
                       focus:outline-none focus:ring-4 focus:ring-gray-900/20 focus:border-gray-900
                       transition-all duration-300 text-lg"
              />
            </div>
          </div>

          <!-- Submit Button -->
          <button 
            type="submit" 
            :disabled="authStore.isLoading"
            class="w-full flex justify-center items-center py-5 px-6 border border-transparent rounded-xl 
                   text-lg font-bold text-white bg-gradient-to-r from-gray-900 to-gray-800 
                   hover:from-gray-800 hover:to-gray-700 
                   focus:outline-none focus:ring-4 focus:ring-gray-900/30
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-gray-900 disabled:hover:to-gray-800
                   transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
          >
            <span v-if="authStore.isLoading" class="animate-spin mr-3">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ authStore.isLoading ? 'İşlem yapılıyor...' : (mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol') }}
          </button>
        </form>
      </div>

      <!-- Demo Bilgileri -->
      <div class="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 transform hover:shadow-2xl transition-all duration-300">
        <h3 class="text-lg font-bold text-gray text-center mb-6">Demo Hesapları</h3>
        <div class="space-y-4">
          <div class="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 text-center border border-gray-200">
            <p class="text-sm text-gray-700">
              <span class="font-bold text-gray">Admin:</span> 
              <span class="font-mono">admin@papyon.com</span> / 
              <span class="font-mono">Admin123!</span>
            </p>
          </div>
          <div class="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 text-center border border-gray-200">
            <p class="text-sm text-gray-700">
              <span class="font-bold text-gray">Test Kullanıcısı:</span> 
              <span class="font-mono">test@example.com</span> / 
              <span class="font-mono">Test123!</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const mode = ref<'login' | 'register'>('login')

const form = reactive({
  name: '',
  email: '',
  password: ''
})

const handleSubmit = async () => {
  try {
    if (mode.value === 'login') {
      await authStore.login(form.email, form.password)
    } else {
      await authStore.register(form.email, form.password, form.name)
    }
    
    // Başarılı giriş sonrası ana sayfaya yönlendir
    router.push('/')
  } catch {
    // Hata authStore'da handle ediliyor
  }
}

// Form alanlarını temizle
const resetForm = () => {
  form.name = ''
  form.email = ''
  form.password = ''
}

// Tab değiştiğinde formu temizle
const previousMode = ref(mode.value)
const unwatchMode = () => {
  if (mode.value !== previousMode.value) {
    resetForm()
    authStore.clearError()
    previousMode.value = mode.value
  }
}

// Mode değişimini izle
setInterval(unwatchMode, 100)
</script> 