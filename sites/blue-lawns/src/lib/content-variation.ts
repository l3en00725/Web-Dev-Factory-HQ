// templates/client-base/src/lib/content-variation.ts

export interface VariationContext {
  location?: {
    city: string;
    state: string;
    region?: string;
  };
  service?: {
    name: string;
    category?: string;
  };
  keywords?: {
    primary: string;
    secondary: string[];
  };
}

/**
 * Applies content variations based on context.
 * Replaces placeholders and adjusts tone/phrasing.
 * 
 * Placeholders:
 * {{city}} -> context.location.city
 * {{state}} -> context.location.state
 * {{service}} -> context.service.name
 * {{keyword}} -> context.keywords.primary
 */
export function applyContentVariation(text: string | undefined, context: VariationContext): string {
  if (!text) return '';
  if (!context) return text;

  let variedText = text;

  // 1. Placeholder Replacement
  if (context.location?.city) {
    variedText = variedText.replace(/{{city}}/gi, context.location.city);
  }
  if (context.location?.state) {
    variedText = variedText.replace(/{{state}}/gi, context.location.state);
  }
  if (context.service?.name) {
    variedText = variedText.replace(/{{service}}/gi, context.service.name);
  }
  if (context.keywords?.primary) {
    variedText = variedText.replace(/{{keyword}}/gi, context.keywords.primary);
  }

  // 2. Dynamic Location Injection (if not explicitly placed)
  // If text mentions "services" but not the city, append "in [City]" occasionally
  // This is a simple heuristic; LLM-generated content should already be specific.
  if (
    context.location?.city &&
    !variedText.includes(context.location.city) &&
    (variedText.toLowerCase().includes('service') || variedText.toLowerCase().includes('provider')) &&
    Math.random() > 0.7 // 30% chance to inject if missing
  ) {
    variedText += ` in ${context.location.city}`;
  }

  return variedText;
}

/**
 * Recursive function to apply variations to an entire object/component props
 */
export function varyComponentProps(props: any, context: VariationContext): any {
  if (!props) return props;
  if (typeof props === 'string') return applyContentVariation(props, context);
  if (Array.isArray(props)) return props.map(item => varyComponentProps(item, context));
  if (typeof props === 'object') {
    const newProps: any = {};
    for (const key in props) {
      // Skip internal Sanity fields
      if (key.startsWith('_')) {
        newProps[key] = props[key];
      } else {
        newProps[key] = varyComponentProps(props[key], context);
      }
    }
    return newProps;
  }
  return props;
}

