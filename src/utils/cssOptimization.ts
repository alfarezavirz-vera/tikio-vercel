/**
 * CSS Loading Optimization Utilities
 * Untuk mengatasi masalah CSS telat load saat refresh
 */

export interface ResourceHint {
  href: string;
  rel: 'preload' | 'prefetch' | 'dns-prefetch' | 'preconnect';
  as?: string;
  crossorigin?: boolean;
}

export const CRITICAL_RESOURCES: ResourceHint[] = [
  // DNS Prefetch
  { href: '//cdnjs.cloudflare.com', rel: 'dns-prefetch' },
  { href: '//fonts.googleapis.com', rel: 'dns-prefetch' },
  { href: '//fonts.gstatic.com', rel: 'dns-prefetch' },
  
  // Preconnect
  { href: 'https://cdnjs.cloudflare.com', rel: 'preconnect', crossorigin: true },
  { href: 'https://fonts.googleapis.com', rel: 'preconnect', crossorigin: true },
  { href: 'https://fonts.gstatic.com', rel: 'preconnect', crossorigin: true },
  
  // Preload critical resources
  { 
    href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap', 
    rel: 'preload', 
    as: 'style' 
  },
  { 
    href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css', 
    rel: 'preload', 
    as: 'style' 
  }
];

export class CSSOptimizer {
  private static instance: CSSOptimizer;
  private loadedResources = new Set<string>();
  private fontLoadPromise: Promise<void> | null = null;

  static getInstance(): CSSOptimizer {
    if (!CSSOptimizer.instance) {
      CSSOptimizer.instance = new CSSOptimizer();
    }
    return CSSOptimizer.instance;
  }

  /**
   * Initialize CSS optimization
   */
  init(): void {
    this.addResourceHints();
    this.optimizeFontLoading();
    this.setupLoadingStates();
  }

  /**
   * Add resource hints to document head
   */
  private addResourceHints(): void {
    CRITICAL_RESOURCES.forEach(resource => {
      if (this.loadedResources.has(resource.href)) return;
      
      const link = document.createElement('link');
      link.rel = resource.rel;
      link.href = resource.href;
      
      if (resource.as) link.as = resource.as;
      if (resource.crossorigin) link.crossOrigin = 'anonymous';
      
      // Handle style preloading with fallback
      if (resource.rel === 'preload' && resource.as === 'style') {
        link.onload = () => {
          link.rel = 'stylesheet';
          this.loadedResources.add(resource.href);
        };
        
        // Fallback for browsers that don't support onload
        const noscript = document.createElement('noscript');
        const fallbackLink = document.createElement('link');
        fallbackLink.rel = 'stylesheet';
        fallbackLink.href = resource.href;
        noscript.appendChild(fallbackLink);
        document.head.appendChild(noscript);
      }
      
      document.head.appendChild(link);
      this.loadedResources.add(resource.href);
    });
  }

  /**
   * Optimize font loading
   */
  private optimizeFontLoading(): void {
    if (document.fonts && document.fonts.ready) {
      this.fontLoadPromise = document.fonts.ready.then(() => {
        document.documentElement.classList.add('fonts-loaded');
      });
    } else {
      // Fallback for older browsers
      this.fontLoadPromise = new Promise(resolve => {
        setTimeout(() => {
          document.documentElement.classList.add('fonts-loaded');
          resolve();
        }, 100);
      });
    }
  }

  /**
   * Setup loading states and transitions
   */
  private setupLoadingStates(): void {
    // Add loading class to body initially
    document.body.classList.add('loading');
    
    // Remove loading states when everything is loaded
    window.addEventListener('load', () => {
      this.removeLoadingStates();
    });
    
    // Fallback timeout
    setTimeout(() => {
      this.removeLoadingStates();
    }, 3000);
  }

  /**
   * Remove loading states
   */
  private removeLoadingStates(): void {
    document.body.classList.remove('loading');
    document.body.classList.add('loaded');
    
    // Remove loading placeholders
    const loadingElements = document.querySelectorAll('.loading-placeholder');
    loadingElements.forEach(el => {
      el.classList.remove('loading-placeholder');
    });
  }

  /**
   * Check if fonts are loaded
   */
  async waitForFonts(): Promise<void> {
    if (this.fontLoadPromise) {
      await this.fontLoadPromise;
    }
  }

  /**
   * Preload additional resources
   */
  preloadResource(href: string, as: string, crossorigin = false): void {
    if (this.loadedResources.has(href)) return;
    
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    if (crossorigin) link.crossOrigin = 'anonymous';
    
    document.head.appendChild(link);
    this.loadedResources.add(href);
  }

  /**
   * Get loading progress
   */
  getLoadingProgress(): number {
    const totalResources = CRITICAL_RESOURCES.length;
    const loadedCount = this.loadedResources.size;
    return Math.min((loadedCount / totalResources) * 100, 100);
  }
}

/**
 * Initialize CSS optimization when DOM is ready
 */
export function initCSSOptimization(): void {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      CSSOptimizer.getInstance().init();
    });
  } else {
    CSSOptimizer.getInstance().init();
  }
}

/**
 * Utility function to check if CSS is loaded
 */
export function isCSSLoaded(): boolean {
  return document.body.classList.contains('loaded');
}

/**
 * Utility function to wait for CSS to be loaded
 */
export function waitForCSSLoad(): Promise<void> {
  return new Promise(resolve => {
    if (isCSSLoaded()) {
      resolve();
      return;
    }
    
    const observer = new MutationObserver(() => {
      if (isCSSLoaded()) {
        observer.disconnect();
        resolve();
      }
    });
    
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    });
  });
}