import React from "react";

interface AdSenseFallbackProps {
  width?: string | number;
  height?: string | number;
  showRetry?: boolean;
  onRetry?: () => void;
}

export const AdSenseFallback: React.FC<AdSenseFallbackProps> = ({
  width = "100%",
  height = "280px",
  showRetry = true,
  onRetry,
}) => {
  return (
    <div
      className="flex flex-col items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg text-gray-500"
      style={{ width, height, minHeight: "90px" }}
    >
      <div className="text-center p-4">
        <div className="text-sm font-medium mb-2">⚠️ Ad Failed to Load</div>
        <div className="text-xs mb-3">
          AdSense script failed to load within timeout
        </div>
        {showRetry && onRetry && (
          <button
            onClick={onRetry}
            className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
          >
            Retry Manually
          </button>
        )}
      </div>
    </div>
  );
};

export default AdSenseFallback;
