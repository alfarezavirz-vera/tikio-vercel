import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serveStatic } from 'hono/bun';
import { networkInterfaces } from 'os';
import { ENV_CONFIG } from '../src/config/env.ts';
console.log('Environment Configuration:', {
  BE_PORT: ENV_CONFIG.BE_PORT,
  FE_PORT: ENV_CONFIG.FE_PORT,
  NODE_ENV: ENV_CONFIG.NODE_ENV,
  TIKWM_BASE_URL: ENV_CONFIG.TIKWM_BASE_URL
});
function getVPSIP(): string {
  const interfaces = networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    const interfaceList = interfaces[name];
    if (interfaceList) {
      for (const iface of interfaceList) {
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address;
        }
      }
    }
  }
  return '0.0.0.0';
}
let IP_ADDRESS = getVPSIP();
let TIKWM_BASE_URL = ENV_CONFIG.TIKWM_BASE_URL;
let headers = {
  'Accept': 'application/json, text/javascript, */*; q=0.01',
  'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
  'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36',
  'X-Requested-With': 'XMLHttpRequest',
  'Referer': TIKWM_BASE_URL
};

let requestCounts = new Map();
let lastReset = Date.now();

function checkRateLimit(ip: string): boolean {
  let now = Date.now();
  if (now - lastReset > 60000) {
    requestCounts.clear();
    lastReset = now;
  }
  
  let count = requestCounts.get(ip) || 0;
  if (count >= 10) {
    return false;
  }
  
  requestCounts.set(ip, count + 1);
  return true;
}

let app = new Hono();

let sensitiveFiles = [
  'package.json',
  'package-lock.json',
  'bun.lock',
  '.env',
  '.env.local',
  '.env.production',
  'tsconfig.json',
  'astro.config.mjs',
  'tailwind.config.mjs',
  'ecosystem.config.cjs'
];

let sensitiveDirs = [
  'node_modules',
  'src',
  'backend',
  'logs',
  '.git',
  '.astro'
];

app.use('*', async (c, next) => {
  let url = new URL(c.req.url);
  let pathname = url.pathname;
  
  for (let file of sensitiveFiles) {
    if (pathname.includes(file)) {
      return c.json({ error: 'Access denied' }, 403);
    }
  }
  
  for (let dir of sensitiveDirs) {
    if (pathname.includes(dir)) {
      return c.json({ error: 'Access denied' }, 403);
    }
  }
  
  await next();
});

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'User-Agent'],
  maxAge: 86400
}));
app.use('*', logger());
app.get("/", (c) => {
  return c.json({
     msg: "Welcome to Tikio API"
  })
})
app.options('*', (c) => {
  return c.text('', 200, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400'
  });
});
app.get('/health', (c) => {
  return c.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    server: IP_ADDRESS 
  });
});
app.get('/api/stats', (c) => {
  const stats = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    server: IP_ADDRESS
  };
  return c.json(stats);
});
app.post('/api/download', async (c) => {
  try {
    let clientIP = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || '127.0.0.1';
    
    if (!checkRateLimit(clientIP)) {
      return c.json({ 
        success: false, 
        error: 'Rate limit exceeded. Please wait before making another request.' 
      }, 429);
    }
    
    console.log('Download API called');
    console.log('Request headers:', Object.fromEntries(c.req.raw.headers.entries()));
    let requestData;
    try {
      requestData = await c.req.json();
    } catch (error) {
      console.error('JSON parsing error:', error);
      return c.json({ 
        success: false, 
        error: 'Invalid JSON in request body' 
      }, 400);
    }
    const { url } = requestData;
    console.log('Received URL:', url);
    if (!url) {
      console.log('No URL provided');
      return c.json({ 
        success: false, 
        error: 'URL is required' 
      }, 400);
    }
    const sanitizedUrl = url.trim();
    console.log('Sanitized URL:', sanitizedUrl);
    if (!/^https?:\/\/(www\.)?(tiktok\.com|vm\.tiktok\.com|vt\.tiktok\.com)/.test(sanitizedUrl)) {
      console.log('Invalid TikTok URL:', sanitizedUrl);
      return c.json({ 
        success: false, 
        error: 'Invalid TikTok URL' 
      }, 400);
    }
    console.log('Fetching data for URL:', sanitizedUrl);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const res = await fetch(`${TIKWM_BASE_URL}/api?url=${encodeURIComponent(sanitizedUrl)}`, {
      headers,
      keepalive: true,
      signal: AbortSignal.timeout(15000)
    });
    
    if (!res.ok) {
      console.error('TikWM API error:', res.status, res.statusText);
      return c.json({ 
        success: false, 
        error: `TikWM API error: ${res.status} - ${res.statusText}` 
      }, 500);
    }
    
    const responseData = await res.json();
    console.log('API Response:', responseData);
    if (!responseData || typeof responseData !== 'object') {
      return c.json({ 
        success: false, 
        error: 'Failed to fetch data, please try again later!' 
      }, 500);
    }
    if (responseData.code !== 0) {
      return c.json({ 
        success: false, 
        error: responseData.msg || 'Failed to fetch video data' 
      }, 500);
    }
    if (!responseData.data) {
      return c.json({ 
        success: false, 
        error: 'Video data not found' 
      }, 404);
    }
    let data = responseData.data;
    let videoId = data.id;
    console.log('Video ID extracted:', videoId);
    let video = {
      id: data.id,
      title: data.title,
      region: data.region,
      sizeMedia: data.size,
      created: new Date(Date.now() - data.create_time).toLocaleString(),
      duration: `${data.duration}s`,
      thumbnail: data.cover,
      stats: {
        views: data.play_count.toLocaleString(),
        likes: data.digg_count.toLocaleString(),
        comments: data.comment_count.toLocaleString(),
        shares: data.share_count.toLocaleString(),
      },
      music: {
        title: data.music_info.title,
        author: data.music_info.author,
        isOriginal: data.music_info.original,
        download: data.music_info.play
      },
      author: {
        name: data.author.nickname,
        nickname: data.author.nickname,
        profile_images: data.author.avatar
      },
      isSlide: !!data.images,
      download: data.images ? data.images : {
        watermark: data.wmplay,
        no_watermark: data.play
      },
    };
    return c.json({ 
      success: true, 
      data: video 
    });
  } catch (error) {
    console.error('Download error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, 500);
  }
});
app.post('/api/search', async (c) => {
  try {
    let clientIP = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || '127.0.0.1';
    
    if (!checkRateLimit(clientIP)) {
      return c.json({ 
        success: false, 
        error: 'Rate limit exceeded. Please wait before making another request.' 
      }, 429);
    }
    
    let requestData;
    try {
      requestData = await c.req.json();
    } catch (error) {
      console.error('JSON parsing error:', error);
      return c.json({ 
        success: false, 
        error: 'Invalid JSON in request body' 
      }, 400);
    }
    const { query } = requestData;
    if (!query) {
      return c.json({ 
        success: false, 
        error: 'Search query is required' 
      }, 400);
    }
    const sanitizedQuery = query.trim();
    console.log('Searching for:', sanitizedQuery);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const params = new URLSearchParams({
      keywords: sanitizedQuery,
      count: '12',
      hd: '1',
      web: '1',
      cursor: '1'
    });
    const res = await fetch(`${TIKWM_BASE_URL}/api/feed/search`, {
      method: 'POST',
      headers,
      body: params.toString(),
      keepalive: true,
      signal: AbortSignal.timeout(15000)
    });
    
    if (!res.ok) {
      console.error('TikWM Search API error:', res.status, res.statusText);
      return c.json({ 
        success: false, 
        error: `TikWM Search API error: ${res.status} - ${res.statusText}` 
      }, 500);
    }
    
    const data = await res.json();
    console.log('Search API Response:', data);
    if (!data || typeof data !== 'object') {
      return c.json({ 
        success: false, 
        error: 'Failed to fetch search data' 
      }, 500);
    }
    if (data.code !== 0) {
      return c.json({ 
        success: false, 
        error: data.msg || 'Search failed' 
      }, 500);
    }
    let videos = [];
    if (data.data && data.data.videos) {
      for (let video of data.data.videos) {
        videos.push({
          id: video.id,
          title: video.title,
          region: video.region,
          sizeMedia: video.size,
          created: new Date(Date.now() - video.create_time).toLocaleString(),
          duration: `${video.duration}s`,
          thumbnail: TIKWM_BASE_URL + video.cover,
          stats: {
            views: video.play_count.toLocaleString(),
            likes: video.digg_count.toLocaleString(),
            comments: video.comment_count.toLocaleString(),
            shares: video.share_count.toLocaleString(),
          },
          music: {
            title: video.music_info.title,
            author: video.music_info.author,
            isOriginal: video.music_info.original,
            download: video.music_info.play
          },
          author: {
            name: video.author.nickname,
            nickname: video.author.nickname,
            profile_images: TIKWM_BASE_URL + video.author.avatar
          },
          download: {
            watermark: TIKWM_BASE_URL + video.wmplay,
            no_watermark: TIKWM_BASE_URL + video.play
          }
        });
      }
    }
    console.log('Search results count:', videos.length);
    return c.json({ 
      success: true, 
      data: videos 
    });
  } catch (error) {
    console.error('Search error:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred during search' 
    }, 500);
  }
});
app.get('/api/download/:id', async (c) => {
  try {
    const id = c.req.param('id');
    if (!id) {
      return c.json({ 
        success: false, 
        error: 'Video ID is required' 
      }, 400);
    }
    console.log('Fetching video by ID:', id);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const params_data = new URLSearchParams({
      url: `https://www.tiktok.com/@user/video/${id}`,
      hd: '1'
    });
    const res = await fetch(`${TIKWM_BASE_URL}/api/`, {
      method: 'POST',
      headers,
      body: params_data.toString(),
      keepalive: true,
      signal: AbortSignal.timeout(15000)
    });
    
    if (!res.ok) {
      console.error('TikWM API error for ID:', res.status, res.statusText);
      return c.json({ 
        success: false, 
        error: `TikWM API error: ${res.status} - ${res.statusText}` 
      }, 500);
    }
    
    const responseData = await res.json();
    await new Promise(r => setTimeout(r, 2000));
    console.log('Video API Response:', responseData);
    if (!responseData || typeof responseData !== 'object') {
      return c.json({ 
        success: false, 
        error: 'Failed to fetch data, please try again later!' 
      }, 500);
    }
    if (responseData.code !== 0) {
      return c.json({ 
        success: false, 
        error: responseData.msg || 'Failed to fetch video data' 
      }, 500);
    }
    if (!responseData.data) {
      return c.json({ 
        success: false, 
        error: 'Video data not found' 
      }, 404);
    }
    const data = responseData.data;
    const video = {
      id: data.id,
      title: data.title,
      region: data.region,
      sizeMedia: data.size,
      created: new Date(Date.now() - data.create_time).toLocaleString(),
      duration: `${data.duration}s`,
      thumbnail: data.cover,
      stats: {
        views: data.play_count.toLocaleString(),
        likes: data.digg_count.toLocaleString(),
        comments: data.comment_count.toLocaleString(),
        shares: data.share_count.toLocaleString(),
      },
      music: {
        title: data.music_info.title,
        author: data.music_info.author,
        isOriginal: data.music_info.original,
        download: data.music_info.play
      },
      author: {
        name: data.author.nickname,
        nickname: data.author.nickname,
        profile_images: data.author.avatar
      },
      isSlide: !!data.images,
      download: data.images ? data.images : {
        watermark: data.wmplay,
        no_watermark: data.play
      },
    };
    console.log('Processed video result:', video);
    return c.json({ 
      success: true, 
      data: video 
    });
  } catch (error) {
    console.error('Video fetch error:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    }, 500);
  }
});
export default {
   port: parseInt(ENV_CONFIG.BE_PORT),
   hostname: ENV_CONFIG.HOST,
   fetch: app.fetch,
   development: ENV_CONFIG.NODE_ENV === 'development'
}; 