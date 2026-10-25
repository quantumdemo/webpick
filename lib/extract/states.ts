export interface ComponentStateStyle {
  state: 'default' | 'hover' | 'focus' | 'active' | 'disabled';
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  boxShadow: string;
  transform?: string;
  opacity?: string;
}

export interface InteractiveComponentSpec {
  name: string;
  selector: string;
  states: Record<string, ComponentStateStyle>;
}

export async function captureElementStates(page: any, selector: string, componentName: string): Promise<InteractiveComponentSpec | null> {
  try {
    const el = await page.$(selector);
    if (!el) return null;

    const getStyle = async () => {
      return await page.evaluate((sel: string) => {
        const target = document.querySelector(sel);
        if (!target) return null;
        const s = window.getComputedStyle(target);
        return {
          backgroundColor: s.backgroundColor,
          textColor: s.color,
          borderColor: s.borderColor,
          boxShadow: s.boxShadow,
          transform: s.transform,
          opacity: s.opacity,
        };
      }, selector);
    };

    const defaultStyle = await getStyle();
    if (!defaultStyle) return null;

    const states: Record<string, ComponentStateStyle> = {
      default: { state: 'default', ...defaultStyle },
    };

    // Simulate Hover
    try {
      await el.hover();
      await new Promise((resolve) => setTimeout(resolve, 100));
      const hoverStyle = await getStyle();
      if (hoverStyle) states.hover = { state: 'hover', ...hoverStyle };
    } catch {}

    // Simulate Focus
    try {
      await el.focus();
      await new Promise((resolve) => setTimeout(resolve, 100));
      const focusStyle = await getStyle();
      if (focusStyle) states.focus = { state: 'focus', ...focusStyle };
    } catch {}

    return {
      name: componentName,
      selector,
      states,
    };
  } catch (err) {
    console.warn(`Failed state capture for ${componentName}`, err);
    return null;
  }
}
