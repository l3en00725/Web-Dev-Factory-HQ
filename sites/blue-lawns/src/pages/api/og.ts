import { ImageResponse } from '@vercel/og';
import type { APIRoute } from 'astro';
import React from 'react';

export const runtime = 'edge';

export const GET: APIRoute = async ({ request }) => {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title') || "Love Your Lawn Again.";
    const image = searchParams.get('image') || "/opengraph.jpg";

    // Make image URL absolute if it's relative
    const imageUrl = image.startsWith('http') 
      ? image 
      : `${new URL(request.url).origin}${image.startsWith('/') ? image : `/${image}`}`;

    return new ImageResponse(
      React.createElement(
        'div',
        {
          style: {
            width: "1200px",
            height: "630px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            textAlign: "center",
            padding: "40px",
          },
        },
        React.createElement(
          'div',
          {
            style: {
              fontSize: "72px",
              fontWeight: "bold",
              color: "white",
              textShadow: "0 4px 12px rgba(0,0,0,0.4)",
            },
          },
          title
        )
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
