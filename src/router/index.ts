import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true }
    },
    {
      path: '/users',
      name: 'users',
      component: () => import('../views/UsersView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/roles',
      name: 'roles',
      component: () => import('../views/RolesView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/app-types',
      name: 'app-types',
      component: () => import('../views/AppTypesView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/apps',
      name: 'apps',
      component: () => import('../views/AppsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/apps/:id',
      name: 'app-detail',
      component: () => import('../views/AppDetailView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiresGuest: true }
    }
  ]
})

// Route guard'ları
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Auth durumunu restore et (token varsa ama user yoksa)
  if (authStore.token && !authStore.user) {
    try {
      await authStore.restoreAuth()
    } catch {
      // Token geçersiz, login'e yönlendir
      authStore.logout()
      if (to.path !== '/login') {
        next('/login')
        return
      }
    }
  }

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest)
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin)

  if (requiresAuth && !authStore.isAuthenticated) {
    // Giriş gerekli ama kullanıcı giriş yapmamış
    next('/login')
  } else if (requiresGuest && authStore.isAuthenticated) {
    // Misafir sayfası ama kullanıcı zaten giriş yapmış
    next('/')
  } else if (requiresAdmin && !authStore.isAdmin) {
    // Admin yetkisi gerekli ama kullanıcının yetkisi yok
    next('/')
  } else {
    next()
  }
})

export default router
