import type { APIRoute } from 'astro';
import { VPS_CONFIG } from '../../utils/config.ts';

export const POST: APIRoute = async ({ request }) => {
  try {
    let requestData;
    try {
      requestData = await request.json();
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid JSON in request body' 
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }

    const { url } = requestData;
    if (!url || typeof url !== 'string' || !url.trim()) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'URL is required and must be a non-empty string' 
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }

    const sanitizedUrl = url.trim();
    if (!/^https?:\/\/(www\.)?(tiktok\.com|vm\.tiktok\.com|vt\.tiktok\.com)/.test(sanitizedUrl)) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid TikTok URL format' 
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }

    let backendUrl = await VPS_CONFIG.getBackendUrl();
    console.log('Backend URL:', backendUrl);
    let apiUrl = `${backendUrl}/api/download`;
    console.log('API URL:', apiUrl);

    let response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ url: sanitizedUrl }),
      signal: AbortSignal.timeout(30000)
    });

    console.log('Backend response status:', response.status);
    
    if (!response.ok) {
      let errorMessage = 'Terjadi kesalahan saat memproses video';
      try {
        const errorData = await response.json();
        let backendError = errorData.error || errorData.message || '';
        
        if (backendError.includes('Rate limit') || backendError.includes('Free Api Limit')) {
          errorMessage = 'Server sedang sibuk, silakan coba lagi dalam beberapa detik';
        } else if (backendError.includes('Invalid TikTok URL')) {
          errorMessage = 'URL TikTok tidak valid, pastikan URL sudah benar';
        } else if (backendError.includes('Video data not found')) {
          errorMessage = 'Video tidak ditemukan, pastikan URL masih aktif';
        } else if (backendError.includes('TikWM API error')) {
          errorMessage = 'Layanan download sedang maintenance, silakan coba lagi nanti';
        } else if (backendError) {
          errorMessage = backendError;
        }
      } catch {
        if (response.status === 429) {
          errorMessage = 'Terlalu banyak permintaan, silakan tunggu sebentar';
        } else if (response.status === 500) {
          errorMessage = 'Server sedang mengalami masalah, silakan coba lagi';
        }
      }
      
      console.error('Backend error:', errorMessage);
      return new Response(JSON.stringify({ 
        success: false, 
        error: errorMessage
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }

    let result = await response.json();
    console.log('Backend result:', result);
    
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  } catch (error) {
    console.error('Download API error:', error);
    let errorMessage = 'An unexpected error occurred';
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = 'Request timeout - please try again';
      } else if (error.message.includes('fetch')) {
        errorMessage = 'Network error - unable to connect to backend server';
      } else {
        errorMessage = error.message;
      }
    }
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }
};

export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  });
};