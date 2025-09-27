<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md">
      <!-- Logo and Brand -->
      <div class="text-center mb-8">
        <div class="flex items-center justify-center space-x-3 mb-4">
          <!-- Papyon Logo -->
          <div class="w-12 h-12 bg-primary-black rounded-lg flex items-center justify-center transform hover:scale-110 transition-transform duration-300">
            <span class="text-primary-white font-bold text-xl">P</span>
          </div>
          <h1 class="text-3xl font-bold text-primary-black">Papyon AI</h1>
        </div>
        <p class="text-gray-600">Yapay Zeka Destekli Platformuna Hoş Geldiniz</p>
      </div>

      <!-- Main Card -->
      <PapyonCard variant="elevated" padding="lg" class="mb-6">
        <!-- Tab System -->
        <div class="flex bg-gray-100 rounded-lg p-1 mb-6">
          <PapyonButton
            :variant="mode === 'login' ? 'primary' : 'ghost'"
            size="md"
            class="flex-1"
            @click="switchMode('login')"
          >
            Giriş Yap
          </PapyonButton>
          <PapyonButton
            :variant="mode === 'register' ? 'primary' : 'ghost'"
            size="md"
            class="flex-1"
            @click="switchMode('register')"
          >
            Kayıt Ol
          </PapyonButton>
        </div>

        <!-- Error Message -->
        <div v-if="authStore.error" class="mb-6">
          <PapyonCard variant="outlined" padding="md" class="border-accent-red bg-red-50">
            <div class="flex items-start justify-between">
              <div class="flex items-center">
                <ExclamationTriangleIcon class="h-5 w-5 text-accent-red flex-shrink-0" />
                <p class="ml-3 text-sm text-red-800">{{ authStore.error }}</p>
              </div>
              <PapyonButton
                variant="ghost"
                size="sm"
                @click="authStore.clearError()"
                class="text-accent-red hover:text-red-700 -mt-1 -mr-1"
              >
                <XMarkIcon class="h-4 w-4" />
              </PapyonButton>
            </div>
          </PapyonCard>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Name Field (Register only) -->
          <PapyonInput
            v-if="mode === 'register'"
            v-model="form.name"
            label="Ad Soyad"
            type="text"
            placeholder="Adınız ve soyadınız"
            :icon="UserIcon"
            icon-position="left"
            required
          />

          <!-- Email Field -->
          <PapyonInput
            v-model="form.email"
            label="E-posta"
            type="email"
            placeholder="ornek@papyon.ai"
            :icon="EnvelopeIcon"
            icon-position="left"
            required
          />

          <!-- Password Field -->
          <PapyonInput
            v-model="form.password"
            label="Şifre"
            type="password"
            placeholder="••••••••"
            :icon="LockClosedIcon"
            icon-position="left"
            required
          />

          <!-- Submit Button -->
          <PapyonButton
            type="submit"
            variant="primary"
            size="lg"
            :loading="authStore.isLoading"
            :disabled="authStore.isLoading"
            class="w-full"
          >
            {{ mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol' }}
          </PapyonButton>
        </form>
      </PapyonCard>

      <!-- Demo Accounts -->
      <PapyonCard variant="elevated" padding="md">
        <h3 class="text-lg font-semibold text-center mb-4">Demo Hesapları</h3>
        <div class="space-y-3">
          <div class="bg-gray-50 rounded-lg p-3 text-center">
            <p class="text-sm text-gray-700">
              <span class="font-semibold">Admin:</span> 
              <span class="font-mono text-xs">admin@papyon.com</span> / 
              <span class="font-mono text-xs">Admin123!</span>
            </p>
          </div>
          <div class="bg-gray-50 rounded-lg p-3 text-center">
            <p class="text-sm text-gray-700">
              <span class="font-semibold">Test Kullanıcısı:</span> 
              <span class="font-mono text-xs">test@example.com</span> / 
              <span class="font-mono text-xs">Test123!</span>
            </p>
          </div>
        </div>
      </PapyonCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { 
  UserIcon, 
  EnvelopeIcon, 
  LockClosedIcon, 
  ExclamationTriangleIcon, 
  XMarkIcon 
} from '@heroicons/vue/24/outline'
import PapyonButton from '@/components/PapyonButton.vue'
import PapyonInput from '@/components/PapyonInput.vue'
import PapyonCard from '@/components/PapyonCard.vue'

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

// Mode değiştirme fonksiyonu
const switchMode = (newMode: 'login' | 'register') => {
  mode.value = newMode
  resetForm()
  authStore.clearError()
}

// Mode değişimini izle
watch(mode, () => {
  resetForm()
  authStore.clearError()
})
</script> 