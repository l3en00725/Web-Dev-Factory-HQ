import type { OgTemplateConfig, OgTemplateProps, OgTheme } from './og-template';

export interface SanityOgTemplate {
  templateStyle?: string | null;
  backgroundColor?: string | null;
  textColor?: string | null;
  overlayImage?: {
    asset?: {
      _ref?: string;
      _id?: string;
      url?: string;
    } | null;
    url?: string | null;
  } | null;
  defaultTitle?: string | null;
  defaultSubtitle?: string | null;
}

export interface OgRequestParams {
  title?: string | null;
  subtitle?: string | null;
  image?: string | null;
  theme?: OgTheme;
}

export function parseOgRequestParams(
  searchParams: URLSearchParams,
): OgRequestParams {
  const themeParam = searchParams.get('theme');
  const normalizedTheme = themeParam
    ? (themeParam.toLowerCase() as OgTheme)
    : undefined;

  const theme: OgTheme | undefined =
    normalizedTheme === 'light' || normalizedTheme === 'dark' || normalizedTheme === 'brand'
      ? normalizedTheme
      : undefined;

  return {
    title: searchParams.get('title'),
    subtitle: searchParams.get('subtitle'),
    image: searchParams.get('image'),
    theme,
  };
}

/**
 * Very lightweight Sanity image URL resolver.
 * Expects either a direct `url` on the field or on `overlayImage.asset`.
 * More advanced URL building can be layered on by the pipeline later.
 */
export function resolveOgImageUrl(
  template?: SanityOgTemplate | null,
  explicitImage?: string | null,
): string | undefined {
  if (explicitImage) return explicitImage;

  const overlay = template?.overlayImage;
  if (!overlay) return undefined;

  if (overlay.url) return overlay.url;
  if (overlay.asset?.url) return overlay.asset.url;

  return undefined;
}

/**
 * Map a Sanity OG template + query params into OgTemplate React props
 * used by the /api/og route.
 */
export function mapSanityTemplateToOgProps(
  template: SanityOgTemplate,
  params: OgRequestParams,
): OgTemplateProps & { template: OgTemplateConfig } {
  const imageUrl = resolveOgImageUrl(template, params.image || null);

  const resolvedTemplate: OgTemplateConfig = {
    templateStyle: template.templateStyle || undefined,
    backgroundColor: template.backgroundColor || undefined,
    textColor: template.textColor || undefined,
    overlayImageUrl: imageUrl || null,
    defaultTitle: template.defaultTitle || null,
    defaultSubtitle: template.defaultSubtitle || null,
  };

  return {
    title: params.title || template.defaultTitle || null,
    subtitle: params.subtitle || template.defaultSubtitle || null,
    imageUrl,
    theme: params.theme,
    template: resolvedTemplate,
  };
}

/**
 * Generate a per-site default OG template configuration.
 * Downstream pipeline steps can override this with values from
 * Sanity `settings.ogTemplate` and brand colors.
 */
export function getDefaultOgTemplate(siteName?: string): SanityOgTemplate {
  const safeSiteName = siteName || 'Web-Dev-Factory Site';

  return {
    templateStyle: 'brand',
    backgroundColor: '#00382A',
    textColor: '#ffffff',
    defaultTitle: safeSiteName,
    defaultSubtitle: 'High-performance sites by Web-Dev-Factory',
    overlayImage: null,
  };
}


