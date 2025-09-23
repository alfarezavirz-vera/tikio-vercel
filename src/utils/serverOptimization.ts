/**
 * Server-side optimization utilities
 * Untuk optimasi CSS loading di server-side rendering
 */

export interface ServerOptimizationConfig {
  enableInlineStyles: boolean;
  enableResourceHints: boolean;
  enableCriticalCSS: boolean;
  enableFontOptimization: boolean;
}

export const DEFAULT_CONFIG: ServerOptimizationConfig = {
  enableInlineStyles: true,
  enableResourceHints: true,
  enableCriticalCSS: true,
  enableFontOptimization: true,
};

/**
 * Generate resource hints HTML
 */
export function generateResourceHints(): string {
  const hints = [
    '<!-- DNS Prefetch -->',
    '<link rel="dns-prefetch" href="//cdnjs.cloudflare.com">',
    '<link rel="dns-prefetch" href="//fonts.googleapis.com">',
    '<link rel="dns-prefetch" href="//fonts.gstatic.com">',
    '',
    '<!-- Preconnect -->',
    '<link rel="preconnect" href="https://cdnjs.cloudflare.com" crossorigin>',
    '<link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>',
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
    '',
    '<!-- Preload Critical Resources -->',
    '<link rel="preload" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" as="style" onload="this.onload=null;this.rel=\'stylesheet\'">',
    '<noscript><link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet"></noscript>',
    '',
    '<link rel="preload" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" as="style" onload="this.onload=null;this.rel=\'stylesheet\'">',
    '<noscript><link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet"></noscript>',
  ];
  
  return hints.join('\n');
}

/**
 * Generate critical CSS for above-the-fold content
 */
export function generateCriticalCSS(): string {
  return `
    <style>
      /* Critical CSS untuk layout dasar */
      body { 
        margin: 0; 
        font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
        background-color: #000000; 
        color: #ffffff;
        overflow-x: hidden;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
      
      /* Layout critical classes */
      .min-h-screen { min-height: 100vh; }
      .bg-black { background-color: #000000; }
      .text-white { color: #ffffff; }
      .flex { display: flex; }
      .flex-col { flex-direction: column; }
      .items-center { align-items: center; }
      .justify-center { justify-content: center; }
      .justify-between { justify-content: space-between; }
      
      /* Container */
      .container { 
        max-width: 1200px; 
        margin: 0 auto; 
        padding: 0 1rem; 
      }
      
      /* Header */
      .sticky { position: sticky; }
      .top-0 { top: 0; }
      .z-50 { z-index: 50; }
      .backdrop-blur-xl { backdrop-filter: blur(24px); }
      .border-b { border-bottom-width: 1px; }
      .border-white\\/20 { border-color: rgba(255, 255, 255, 0.2); }
      
      /* Typography */
      .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
      .font-black { font-weight: 900; }
      .font-semibold { font-weight: 600; }
      
      /* Gradient text */
      .bg-gradient-to-t { background-image: linear-gradient(to top, var(--tw-gradient-stops)); }
      .from-white { 
        --tw-gradient-from: #ffffff; 
        --tw-gradient-to: rgba(255, 255, 255, 0); 
        --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); 
      }
      .to-gray-300 { --tw-gradient-to: #d1d5db; }
      .bg-clip-text { background-clip: text; }
      .text-transparent { color: transparent; }
      
      /* Spacing */
      .px-4 { padding-left: 1rem; padding-right: 1rem; }
      .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
      
      /* Loading states */
      .loading-placeholder {
        background: linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%);
        background-size: 200% 100%;
        animation: loading-shimmer 1.5s infinite;
        border-radius: 0.5rem;
      }
      
      @keyframes loading-shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      
      /* Font loading optimization */
      .font-loading {
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      .fonts-loaded .font-loading {
        font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      /* Responsive */
      @media (min-width: 640px) {
        .container { padding: 0 1.5rem; }
        .sm\\:px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
        .sm\\:py-6 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
        .sm\\:text-2xl { font-size: 1.5rem; line-height: 2rem; }
      }
      
      @media (min-width: 1024px) {
        .container { padding: 0 2rem; }
        .lg\\:px-8 { padding-left: 2rem; padding-right: 2rem; }
        .lg\\:py-8 { padding-top: 2rem; padding-bottom: 2rem; }
        .lg\\:text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
      }
      
      /* Performance optimizations */
      .will-change-transform { will-change: transform; }
      .will-change-opacity { will-change: opacity; }
      
      /* Reduce motion for accessibility */
      @media (prefers-reduced-motion: reduce) {
        .loading-placeholder {
          animation: none;
        }
      }
    </style>
  `;
}

/**
 * Generate optimization script
 */
export function generateOptimizationScript(): string {
  return `
    <script>
      // CSS Loading Optimization
      (function() {
        'use strict';
        
        // Initialize CSS optimization
        function initCSSOptimization() {
          // Font loading optimization
          if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(function() {
              document.documentElement.classList.add('fonts-loaded');
            });
          } else {
            setTimeout(function() {
              document.documentElement.classList.add('fonts-loaded');
            }, 100);
          }
          
          // Setup loading states
          document.body.classList.add('loading');
          
          // Remove loading states when everything is loaded
          window.addEventListener('load', function() {
            document.body.classList.remove('loading');
            document.body.classList.add('loaded');
            
            // Remove loading placeholders
            const loadingElements = document.querySelectorAll('.loading-placeholder');
            loadingElements.forEach(function(el) {
              el.classList.remove('loading-placeholder');
            });
          });
          
          // Fallback timeout
          setTimeout(function() {
            document.body.classList.remove('loading');
            document.body.classList.add('loaded');
          }, 3000);
        }
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', initCSSOptimization);
        } else {
          initCSSOptimization();
        }
      })();
    </script>
  `;
}

/**
 * Generate complete optimization HTML
 */
export function generateOptimizationHTML(config: ServerOptimizationConfig = DEFAULT_CONFIG): string {
  const parts: string[] = [];
  
  if (config.enableResourceHints) {
    parts.push(generateResourceHints());
  }
  
  if (config.enableCriticalCSS) {
    parts.push(generateCriticalCSS());
  }
  
  if (config.enableFontOptimization) {
    parts.push(generateOptimizationScript());
  }
  
  return parts.join('\n');
}