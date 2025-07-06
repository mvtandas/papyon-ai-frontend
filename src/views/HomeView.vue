<template>
  <div class="home-view">
    <div class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">Papyon AI'ya Hoş Geldiniz</h1>
        <p class="hero-subtitle">
          Akıllı uygulama yönetimi platformu ile app'lerinizi oluşturun, yönetin ve paylaşın.
        </p>
        
        <div class="hero-actions">
          <RouterLink to="/apps" class="primary-button">
            <ComputerDesktopIcon class="w-5 h-5" />
            Uygulamalarımı Görüntüle
          </RouterLink>
          
          <RouterLink v-if="authStore.isAdmin" to="/app-types" class="secondary-button">
            <TagIcon class="w-5 h-5" />
            App Tiplerini Yönet
          </RouterLink>
        </div>
      </div>
    </div>

    <div class="features-section">
      <h2 class="section-title">Platform Özellikleri</h2>
      
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">
            <ComputerDesktopIcon class="w-8 h-8 text-slate-600" />
          </div>
          <h3>Uygulama Yönetimi</h3>
          <p>Farklı türlerde uygulamalar oluşturun ve yönetin. Restaurant, e-ticaret, blog ve daha fazlası.</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">
            <UsersIcon class="w-8 h-8 text-slate-600" />
          </div>
          <h3>Takım Çalışması</h3>
          <p>Uygulamalarınızı takım üyeleriyle paylaşın. Farklı roller ve yetkiler tanımlayın.</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">
            <TagIcon class="w-8 h-8 text-slate-600" />
          </div>
          <h3>App Tipleri</h3>
          <p>Özelleştirilebilir app tipleri ile farklı ihtiyaçlara uygun çözümler geliştirin.</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">
            <ShareIcon class="w-8 h-8 text-slate-600" />
          </div>
          <h3>Public Paylaşım</h3>
          <p>Uygulamalarınızı public olarak paylaşın ve diğer kullanıcıların keşfetmesine izin verin.</p>
        </div>
      </div>
    </div>

    <div class="quick-actions">
      <h2 class="section-title">Hızlı İşlemler</h2>
      
      <div class="actions-grid">
        <RouterLink to="/apps" class="action-card">
          <div class="action-icon">
            <PlusIcon class="w-6 h-6 text-blue-600" />
          </div>
          <h3>Yeni App Oluştur</h3>
          <p>Hemen yeni bir uygulama oluşturmaya başlayın</p>
        </RouterLink>
        
        <RouterLink to="/apps" class="action-card">
          <div class="action-icon">
            <ClipboardDocumentIcon class="w-6 h-6 text-emerald-600" />
          </div>
          <h3>App'lerimi Görüntüle</h3>
          <p>Mevcut uygulamalarınızı yönetin</p>
        </RouterLink>
        
        <RouterLink v-if="authStore.isAdmin" to="/app-types" class="action-card">
          <div class="action-icon">
            <TagIcon class="w-6 h-6 text-purple-600" />
          </div>
          <h3>App Tiplerini Yönet</h3>
          <p>App tiplerini düzenleyin ve yeni tipler ekleyin</p>
        </RouterLink>
        
        <RouterLink v-if="authStore.isAdmin" to="/users" class="action-card">
          <div class="action-icon">
            <UsersIcon class="w-6 h-6 text-orange-600" />
          </div>
          <h3>Kullanıcıları Yönet</h3>
          <p>Sistem kullanıcılarını ve rollerini yönetin</p>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { RouterLink } from 'vue-router'
import { 
  ComputerDesktopIcon,
  TagIcon,
  UsersIcon,
  ShareIcon,
  PlusIcon,
  ClipboardDocumentIcon
} from '@heroicons/vue/24/outline'

const authStore = useAuthStore()
</script>

<style scoped>
.home-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.hero-section {
  text-align: center;
  padding: 4rem 2rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 1rem;
  margin-bottom: 3rem;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 1rem 0;
  background: linear-gradient(135deg, #000000 0%, #333333 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: #6c757d;
  margin: 0 0 2rem 0;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.primary-button,
.secondary-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  border-radius: 0.5rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
}

.primary-button {
  background: #000000;
  color: white;
}

.primary-button:hover {
  background: #333333;
  transform: translateY(-2px);
}

.secondary-button {
  background: white;
  color: #000000;
  border: 2px solid #000000;
}

.secondary-button:hover {
  background: #000000;
  color: white;
  transform: translateY(-2px);
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  text-align: center;
  margin: 0 0 2rem 0;
}

.features-section {
  margin-bottom: 3rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 0.75rem;
  border: 1px solid #e9ecef;
  text-align: center;
  transition: all 0.2s;
}

.feature-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.feature-icon {
  width: 4rem;
  height: 4rem;
  background: linear-gradient(135deg, #000000 0%, #333333 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  color: white;
}

.feature-icon svg {
  width: 2rem;
  height: 2rem;
}

.feature-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 1rem 0;
}

.feature-card p {
  color: #6c757d;
  line-height: 1.6;
  margin: 0;
}

.quick-actions {
  margin-bottom: 2rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.action-card {
  background: white;
  padding: 2rem;
  border-radius: 0.75rem;
  border: 1px solid #e9ecef;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s;
  text-align: center;
}

.action-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
  border-color: #000000;
}

.action-icon {
  width: 3rem;
  height: 3rem;
  background: linear-gradient(135deg, #000000 0%, #333333 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  color: white;
}

.action-icon svg {
  width: 1.5rem;
  height: 1.5rem;
}

.action-card h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
}

.action-card p {
  color: #6c757d;
  font-size: 0.875rem;
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-subtitle {
    font-size: 1rem;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .primary-button,
  .secondary-button {
    width: 100%;
    max-width: 300px;
    justify-content: center;
  }
  
  .features-grid,
  .actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
