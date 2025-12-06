// templates/client-base/src/pages/api/og.ts
import { ImageResponse } from '@vercel/og';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  try {
    const { searchParams } = new URL(request.url);

    // Extract params
    const title = searchParams.get('title') || 'Web Dev Factory';
    const subtitle = searchParams.get('subtitle') || '';
    const brandColorParam = searchParams.get('color') || '#3b82f6'; // Default blue
    const logoParam = searchParams.get('logo');

    // Enforce absolute URLs only for logo
    let logo: string | null = null;
    if (logoParam) {
      try {
        const parsed = new URL(logoParam);
        logo = parsed.toString();
      } catch {
        logo = null;
      }
    }

    const brandColor = brandColorParam;

    const element = {
      type: 'div',
      props: {
        style: {
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ffffff',
          backgroundImage: `radial-gradient(circle at 25px 25px, ${brandColor}20 2%, transparent 0%), radial-gradient(circle at 75px 75px, ${brandColor}20 2%, transparent 0%)`,
          backgroundSize: '100px 100px',
          fontFamily: 'Inter, sans-serif',
          position: 'relative',
        },
        children: [
          // Logo
          logo
            ? {
                type: 'img',
                props: {
                  src: logo,
                  width: 120,
                  height: 120,
                  style: {
                    objectFit: 'contain',
                    marginBottom: 40,
                  },
                },
              }
            : {
                type: 'div',
                props: {
                  style: {
                    width: 80,
                    height: 80,
                    backgroundColor: brandColor,
                    borderRadius: 20,
                    marginBottom: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: 40,
                    fontWeight: 'bold',
                  },
                  children: title[0],
                },
              },
          // Content Container
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '0 60px',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: 70,
                      fontWeight: 900,
                      letterSpacing: '-0.02em',
                      color: '#1a202c',
                      marginBottom: subtitle ? 20 : 0,
                      lineHeight: 1.1,
                    },
                    children: title,
                  },
                },
                subtitle && {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: 32,
                      fontWeight: 500,
                      color: '#64748b',
                    },
                    children: subtitle,
                  },
                },
              ].filter(Boolean),
            },
          },
          // Footer Decoration
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 16,
                backgroundColor: brandColor,
              },
            },
          },
        ],
      },
    };

    // Cast to any to satisfy the ImageResponse ReactElement constraint
    return new ImageResponse(element as any, {
      width: 1200,
      height: 630,
    });
  } catch (e: any) {
    console.error(e);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
};

