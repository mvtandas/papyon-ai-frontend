<template>
  <nav class="papyon-navigation bg-primary-white border-b border-gray-200 fixed top-0 left-0 right-0 z-40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <!-- Left side: Logo and main navigation -->
        <div class="flex">
          <!-- Logo -->
          <div class="flex-shrink-0 flex items-center">
            <router-link to="/" class="flex items-center space-x-2 focus-ring rounded-md p-1">
              <!-- Papyon Logo/Icon -->
              <div class="w-8 h-8 bg-primary-black rounded-md flex items-center justify-center">
                <span class="text-primary-white font-bold text-sm">P</span>
              </div>
              <span class="text-xl font-bold text-primary-black">Papyon AI</span>
            </router-link>
          </div>

          <!-- Desktop Navigation -->
          <div class="hidden md:ml-6 md:flex md:space-x-8">
            <template v-for="item in navigationItems" :key="item.path">
              <!-- Main navigation item -->
              <router-link
                v-if="!item.children"
                :to="item.path"
                :class="navigationItemClasses(item.path)"
                class="inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors duration-200"
              >
                <component v-if="item.icon" :is="item.icon" class="w-4 h-4 mr-2" />
                {{ item.label }}
                <span v-if="item.badge" :class="badgeClasses">{{ item.badge }}</span>
              </router-link>

              <!-- Dropdown navigation item -->
              <div v-else class="relative" @mouseenter="showDropdown(item.path)" @mouseleave="hideDropdown(item.path)">
                <button
                  :class="navigationItemClasses(item.path)"
                  class="inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors duration-200 focus-ring rounded-md"
                  :aria-expanded="dropdownStates[item.path]"
                >
                  <component v-if="item.icon" :is="item.icon" class="w-4 h-4 mr-2" />
                  {{ item.label }}
                  <ChevronDownIcon class="w-4 h-4 ml-1" />
                  <span v-if="item.badge" :class="badgeClasses">{{ item.badge }}</span>
                </button>

                <!-- Dropdown menu -->
                <Transition
                  enter-active-class="transition ease-out duration-200"
                  enter-from-class="opacity-0 translate-y-1"
                  enter-to-class="opacity-100 translate-y-0"
                  leave-active-class="transition ease-in duration-150"
                  leave-from-class="opacity-100 translate-y-0"
                  leave-to-class="opacity-0 translate-y-1"
                >
                  <div
                    v-if="dropdownStates[item.path]"
                    class="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-primary-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                  >
                    <div class="py-1">
                      <router-link
                        v-for="child in item.children"
                        :key="child.path"
                        :to="child.path"
                        class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
                      >
                        <component v-if="child.icon" :is="child.icon" class="w-4 h-4 mr-3" />
                        {{ child.label }}
                        <span v-if="child.badge" class="ml-auto bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded-full">
                          {{ child.badge }}
                        </span>
                      </router-link>
                    </div>
                  </div>
                </Transition>
              </div>
            </template>
          </div>
        </div>

        <!-- Right side: User menu and mobile menu button -->
        <div class="flex items-center">
          <!-- User dropdown (desktop) -->
          <div class="hidden md:ml-4 md:flex-shrink-0 md:flex md:items-center">
            <div class="relative" @mouseenter="showUserDropdown = true" @mouseleave="showUserDropdown = false">
              <button
                class="bg-primary-white rounded-full flex text-sm focus-ring"
                :aria-expanded="showUserDropdown"
                aria-haspopup="true"
              >
                <span class="sr-only">Open user menu</span>
                <!-- User Avatar -->
                <div class="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                  <span class="text-sm font-medium text-gray-700">
                    {{ userInitials }}
                  </span>
                </div>
              </button>

              <!-- User dropdown menu -->
              <Transition
                enter-active-class="transition ease-out duration-200"
                enter-from-class="opacity-0 scale-95"
                enter-to-class="opacity-100 scale-100"
                leave-active-class="transition ease-in duration-75"
                leave-from-class="opacity-100 scale-100"
                leave-to-class="opacity-0 scale-95"
              >
                <div
                  v-if="showUserDropdown"
                  class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-primary-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                >
                  <div class="py-1">
                    <div class="px-4 py-2 text-sm text-gray-900 border-b border-gray-200">
                      <div class="font-medium">{{ user.name }}</div>
                      <div class="text-gray-500">{{ user.email }}</div>
                    </div>
                    <button
                      v-for="action in userMenuActions"
                      :key="action.label"
                      @click="action.action"
                      class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
                    >
                      <component v-if="action.icon" :is="action.icon" class="w-4 h-4 mr-3" />
                      {{ action.label }}
                    </button>
                  </div>
                </div>
              </Transition>
            </div>
          </div>

          <!-- Mobile menu button -->
          <div class="md:hidden">
            <button
              @click="mobileMenuOpen = !mobileMenuOpen"
              class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus-ring"
              :aria-expanded="mobileMenuOpen"
            >
              <span class="sr-only">Open main menu</span>
              <Bars3Icon v-if="!mobileMenuOpen" class="block h-6 w-6" />
              <XMarkIcon v-else class="block h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile menu -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition ease-in duration-100"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div v-if="mobileMenuOpen" class="md:hidden">
        <div class="pt-2 pb-3 space-y-1 bg-primary-white border-t border-gray-200">
          <!-- Mobile navigation items -->
          <template v-for="item in navigationItems" :key="item.path">
            <router-link
              v-if="!item.children"
              :to="item.path"
              @click="mobileMenuOpen = false"
              :class="mobileNavigationItemClasses(item.path)"
              class="flex items-center pl-3 pr-4 py-2 text-base font-medium transition-colors duration-200"
            >
              <component v-if="item.icon" :is="item.icon" class="w-5 h-5 mr-3" />
              {{ item.label }}
              <span v-if="item.badge" class="ml-auto bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded-full">
                {{ item.badge }}
              </span>
            </router-link>

            <!-- Mobile dropdown items -->
            <div v-else>
              <button
                @click="toggleMobileDropdown(item.path)"
                :class="mobileNavigationItemClasses(item.path)"
                class="flex items-center w-full pl-3 pr-4 py-2 text-base font-medium transition-colors duration-200"
              >
                <component v-if="item.icon" :is="item.icon" class="w-5 h-5 mr-3" />
                {{ item.label }}
                <ChevronDownIcon 
                  :class="['w-4 h-4 ml-auto transition-transform duration-200', mobileDropdownStates[item.path] ? 'rotate-180' : '']" 
                />
                <span v-if="item.badge" class="ml-2 bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded-full">
                  {{ item.badge }}
                </span>
              </button>

              <!-- Mobile submenu -->
              <Transition
                enter-active-class="transition ease-out duration-200"
                enter-from-class="opacity-0 max-h-0"
                enter-to-class="opacity-100 max-h-96"
                leave-active-class="transition ease-in duration-150"
                leave-from-class="opacity-100 max-h-96"
                leave-to-class="opacity-0 max-h-0"
              >
                <div v-if="mobileDropdownStates[item.path]" class="overflow-hidden">
                  <router-link
                    v-for="child in item.children"
                    :key="child.path"
                    :to="child.path"
                    @click="mobileMenuOpen = false"
                    class="flex items-center pl-8 pr-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <component v-if="child.icon" :is="child.icon" class="w-4 h-4 mr-3" />
                    {{ child.label }}
                    <span v-if="child.badge" class="ml-auto bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded-full">
                      {{ child.badge }}
                    </span>
                  </router-link>
                </div>
              </Transition>
            </div>
          </template>
        </div>

        <!-- Mobile user menu -->
        <div class="pt-4 pb-3 border-t border-gray-200">
          <div class="flex items-center px-4">
            <div class="flex-shrink-0">
              <div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                <span class="text-sm font-medium text-gray-700">
                  {{ userInitials }}
                </span>
              </div>
            </div>
            <div class="ml-3">
              <div class="text-base font-medium text-gray-800">{{ user.name }}</div>
              <div class="text-sm font-medium text-gray-500">{{ user.email }}</div>
            </div>
          </div>
          <div class="mt-3 space-y-1">
            <button
              v-for="action in userMenuActions"
              :key="action.label"
              @click="action.action(); mobileMenuOpen = false"
              class="flex items-center w-full px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors duration-200"
            >
              <component v-if="action.icon" :is="action.icon" class="w-5 h-5 mr-3" />
              {{ action.label }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </nav>
</template>

<script setup lang="ts">
import { computed, ref, reactive, type Component } from 'vue'
import { useRoute } from 'vue-router'
import { 
  Bars3Icon, 
  XMarkIcon, 
  ChevronDownIcon,
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/vue/24/outline'

export interface NavigationItem {
  label: string
  path: string
  icon?: Component
  badge?: string | number
  children?: NavigationItem[]
}

export interface User {
  name: string
  email: string
  avatar?: string
}

export interface UserMenuAction {
  label: string
  icon?: Component
  action: () => void
}

export interface PapyonNavigationProps {
  navigationItems: NavigationItem[]
  user: User
  userMenuActions?: UserMenuAction[]
}

const props = withDefaults(defineProps<PapyonNavigationProps>(), {
  userMenuActions: () => [
    {
      label: 'Profile',
      icon: UserIcon,
      action: () => console.log('Profile clicked')
    },
    {
      label: 'Settings',
      icon: Cog6ToothIcon,
      action: () => console.log('Settings clicked')
    },
    {
      label: 'Sign out',
      icon: ArrowRightOnRectangleIcon,
      action: () => console.log('Sign out clicked')
    }
  ]
})

const route = useRoute()

// Mobile menu state
const mobileMenuOpen = ref(false)

// Dropdown states
const dropdownStates = reactive<Record<string, boolean>>({})
const mobileDropdownStates = reactive<Record<string, boolean>>({})
const showUserDropdown = ref(false)

// User initials
const userInitials = computed(() => {
  return props.user.name
    .split(' ')
    .map(name => name.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

// Navigation item classes
const navigationItemClasses = (path: string) => {
  const isActive = route.path === path || route.path.startsWith(path + '/')
  
  return [
    'border-b-2',
    'transition-colors',
    'duration-200',
    isActive
      ? 'border-primary-black text-primary-black'
      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
  ].join(' ')
}

// Mobile navigation item classes
const mobileNavigationItemClasses = (path: string) => {
  const isActive = route.path === path || route.path.startsWith(path + '/')
  
  return [
    'border-l-4',
    isActive
      ? 'bg-gray-50 border-primary-black text-primary-black'
      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
  ].join(' ')
}

// Badge classes
const badgeClasses = computed(() => [
  'ml-2',
  'inline-flex',
  'items-center',
  'px-2.5',
  'py-0.5',
  'rounded-full',
  'text-xs',
  'font-medium',
  'bg-accent-red',
  'text-primary-white'
].join(' '))

// Dropdown functions
const showDropdown = (path: string) => {
  dropdownStates[path] = true
}

const hideDropdown = (path: string) => {
  dropdownStates[path] = false
}

const toggleMobileDropdown = (path: string) => {
  mobileDropdownStates[path] = !mobileDropdownStates[path]
}

// Initialize dropdown states
props.navigationItems.forEach(item => {
  if (item.children) {
    dropdownStates[item.path] = false
    mobileDropdownStates[item.path] = false
  }
})
</script>

<style scoped>
.papyon-navigation {
  /* Ensure navigation stays above other content */
  backdrop-filter: blur(8px);
}

/* Focus ring utility */
.focus-ring {
  outline: none;
}

.focus-ring:focus {
  outline: 2px solid var(--color-gray-500);
  outline-offset: 2px;
}

/* Smooth transitions for dropdowns */
.transition-max-height {
  transition: max-height 0.3s ease-in-out;
}
</style>