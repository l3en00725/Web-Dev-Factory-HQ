// templates/template-resolver.ts
// Template resolution system for multi-template support

import templatesConfig from './config/templates.json';

export interface TemplateConfig {
  templateId: string;
  templateName: string;
  templatePath: string;
  description?: string;
  previewImage?: string | null;
  sectionsPath: string;
  layoutsPath: string;
  stylesPath: string;
}

export interface TemplatesRegistry {
  templates: TemplateConfig[];
  defaultTemplate: string;
}

/**
 * Get template configuration by ID
 */
export function getTemplate(templateId?: string | null): TemplateConfig {
  const registry = templatesConfig as TemplatesRegistry;
  const template = registry.templates.find((t) => t.templateId === templateId);
  
  if (!template) {
    // Fallback to default template
    const defaultTemplate = registry.templates.find(
      (t) => t.templateId === registry.defaultTemplate
    );
    if (!defaultTemplate) {
      throw new Error(
        `Template "${templateId}" not found and default template "${registry.defaultTemplate}" is missing`
      );
    }
    return defaultTemplate;
  }
  
  return template;
}

/**
 * Get all available templates
 */
export function getAllTemplates(): TemplateConfig[] {
  const registry = templatesConfig as TemplatesRegistry;
  return registry.templates;
}

/**
 * Resolve section component path for a template
 */
export function resolveSectionPath(
  templateId: string | null | undefined,
  sectionType: string
): string {
  const template = getTemplate(templateId);
  // Return relative path from template root to section component
  // This will be used for dynamic imports in PageBuilder
  return `${template.templatePath}/${template.sectionsPath}/${sectionType}.astro`;
}

/**
 * Resolve layout component path for a template
 */
export function resolveLayoutPath(
  templateId: string | null | undefined,
  layoutName: string = 'Base'
): string {
  const template = getTemplate(templateId);
  return `${template.templatePath}/${template.layoutsPath}/${layoutName}.astro`;
}

/**
 * Validate template ID exists
 */
export function isValidTemplate(templateId: string): boolean {
  const registry = templatesConfig as TemplatesRegistry;
  return registry.templates.some((t) => t.templateId === templateId);
}

