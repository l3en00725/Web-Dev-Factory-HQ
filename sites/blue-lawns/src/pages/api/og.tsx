import { ImageResponse } from '@vercel/og';
import type { APIRoute } from 'astro';

export const runtime = 'edge';

export const GET: APIRoute = async ({ request }) => {
  try {
    const { searchParams, origin } = new URL(request.url);
    const title = searchParams.get('title') || "Love Your Lawn Again.";
    const imageParam = searchParams.get('image');
    
    // Get image URL - decode and make absolute if relative
    let imageUrl = `${origin}/opengraph.jpg`; // Default fallback
    if (imageParam) {
      const decodedImage = decodeURIComponent(imageParam);
      if (decodedImage.startsWith('http')) {
        imageUrl = decodedImage;
      } else {
        // Relative path - make it absolute
        imageUrl = `${origin}${decodedImage.startsWith('/') ? decodedImage : `/${decodedImage}`}`;
      }
    }

    return new ImageResponse(
      (
        <div
          style={{
            width: "1200px",
            height: "630px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            position: "relative",
          }}
        >
          {/* Dark overlay for text readability */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.4)",
            }}
          />
          
          {/* Title text */}
          <div
            style={{
              fontSize: "72px",
              fontWeight: "bold",
              color: "white",
              textShadow: "0 4px 12px rgba(0,0,0,0.6)",
              textAlign: "center",
              padding: "40px",
              position: "relative",
              zIndex: 1,
              maxWidth: "1000px",
            }}
          >
            {title}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.error('OG Image generation error:', e);
    return new Response(`Failed to generate the image: ${e.message}`, {
      status: 500,
    });
  }
};

