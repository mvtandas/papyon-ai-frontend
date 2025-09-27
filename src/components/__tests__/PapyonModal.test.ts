import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import PapyonModal from "../PapyonModal.vue";

// Mock Teleport for testing
vi.mock("vue", async () => {
  const actual = await vi.importActual("vue");
  return {
    ...actual,
    Teleport: {
      name: "Teleport",
      props: ["to"],
      setup(props: any, { slots }: any) {
        return () => slots.default?.();
      },
    },
  };
});

describe("PapyonModal", () => {
  let originalBodyOverflow: string;

  beforeEach(() => {
    originalBodyOverflow = document.body.style.overflow;
    // Create a div to act as the modal container
    const modalContainer = document.createElement("div");
    modalContainer.id = "modal-container";
    document.body.appendChild(modalContainer);
  });

  afterEach(() => {
    document.body.style.overflow = originalBodyOverflow;
    // Clean up modal container
    const modalContainer = document.getElementById("modal-container");
    if (modalContainer) {
      document.body.removeChild(modalContainer);
    }
  });

  it("renders when modelValue is true", () => {
    const wrapper = mount(PapyonModal, {
      props: {
        modelValue: true,
      },
      slots: {
        default: "Modal content",
      },
    });

    expect(wrapper.text()).toContain("Modal content");
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true);
  });

  it("does not render when modelValue is false", () => {
    const wrapper = mount(PapyonModal, {
      props: {
        modelValue: false,
      },
      slots: {
        default: "Modal content",
      },
    });

    expect(wrapper.find('[role="dialog"]').exists()).toBe(false);
  });

  it("renders title when provided", () => {
    const wrapper = mount(PapyonModal, {
      props: {
        modelValue: true,
        title: "Test Modal",
      },
    });

    expect(wrapper.text()).toContain("Test Modal");
    expect(wrapper.find("h3").text()).toBe("Test Modal");
  });

  it("renders close button when closable is true", () => {
    const wrapper = mount(PapyonModal, {
      props: {
        modelValue: true,
        closable: true,
      },
    });

    const closeButton = wrapper.find('button[aria-label="Close modal"]');
    expect(closeButton.exists()).toBe(true);
  });

  it("does not render close button when closable is false", () => {
    const wrapper = mount(PapyonModal, {
      props: {
        modelValue: true,
        closable: false,
      },
    });

    const closeButton = wrapper.find('button[aria-label="Close modal"]');
    expect(closeButton.exists()).toBe(false);
  });

  it("applies correct size classes", () => {
    const sizes = ["sm", "md", "lg", "xl", "full"] as const;
    const expectedClasses = {
      sm: "max-w-sm",
      md: "max-w-md",
      lg: "max-w-lg",
      xl: "max-w-2xl",
      full: "max-w-7xl",
    };

    sizes.forEach((size) => {
      const wrapper = mount(PapyonModal, {
        props: {
          modelValue: true,
          size,
        },
      });

      const modal = wrapper.find(".bg-primary-white");
      expect(modal.classes()).toContain(expectedClasses[size]);
    });
  });

  it("applies correct backdrop classes", () => {
    const backdrops = ["blur", "dark", "light"] as const;
    const expectedClasses = {
      blur: "backdrop-blur-sm",
      dark: "bg-gray-900/75",
      light: "bg-gray-500/50",
    };

    backdrops.forEach((backdrop) => {
      const wrapper = mount(PapyonModal, {
        props: {
          modelValue: true,
          backdrop,
        },
      });

      const backdropElement = wrapper.find('[role="dialog"]');
      if (backdrop === "blur") {
        expect(backdropElement.classes()).toContain("backdrop-blur-sm");
      } else {
        expect(backdropElement.classes()).toContain(expectedClasses[backdrop]);
      }
    });
  });

  it("emits update:modelValue and close when close button is clicked", async () => {
    const wrapper = mount(PapyonModal, {
      props: {
        modelValue: true,
        closable: true,
      },
    });

    const closeButton = wrapper.find('button[aria-label="Close modal"]');
    await closeButton.trigger("click");

    expect(wrapper.emitted("update:modelValue")).toHaveLength(1);
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([false]);
    expect(wrapper.emitted("close")).toHaveLength(1);
  });

  it("emits update:modelValue and close when backdrop is clicked and closeOnBackdrop is true", async () => {
    const wrapper = mount(PapyonModal, {
      props: {
        modelValue: true,
        closeOnBackdrop: true,
      },
    });

    const backdrop = wrapper.find('[role="dialog"]');
    await backdrop.trigger("click");

    expect(wrapper.emitted("update:modelValue")).toHaveLength(1);
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([false]);
    expect(wrapper.emitted("close")).toHaveLength(1);
  });

  it("does not close when backdrop is clicked and closeOnBackdrop is false", async () => {
    const wrapper = mount(PapyonModal, {
      props: {
        modelValue: true,
        closeOnBackdrop: false,
      },
    });

    const backdrop = wrapper.find('[role="dialog"]');
    await backdrop.trigger("click");

    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    expect(wrapper.emitted("close")).toBeUndefined();
  });

  it("emits update:modelValue and close when escape key is pressed and closeOnEscape is true", async () => {
    const wrapper = mount(PapyonModal, {
      props: {
        modelValue: true,
        closeOnEscape: true,
      },
    });

    const backdrop = wrapper.find('[role="dialog"]');
    await backdrop.trigger("keydown.esc");

    expect(wrapper.emitted("update:modelValue")).toHaveLength(1);
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([false]);
    expect(wrapper.emitted("close")).toHaveLength(1);
  });

  it("does not close when escape key is pressed and closeOnEscape is false", async () => {
    const wrapper = mount(PapyonModal, {
      props: {
        modelValue: true,
        closeOnEscape: false,
      },
    });

    const backdrop = wrapper.find('[role="dialog"]');
    await backdrop.trigger("keydown.esc");

    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    expect(wrapper.emitted("close")).toBeUndefined();
  });

  it("renders header slot content", () => {
    const wrapper = mount(PapyonModal, {
      props: {
        modelValue: true,
      },
      slots: {
        header: '<div class="custom-header">Custom Header</div>',
      },
    });

    expect(wrapper.find(".custom-header").exists()).toBe(true);
    expect(wrapper.text()).toContain("Custom Header");
  });

  it("renders footer slot content", () => {
    const wrapper = mount(PapyonModal, {
      props: {
        modelValue: true,
      },
      slots: {
        footer: '<div class="custom-footer">Custom Footer</div>',
      },
    });

    expect(wrapper.find(".custom-footer").exists()).toBe(true);
    expect(wrapper.text()).toContain("Custom Footer");
  });

  it("has proper accessibility attributes", () => {
    const wrapper = mount(PapyonModal, {
      props: {
        modelValue: true,
        title: "Accessible Modal",
      },
    });

    const dialog = wrapper.find('[role="dialog"]');
    expect(dialog.attributes("aria-modal")).toBe("true");
    expect(dialog.attributes("aria-labelledby")).toBeDefined();
    expect(dialog.attributes("aria-describedby")).toBeDefined();

    const title = wrapper.find("h3");
    expect(title.attributes("id")).toBe(dialog.attributes("aria-labelledby"));
  });

  it("prevents modal content click from closing modal", async () => {
    const wrapper = mount(PapyonModal, {
      props: {
        modelValue: true,
        closeOnBackdrop: true,
      },
    });

    const modalContent = wrapper.find(".bg-primary-white");
    await modalContent.trigger("click");

    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    expect(wrapper.emitted("close")).toBeUndefined();
  });

  it("applies correct header styling", () => {
    const wrapper = mount(PapyonModal, {
      props: {
        modelValue: true,
        title: "Test Modal",
      },
    });

    const header = wrapper.find(".px-6.py-4.border-b");
    expect(header.exists()).toBe(true);
    expect(header.classes()).toContain("bg-gray-50");
    expect(header.classes()).toContain("border-gray-200");
  });

  it("applies correct content styling", () => {
    const wrapper = mount(PapyonModal, {
      props: {
        modelValue: true,
      },
      slots: {
        default: "Modal content",
      },
    });

    const content = wrapper.find('[id^="papyon-modal-content-"]');
    expect(content.classes()).toContain("px-6");
    expect(content.classes()).toContain("py-4");
  });

  it("applies correct footer styling", () => {
    const wrapper = mount(PapyonModal, {
      props: {
        modelValue: true,
      },
      slots: {
        footer: "Footer content",
      },
    });

    const footer = wrapper.find(".border-t.bg-gray-50");
    expect(footer.exists()).toBe(true);
    expect(footer.classes()).toContain("px-6");
    expect(footer.classes()).toContain("py-4");
    expect(footer.classes()).toContain("flex");
    expect(footer.classes()).toContain("justify-end");
  });

  it("adds scroll classes for full size modal", () => {
    const wrapper = mount(PapyonModal, {
      props: {
        modelValue: true,
        size: "full",
      },
    });

    const content = wrapper.find('[id^="papyon-modal-content-"]');
    expect(content.classes()).toContain("overflow-y-auto");
    expect(content.classes()).toContain("flex-1");
  });

  it("has proper z-index for backdrop", () => {
    const wrapper = mount(PapyonModal, {
      props: {
        modelValue: true,
      },
    });

    const backdrop = wrapper.find('[role="dialog"]');
    expect(backdrop.classes()).toContain("z-50");
  });
});
