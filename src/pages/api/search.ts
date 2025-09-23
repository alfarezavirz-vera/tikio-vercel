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

    const { query } = requestData;
    if (!query || typeof query !== 'string' || !query.trim()) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Search query is required and must be a non-empty string' 
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
    let apiUrl = `${backendUrl}/api/search`;
    console.log('API URL:', apiUrl);

    let response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ query: query.trim() }),
      signal: AbortSignal.timeout(30000)
    });

    console.log('Backend response status:', response.status);
    
    if (!response.ok) {
      let errorMessage = 'Terjadi kesalahan saat mencari video';
      try {
        const errorData = await response.json();
        let backendError = errorData.error || errorData.message || '';
        
        if (backendError.includes('Rate limit') || backendError.includes('Free Api Limit')) {
          errorMessage = 'Server sedang sibuk, silakan coba lagi dalam beberapa detik';
        } else if (backendError.includes('Search query is required')) {
          errorMessage = 'Kata kunci pencarian tidak boleh kosong';
        } else if (backendError.includes('Search failed')) {
          errorMessage = 'Pencarian gagal, silakan coba kata kunci lain';
        } else if (backendError.includes('TikWM Search API error')) {
          errorMessage = 'Layanan pencarian sedang maintenance, silakan coba lagi nanti';
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
    console.error('Search API error:', error);
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