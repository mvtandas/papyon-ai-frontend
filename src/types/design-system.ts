// Design System Type Definitions

export interface ColorPalette {
  primary: {
    black: string
    white: string
  }
  gray: {
    50: string
    100: string
    200: string
    300: string
    400: string
    500: string
    600: string
    700: string
    800: string
    900: string
    950: string
  }
  accent: {
    red: string
    green: string
    blue: string
    yellow: string
  }
  semantic: {
    success: string
    warning: string
    error: string
    info: string
  }
}

export interface TypographyConfig {
  fontFamily: {
    primary: string
    mono: string
  }
  fontSize: {
    xs: string
    sm: string
    base: string
    lg: string
    xl: string
    '2xl': string
    '3xl': string
    '4xl': string
    '5xl': string
  }
  lineHeight: {
    xs: string
    sm: string
    base: string
    lg: string
    xl: string
    '2xl': string
    '3xl': string
    '4xl': string
    '5xl': string
  }
}

export interface SpacingConfig {
  1: string
  2: string
  3: string
  4: string
  5: string
  6: string
  8: string
  10: string
  12: string
  16: string
  20: string
  24: string
}

export interface BorderRadiusConfig {
  none: string
  sm: string
  default: string
  md: string
  lg: string
  xl: string
  '2xl': string
  '3xl': string
  full: string
}

export interface ShadowConfig {
  sm: string
  default: string
  md: string
  lg: string
  xl: string
  '2xl': string
  inner: string
}

export interface AnimationConfig {
  duration: {
    fast: string
    normal: string
    slow: string
  }
  easing: {
    in: string
    out: string
    inOut: string
  }
}

export interface ThemeConfig {
  colors: ColorPalette
  typography: TypographyConfig
  spacing: SpacingConfig
  borderRadius: BorderRadiusConfig
  shadows: ShadowConfig
  animations: AnimationConfig
}

// Component variant types
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'
export type InputState = 'default' | 'error' | 'success'
export type CardVariant = 'default' | 'elevated' | 'outlined'
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

// Design system constants
export const DESIGN_TOKENS = {
  colors: {
    primary: {
      black: '#000000',
      white: '#ffffff',
    },
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
      950: '#030712',
    },
    accent: {
      red: '#ef4444',
      green: '#10b981',
      blue: '#3b82f6',
      yellow: '#f59e0b',
    },
    semantic: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
  },
  typography: {
    fontFamily: {
      primary: "'Inter', system-ui, sans-serif",
      mono: "'JetBrains Mono', monospace",
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
    },
  },
  spacing: {
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
  },
  animations: {
    duration: {
      fast: '0.15s',
      normal: '0.2s',
      slow: '0.3s',
    },
    easing: {
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
} as const

// Utility type for extracting design token values
export type DesignTokenValue<T> = T extends Record<string, infer U> ? U : never