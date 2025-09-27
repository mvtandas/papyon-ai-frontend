<template>
  <div class="p-8 space-y-6">
    <h1 class="text-3xl font-bold text-primary-black">Design System Test</h1>
    
    <!-- Color Palette Test -->
    <div class="space-y-4">
      <h2 class="text-xl font-semibold">Colors</h2>
      <div class="flex space-x-4">
        <div class="w-16 h-16 bg-primary-black rounded-lg"></div>
        <div class="w-16 h-16 bg-primary-white border border-gray-300 rounded-lg"></div>
        <div class="w-16 h-16 bg-gray-500 rounded-lg"></div>
        <div class="w-16 h-16 bg-accent-red rounded-lg"></div>
        <div class="w-16 h-16 bg-accent-green rounded-lg"></div>
        <div class="w-16 h-16 bg-accent-blue rounded-lg"></div>
      </div>
    </div>

    <!-- Typography Test -->
    <div class="space-y-2">
      <h2 class="text-xl font-semibold">Typography</h2>
      <p class="text-xs">Extra Small Text</p>
      <p class="text-sm">Small Text</p>
      <p class="text-base">Base Text</p>
      <p class="text-lg">Large Text</p>
      <p class="text-xl">Extra Large Text</p>
    </div>

    <!-- Button Test -->
    <div class="space-y-4">
      <h2 class="text-xl font-semibold">Buttons</h2>
      
      <!-- Button Variants -->
      <div class="space-y-2">
        <h3 class="text-lg font-medium">Variants</h3>
        <div class="flex flex-wrap gap-4">
          <PapyonButton variant="primary">Primary Button</PapyonButton>
          <PapyonButton variant="secondary">Secondary Button</PapyonButton>
          <PapyonButton variant="ghost">Ghost Button</PapyonButton>
          <PapyonButton variant="danger">Danger Button</PapyonButton>
        </div>
      </div>

      <!-- Button Sizes -->
      <div class="space-y-2">
        <h3 class="text-lg font-medium">Sizes</h3>
        <div class="flex flex-wrap items-center gap-4">
          <PapyonButton size="sm">Small</PapyonButton>
          <PapyonButton size="md">Medium</PapyonButton>
          <PapyonButton size="lg">Large</PapyonButton>
        </div>
      </div>

      <!-- Button States -->
      <div class="space-y-2">
        <h3 class="text-lg font-medium">States</h3>
        <div class="flex flex-wrap gap-4">
          <PapyonButton>Normal</PapyonButton>
          <PapyonButton disabled>Disabled</PapyonButton>
          <PapyonButton loading>Loading</PapyonButton>
        </div>
      </div>

      <!-- Button with Icons -->
      <div class="space-y-2">
        <h3 class="text-lg font-medium">With Icons</h3>
        <div class="flex flex-wrap gap-4">
          <PapyonButton :icon="PlusIcon" icon-position="left">Add Item</PapyonButton>
          <PapyonButton :icon="ArrowRightIcon" icon-position="right" variant="secondary">Continue</PapyonButton>
        </div>
      </div>
    </div>

    <!-- Input Test -->
    <div class="space-y-4">
      <h2 class="text-xl font-semibold">Inputs</h2>
      
      <!-- Input Sizes -->
      <div class="space-y-2">
        <h3 class="text-lg font-medium">Sizes</h3>
        <div class="space-y-3 max-w-md">
          <PapyonInput size="sm" label="Small Input" placeholder="Small input..." />
          <PapyonInput size="md" label="Medium Input" placeholder="Medium input..." />
          <PapyonInput size="lg" label="Large Input" placeholder="Large input..." />
        </div>
      </div>

      <!-- Input States -->
      <div class="space-y-2">
        <h3 class="text-lg font-medium">States</h3>
        <div class="space-y-3 max-w-md">
          <PapyonInput label="Default State" placeholder="Enter text..." />
          <PapyonInput 
            label="Error State" 
            state="error" 
            error-message="This field is required" 
            placeholder="Enter text..." 
          />
          <PapyonInput 
            label="Success State" 
            state="success" 
            help-text="Looks good!" 
            placeholder="Enter text..." 
          />
          <PapyonInput label="Disabled State" disabled placeholder="Disabled input..." />
        </div>
      </div>

      <!-- Input with Icons -->
      <div class="space-y-2">
        <h3 class="text-lg font-medium">With Icons</h3>
        <div class="space-y-3 max-w-md">
          <PapyonInput 
            label="Email" 
            type="email" 
            :icon="EnvelopeIcon" 
            icon-position="left" 
            placeholder="Enter your email..." 
          />
          <PapyonInput 
            label="Search" 
            type="search" 
            :icon="MagnifyingGlassIcon" 
            icon-position="right" 
            placeholder="Search..." 
          />
        </div>
      </div>

      <!-- Input Types -->
      <div class="space-y-2">
        <h3 class="text-lg font-medium">Input Types</h3>
        <div class="space-y-3 max-w-md">
          <PapyonInput label="Text" type="text" placeholder="Text input..." />
          <PapyonInput label="Email" type="email" placeholder="email@example.com" />
          <PapyonInput label="Password" type="password" placeholder="Password..." />
          <PapyonInput label="Number" type="number" placeholder="123" />
          <PapyonInput label="Phone" type="tel" placeholder="+1 (555) 123-4567" />
        </div>
      </div>
    </div>

    <!-- Card Test -->
    <div class="space-y-4">
      <h2 class="text-xl font-semibold">Cards</h2>
      
      <!-- Card Variants -->
      <div class="space-y-2">
        <h3 class="text-lg font-medium">Variants</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl">
          <PapyonCard variant="default">
            <h4 class="font-semibold mb-2">Default Card</h4>
            <p class="text-gray-600">This is a default card with basic styling.</p>
          </PapyonCard>
          
          <PapyonCard variant="elevated">
            <h4 class="font-semibold mb-2">Elevated Card</h4>
            <p class="text-gray-600">This card has a shadow for elevation effect.</p>
          </PapyonCard>
          
          <PapyonCard variant="outlined">
            <h4 class="font-semibold mb-2">Outlined Card</h4>
            <p class="text-gray-600">This card has a thicker border outline.</p>
          </PapyonCard>
        </div>
      </div>

      <!-- Card Sizes -->
      <div class="space-y-2">
        <h3 class="text-lg font-medium">Padding Sizes</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl">
          <PapyonCard padding="sm" variant="elevated">
            <h4 class="font-semibold mb-2">Small Padding</h4>
            <p class="text-gray-600">Compact card with small padding.</p>
          </PapyonCard>
          
          <PapyonCard padding="md" variant="elevated">
            <h4 class="font-semibold mb-2">Medium Padding</h4>
            <p class="text-gray-600">Standard card with medium padding.</p>
          </PapyonCard>
          
          <PapyonCard padding="lg" variant="elevated">
            <h4 class="font-semibold mb-2">Large Padding</h4>
            <p class="text-gray-600">Spacious card with large padding.</p>
          </PapyonCard>
        </div>
      </div>

      <!-- Interactive Cards -->
      <div class="space-y-2">
        <h3 class="text-lg font-medium">Interactive Cards</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
          <PapyonCard hover variant="elevated">
            <h4 class="font-semibold mb-2">Hover Effect</h4>
            <p class="text-gray-600">This card has hover animations.</p>
          </PapyonCard>
          
          <PapyonCard clickable variant="elevated" @click="() => alert('Card clicked!')">
            <h4 class="font-semibold mb-2">Clickable Card</h4>
            <p class="text-gray-600">Click this card to see the interaction.</p>
          </PapyonCard>
        </div>
      </div>

      <!-- Card with Header and Footer -->
      <div class="space-y-2">
        <h3 class="text-lg font-medium">With Header & Footer</h3>
        <div class="max-w-md">
          <PapyonCard variant="elevated">
            <template #header>
              <div class="flex items-center justify-between">
                <h4 class="font-semibold">Card Title</h4>
                <span class="text-sm text-gray-500">Status</span>
              </div>
            </template>
            
            <p class="text-gray-600 mb-4">
              This card demonstrates the header and footer slots. The header typically contains titles and metadata.
            </p>
            
            <template #footer>
              <div class="flex justify-end space-x-2">
                <PapyonButton size="sm" variant="ghost">Cancel</PapyonButton>
                <PapyonButton size="sm" variant="primary">Save</PapyonButton>
              </div>
            </template>
          </PapyonCard>
        </div>
      </div>
    </div>

    <!-- Modal Test -->
    <div class="space-y-4">
      <h2 class="text-xl font-semibold">Modals</h2>
      
      <!-- Modal Sizes -->
      <div class="space-y-2">
        <h3 class="text-lg font-medium">Sizes</h3>
        <div class="flex flex-wrap gap-4">
          <PapyonButton @click="showSmallModal = true">Small Modal</PapyonButton>
          <PapyonButton @click="showMediumModal = true">Medium Modal</PapyonButton>
          <PapyonButton @click="showLargeModal = true">Large Modal</PapyonButton>
          <PapyonButton @click="showXLModal = true">XL Modal</PapyonButton>
          <PapyonButton @click="showFullModal = true">Full Modal</PapyonButton>
        </div>
      </div>

      <!-- Modal Variants -->
      <div class="space-y-2">
        <h3 class="text-lg font-medium">Backdrop Variants</h3>
        <div class="flex flex-wrap gap-4">
          <PapyonButton @click="showBlurModal = true">Blur Backdrop</PapyonButton>
          <PapyonButton @click="showDarkModal = true">Dark Backdrop</PapyonButton>
          <PapyonButton @click="showLightModal = true">Light Backdrop</PapyonButton>
        </div>
      </div>

      <!-- Modal Features -->
      <div class="space-y-2">
        <h3 class="text-lg font-medium">Features</h3>
        <div class="flex flex-wrap gap-4">
          <PapyonButton @click="showFormModal = true">Form Modal</PapyonButton>
          <PapyonButton @click="showConfirmModal = true">Confirmation Modal</PapyonButton>
          <PapyonButton @click="showNoCloseModal = true">No Close Button</PapyonButton>
        </div>
      </div>
    </div>

    <!-- Animation Test -->
    <div class="space-y-4">
      <h2 class="text-xl font-semibold">Animations</h2>
      <div class="animate-fade-in p-4 bg-gray-100 rounded-lg">
        Fade In Animation
      </div>
    </div>

    <!-- Modal Components -->
    <!-- Small Modal -->
    <PapyonModal v-model="showSmallModal" size="sm" title="Small Modal">
      <p>This is a small modal with minimal content.</p>
    </PapyonModal>

    <!-- Medium Modal -->
    <PapyonModal v-model="showMediumModal" size="md" title="Medium Modal">
      <p>This is a medium-sized modal with standard content. It provides a good balance between content space and screen real estate.</p>
    </PapyonModal>

    <!-- Large Modal -->
    <PapyonModal v-model="showLargeModal" size="lg" title="Large Modal">
      <p>This is a large modal that can accommodate more content. It's perfect for forms, detailed information, or complex interactions.</p>
      <p class="mt-4">You can include multiple paragraphs, lists, and other content elements here.</p>
    </PapyonModal>

    <!-- XL Modal -->
    <PapyonModal v-model="showXLModal" size="xl" title="Extra Large Modal">
      <p>This is an extra large modal designed for complex content that needs more space.</p>
      <div class="mt-4 grid grid-cols-2 gap-4">
        <div>
          <h4 class="font-semibold mb-2">Left Column</h4>
          <p>Content in the left column.</p>
        </div>
        <div>
          <h4 class="font-semibold mb-2">Right Column</h4>
          <p>Content in the right column.</p>
        </div>
      </div>
    </PapyonModal>

    <!-- Full Modal -->
    <PapyonModal v-model="showFullModal" size="full" title="Full Screen Modal">
      <p>This is a full-screen modal that takes up most of the viewport. It's ideal for complex workflows or detailed content.</p>
      <div class="mt-6 space-y-4">
        <div v-for="i in 10" :key="i" class="p-4 bg-gray-50 rounded-lg">
          <h4 class="font-semibold">Section {{ i }}</h4>
          <p>This is content for section {{ i }}. The modal will scroll if content exceeds the viewport height.</p>
        </div>
      </div>
    </PapyonModal>

    <!-- Blur Backdrop Modal -->
    <PapyonModal v-model="showBlurModal" backdrop="blur" title="Blur Backdrop">
      <p>This modal uses a blur backdrop effect for a modern look.</p>
    </PapyonModal>

    <!-- Dark Backdrop Modal -->
    <PapyonModal v-model="showDarkModal" backdrop="dark" title="Dark Backdrop">
      <p>This modal uses a dark backdrop for high contrast.</p>
    </PapyonModal>

    <!-- Light Backdrop Modal -->
    <PapyonModal v-model="showLightModal" backdrop="light" title="Light Backdrop">
      <p>This modal uses a light backdrop for subtle emphasis.</p>
    </PapyonModal>

    <!-- Form Modal -->
    <PapyonModal v-model="showFormModal" title="User Information">
      <div class="space-y-4">
        <PapyonInput label="Full Name" placeholder="Enter your full name" />
        <PapyonInput label="Email" type="email" placeholder="Enter your email" />
        <PapyonInput label="Phone" type="tel" placeholder="Enter your phone number" />
      </div>
      
      <template #footer>
        <PapyonButton variant="ghost" @click="showFormModal = false">Cancel</PapyonButton>
        <PapyonButton variant="primary" @click="showFormModal = false">Save</PapyonButton>
      </template>
    </PapyonModal>

    <!-- Confirmation Modal -->
    <PapyonModal v-model="showConfirmModal" size="sm" title="Confirm Action">
      <p>Are you sure you want to delete this item? This action cannot be undone.</p>
      
      <template #footer>
        <PapyonButton variant="ghost" @click="showConfirmModal = false">Cancel</PapyonButton>
        <PapyonButton variant="danger" @click="showConfirmModal = false">Delete</PapyonButton>
      </template>
    </PapyonModal>

    <!-- No Close Button Modal -->
    <PapyonModal 
      v-model="showNoCloseModal" 
      title="No Close Button" 
      :closable="false"
      :close-on-backdrop="false"
      :close-on-escape="false"
    >
      <p>This modal cannot be closed by clicking the backdrop, pressing escape, or using a close button.</p>
      <p class="mt-2">You must use the button below to close it.</p>
      
      <template #footer>
        <PapyonButton variant="primary" @click="showNoCloseModal = false">Close Modal</PapyonButton>
      </template>
    </PapyonModal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { PlusIcon, ArrowRightIcon, EnvelopeIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/outline'
import PapyonButton from './PapyonButton.vue'
import PapyonInput from './PapyonInput.vue'
import PapyonCard from './PapyonCard.vue'
import PapyonModal from './PapyonModal.vue'

// Modal states
const showSmallModal = ref(false)
const showMediumModal = ref(false)
const showLargeModal = ref(false)
const showXLModal = ref(false)
const showFullModal = ref(false)
const showBlurModal = ref(false)
const showDarkModal = ref(false)
const showLightModal = ref(false)
const showFormModal = ref(false)
const showConfirmModal = ref(false)
const showNoCloseModal = ref(false)

// This component tests the design system implementation
</script>