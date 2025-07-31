import React, { useEffect, useRef, useState, useCallback, memo } from "react";

interface AdSenseProps {
  adSlot: string;
  adFormat?: "auto" | "fluid" | "rectangle" | "vertical" | "horizontal";
  style?: React.CSSProperties;
  className?: string;
  fullWidthResponsive?: boolean;
  lazy?: boolean;
  testMode?: boolean;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

// AdSense configuration constants
const ADSENSE_CONFIG = {
  CLIENT_ID: "ca-pub-8134322068798634",
  SCRIPT_URL: "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js",
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  LOAD_TIMEOUT: 5000,
} as const;

// Development environment check
const isDevelopment = () => {
  return (
    process.env.NODE_ENV === "development" ||
    (typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.protocol === "file:"))
  );
};

// Check if AdSense script is available
const isAdSenseAvailable = (): boolean => {
  return typeof window !== "undefined" && Array.isArray(window.adsbygoogle);
};

// Wait for AdSense script to load with timeout
const waitForAdSense = (
  timeout = ADSENSE_CONFIG.LOAD_TIMEOUT
): Promise<boolean> => {
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

const AdSense: React.FC<AdSenseProps> = memo(
  ({
    adSlot,
    adFormat = "auto",
    style = {},
    className = "",
    fullWidthResponsive = true,
    lazy = false,
    testMode = false,
  }) => {
    const adRef = useRef<HTMLDivElement>(null);
    const [adState, setAdState] = useState({
      status: "initializing",
      error: null as string | null,
      isLoaded: false,
      retryCount: 0,
    });
    const [isVisible, setIsVisible] = useState(!lazy);

    // Intersection Observer for lazy loading
    useEffect(() => {
      if (!lazy || isVisible) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsVisible(true);
              observer.disconnect();
            }
          });
        },
        { threshold: 0.1, rootMargin: "100px" }
      );

      if (adRef.current) {
        observer.observe(adRef.current);
      }

      return () => observer.disconnect();
    }, [lazy, isVisible]);

    // Load and initialize ad
    const loadAd = useCallback(async () => {
      try {
        setAdState((prev) => ({ ...prev, status: "loading", error: null }));

        // Skip ads in development unless test mode is enabled
        if (isDevelopment() && !testMode) {
          setAdState((prev) => ({
            ...prev,
            status: "development",
            isLoaded: false,
          }));
          return;
        }

        // Validate ad slot
        if (!adSlot || typeof adSlot !== "string") {
          throw new Error("Invalid ad slot provided");
        }

        if (adSlot.includes("placeholder") || adSlot === "1234567890") {
          throw new Error("Placeholder ad slot detected");
        }

        // Wait for AdSense script
        const scriptLoaded = await waitForAdSense();
        if (!scriptLoaded) {
          throw new Error("AdSense script failed to load within timeout");
        }

        // Initialize AdSense ad
        if (window.adsbygoogle && adRef.current) {
          const adElements = adRef.current.querySelectorAll(".adsbygoogle");

          // Clear any existing ads
          adElements.forEach((el) => {
            if (el.getAttribute("data-adsbygoogle-status")) {
              el.removeAttribute("data-adsbygoogle-status");
            }
          });

          // Push to AdSense queue
          window.adsbygoogle.push({});

          setAdState((prev) => ({
            ...prev,
            status: "loaded",
            isLoaded: true,
            error: null,
          }));

          // Log success in development
          if (isDevelopment()) {
            console.log("✅ AdSense ad loaded:", {
              adSlot,
              adFormat,
              client: ADSENSE_CONFIG.CLIENT_ID,
              timestamp: new Date().toISOString(),
            });
          }
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        console.error("AdSense loading error:", errorMessage);

        setAdState((prev) => ({
          ...prev,
          status: "error",
          error: errorMessage,
          retryCount: prev.retryCount + 1,
        }));
      }
    }, [adSlot, adFormat, testMode]);

    // Retry mechanism
    const retryLoad = useCallback(() => {
      if (adState.retryCount < ADSENSE_CONFIG.MAX_RETRY_ATTEMPTS) {
        setTimeout(
          loadAd,
          ADSENSE_CONFIG.RETRY_DELAY * (adState.retryCount + 1)
        );
      }
    }, [loadAd, adState.retryCount]);

    // Load ad when visible
    useEffect(() => {
      if (isVisible && adState.status === "initializing") {
        loadAd();
      }
    }, [isVisible, adState.status, loadAd]);

    // Auto-retry on error
    useEffect(() => {
      if (
        adState.status === "error" &&
        adState.retryCount < ADSENSE_CONFIG.MAX_RETRY_ATTEMPTS
      ) {
        retryLoad();
      }
    }, [adState.status, adState.retryCount, retryLoad]);

    // Render development placeholder
    const renderDevelopmentPlaceholder = () => (
      <div
        className={`adsense-placeholder ${className}`}
        style={{
          ...style,
          minHeight: "90px",
          backgroundColor: "#0f172a",
          border: "2px dashed #334155",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          borderRadius: "8px",
          padding: "16px",
          position: "relative",
        }}
      >
        <div
          style={{
            color: "#10b981",
            fontSize: "16px",
            marginBottom: "8px",
            fontWeight: "600",
          }}
        >
          🎯 AdSense Development Mode
        </div>
        <div
          style={{
            color: "#94a3b8",
            fontSize: "14px",
            marginBottom: "4px",
            textAlign: "center",
          }}
        >
          Slot: {adSlot}
        </div>
        <div
          style={{
            color: "#64748b",
            fontSize: "12px",
            textAlign: "center",
          }}
        >
          Format: {adFormat} | Responsive: {fullWidthResponsive ? "Yes" : "No"}
        </div>
        {testMode && (
          <button
            onClick={loadAd}
            style={{
              marginTop: "8px",
              padding: "4px 8px",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            Test Load Ad
          </button>
        )}
      </div>
    );

    // Render error state
    const renderErrorState = () => (
      <div
        className={`adsense-error ${className}`}
        style={{
          ...style,
          minHeight: "90px",
          backgroundColor: "#fef2f2",
          border: "1px solid #fca5a5",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          padding: "16px",
        }}
      >
        <div
          style={{
            color: "#dc2626",
            fontSize: "14px",
            marginBottom: "8px",
            textAlign: "center",
            fontWeight: "600",
          }}
        >
          ⚠️ Ad Failed to Load
        </div>
        <div
          style={{
            color: "#991b1b",
            fontSize: "12px",
            textAlign: "center",
            marginBottom: "8px",
          }}
        >
          {adState.error}
        </div>
        {adState.retryCount < ADSENSE_CONFIG.MAX_RETRY_ATTEMPTS && (
          <div
            style={{
              color: "#f59e0b",
              fontSize: "11px",
              textAlign: "center",
            }}
          >
            Retrying... ({adState.retryCount}/
            {ADSENSE_CONFIG.MAX_RETRY_ATTEMPTS})
          </div>
        )}
        {adState.retryCount >= ADSENSE_CONFIG.MAX_RETRY_ATTEMPTS && (
          <button
            onClick={() => {
              setAdState((prev) => ({ ...prev, retryCount: 0 }));
              loadAd();
            }}
            style={{
              padding: "4px 8px",
              backgroundColor: "#dc2626",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "11px",
              cursor: "pointer",
            }}
          >
            Retry Manually
          </button>
        )}
      </div>
    );

    // Render loading state
    const renderLoadingState = () => (
      <div
        className={`adsense-loading ${className}`}
        style={{
          ...style,
          minHeight: "90px",
          backgroundColor: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            color: "#64748b",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <div
            style={{
              width: "16px",
              height: "16px",
              border: "2px solid #e2e8f0",
              borderTop: "2px solid #3b82f6",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          Loading advertisement...
        </div>
        <style>
          {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
        </style>
      </div>
    );

    // Early returns for special states
    if (adState.status === "development") {
      return renderDevelopmentPlaceholder();
    }

    if (adState.status === "error") {
      return renderErrorState();
    }

    if (adState.status === "loading" || adState.status === "initializing") {
      return renderLoadingState();
    }

    // Main ad container
    return (
      <div
        ref={adRef}
        className={`adsense-container ${className}`}
        style={{
          minHeight: "90px",
          width: "100%",
          position: "relative",
          ...style,
        }}
      >
        <ins
          className="adsbygoogle"
          style={{
            display: "block",
            minHeight: "90px",
            width: "100%",
          }}
          data-ad-client={ADSENSE_CONFIG.CLIENT_ID}
          data-ad-slot={adSlot}
          data-ad-format={adFormat}
          data-full-width-responsive={fullWidthResponsive.toString()}
        />

        {/* Debug overlay for development */}
        {isDevelopment() && adState.isLoaded && (
          <div
            style={{
              position: "absolute",
              top: "4px",
              right: "4px",
              fontSize: "10px",
              background: "rgba(16, 185, 129, 0.9)",
              color: "white",
              padding: "4px 8px",
              borderRadius: "4px",
              fontFamily: "monospace",
              pointerEvents: "none",
              zIndex: 1000,
              maxWidth: "200px",
              textAlign: "center",
            }}
          >
            ✅ Ad Loaded: {adSlot}
          </div>
        )}
      </div>
    );
  }
);

AdSense.displayName = "AdSense";

export default AdSense;
