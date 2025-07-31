/**
 * AdSense Utilities
 * Helper functions for AdSense integration
 */

// AdSense configuration constants
export const ADSENSE_CONFIG = {
  CLIENT_ID: "ca-pub-8134322068798634",
  SCRIPT_URL: "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js",
  SCRIPT_ID: "google-adsense-script",
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  LOAD_TIMEOUT: 5000,
  INTERSECTION_THRESHOLD: 0.1,
  INTERSECTION_ROOT_MARGIN: "100px",
} as const;

// Ad formats mapping
export const AD_FORMATS = {
  AUTO: "auto",
  FLUID: "fluid",
  RECTANGLE: "rectangle",
  VERTICAL: "vertical",
  HORIZONTAL: "horizontal",
  LEADERBOARD: "728x90",
  BANNER: "320x50",
  LARGE_RECTANGLE: "336x280",
  MEDIUM_RECTANGLE: "300x250",
  WIDE_SKYSCRAPER: "160x600",
  SKYSCRAPER: "120x600",
} as const;

// Responsive breakpoints for ads
export const AD_BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
  DESKTOP: 1200,
} as const;

/**
 * Check if the current environment is development
 */
export const isDevelopmentEnvironment = (): boolean => {
  if (typeof window === "undefined") return false;
  
  return (
    process.env.NODE_ENV === "development" ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.protocol === "file:"
  );
};

/**
 * Check if AdSense script is loaded and available
 */
export const isAdSenseAvailable = (): boolean => {
  return (
    typeof window !== "undefined" &&
    Array.isArray(window.adsbygoogle)
  );
};

/**
 * Wait for AdSense script to load with timeout
 */
export const waitForAdSense = (timeout = ADSENSE_CONFIG.LOAD_TIMEOUT): Promise<boolean> => {
  return new Promise((resolve) => {
    if (isAdSenseAvailable()) {
      resolve(true);
      return;
    }

    const startTime = Date.now();
    const checkInterval = setInterval(() => {
      if (isAdSenseAvailable()) {
        clearInterval(checkInterval);
        resolve(true);
      } else if (Date.now() - startTime > timeout) {
        clearInterval(checkInterval);
        resolve(false);
      }
    }, 100);
  });
};

/**
 * Validate ad slot format
 */
export const validateAdSlot = (adSlot: string): { isValid: boolean; error?: string } => {
  if (!adSlot || typeof adSlot !== "string") {
    return { isValid: false, error: "Ad slot must be a non-empty string" };
  }

  if (adSlot.trim() === "") {
    return { isValid: false, error: "Ad slot cannot be empty" };
  }

  if (adSlot.includes("placeholder") || adSlot === "1234567890") {
    return { isValid: false, error: "Using placeholder ad slot" };
  }

  // Basic format validation (AdSense slots are typically 10 digits)
  if (!/^\d{10}$/.test(adSlot)) {
    return { isValid: false, error: "Ad slot should be 10 digits" };
  }

  return { isValid: true };
};

/**
 * Get responsive ad size based on screen width
 */
export const getResponsiveAdSize = (screenWidth?: number): string => {
  const width = screenWidth || (typeof window !== "undefined" ? window.innerWidth : 1200);
  
  if (width < AD_BREAKPOINTS.MOBILE) {
    return AD_FORMATS.BANNER; // 320x50
  } else if (width < AD_BREAKPOINTS.TABLET) {
    return AD_FORMATS.MEDIUM_RECTANGLE; // 300x250
  } else if (width < AD_BREAKPOINTS.DESKTOP) {
    return AD_FORMATS.LARGE_RECTANGLE; // 336x280
  } else {
    return AD_FORMATS.LEADERBOARD; // 728x90
  }
};

/**
 * Create intersection observer for lazy loading ads
 */
export const createAdIntersectionObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit
): IntersectionObserver | null => {
  if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
    return null;
  }

  const defaultOptions: IntersectionObserverInit = {
    threshold: ADSENSE_CONFIG.INTERSECTION_THRESHOLD,
    rootMargin: ADSENSE_CONFIG.INTERSECTION_ROOT_MARGIN,
  };

  return new IntersectionObserver(callback, { ...defaultOptions, ...options });
};

/**
 * Clear ad element for re-initialization
 */
export const clearAdElement = (element: Element): void => {
  if (element.getAttribute("data-adsbygoogle-status")) {
    element.removeAttribute("data-adsbygoogle-status");
  }
};

/**
 * Push ad configuration to AdSense queue with error handling
 */
export const pushAdSafe = (config: Record<string, any> = {}): boolean => {
  try {
    if (!isAdSenseAvailable()) {
      console.warn("AdSense not available, cannot push ad config");
      return false;
    }

    window.adsbygoogle.push(config);
    return true;
  } catch (error) {
    console.error("Error pushing ad configuration:", error);
    return false;
  }
};

/**
 * Generate ad container style based on format
 */
export const getAdContainerStyle = (
  adFormat: string,
  customStyle?: React.CSSProperties
): React.CSSProperties => {
  const baseStyle: React.CSSProperties = {
    display: "block",
    width: "100%",
    minHeight: "90px",
    ...customStyle,
  };

  switch (adFormat) {
    case AD_FORMATS.LEADERBOARD:
      return { ...baseStyle, maxWidth: "728px", minHeight: "90px" };
    case AD_FORMATS.BANNER:
      return { ...baseStyle, maxWidth: "320px", minHeight: "50px" };
    case AD_FORMATS.MEDIUM_RECTANGLE:
      return { ...baseStyle, maxWidth: "300px", minHeight: "250px" };
    case AD_FORMATS.LARGE_RECTANGLE:
      return { ...baseStyle, maxWidth: "336px", minHeight: "280px" };
    case AD_FORMATS.WIDE_SKYSCRAPER:
      return { ...baseStyle, maxWidth: "160px", minHeight: "600px" };
    case AD_FORMATS.SKYSCRAPER:
      return { ...baseStyle, maxWidth: "120px", minHeight: "600px" };
    default:
      return baseStyle;
  }
};

/**
 * Debug logger for AdSense operations
 */
export const adSenseLogger = {
  info: (message: string, data?: any): void => {
    if (isDevelopmentEnvironment()) {
      console.log(`🎯 [AdSense] ${message}`, data || "");
    }
  },
  warn: (message: string, data?: any): void => {
    console.warn(`⚠️ [AdSense] ${message}`, data || "");
  },
  error: (message: string, error?: any): void => {
    console.error(`❌ [AdSense] ${message}`, error || "");
  },
  success: (message: string, data?: any): void => {
    if (isDevelopmentEnvironment()) {
      console.log(`✅ [AdSense] ${message}`, data || "");
    }
  },
};

/**
 * Performance monitoring for ads
 */
export const trackAdPerformance = (adSlot: string, event: string, data?: any): void => {
  if (isDevelopmentEnvironment()) {
    console.log(`📊 [AdSense Performance] ${event}`, {
      adSlot,
      timestamp: new Date().toISOString(),
      ...data,
    });
  }

  // Here you could integrate with analytics services like Google Analytics
  // gtag('event', event, { ad_slot: adSlot, ...data });
};

export default {
  ADSENSE_CONFIG,
  AD_FORMATS,
  AD_BREAKPOINTS,
  isDevelopmentEnvironment,
  isAdSenseAvailable,
  waitForAdSense,
  validateAdSlot,
  getResponsiveAdSize,
  createAdIntersectionObserver,
  clearAdElement,
  pushAdSafe,
  getAdContainerStyle,
  adSenseLogger,
  trackAdPerformance,
};
