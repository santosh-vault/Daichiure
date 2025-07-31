import React, { useEffect, useRef, useState } from "react";

interface AdSenseProps {
  adSlot: string;
  adFormat?: "auto" | "fluid";
  style?: React.CSSProperties;
  className?: string;
  fullWidthResponsive?: boolean;
}

const AdSense: React.FC<AdSenseProps> = ({
  adSlot,
  adFormat = "auto",
  style = {},
  className = "",
  fullWidthResponsive = true,
}) => {
  const adRef = useRef<HTMLDivElement>(null);
  const [adStatus, setAdStatus] = useState<string>("Loading...");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const loadAd = () => {
      try {
        // Check if we're in development
        if (window.location.hostname === "localhost") {
          setAdStatus("Development Mode - Ads Disabled");
          return;
        }

        // Check if AdSense script is loaded
        if (!(window as any).adsbygoogle) {
          setAdStatus("AdSense script not loaded");
          console.error("AdSense script not found in window object");
          return;
        }

        // Check for placeholder ad slot
        if (adSlot === "1234567890") {
          setAdStatus("⚠️ Using placeholder ad slot!");
          return;
        }

        // Initialize AdSense
        (window as any).adsbygoogle = (window as any).adsbygoogle || [];
        (window as any).adsbygoogle.push({});
        setAdStatus(`Ad initialized - Slot: ${adSlot}`);

        console.log("AdSense ad pushed:", {
          adSlot,
          adFormat,
          client: "ca-pub-8134322068798634",
        });
      } catch (error) {
        console.error("AdSense error:", error);
        setAdStatus(`Error: ${error}`);
      }
    };

    const timer = setTimeout(loadAd, 500);
    return () => clearTimeout(timer);
  }, [adSlot, isClient]);

  // Development placeholder
  if (!isClient || window.location.hostname === "localhost") {
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
        }}
      >
        <div
          style={{
            color: "#9ca3af",
            fontSize: "14px",
            marginBottom: "4px",
          }}
        >
          🎯 AdSense Development Placeholder
        </div>
        <div
          style={{
            color: "#6b7280",
            fontSize: "12px",
          }}
        >
          Slot: {adSlot} | Status: {adStatus}
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
        style={{ display: "block" }}
        data-ad-client="ca-pub-8134322068798634"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive.toString()}
      />

      {/* Debug overlay for production */}
      {process.env.NODE_ENV === "development" && (
        <div
          style={{
            position: "absolute",
            top: "2px",
            right: "2px",
            fontSize: "10px",
            background: "rgba(0,0,0,0.8)",
            color: "#00ff00",
            padding: "4px 8px",
            borderRadius: "4px",
            fontFamily: "monospace",
          }}
        >
          {adStatus}
        </div>
      )}
    </div>
  );
};

export default AdSense;
