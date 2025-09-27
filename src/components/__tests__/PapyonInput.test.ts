import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { UserIcon, EnvelopeIcon } from '@heroicons/vue/24/outline'
import PapyonInput from '../PapyonInput.vue'

describe('PapyonInput', () => {
  it('renders with default props', () => {
    const wrapper = mount(PapyonInput)
    const input = wrapper.find('input')

    expect(input.exists()).toBe(true)
    expect(input.attributes('type')).toBe('text')
    expect(input.classes()).toContain('px-3')
    expect(input.classes()).toContain('py-2')
    expect(input.classes()).toContain('border-gray-300')
  })

  it('renders with label', () => {
    const wrapper = mount(PapyonInput, {
      props: {
        label: 'Username'
      }
    })

    const label = wrapper.find('label')
    expect(label.exists()).toBe(true)
    expect(label.text()).toBe('Username')
  })

  it('renders required asterisk when required', () => {
    const wrapper = mount(PapyonInput, {
      props: {
        label: 'Email',
        required: true
      }
    })

    const asterisk = wrapper.find('span.text-accent-red')
    expect(asterisk.exists()).toBe(true)
    expect(asterisk.text()).toBe('*')
  })

  it('renders different input types correctly', () => {
    const types = ['text', 'email', 'password', 'number', 'tel', 'url', 'search'] as const
    
    types.forEach(type => {
      const wrapper = mount(PapyonInput, {
        props: { type }
      })
      
      expect(wrapper.find('input').attributes('type')).toBe(type)
    })
  })

  it('renders small size correctly', () => {
    const wrapper = mount(PapyonInput, {
      props: {
        size: 'sm'
      }
    })

    const input = wrapper.find('input')
    expect(input.classes()).toContain('px-3')
    expect(input.classes()).toContain('py-1.5')
    expect(input.classes()).toContain('text-sm')
    expect(input.classes()).toContain('min-h-[32px]')
  })

  it('renders medium size correctly', () => {
    const wrapper = mount(PapyonInput, {
      props: {
        size: 'md'
      }
    })

    const input = wrapper.find('input')
    expect(input.classes()).toContain('px-3')
    expect(input.classes()).toContain('py-2')
    expect(input.classes()).toContain('min-h-[40px]')
  })

  it('renders large size correctly', () => {
    const wrapper = mount(PapyonInput, {
      props: {
        size: 'lg'
      }
    })

    const input = wrapper.find('input')
    expect(input.classes()).toContain('px-4')
    expect(input.classes()).toContain('py-3')
    expect(input.classes()).toContain('text-base')
    expect(input.classes()).toContain('min-h-[48px]')
  })

  it('renders error state correctly', () => {
    const wrapper = mount(PapyonInput, {
      props: {
        state: 'error',
        errorMessage: 'This field is required'
      }
    })

    const input = wrapper.find('input')
    expect(input.classes()).toContain('border-accent-red')
    expect(input.classes()).toContain('focus:border-accent-red')
    expect(input.classes()).toContain('focus:ring-accent-red')
    expect(input.attributes('aria-invalid')).toBe('true')

    const helpText = wrapper.find('[id^="papyon-help-"]')
    expect(helpText.exists()).toBe(true)
    expect(helpText.text()).toBe('This field is required')
    expect(helpText.classes()).toContain('text-accent-red')
  })

  it('renders success state correctly', () => {
    const wrapper = mount(PapyonInput, {
      props: {
        state: 'success',
        helpText: 'Looks good!'
      }
    })

    const input = wrapper.find('input')
    expect(input.classes()).toContain('border-accent-green')
    expect(input.classes()).toContain('focus:border-accent-green')
    expect(input.classes()).toContain('focus:ring-accent-green')

    const helpText = wrapper.find('[id^="papyon-help-"]')
    expect(helpText.exists()).toBe(true)
    expect(helpText.text()).toBe('Looks good!')
    expect(helpText.classes()).toContain('text-accent-green')
  })

  it('renders left icon correctly', () => {
    const wrapper = mount(PapyonInput, {
      props: {
        icon: UserIcon,
        iconPosition: 'left'
      }
    })

    const icon = wrapper.findComponent(UserIcon)
    expect(icon.exists()).toBe(true)
    expect(icon.classes()).toContain('h-5')
    expect(icon.classes()).toContain('w-5')
    expect(icon.classes()).toContain('text-gray-400')

    const input = wrapper.find('input')
    expect(input.classes()).toContain('pl-10')
  })

  it('renders right icon correctly', () => {
    const wrapper = mount(PapyonInput, {
      props: {
        icon: EnvelopeIcon,
        iconPosition: 'right'
      }
    })

    const icon = wrapper.findComponent(EnvelopeIcon)
    expect(icon.exists()).toBe(true)

    const input = wrapper.find('input')
    expect(input.classes()).toContain('pr-10')
  })

  it('adjusts icon padding for different sizes', () => {
    const smallWrapper = mount(PapyonInput, {
      props: {
        size: 'sm',
        icon: UserIcon,
        iconPosition: 'left'
      }
    })
    expect(smallWrapper.find('input').classes()).toContain('pl-9')

    const largeWrapper = mount(PapyonInput, {
      props: {
        size: 'lg',
        icon: UserIcon,
        iconPosition: 'left'
      }
    })
    expect(largeWrapper.find('input').classes()).toContain('pl-11')
  })

  it('handles disabled state correctly', () => {
    const wrapper = mount(PapyonInput, {
      props: {
        disabled: true
      }
    })

    const input = wrapper.find('input')
    expect(input.element.disabled).toBe(true)
    expect(input.classes()).toContain('disabled:opacity-50')
    expect(input.classes()).toContain('disabled:cursor-not-allowed')
    expect(input.classes()).toContain('disabled:bg-gray-50')
  })

  it('handles readonly state correctly', () => {
    const wrapper = mount(PapyonInput, {
      props: {
        readonly: true
      }
    })

    const input = wrapper.find('input')
    expect(input.element.readOnly).toBe(true)
  })

  it('handles placeholder correctly', () => {
    const wrapper = mount(PapyonInput, {
      props: {
        placeholder: 'Enter your name'
      }
    })

    const input = wrapper.find('input')
    expect(input.attributes('placeholder')).toBe('Enter your name')
  })

  it('emits update:modelValue on input', async () => {
    const wrapper = mount(PapyonInput)
    const input = wrapper.find('input')

    await input.setValue('test value')
    expect(wrapper.emitted('update:modelValue')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['test value'])
  })

  it('emits number value for number input type', async () => {
    const wrapper = mount(PapyonInput, {
      props: {
        type: 'number'
      }
    })
    const input = wrapper.find('input')

    await input.setValue('123')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([123])
  })

  it('emits focus and blur events', async () => {
    const wrapper = mount(PapyonInput)
    const input = wrapper.find('input')

    await input.trigger('focus')
    expect(wrapper.emitted('focus')).toHaveLength(1)

    await input.trigger('blur')
    expect(wrapper.emitted('blur')).toHaveLength(1)
  })

  it('sets correct accessibility attributes', () => {
    const wrapper = mount(PapyonInput, {
      props: {
        label: 'Username',
        required: true,
        helpText: 'Enter your username'
      }
    })

    const input = wrapper.find('input')
    const label = wrapper.find('label')
    const helpText = wrapper.find('[id^="papyon-help-"]')

    expect(input.attributes('required')).toBeDefined()
    expect(input.attributes('aria-describedby')).toBe(helpText.attributes('id'))
    expect(label.attributes('for')).toBe(input.attributes('id'))
  })

  it('shows error message over help text when in error state', () => {
    const wrapper = mount(PapyonInput, {
      props: {
        state: 'error',
        helpText: 'This is help text',
        errorMessage: 'This is an error'
      }
    })

    const helpText = wrapper.find('[id^="papyon-help-"]')
    expect(helpText.text()).toBe('This is an error')
  })

  it('renders help text when not in error state', () => {
    const wrapper = mount(PapyonInput, {
      props: {
        helpText: 'This is help text'
      }
    })

    const helpText = wrapper.find('[id^="papyon-help-"]')
    expect(helpText.text()).toBe('This is help text')
  })

  it('applies correct icon color based on state', () => {
    const errorWrapper = mount(PapyonInput, {
      props: {
        state: 'error',
        icon: UserIcon
      }
    })
    expect(errorWrapper.findComponent(UserIcon).classes()).toContain('text-accent-red')

    const successWrapper = mount(PapyonInput, {
      props: {
        state: 'success',
        icon: UserIcon
      }
    })
    expect(successWrapper.findComponent(UserIcon).classes()).toContain('text-accent-green')
  })
})