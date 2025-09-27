<template>
  <div class="papyon-input-wrapper">
    <!-- Label -->
    <label
      v-if="label"
      :for="inputId"
      :class="labelClasses"
    >
      {{ label }}
      <span v-if="required" class="text-accent-red ml-1">*</span>
    </label>

    <!-- Input Container -->
    <div :class="containerClasses">
      <!-- Left Icon -->
      <div v-if="icon && iconPosition === 'left'" class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <component :is="icon" :class="iconClasses" />
      </div>

      <!-- Input Element -->
      <input
        :id="inputId"
        :type="type"
        :class="inputClasses"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :value="modelValue"
        :aria-invalid="state === 'error'"
        :aria-describedby="helpTextId"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
      />

      <!-- Right Icon -->
      <div v-if="icon && iconPosition === 'right'" class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <component :is="icon" :class="iconClasses" />
      </div>
    </div>

    <!-- Help Text / Error Message -->
    <div
      v-if="helpText || errorMessage"
      :id="helpTextId"
      :class="helpTextClasses"
    >
      {{ state === 'error' ? errorMessage : helpText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, type Component } from 'vue'

export interface PapyonInputProps {
  modelValue?: string | number
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'
  size?: 'sm' | 'md' | 'lg'
  state?: 'default' | 'error' | 'success'
  label?: string
  placeholder?: string
  helpText?: string
  errorMessage?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  icon?: Component
  iconPosition?: 'left' | 'right'
}

const props = withDefaults(defineProps<PapyonInputProps>(), {
  type: 'text',
  size: 'md',
  state: 'default',
  disabled: false,
  readonly: false,
  required: false,
  iconPosition: 'left'
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}>()

// Generate unique IDs for accessibility
const inputId = ref(`papyon-input-${Math.random().toString(36).substr(2, 9)}`)
const helpTextId = ref(`papyon-help-${Math.random().toString(36).substr(2, 9)}`)

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = props.type === 'number' ? Number(target.value) : target.value
  emit('update:modelValue', value)
}

const handleBlur = (event: FocusEvent) => {
  emit('blur', event)
}

const handleFocus = (event: FocusEvent) => {
  emit('focus', event)
}

const labelClasses = computed(() => {
  return [
    'block',
    'text-sm',
    'font-medium',
    'text-gray-700',
    'mb-1'
  ].join(' ')
})

const containerClasses = computed(() => {
  return [
    'relative',
    'rounded-md',
    'shadow-sm'
  ].join(' ')
})

const inputClasses = computed(() => {
  const baseClasses = [
    'block',
    'w-full',
    'rounded-md',
    'border',
    'transition-colors',
    'duration-200',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
    'disabled:bg-gray-50'
  ]

  // Size classes
  const sizeClasses = {
    sm: ['px-3', 'py-1.5', 'text-sm', 'min-h-[32px]'],
    md: ['px-3', 'py-2', 'text-sm', 'min-h-[40px]'],
    lg: ['px-4', 'py-3', 'text-base', 'min-h-[48px]']
  }

  // Icon padding adjustments
  const iconPaddingClasses = []
  if (props.icon) {
    if (props.iconPosition === 'left') {
      const leftPadding = {
        sm: 'pl-9',
        md: 'pl-10',
        lg: 'pl-11'
      }
      iconPaddingClasses.push(leftPadding[props.size])
    } else {
      const rightPadding = {
        sm: 'pr-9',
        md: 'pr-10',
        lg: 'pr-11'
      }
      iconPaddingClasses.push(rightPadding[props.size])
    }
  }

  // State classes
  const stateClasses = {
    default: [
      'border-gray-300',
      'text-gray-900',
      'placeholder-gray-400',
      'focus:border-gray-500',
      'focus:ring-gray-500'
    ],
    error: [
      'border-accent-red',
      'text-gray-900',
      'placeholder-gray-400',
      'focus:border-accent-red',
      'focus:ring-accent-red'
    ],
    success: [
      'border-accent-green',
      'text-gray-900',
      'placeholder-gray-400',
      'focus:border-accent-green',
      'focus:ring-accent-green'
    ]
  }

  return [
    ...baseClasses,
    ...sizeClasses[props.size],
    ...iconPaddingClasses,
    ...stateClasses[props.state]
  ].join(' ')
})

const iconClasses = computed(() => {
  const baseIconClasses = ['flex-shrink-0']
  
  const sizeIconClasses = {
    sm: ['h-4', 'w-4'],
    md: ['h-5', 'w-5'],
    lg: ['h-5', 'w-5']
  }

  const stateIconClasses = {
    default: ['text-gray-400'],
    error: ['text-accent-red'],
    success: ['text-accent-green']
  }

  return [
    ...baseIconClasses,
    ...sizeIconClasses[props.size],
    ...stateIconClasses[props.state]
  ].join(' ')
})

const helpTextClasses = computed(() => {
  const baseClasses = ['mt-1', 'text-sm']

  const stateClasses = {
    default: ['text-gray-500'],
    error: ['text-accent-red'],
    success: ['text-accent-green']
  }

  return [
    ...baseClasses,
    ...stateClasses[props.state]
  ].join(' ')
})
</script>