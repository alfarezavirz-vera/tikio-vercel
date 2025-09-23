import type { MiddlewareHandler } from 'astro';

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
  'ecosystem.config.cjs',
  'middleware.ts',
  'env.d.ts'
];

let sensitiveDirs = [
  'node_modules',
  'src',
  'backend', 
  'logs',
  '.git',
  '.astro',
  'dist'
];

let sensitiveExtensions = [
  '.json',
  '.lock',
  '.env',
  '.config',
  '.log',
  '.ts',
  '.js',
  '.mjs',
  '.cjs'
];

export const onRequest: MiddlewareHandler = (context, next) => {
  let url = new URL(context.request.url);
  let pathname = url.pathname.toLowerCase();
  
  if (pathname === '/404') {
    return next();
  }
  
  for (let file of sensitiveFiles) {
    if (pathname.includes(file.toLowerCase())) {
      return context.redirect('/404');
    }
  }
  
  for (let dir of sensitiveDirs) {
    if (pathname.includes(dir.toLowerCase())) {
      return context.redirect('/404');
    }
  }
  
  for (let ext of sensitiveExtensions) {
    if (pathname.endsWith(ext)) {
      return context.redirect('/404');
    }
  }
  
  if (pathname.includes('..') || pathname.includes('~')) {
    return context.redirect('/404');
  }
  
  if (pathname.includes('admin') || pathname.includes('wp-') || pathname.includes('phpmyadmin') || pathname.includes('config')) {
    return context.redirect('/404');
  }
  
  if (pathname.includes('api/') && !pathname.startsWith('/api/download') && !pathname.startsWith('/api/search')) {
    return context.redirect('/404');
  }
  
  return next();
};