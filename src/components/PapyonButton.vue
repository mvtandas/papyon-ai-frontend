<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || loading"
    @click="handleClick"
    :type="type"
  >
    <!-- Loading Spinner -->
    <svg
      v-if="loading"
      class="animate-spin -ml-1 mr-2 h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      ></circle>
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>

    <!-- Left Icon -->
    <component
      v-if="icon && iconPosition === 'left' && !loading"
      :is="icon"
      :class="iconClasses"
    />

    <!-- Button Text -->
    <span v-if="$slots.default">
      <slot />
    </span>

    <!-- Right Icon -->
    <component
      v-if="icon && iconPosition === 'right' && !loading"
      :is="icon"
      :class="iconClasses"
    />
  </button>
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue'

export interface PapyonButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  icon?: Component
  iconPosition?: 'left' | 'right'
  type?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<PapyonButtonProps>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  iconPosition: 'left',
  type: 'button'
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}

const buttonClasses = computed(() => {
  const baseClasses = [
    'btn-base',
    'inline-flex',
    'items-center',
    'justify-center',
    'font-medium',
    'rounded-md',
    'transition-all',
    'duration-200',
    'focus-ring',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed'
  ]

  // Size classes
  const sizeClasses = {
    sm: ['px-3', 'py-1.5', 'text-sm', 'min-h-[32px]'],
    md: ['px-4', 'py-2', 'text-sm', 'min-h-[40px]'],
    lg: ['px-6', 'py-3', 'text-base', 'min-h-[48px]']
  }

  // Variant classes
  const variantClasses = {
    primary: [
      'bg-primary-black',
      'text-primary-white',
      'border',
      'border-primary-black',
      'hover:bg-gray-800',
      'hover:border-gray-800',
      'active:bg-gray-900'
    ],
    secondary: [
      'bg-primary-white',
      'text-primary-black',
      'border',
      'border-gray-300',
      'hover:bg-gray-50',
      'hover:border-gray-400',
      'active:bg-gray-100'
    ],
    ghost: [
      'bg-transparent',
      'text-gray-700',
      'border',
      'border-transparent',
      'hover:bg-gray-100',
      'hover:text-gray-900',
      'active:bg-gray-200'
    ],
    danger: [
      'bg-accent-red',
      'text-primary-white',
      'border',
      'border-accent-red',
      'hover:bg-red-600',
      'hover:border-red-600',
      'active:bg-red-700'
    ]
  }

  return [
    ...baseClasses,
    ...sizeClasses[props.size],
    ...variantClasses[props.variant]
  ].join(' ')
})

const iconClasses = computed(() => {
  const baseIconClasses = ['flex-shrink-0']
  
  const sizeIconClasses = {
    sm: ['h-4', 'w-4'],
    md: ['h-4', 'w-4'],
    lg: ['h-5', 'w-5']
  }

  const spacingClasses = []
  if (props.iconPosition === 'left') {
    spacingClasses.push('mr-2')
  } else {
    spacingClasses.push('ml-2')
  }

  return [
    ...baseIconClasses,
    ...sizeIconClasses[props.size],
    ...spacingClasses
  ].join(' ')
})
</script>