import type { APIRoute } from 'astro';
export const POST: APIRoute = async ({ request }) => {
  try {
    const { url, filename } = await request.json();
    if (!url || !filename) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'URL and filename are required' 
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    try {
      const urlObj = new URL(url);
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        throw new Error('Invalid protocol');
      }
    } catch {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid URL' 
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); 
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36'
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: `Failed to fetch file: ${response.status}` 
        }), {
          status: response.status,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }
      const fileBuffer = await response.arrayBuffer();
      return new Response(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': response.headers.get('content-type') || 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Length': fileBuffer.byteLength.toString(),
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
  } catch (error) {
    console.error('Download error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error && error.name === 'AbortError' 
        ? 'Download timeout' 
        : 'An unexpected error occurred during download' 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};