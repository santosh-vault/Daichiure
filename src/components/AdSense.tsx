import React, { useEffect, useRef, useState } from "react";

interface AdSenseProps {
  adSlot: string;
  adFormat?: "auto" | "fluid" | "rectangle" | "vertical" | "horizontal";
  style?: React.CSSProperties;
  className?: string;
  fullWidthResponsive?: boolean;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

const AdSense: React.FC<AdSenseProps> = ({
  adSlot,
  adFormat = "auto",
  style = {},
  className = "",
  fullWidthResponsive = true,
}) => {
  const adRef = useRef<HTMLDivElement>(null);
  const [adStatus, setAdStatus] = useState<string>("Initializing...");
  const [isClient, setIsClient] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const loadAd = async () => {
      try {
        // Skip ads in development or localhost
        if (
          process.env.NODE_ENV === "development" ||
          window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1" ||
          window.location.protocol === "file:"
        ) {
          setAdStatus("Development Mode - Ads Disabled");
          return;
        }

        // Validate ad slot
        if (!adSlot) {
          throw new Error("Ad slot is required");
        }

        if (adSlot === "1234567890" || adSlot.includes("placeholder")) {
          setAdStatus("⚠️ Using placeholder ad slot!");
          console.warn("Placeholder ad slot detected:", adSlot);
          return;
        }

        // Wait for AdSense script to load
        let attempts = 0;
        const maxAttempts = 10;

        while (!window.adsbygoogle && attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 200));
          attempts++;
        }

        if (!window.adsbygoogle) {
          throw new Error("AdSense script failed to load after 2 seconds");
        }

        // Initialize AdSense
        try {
          window.adsbygoogle = window.adsbygoogle || [];
          window.adsbygoogle.push({});
          setIsLoaded(true);
          setAdStatus(`Ad loaded - Slot: ${adSlot}`);

          console.log("✅ AdSense ad initialized:", {
            adSlot,
            adFormat,
            client: "ca-pub-8134322068798634",
            timestamp: new Date().toISOString(),
          });
        } catch (pushError) {
          throw new Error(`AdSense push failed: ${pushError}`);
        }
      } catch (error) {
        console.error("AdSense loading error:", error);
        setHasError(true);
        setAdStatus(
          `Error: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    };

    const timer = setTimeout(loadAd, 300);
    return () => clearTimeout(timer);
  }, [adSlot, isClient, adFormat]);

  // Server-side rendering guard
  if (!isClient) {
    return null;
  }

  // Development/localhost placeholder
  if (
    process.env.NODE_ENV === "development" ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.protocol === "file:"
  ) {
    return (
      <div
        className={`adsense-placeholder ${className}`}
        style={{
          ...style,
          minHeight: "90px",
          backgroundColor: "#1f2937",
          border: "2px dashed #374151",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          borderRadius: "8px",
          padding: "16px",
        }}
      >
        <div
          style={{
            color: "#10b981",
            fontSize: "16px",
            marginBottom: "8px",
            fontWeight: "bold",
          }}
        >
          🎯 AdSense Development Mode
        </div>
        <div
          style={{
            color: "#9ca3af",
            fontSize: "14px",
            marginBottom: "4px",
            textAlign: "center",
          }}
        >
          Slot: {adSlot}
        </div>
        <div
          style={{
            color: "#6b7280",
            fontSize: "12px",
            textAlign: "center",
          }}
        >
          Status: {adStatus}
        </div>
      </div>
    );
  }

  // Error state
  if (hasError) {
    return (
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
            marginBottom: "4px",
            textAlign: "center",
          }}
        >
          ⚠️ Ad Failed to Load
        </div>
        <div
          style={{
            color: "#991b1b",
            fontSize: "12px",
            textAlign: "center",
          }}
        >
          {adStatus}
        </div>
      </div>
    );
  }

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
        }}
        data-ad-client="ca-pub-8134322068798634"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive.toString()}
      />

      {/* Status indicator for debugging */}
      {(process.env.NODE_ENV === "development" || !isLoaded) && (
        <div
          style={{
            position: "absolute",
            top: "4px",
            right: "4px",
            fontSize: "10px",
            background: isLoaded
              ? "rgba(16, 185, 129, 0.9)"
              : "rgba(245, 158, 11, 0.9)",
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
          {adStatus}
        </div>
      )}
    </div>
  );
};

export default AdSense;
