import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { PlusIcon } from '@heroicons/vue/24/outline'
import PapyonButton from '../PapyonButton.vue'

describe('PapyonButton', () => {
  it('renders with default props', () => {
    const wrapper = mount(PapyonButton, {
      slots: {
        default: 'Click me'
      }
    })

    expect(wrapper.text()).toBe('Click me')
    expect(wrapper.classes()).toContain('bg-primary-black')
    expect(wrapper.classes()).toContain('text-primary-white')
    expect(wrapper.classes()).toContain('px-4')
    expect(wrapper.classes()).toContain('py-2')
  })

  it('renders primary variant correctly', () => {
    const wrapper = mount(PapyonButton, {
      props: {
        variant: 'primary'
      },
      slots: {
        default: 'Primary Button'
      }
    })

    expect(wrapper.classes()).toContain('bg-primary-black')
    expect(wrapper.classes()).toContain('text-primary-white')
    expect(wrapper.classes()).toContain('border-primary-black')
  })

  it('renders secondary variant correctly', () => {
    const wrapper = mount(PapyonButton, {
      props: {
        variant: 'secondary'
      },
      slots: {
        default: 'Secondary Button'
      }
    })

    expect(wrapper.classes()).toContain('bg-primary-white')
    expect(wrapper.classes()).toContain('text-primary-black')
    expect(wrapper.classes()).toContain('border-gray-300')
  })

  it('renders ghost variant correctly', () => {
    const wrapper = mount(PapyonButton, {
      props: {
        variant: 'ghost'
      },
      slots: {
        default: 'Ghost Button'
      }
    })

    expect(wrapper.classes()).toContain('bg-transparent')
    expect(wrapper.classes()).toContain('text-gray-700')
    expect(wrapper.classes()).toContain('border-transparent')
  })

  it('renders danger variant correctly', () => {
    const wrapper = mount(PapyonButton, {
      props: {
        variant: 'danger'
      },
      slots: {
        default: 'Danger Button'
      }
    })

    expect(wrapper.classes()).toContain('bg-accent-red')
    expect(wrapper.classes()).toContain('text-primary-white')
    expect(wrapper.classes()).toContain('border-accent-red')
  })

  it('renders small size correctly', () => {
    const wrapper = mount(PapyonButton, {
      props: {
        size: 'sm'
      },
      slots: {
        default: 'Small Button'
      }
    })

    expect(wrapper.classes()).toContain('px-3')
    expect(wrapper.classes()).toContain('py-1.5')
    expect(wrapper.classes()).toContain('text-sm')
    expect(wrapper.classes()).toContain('min-h-[32px]')
  })

  it('renders medium size correctly', () => {
    const wrapper = mount(PapyonButton, {
      props: {
        size: 'md'
      },
      slots: {
        default: 'Medium Button'
      }
    })

    expect(wrapper.classes()).toContain('px-4')
    expect(wrapper.classes()).toContain('py-2')
    expect(wrapper.classes()).toContain('min-h-[40px]')
  })

  it('renders large size correctly', () => {
    const wrapper = mount(PapyonButton, {
      props: {
        size: 'lg'
      },
      slots: {
        default: 'Large Button'
      }
    })

    expect(wrapper.classes()).toContain('px-6')
    expect(wrapper.classes()).toContain('py-3')
    expect(wrapper.classes()).toContain('text-base')
    expect(wrapper.classes()).toContain('min-h-[48px]')
  })

  it('handles disabled state correctly', () => {
    const wrapper = mount(PapyonButton, {
      props: {
        disabled: true
      },
      slots: {
        default: 'Disabled Button'
      }
    })

    expect(wrapper.element.disabled).toBe(true)
    expect(wrapper.classes()).toContain('disabled:opacity-50')
    expect(wrapper.classes()).toContain('disabled:cursor-not-allowed')
  })

  it('handles loading state correctly', () => {
    const wrapper = mount(PapyonButton, {
      props: {
        loading: true
      },
      slots: {
        default: 'Loading Button'
      }
    })

    expect(wrapper.element.disabled).toBe(true)
    expect(wrapper.find('svg').exists()).toBe(true)
    expect(wrapper.find('svg').classes()).toContain('animate-spin')
  })

  it('renders left icon correctly', () => {
    const wrapper = mount(PapyonButton, {
      props: {
        icon: PlusIcon,
        iconPosition: 'left'
      },
      slots: {
        default: 'Button with Icon'
      }
    })

    const icon = wrapper.findComponent(PlusIcon)
    expect(icon.exists()).toBe(true)
    expect(icon.classes()).toContain('mr-2')
    expect(icon.classes()).toContain('h-4')
    expect(icon.classes()).toContain('w-4')
  })

  it('renders right icon correctly', () => {
    const wrapper = mount(PapyonButton, {
      props: {
        icon: PlusIcon,
        iconPosition: 'right'
      },
      slots: {
        default: 'Button with Icon'
      }
    })

    const icon = wrapper.findComponent(PlusIcon)
    expect(icon.exists()).toBe(true)
    expect(icon.classes()).toContain('ml-2')
  })

  it('hides icon when loading', () => {
    const wrapper = mount(PapyonButton, {
      props: {
        icon: PlusIcon,
        loading: true
      },
      slots: {
        default: 'Loading Button'
      }
    })

    expect(wrapper.findComponent(PlusIcon).exists()).toBe(false)
    expect(wrapper.find('svg.animate-spin').exists()).toBe(true)
  })

  it('emits click event when clicked', async () => {
    const wrapper = mount(PapyonButton, {
      slots: {
        default: 'Click me'
      }
    })

    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('does not emit click event when disabled', async () => {
    const wrapper = mount(PapyonButton, {
      props: {
        disabled: true
      },
      slots: {
        default: 'Disabled Button'
      }
    })

    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('does not emit click event when loading', async () => {
    const wrapper = mount(PapyonButton, {
      props: {
        loading: true
      },
      slots: {
        default: 'Loading Button'
      }
    })

    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('sets correct button type', () => {
    const wrapper = mount(PapyonButton, {
      props: {
        type: 'submit'
      },
      slots: {
        default: 'Submit Button'
      }
    })

    expect(wrapper.element.type).toBe('submit')
  })

  it('has proper accessibility attributes', () => {
    const wrapper = mount(PapyonButton, {
      props: {
        disabled: true
      },
      slots: {
        default: 'Accessible Button'
      }
    })

    expect(wrapper.element.disabled).toBe(true)
    expect(wrapper.classes()).toContain('focus-ring')
  })

  it('applies correct icon size for large button', () => {
    const wrapper = mount(PapyonButton, {
      props: {
        size: 'lg',
        icon: PlusIcon
      },
      slots: {
        default: 'Large Button'
      }
    })

    const icon = wrapper.findComponent(PlusIcon)
    expect(icon.classes()).toContain('h-5')
    expect(icon.classes()).toContain('w-5')
  })
})