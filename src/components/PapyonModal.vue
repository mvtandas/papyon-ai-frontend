<template>
  <!-- Modal Backdrop -->
  <Teleport to="body">
    <Transition
      name="modal-backdrop"
      enter-active-class="transition-opacity duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        :class="backdropClasses"
        @click="handleBackdropClick"
        @keydown.esc="handleEscapeKey"
        tabindex="-1"
        role="dialog"
        :aria-modal="true"
        :aria-labelledby="titleId"
        :aria-describedby="contentId"
      >
        <!-- Modal Container -->
        <div class="flex min-h-full items-center justify-center p-4">
          <Transition
            name="modal-content"
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 scale-95 translate-y-4"
            enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="opacity-100 scale-100 translate-y-0"
            leave-to-class="opacity-0 scale-95 translate-y-4"
          >
            <div
              v-if="modelValue"
              :class="modalClasses"
              @click.stop
              ref="modalRef"
            >
              <!-- Modal Header -->
              <div v-if="$slots.header || title || closable" :class="headerClasses">
                <div class="flex items-center justify-between">
                  <!-- Title or Header Slot -->
                  <div class="flex-1">
                    <slot name="header">
                      <h3 v-if="title" :id="titleId" class="text-lg font-semibold text-gray-900">
                        {{ title }}
                      </h3>
                    </slot>
                  </div>
                  
                  <!-- Close Button -->
                  <button
                    v-if="closable"
                    @click="handleClose"
                    class="ml-4 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded-md p-1"
                    aria-label="Close modal"
                  >
                    <XMarkIcon class="h-5 w-5" />
                  </button>
                </div>
              </div>

              <!-- Modal Content -->
              <div :id="contentId" :class="contentClasses">
                <slot />
              </div>

              <!-- Modal Footer -->
              <div v-if="$slots.footer" :class="footerClasses">
                <slot name="footer" />
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'

export interface PapyonModalProps {
  modelValue: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  title?: string
  closable?: boolean
  backdrop?: 'blur' | 'dark' | 'light'
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
}

const props = withDefaults(defineProps<PapyonModalProps>(), {
  size: 'md',
  closable: true,
  backdrop: 'blur',
  closeOnBackdrop: true,
  closeOnEscape: true
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
  open: []
}>()

// Refs
const modalRef = ref<HTMLElement>()

// Generate unique IDs for accessibility
const titleId = ref(`papyon-modal-title-${Math.random().toString(36).substr(2, 9)}`)
const contentId = ref(`papyon-modal-content-${Math.random().toString(36).substr(2, 9)}`)

// Focus management
const previousActiveElement = ref<HTMLElement | null>(null)

const handleClose = () => {
  emit('update:modelValue', false)
  emit('close')
}

const handleBackdropClick = () => {
  if (props.closeOnBackdrop) {
    handleClose()
  }
}

const handleEscapeKey = () => {
  if (props.closeOnEscape) {
    handleClose()
  }
}

// Focus trap implementation
const trapFocus = (element: HTMLElement) => {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  const firstElement = focusableElements[0] as HTMLElement
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }
  }

  element.addEventListener('keydown', handleTabKey)
  return () => element.removeEventListener('keydown', handleTabKey)
}

// Watch for modal open/close
watch(() => props.modelValue, async (isOpen) => {
  if (isOpen) {
    // Store current focus
    previousActiveElement.value = document.activeElement as HTMLElement
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden'
    
    // Focus modal after transition
    await nextTick()
    if (modalRef.value) {
      modalRef.value.focus()
      trapFocus(modalRef.value)
    }
    
    emit('open')
  } else {
    // Restore body scroll
    document.body.style.overflow = ''
    
    // Restore previous focus
    if (previousActiveElement.value) {
      previousActiveElement.value.focus()
    }
  }
})

// Cleanup on unmount
onUnmounted(() => {
  document.body.style.overflow = ''
})

const backdropClasses = computed(() => {
  const baseClasses = [
    'fixed',
    'inset-0',
    'z-50',
    'flex',
    'items-center',
    'justify-center'
  ]

  const backdropStyles = {
    blur: ['bg-gray-900/50', 'backdrop-blur-sm'],
    dark: ['bg-gray-900/75'],
    light: ['bg-gray-500/50']
  }

  return [
    ...baseClasses,
    ...backdropStyles[props.backdrop]
  ].join(' ')
})

const modalClasses = computed(() => {
  const baseClasses = [
    'relative',
    'bg-primary-white',
    'rounded-lg',
    'shadow-xl',
    'transform',
    'transition-all',
    'max-h-[90vh]',
    'overflow-hidden',
    'focus:outline-none'
  ]

  // Size classes
  const sizeClasses = {
    sm: ['w-full', 'max-w-sm'],
    md: ['w-full', 'max-w-md'],
    lg: ['w-full', 'max-w-lg'],
    xl: ['w-full', 'max-w-2xl'],
    full: ['w-full', 'max-w-7xl', 'mx-4', 'h-[90vh]']
  }

  return [
    ...baseClasses,
    ...sizeClasses[props.size]
  ].join(' ')
})

const headerClasses = computed(() => {
  return [
    'px-6',
    'py-4',
    'border-b',
    'border-gray-200',
    'bg-gray-50'
  ].join(' ')
})

const contentClasses = computed(() => {
  const baseClasses = ['px-6', 'py-4']
  
  // Add scroll for full size modals
  if (props.size === 'full') {
    baseClasses.push('overflow-y-auto', 'flex-1')
  }

  return baseClasses.join(' ')
})

const footerClasses = computed(() => {
  return [
    'px-6',
    'py-4',
    'border-t',
    'border-gray-200',
    'bg-gray-50',
    'flex',
    'justify-end',
    'space-x-3'
  ].join(' ')
})
</script>

<style scoped>
/* Ensure modal appears above everything */
.modal-backdrop {
  z-index: 9999;
}

/* Smooth transitions */
.modal-backdrop-enter-active,
.modal-backdrop-leave-active {
  transition: opacity 0.3s ease;
}

.modal-backdrop-enter-from,
.modal-backdrop-leave-to {
  opacity: 0;
}

.modal-content-enter-active,
.modal-content-leave-active {
  transition: all 0.3s ease;
}

.modal-content-enter-from,
.modal-content-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(1rem);
}
</style>