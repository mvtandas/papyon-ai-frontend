<template>
  <div :class="cardClasses" @click="handleClick">
    <!-- Header Slot -->
    <div v-if="$slots.header" :class="headerClasses">
      <slot name="header" />
    </div>

    <!-- Main Content -->
    <div :class="contentClasses">
      <slot />
    </div>

    <!-- Footer Slot -->
    <div v-if="$slots.footer" :class="footerClasses">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface PapyonCardProps {
  variant?: 'default' | 'elevated' | 'outlined'
  padding?: 'sm' | 'md' | 'lg'
  hover?: boolean
  clickable?: boolean
  rounded?: boolean
}

const props = withDefaults(defineProps<PapyonCardProps>(), {
  variant: 'default',
  padding: 'md',
  hover: false,
  clickable: false,
  rounded: true
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const handleClick = (event: MouseEvent) => {
  if (props.clickable) {
    emit('click', event)
  }
}

const cardClasses = computed(() => {
  const baseClasses = [
    'papyon-card',
    'transition-all',
    'duration-200'
  ]

  // Variant classes
  const variantClasses = {
    default: [
      'bg-primary-white',
      'border',
      'border-gray-200'
    ],
    elevated: [
      'bg-primary-white',
      'shadow-md',
      'border',
      'border-gray-100'
    ],
    outlined: [
      'bg-primary-white',
      'border-2',
      'border-gray-300'
    ]
  }

  // Rounded corners
  const roundedClasses = props.rounded ? ['rounded-lg'] : []

  // Hover effects
  const hoverClasses = []
  if (props.hover || props.clickable) {
    if (props.variant === 'elevated') {
      hoverClasses.push('hover:shadow-lg', 'hover:shadow-gray-200/50')
    } else {
      hoverClasses.push('hover:shadow-md', 'hover:shadow-gray-200/50')
    }
    hoverClasses.push('hover:-translate-y-0.5')
  }

  // Clickable cursor
  const clickableClasses = props.clickable ? ['cursor-pointer'] : []

  // Focus styles for accessibility
  const focusClasses = props.clickable ? ['focus:outline-none', 'focus:ring-2', 'focus:ring-gray-500', 'focus:ring-offset-2'] : []

  return [
    ...baseClasses,
    ...variantClasses[props.variant],
    ...roundedClasses,
    ...hoverClasses,
    ...clickableClasses,
    ...focusClasses
  ].join(' ')
})

const headerClasses = computed(() => {
  const baseClasses = ['papyon-card-header']
  
  // Padding classes
  const paddingClasses = {
    sm: ['px-4', 'py-3'],
    md: ['px-6', 'py-4'],
    lg: ['px-8', 'py-6']
  }

  // Border bottom
  const borderClasses = ['border-b', 'border-gray-200']

  // Rounded top corners
  const roundedClasses = props.rounded ? ['rounded-t-lg'] : []

  return [
    ...baseClasses,
    ...paddingClasses[props.padding],
    ...borderClasses,
    ...roundedClasses
  ].join(' ')
})

const contentClasses = computed(() => {
  const baseClasses = ['papyon-card-content']
  
  // Padding classes
  const paddingClasses = {
    sm: ['p-4'],
    md: ['p-6'],
    lg: ['p-8']
  }

  return [
    ...baseClasses,
    ...paddingClasses[props.padding]
  ].join(' ')
})

const footerClasses = computed(() => {
  const baseClasses = ['papyon-card-footer']
  
  // Padding classes
  const paddingClasses = {
    sm: ['px-4', 'py-3'],
    md: ['px-6', 'py-4'],
    lg: ['px-8', 'py-6']
  }

  // Border top
  const borderClasses = ['border-t', 'border-gray-200']

  // Rounded bottom corners
  const roundedClasses = props.rounded ? ['rounded-b-lg'] : []

  // Background for footer
  const backgroundClasses = ['bg-gray-50']

  return [
    ...baseClasses,
    ...paddingClasses[props.padding],
    ...borderClasses,
    ...roundedClasses,
    ...backgroundClasses
  ].join(' ')
})
</script>

<style scoped>
.papyon-card {
  /* Ensure smooth transitions */
  transform: translateZ(0);
}

/* Responsive behavior */
@media (max-width: 640px) {
  .papyon-card-header,
  .papyon-card-content,
  .papyon-card-footer {
    /* Reduce padding on mobile */
    padding-left: 1rem !important;
    padding-right: 1rem !important;
  }
}
</style>