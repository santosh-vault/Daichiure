import React, { createContext, useContext, useEffect, ReactNode } from "react";
import { useAdSense } from "../hooks/useAdSense";

interface AdSenseContextType {
  isScriptLoaded: boolean;
  isScriptError: boolean;
  isInitialized: boolean;
  pushAd: (config?: Record<string, any>) => boolean;
  refreshAds: () => void;
  setConsent: (hasConsent: boolean) => void;
}

const AdSenseContext = createContext<AdSenseContextType | undefined>(undefined);

interface AdSenseProviderProps {
  children: ReactNode;
  clientId?: string;
  enableConsent?: boolean;
  testMode?: boolean;
  autoLoad?: boolean;
}

/**
 * AdSense Context Provider
 * Manages AdSense script loading and provides utilities throughout the app
 */
export const AdSenseProvider: React.FC<AdSenseProviderProps> = ({
  children,
  clientId,
  enableConsent = false,
  testMode = false,
  autoLoad = true,
}) => {
  const adSenseHook = useAdSense({
    clientId,
    enableConsent,
    testMode,
  });

  // Auto-load script on mount if enabled
  useEffect(() => {
    if (autoLoad && !adSenseHook.isScriptLoaded && !adSenseHook.isScriptError) {
      adSenseHook.loadScript();
    }
  }, [
    autoLoad,
    adSenseHook.isScriptLoaded,
    adSenseHook.isScriptError,
    adSenseHook.loadScript,
  ]);

  const contextValue: AdSenseContextType = {
    isScriptLoaded: adSenseHook.isScriptLoaded,
    isScriptError: adSenseHook.isScriptError,
    isInitialized: adSenseHook.isInitialized,
    pushAd: adSenseHook.pushAd,
    refreshAds: adSenseHook.refreshAds,
    setConsent: adSenseHook.setConsent,
  };

  return (
    <AdSenseContext.Provider value={contextValue}>
      {children}
    </AdSenseContext.Provider>
  );
};

/**
 * Hook to use AdSense context
 * Must be used within AdSenseProvider
 */
export const useAdSenseContext = (): AdSenseContextType => {
  const context = useContext(AdSenseContext);

  if (context === undefined) {
    throw new Error("useAdSenseContext must be used within an AdSenseProvider");
  }

  return context;
};

export default AdSenseProvider;
