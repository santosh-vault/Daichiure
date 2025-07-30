import React, { useEffect, useRef } from "react";

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

  useEffect(() => {
    // Check if AdSense is loaded
    if (typeof window !== "undefined" && (window as any).adsbygoogle) {
      try {
        // Push the ad to AdSense
        (window as any).adsbygoogle = (window as any).adsbygoogle || [];
        (window as any).adsbygoogle.push({});
      } catch (error) {
        console.error("AdSense error:", error);
      }
    }
  }, [adSlot]);

  return (
    <div ref={adRef} className={`adsense-container ${className}`} style={style}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-8134322068798634"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive}
      />
    </div>
  );
};

export default AdSense;
