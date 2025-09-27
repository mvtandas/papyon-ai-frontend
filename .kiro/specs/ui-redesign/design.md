# UI Redesign Design Document

## Overview

Bu tasarım dokümanı, Papyon AI platformunun tüm kullanıcı arayüzünün yeniden tasarlanması için kapsamlı bir rehber sunmaktadır. Tasarım, siyah-beyaz renk paleti, papyon maskotu ve tutarlı bileşen sistemi etrafında şekillendirilmiştir.

## Architecture

### Design System Hierarchy
```
Design System
├── Design Tokens (Colors, Typography, Spacing)
├── Base Components (Button, Input, Card, etc.)
├── Composite Components (Navigation, Forms, Tables)
├── Layout Components (Header, Sidebar, Main)
└── Page Templates (Dashboard, List, Detail, Auth)
```

### Technology Stack
- **Framework**: Vue 3 + TypeScript
- **Styling**: Tailwind CSS 4.x
- **Icons**: Heroicons
- **State Management**: Pinia
- **Routing**: Vue Router

## Components and Interfaces

### 1. Design Tokens

#### Color Palette
```css
/* Primary Colors */
--color-black: #000000
--color-white: #ffffff
--color-gray-50: #f9fafb
--color-gray-100: #f3f4f6
--color-gray-200: #e5e7eb
--color-gray-300: #d1d5db
--color-gray-400: #9ca3af
--color-gray-500: #6b7280
--color-gray-600: #4b5563
--color-gray-700: #374151
--color-gray-800: #1f2937
--color-gray-900: #111827

/* Accent Colors */
--color-accent-red: #ef4444
--color-accent-green: #10b981
--color-accent-blue: #3b82f6
--color-accent-yellow: #f59e0b
```

#### Typography Scale
```css
/* Font Families */
--font-primary: 'Inter', system-ui, sans-serif
--font-mono: 'JetBrains Mono', monospace

/* Font Sizes */
--text-xs: 0.75rem
--text-sm: 0.875rem
--text-base: 1rem
--text-lg: 1.125rem
--text-xl: 1.25rem
--text-2xl: 1.5rem
--text-3xl: 1.875rem
--text-4xl: 2.25rem
--text-5xl: 3rem
```

#### Spacing System
```css
/* Spacing Scale */
--space-1: 0.25rem
--space-2: 0.5rem
--space-3: 0.75rem
--space-4: 1rem
--space-5: 1.25rem
--space-6: 1.5rem
--space-8: 2rem
--space-10: 2.5rem
--space-12: 3rem
--space-16: 4rem
--space-20: 5rem
--space-24: 6rem
```

### 2. Base Components

#### Button Component
```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'danger'
  size: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  icon?: Component
  iconPosition?: 'left' | 'right'
}
```

**Variants:**
- **Primary**: Siyah arka plan, beyaz metin
- **Secondary**: Beyaz arka plan, siyah kenarlık, siyah metin
- **Ghost**: Şeffaf arka plan, hover'da gri arka plan
- **Danger**: Kırmızı arka plan, beyaz metin

#### Input Component
```typescript
interface InputProps {
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
  size: 'sm' | 'md' | 'lg'
  state: 'default' | 'error' | 'success'
  placeholder?: string
  disabled?: boolean
  icon?: Component
  iconPosition?: 'left' | 'right'
}
```

#### Card Component
```typescript
interface CardProps {
  variant: 'default' | 'elevated' | 'outlined'
  padding: 'sm' | 'md' | 'lg'
  hover?: boolean
}
```

#### Modal Component
```typescript
interface ModalProps {
  size: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closable?: boolean
  backdrop?: 'blur' | 'dark' | 'light'
}
```

### 3. Composite Components

#### Navigation Component
```typescript
interface NavigationProps {
  items: NavigationItem[]
  currentPath: string
  user: User
  onLogout: () => void
}

interface NavigationItem {
  label: string
  path: string
  icon: Component
  badge?: string | number
  children?: NavigationItem[]
}
```

**Features:**
- Responsive design (mobile hamburger menu)
- Active state indicators
- User dropdown with avatar
- Papyon logo integration
- Smooth animations

#### Data Table Component
```typescript
interface DataTableProps<T> {
  data: T[]
  columns: TableColumn<T>[]
  loading?: boolean
  pagination?: PaginationConfig
  selection?: 'single' | 'multiple' | 'none'
  actions?: TableAction<T>[]
}

interface TableColumn<T> {
  key: keyof T
  label: string
  sortable?: boolean
  width?: string
  render?: (value: any, row: T) => VNode
}
```

#### Form Builder Component
```typescript
interface FormBuilderProps {
  schema: FormSchema
  values: Record<string, any>
  onSubmit: (values: Record<string, any>) => void
  loading?: boolean
}

interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'select' | 'textarea' | 'checkbox'
  required?: boolean
  validation?: ValidationRule[]
  options?: SelectOption[]
}
```

### 4. Layout Components

#### App Layout
```vue
<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <PapyonNavigation />
    
    <!-- Main Content -->
    <main class="pt-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <router-view />
      </div>
    </main>
    
    <!-- Global Modals -->
    <PapyonModalContainer />
    
    <!-- Toast Notifications -->
    <PapyonToastContainer />
  </div>
</template>
```

#### Page Layout Templates
```typescript
// Dashboard Layout
interface DashboardLayoutProps {
  title: string
  subtitle?: string
  actions?: Component[]
  tabs?: TabItem[]
}

// List Layout
interface ListLayoutProps {
  title: string
  createButton?: ButtonConfig
  filters?: FilterConfig[]
  searchable?: boolean
}

// Detail Layout
interface DetailLayoutProps {
  title: string
  breadcrumbs?: BreadcrumbItem[]
  actions?: ActionConfig[]
  tabs?: TabItem[]
}
```

## Data Models

### Theme Configuration
```typescript
interface ThemeConfig {
  colors: ColorPalette
  typography: TypographyConfig
  spacing: SpacingConfig
  borderRadius: BorderRadiusConfig
  shadows: ShadowConfig
  animations: AnimationConfig
}

interface ColorPalette {
  primary: ColorScale
  gray: ColorScale
  accent: {
    red: string
    green: string
    blue: string
    yellow: string
  }
}
```

### Component State Management
```typescript
interface ComponentState {
  loading: boolean
  error: string | null
  data: any
  meta: {
    page: number
    totalPages: number
    totalItems: number
  }
}
```

### Design System Store
```typescript
interface DesignSystemStore {
  theme: ThemeConfig
  breakpoint: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  darkMode: boolean
  reducedMotion: boolean
  
  // Actions
  setTheme: (theme: Partial<ThemeConfig>) => void
  toggleDarkMode: () => void
  setBreakpoint: (breakpoint: string) => void
}
```

## Error Handling

### Error States
1. **Network Errors**: Connection timeout, server unavailable
2. **Validation Errors**: Form field validation, required fields
3. **Permission Errors**: Unauthorized access, insufficient permissions
4. **Data Errors**: Invalid data format, missing resources

### Error Display Patterns
```typescript
interface ErrorDisplayConfig {
  type: 'toast' | 'inline' | 'modal' | 'page'
  severity: 'info' | 'warning' | 'error' | 'success'
  dismissible: boolean
  autoHide?: number
}
```

### Error Recovery
- **Retry mechanisms** for network failures
- **Fallback content** for missing data
- **Progressive enhancement** for feature failures
- **Graceful degradation** for unsupported features

## Testing Strategy

### Component Testing
```typescript
// Base Component Tests
describe('PapyonButton', () => {
  it('renders with correct variant styles')
  it('handles click events properly')
  it('shows loading state correctly')
  it('respects disabled state')
})

// Composite Component Tests
describe('PapyonNavigation', () => {
  it('highlights active navigation item')
  it('handles user menu interactions')
  it('responds to mobile breakpoints')
})
```

### Visual Regression Testing
- **Chromatic** integration for component screenshots
- **Percy** for full-page visual testing
- **Storybook** for component documentation and testing

### Accessibility Testing
- **axe-core** for automated a11y testing
- **Keyboard navigation** testing
- **Screen reader** compatibility testing
- **Color contrast** validation

### Performance Testing
- **Bundle size** monitoring
- **Runtime performance** profiling
- **Core Web Vitals** tracking
- **Lighthouse** audits

## Implementation Phases

### Phase 1: Design System Foundation
- Design tokens setup
- Base components (Button, Input, Card)
- Typography and spacing utilities
- Color palette implementation

### Phase 2: Layout and Navigation
- App layout structure
- Navigation component
- Responsive breakpoints
- Mobile menu implementation

### Phase 3: Page Templates
- Authentication pages redesign
- Dashboard layout
- List and detail page templates
- Form layouts

### Phase 4: Advanced Components
- Data tables
- Modal system
- Toast notifications
- Loading states

### Phase 5: Polish and Optimization
- Animations and transitions
- Performance optimization
- Accessibility improvements
- Cross-browser testing

## Brand Integration

### Papyon Mascot Usage
- **Logo placement**: Navigation header, loading states
- **Empty states**: Friendly papyon illustrations
- **Error states**: Papyon with helpful messages
- **Success states**: Celebrating papyon animations

### Brand Voice
- **Professional yet approachable**
- **Clear and concise messaging**
- **Helpful error messages**
- **Encouraging success messages**

### Visual Hierarchy
- **Primary actions**: Black buttons with white text
- **Secondary actions**: White buttons with black borders
- **Destructive actions**: Red accent color
- **Success states**: Green accent color

## Responsive Design Strategy

### Breakpoint System
```css
/* Mobile First Approach */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

### Mobile Optimizations
- **Touch-friendly** button sizes (min 44px)
- **Simplified navigation** with hamburger menu
- **Optimized forms** with proper input types
- **Reduced content density** for better readability

### Desktop Enhancements
- **Multi-column layouts** for better space utilization
- **Hover states** and micro-interactions
- **Keyboard shortcuts** for power users
- **Advanced filtering** and sorting options

## Performance Considerations

### Bundle Optimization
- **Tree shaking** for unused Tailwind classes
- **Component lazy loading** for large pages
- **Icon optimization** with selective imports
- **CSS purging** for production builds

### Runtime Performance
- **Virtual scrolling** for large lists
- **Debounced search** inputs
- **Optimistic updates** for better UX
- **Caching strategies** for API responses

### Loading Strategies
- **Skeleton screens** for content loading
- **Progressive image loading** with placeholders
- **Chunked data loading** for large datasets
- **Background prefetching** for likely navigation

## Accessibility Standards

### WCAG 2.1 AA Compliance
- **Color contrast** ratios of 4.5:1 minimum
- **Keyboard navigation** for all interactive elements
- **Screen reader** compatibility with proper ARIA labels
- **Focus management** for modal and dropdown interactions

### Semantic HTML
- **Proper heading hierarchy** (h1-h6)
- **Landmark roles** for page sections
- **Form labels** and descriptions
- **Button vs link** semantic usage

### Inclusive Design
- **Reduced motion** preferences support
- **High contrast** mode compatibility
- **Text scaling** up to 200% support
- **Alternative text** for all images and icons