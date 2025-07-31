import React from "react";
import AdSense from "./AdSense";

// Ads.txt content for ad verification
export const adsTxtContent =
  "google.com, pub-8134322068798634, DIRECT, f08c47fec0942fa0";

// Common ad slot configurations
export const AD_SLOTS = {
  HEADER_BANNER: "1234567890", // Replace with actual ad slot
  SIDEBAR_SQUARE: "2345678901", // Replace with actual ad slot
  FOOTER_BANNER: "3456789012", // Replace with actual ad slot
  IN_CONTENT: "4567890123", // Replace with actual ad slot
  MOBILE_BANNER: "5678901234", // Replace with actual ad slot
  LEADERBOARD: "6789012345", // Replace with actual ad slot
} as const;

// Pre-configured ad components for easy use
export const HeaderBannerAd: React.FC<{ className?: string }> = ({
  className,
}) => (
  <AdSense
    adSlot={AD_SLOTS.HEADER_BANNER}
    adFormat="horizontal"
    className={className}
    lazy={false}
  />
);

export const SidebarSquareAd: React.FC<{ className?: string }> = ({
  className,
}) => (
  <AdSense
    adSlot={AD_SLOTS.SIDEBAR_SQUARE}
    adFormat="rectangle"
    className={className}
    lazy={true}
  />
);

export const FooterBannerAd: React.FC<{ className?: string }> = ({
  className,
}) => (
  <AdSense
    adSlot={AD_SLOTS.FOOTER_BANNER}
    adFormat="horizontal"
    className={className}
    lazy={true}
  />
);

export const InContentAd: React.FC<{ className?: string }> = ({
  className,
}) => (
  <AdSense
    adSlot={AD_SLOTS.IN_CONTENT}
    adFormat="auto"
    className={className}
    lazy={true}
  />
);

export const MobileBannerAd: React.FC<{ className?: string }> = ({
  className,
}) => (
  <AdSense
    adSlot={AD_SLOTS.MOBILE_BANNER}
    adFormat="auto"
    className={className}
    lazy={false}
  />
);

export const LeaderboardAd: React.FC<{ className?: string }> = ({
  className,
}) => (
  <AdSense
    adSlot={AD_SLOTS.LEADERBOARD}
    adFormat="horizontal"
    className={className}
    lazy={true}
  />
);

// AdSense utilities
export const getAdSlot = (slotName: keyof typeof AD_SLOTS): string => {
  return AD_SLOTS[slotName];
};

// Export default ads.txt content for backward compatibility
export default adsTxtContent;
