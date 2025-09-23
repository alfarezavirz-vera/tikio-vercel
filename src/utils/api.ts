import { VPS_CONFIG } from './config.ts';
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
export interface VideoData {
  id: string;
  title: string;
  author: {
    name: string;
    nickname: string;
    profile_images: string;
  };
  thumbnail: string;
  duration: string;
  sizeMedia: number;
  region: string;
  created: string;
  stats: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
  };
  music?: {
    title: string;
    author: string;
    isOriginal: boolean;
  };
  download: {
    no_watermark?: string;
    watermark?: string;
  } | string[];
  isSlide: boolean;
}
export interface SearchResult {
  id: string;
  title: string;
  author: {
    name: string;
    nickname: string;
  };
  thumbnail: string;
  duration: string;
  views: number;
}
export async function downloadVideo(url: string): Promise<ApiResponse<VideoData>> {
  try {
    let response = await fetch('/api/download', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36'
      },
      body: JSON.stringify({ url }),
      signal: AbortSignal.timeout(30000)
    });
    
    if (!response.ok) {
      let errorMessage = 'Terjadi kesalahan saat memproses video';
      try {
        let errorData = await response.json();
        let backendError = errorData.error || '';
        
        if (backendError.includes('Rate limit') || backendError.includes('Free Api Limit')) {
          errorMessage = 'Server sedang sibuk, silakan coba lagi dalam beberapa detik';
        } else if (backendError.includes('Invalid TikTok URL')) {
          errorMessage = 'URL TikTok tidak valid, pastikan URL sudah benar';
        } else if (backendError.includes('Video data not found')) {
          errorMessage = 'Video tidak ditemukan, pastikan URL masih aktif';
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
      
      return {
        success: false,
        error: errorMessage
      };
    }
    
    let result = await response.json();
    return result;
  } catch (error) {
    return {
      success: false,
      error: 'Koneksi bermasalah, silakan periksa internet Anda'
    };
  }
}
export async function searchVideos(query: string): Promise<ApiResponse<SearchResult[]>> {
  try {
    let response = await fetch('/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36'
      },
      body: JSON.stringify({ query }),
      signal: AbortSignal.timeout(30000)
    });
    
    if (!response.ok) {
      let errorMessage = 'Terjadi kesalahan saat mencari video';
      try {
        let errorData = await response.json();
        let backendError = errorData.error || '';
        
        if (backendError.includes('Rate limit') || backendError.includes('Free Api Limit')) {
          errorMessage = 'Server sedang sibuk, silakan coba lagi dalam beberapa detik';
        } else if (backendError.includes('Search query is required')) {
          errorMessage = 'Kata kunci pencarian tidak boleh kosong';
        } else if (backendError.includes('Search failed')) {
          errorMessage = 'Pencarian gagal, silakan coba kata kunci lain';
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
      
      return {
        success: false,
        error: errorMessage
      };
    }
    
    let result = await response.json();
    return result;
  } catch (error) {
    return {
      success: false,
      error: 'Koneksi bermasalah, silakan periksa internet Anda'
    };
  }
}
export function isValidTikTokUrl(url: string): boolean {
  const tiktokPattern = /^https?:\/\/(www\.)?(tiktok\.com|vm\.tiktok\.com|vt\.tiktok\.com)/;
  return tiktokPattern.test(url);
}
export function extractVideoId(url: string): string | null {
  const patterns = [
    /\/video\/(\d+)/,
    /\/@[\w.-]+\/video\/(\d+)/,
    /\/t\/(\w+)/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  return null;
}
export function formatFileSize(bytes: number): string {
  if (!bytes) return 'Unknown';
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
export function formatNumber(num: number | string): string {
  const numValue = typeof num === 'string' ? parseInt(num.replace(/,/g, '')) : num;
  if (numValue >= 1000000) return (numValue / 1000000).toFixed(1) + 'M';
  if (numValue >= 1000) return (numValue / 1000).toFixed(1) + 'K';
  return numValue.toString();
}