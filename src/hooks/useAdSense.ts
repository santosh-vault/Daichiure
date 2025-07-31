import { useState, useEffect, useCallback } from "react";

interface AdSenseState {
  isScriptLoaded: boolean;
  isScriptError: boolean;
  isInitialized: boolean;
}

interface UseAdSenseOptions {
  clientId?: string;
  enableConsent?: boolean;
  testMode?: boolean;
}

const DEFAULT_CLIENT_ID = "ca-pub-8134322068798634";
const SCRIPT_ID = "google-adsense-script";

/**
 * Custom hook for managing AdSense script loading and initialization
 */
export const useAdSense = (options: UseAdSenseOptions = {}) => {
  const {
    clientId = DEFAULT_CLIENT_ID,
    enableConsent = false,
    testMode = false,
  } = options;

  const [state, setState] = useState<AdSenseState>({
    isScriptLoaded: false,
    isScriptError: false,
    isInitialized: false,
  });

  // Check if AdSense script is already loaded
  const checkScriptStatus = useCallback(() => {
    if (typeof window === "undefined") return false;
    
    const existingScript = document.getElementById(SCRIPT_ID);
    const hasAdsByGoogle = Array.isArray(window.adsbygoogle);
    
    return existingScript !== null || hasAdsByGoogle;
  }, []);

  // Load AdSense script dynamically
  const loadScript = useCallback(() => {
    if (typeof window === "undefined") return;

    // Check if we're in a production environment
    const isProduction = process.env.NODE_ENV === "production" || 
      window.location.hostname.includes("netlify.app") ||
      window.location.hostname.includes("daichiure") ||
      !window.location.hostname.includes("localhost");

    // Skip in development unless test mode is enabled
    if (!isProduction && !testMode) {
      console.log("🔄 AdSense disabled in development mode");
      setState(prev => ({ ...prev, isScriptLoaded: true, isInitialized: true }));
      return;
    }

    // Check if script is already loaded
    if (checkScriptStatus()) {
      setState(prev => ({ ...prev, isScriptLoaded: true, isInitialized: true }));
      return;
    }

    // Create and append script
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
    script.async = true;
    script.crossOrigin = "anonymous";

    script.onload = () => {
      setState(prev => ({ 
        ...prev, 
        isScriptLoaded: true, 
        isInitialized: true,
        isScriptError: false 
      }));
      
      // Initialize AdSense queue if not already done
      if (!window.adsbygoogle) {
        window.adsbygoogle = [];
      }

      console.log("✅ AdSense script loaded successfully");
    };

    script.onerror = () => {
      setState(prev => ({ 
        ...prev, 
        isScriptError: true,
        isScriptLoaded: false 
      }));
      console.error("❌ Failed to load AdSense script");
    };

    document.head.appendChild(script);
  }, [clientId, testMode, checkScriptStatus]);

  // Initialize on mount
  useEffect(() => {
    loadScript();
  }, [loadScript]);

  // Push ad configuration to AdSense queue
  const pushAd = useCallback((config: Record<string, any> = {}) => {
    if (typeof window === "undefined" || !state.isInitialized) {
      console.warn("AdSense not initialized, cannot push ad config");
      return false;
    }

    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push(config);
      return true;
    } catch (error) {
      console.error("Error pushing ad config:", error);
      return false;
    }
  }, [state.isInitialized]);

  // Refresh ads (useful for SPA navigation)
  const refreshAds = useCallback(() => {
    if (typeof window === "undefined" || !state.isInitialized) return;

    try {
      // Clear existing ads
      const adElements = document.querySelectorAll('.adsbygoogle');
      adElements.forEach(el => {
        if (el.getAttribute('data-adsbygoogle-status')) {
          el.removeAttribute('data-adsbygoogle-status');
        }
      });

      // Reinitialize ads
      window.adsbygoogle = window.adsbygoogle || [];
      adElements.forEach(() => {
        window.adsbygoogle.push({});
      });

      console.log("🔄 AdSense ads refreshed");
    } catch (error) {
      console.error("Error refreshing ads:", error);
    }
  }, [state.isInitialized]);

  // Handle consent (GDPR compliance)
  const setConsent = useCallback((hasConsent: boolean) => {
    if (!enableConsent || typeof window === "undefined") return;

    try {
      // This is a placeholder for GDPR consent handling
      // You should integrate with your actual consent management platform
      if (hasConsent) {
        console.log("✅ AdSense consent granted");
      } else {
        console.log("❌ AdSense consent denied");
      }
    } catch (error) {
      console.error("Error handling consent:", error);
    }
  }, [enableConsent]);

  return {
    ...state,
    pushAd,
    refreshAds,
    loadScript,
    setConsent,
  };
};

export default useAdSense;
