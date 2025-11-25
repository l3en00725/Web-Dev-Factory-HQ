import React from 'react';

export type OgTheme = 'light' | 'dark' | 'brand';

export interface OgTemplateConfig {
  templateStyle?: string | null;
  backgroundColor?: string | null;
  textColor?: string | null;
  overlayImageUrl?: string | null;
  defaultTitle?: string | null;
  defaultSubtitle?: string | null;
}

export interface OgTemplateProps {
  title?: string | null;
  subtitle?: string | null;
  imageUrl?: string | null;
  theme?: OgTheme;
  template?: OgTemplateConfig | null;
}

const BRAND_BACKGROUND = '#00382A';
const BRAND_TEXT = '#ffffff';

const THEME_PRESETS: Record<OgTheme, { backgroundColor: string; textColor: string }> = {
  brand: { backgroundColor: BRAND_BACKGROUND, textColor: BRAND_TEXT },
  dark: { backgroundColor: '#020617', textColor: '#e5e7eb' },
  light: { backgroundColor: '#f9fafb', textColor: '#111827' },
};

function resolveTheme(
  theme: OgTheme | undefined,
  template?: OgTemplateConfig | null,
): { backgroundColor: string; textColor: string } {
  const baseTheme: OgTheme =
    (template?.templateStyle as OgTheme | undefined) || theme || 'brand';

  const preset = THEME_PRESETS[baseTheme] ?? THEME_PRESETS.brand;

  return {
    backgroundColor: template?.backgroundColor || preset.backgroundColor,
    textColor: template?.textColor || preset.textColor,
  };
}

/**
 * Reusable OG React component used by the /api/og route.
 *
 * Matches the requested base structure:
 *
 * <div style={{
 *   display:'flex',
 *   width:'100%',
 *   height:'100%',
 *   background:'#00382A',
 *   color:'white',
 *   justifyContent:'center',
 *   alignItems:'center',
 *   fontSize:'64px',
 *   fontWeight:'bold'
 * }}>
 *   <div>
 *     <div>{title}</div>
 *     {subtitle && <div style={{ marginTop:'20px', fontSize:'36px' }}>{subtitle}</div>}
 *   </div>
 * </div>
 */
export const OgTemplate: React.FC<OgTemplateProps> = ({
  title,
  subtitle,
  imageUrl,
  theme,
  template,
}) => {
  const resolvedTitle =
    title || template?.defaultTitle || 'New Web-Dev-Factory Site';
  const resolvedSubtitle = subtitle || template?.defaultSubtitle || '';
  const { backgroundColor, textColor } = resolveTheme(theme, template || undefined);

  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        background: backgroundColor,
        color: textColor,
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '64px',
        fontWeight: 'bold',
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        position: 'relative',
        padding: '60px',
        boxSizing: 'border-box',
      }}
    >
      <div>
        <div>{resolvedTitle}</div>
        {resolvedSubtitle && (
          <div
            style={{
              marginTop: '20px',
              fontSize: '36px',
              fontWeight: 500,
            }}
          >
            {resolvedSubtitle}
          </div>
        )}
      </div>

      {imageUrl && (
        <img
          src={imageUrl}
          alt=""
          style={{
            position: 'absolute',
            right: '60px',
            bottom: '60px',
            width: '320px',
            height: '320px',
            objectFit: 'cover',
            borderRadius: '24px',
            border: '4px solid rgba(255,255,255,0.25)',
          }}
        />
      )}
    </div>
  );
};


