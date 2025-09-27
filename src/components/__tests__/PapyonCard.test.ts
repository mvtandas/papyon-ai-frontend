import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import PapyonCard from '../PapyonCard.vue'

describe('PapyonCard', () => {
  it('renders with default props', () => {
    const wrapper = mount(PapyonCard, {
      slots: {
        default: 'Card content'
      }
    })

    expect(wrapper.text()).toBe('Card content')
    expect(wrapper.classes()).toContain('bg-primary-white')
    expect(wrapper.classes()).toContain('border')
    expect(wrapper.classes()).toContain('border-gray-200')
    expect(wrapper.classes()).toContain('rounded-lg')
  })

  it('renders default variant correctly', () => {
    const wrapper = mount(PapyonCard, {
      props: {
        variant: 'default'
      },
      slots: {
        default: 'Default card'
      }
    })

    expect(wrapper.classes()).toContain('bg-primary-white')
    expect(wrapper.classes()).toContain('border')
    expect(wrapper.classes()).toContain('border-gray-200')
    expect(wrapper.classes()).not.toContain('shadow-md')
  })

  it('renders elevated variant correctly', () => {
    const wrapper = mount(PapyonCard, {
      props: {
        variant: 'elevated'
      },
      slots: {
        default: 'Elevated card'
      }
    })

    expect(wrapper.classes()).toContain('bg-primary-white')
    expect(wrapper.classes()).toContain('shadow-md')
    expect(wrapper.classes()).toContain('border')
    expect(wrapper.classes()).toContain('border-gray-100')
  })

  it('renders outlined variant correctly', () => {
    const wrapper = mount(PapyonCard, {
      props: {
        variant: 'outlined'
      },
      slots: {
        default: 'Outlined card'
      }
    })

    expect(wrapper.classes()).toContain('bg-primary-white')
    expect(wrapper.classes()).toContain('border-2')
    expect(wrapper.classes()).toContain('border-gray-300')
  })

  it('renders small padding correctly', () => {
    const wrapper = mount(PapyonCard, {
      props: {
        padding: 'sm'
      },
      slots: {
        default: 'Small padding card'
      }
    })

    const content = wrapper.find('.papyon-card-content')
    expect(content.classes()).toContain('p-4')
  })

  it('renders medium padding correctly', () => {
    const wrapper = mount(PapyonCard, {
      props: {
        padding: 'md'
      },
      slots: {
        default: 'Medium padding card'
      }
    })

    const content = wrapper.find('.papyon-card-content')
    expect(content.classes()).toContain('p-6')
  })

  it('renders large padding correctly', () => {
    const wrapper = mount(PapyonCard, {
      props: {
        padding: 'lg'
      },
      slots: {
        default: 'Large padding card'
      }
    })

    const content = wrapper.find('.papyon-card-content')
    expect(content.classes()).toContain('p-8')
  })

  it('applies hover effects when hover prop is true', () => {
    const wrapper = mount(PapyonCard, {
      props: {
        hover: true
      },
      slots: {
        default: 'Hoverable card'
      }
    })

    expect(wrapper.classes()).toContain('hover:shadow-md')
    expect(wrapper.classes()).toContain('hover:-translate-y-0.5')
  })

  it('applies elevated hover effects for elevated variant', () => {
    const wrapper = mount(PapyonCard, {
      props: {
        variant: 'elevated',
        hover: true
      },
      slots: {
        default: 'Elevated hoverable card'
      }
    })

    expect(wrapper.classes()).toContain('hover:shadow-lg')
    expect(wrapper.classes()).toContain('hover:shadow-gray-200/50')
  })

  it('makes card clickable when clickable prop is true', () => {
    const wrapper = mount(PapyonCard, {
      props: {
        clickable: true
      },
      slots: {
        default: 'Clickable card'
      }
    })

    expect(wrapper.classes()).toContain('cursor-pointer')
    expect(wrapper.classes()).toContain('focus:outline-none')
    expect(wrapper.classes()).toContain('focus:ring-2')
    expect(wrapper.classes()).toContain('hover:shadow-md')
  })

  it('emits click event when clickable and clicked', async () => {
    const wrapper = mount(PapyonCard, {
      props: {
        clickable: true
      },
      slots: {
        default: 'Clickable card'
      }
    })

    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('does not emit click event when not clickable', async () => {
    const wrapper = mount(PapyonCard, {
      props: {
        clickable: false
      },
      slots: {
        default: 'Non-clickable card'
      }
    })

    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('renders without rounded corners when rounded is false', () => {
    const wrapper = mount(PapyonCard, {
      props: {
        rounded: false
      },
      slots: {
        default: 'Square card'
      }
    })

    expect(wrapper.classes()).not.toContain('rounded-lg')
  })

  it('renders header slot correctly', () => {
    const wrapper = mount(PapyonCard, {
      slots: {
        header: 'Card Header',
        default: 'Card Content'
      }
    })

    const header = wrapper.find('.papyon-card-header')
    expect(header.exists()).toBe(true)
    expect(header.text()).toBe('Card Header')
    expect(header.classes()).toContain('border-b')
    expect(header.classes()).toContain('border-gray-200')
    expect(header.classes()).toContain('px-6')
    expect(header.classes()).toContain('py-4')
  })

  it('renders footer slot correctly', () => {
    const wrapper = mount(PapyonCard, {
      slots: {
        default: 'Card Content',
        footer: 'Card Footer'
      }
    })

    const footer = wrapper.find('.papyon-card-footer')
    expect(footer.exists()).toBe(true)
    expect(footer.text()).toBe('Card Footer')
    expect(footer.classes()).toContain('border-t')
    expect(footer.classes()).toContain('border-gray-200')
    expect(footer.classes()).toContain('bg-gray-50')
    expect(footer.classes()).toContain('px-6')
    expect(footer.classes()).toContain('py-4')
  })

  it('applies correct header padding for different sizes', () => {
    const smallWrapper = mount(PapyonCard, {
      props: {
        padding: 'sm'
      },
      slots: {
        header: 'Header',
        default: 'Content'
      }
    })
    const smallHeader = smallWrapper.find('.papyon-card-header')
    expect(smallHeader.classes()).toContain('px-4')
    expect(smallHeader.classes()).toContain('py-3')

    const largeWrapper = mount(PapyonCard, {
      props: {
        padding: 'lg'
      },
      slots: {
        header: 'Header',
        default: 'Content'
      }
    })
    const largeHeader = largeWrapper.find('.papyon-card-header')
    expect(largeHeader.classes()).toContain('px-8')
    expect(largeHeader.classes()).toContain('py-6')
  })

  it('applies correct footer padding for different sizes', () => {
    const smallWrapper = mount(PapyonCard, {
      props: {
        padding: 'sm'
      },
      slots: {
        default: 'Content',
        footer: 'Footer'
      }
    })
    const smallFooter = smallWrapper.find('.papyon-card-footer')
    expect(smallFooter.classes()).toContain('px-4')
    expect(smallFooter.classes()).toContain('py-3')

    const largeWrapper = mount(PapyonCard, {
      props: {
        padding: 'lg'
      },
      slots: {
        default: 'Content',
        footer: 'Footer'
      }
    })
    const largeFooter = largeWrapper.find('.papyon-card-footer')
    expect(largeFooter.classes()).toContain('px-8')
    expect(largeFooter.classes()).toContain('py-6')
  })

  it('applies rounded corners to header and footer when rounded is true', () => {
    const wrapper = mount(PapyonCard, {
      props: {
        rounded: true
      },
      slots: {
        header: 'Header',
        default: 'Content',
        footer: 'Footer'
      }
    })

    const header = wrapper.find('.papyon-card-header')
    const footer = wrapper.find('.papyon-card-footer')
    
    expect(header.classes()).toContain('rounded-t-lg')
    expect(footer.classes()).toContain('rounded-b-lg')
  })

  it('does not apply rounded corners to header and footer when rounded is false', () => {
    const wrapper = mount(PapyonCard, {
      props: {
        rounded: false
      },
      slots: {
        header: 'Header',
        default: 'Content',
        footer: 'Footer'
      }
    })

    const header = wrapper.find('.papyon-card-header')
    const footer = wrapper.find('.papyon-card-footer')
    
    expect(header.classes()).not.toContain('rounded-t-lg')
    expect(footer.classes()).not.toContain('rounded-b-lg')
  })

  it('renders only content when no header or footer slots provided', () => {
    const wrapper = mount(PapyonCard, {
      slots: {
        default: 'Only content'
      }
    })

    expect(wrapper.find('.papyon-card-header').exists()).toBe(false)
    expect(wrapper.find('.papyon-card-footer').exists()).toBe(false)
    expect(wrapper.find('.papyon-card-content').exists()).toBe(true)
    expect(wrapper.find('.papyon-card-content').text()).toBe('Only content')
  })

  it('has proper transition classes for smooth animations', () => {
    const wrapper = mount(PapyonCard, {
      slots: {
        default: 'Animated card'
      }
    })

    expect(wrapper.classes()).toContain('transition-all')
    expect(wrapper.classes()).toContain('duration-200')
  })
})