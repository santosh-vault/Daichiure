import React from "react";
import AdSense from "../components/AdSense";
import {
  HeaderBannerAd,
  SidebarSquareAd,
  InContentAd,
  FooterBannerAd,
} from "../components/ads";
import { useAdSenseContext } from "../contexts/AdSenseContext";

/**
 * Example component demonstrating the new AdSense implementation
 */
const AdSenseExample: React.FC = () => {
  const { isInitialized, isScriptError, refreshAds } = useAdSenseContext();

  return (
    <div className="adsense-example-page">
      {/* Header with AdSense status */}
      <header className="bg-gray-100 p-4 mb-6">
        <h1 className="text-2xl font-bold mb-2">
          AdSense Implementation Example
        </h1>
        <div className="flex items-center gap-4 text-sm">
          <span
            className={`px-2 py-1 rounded ${
              isInitialized
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            Status: {isInitialized ? "Ready" : "Loading"}
          </span>
          {isScriptError && (
            <span className="px-2 py-1 rounded bg-red-100 text-red-800">
              Script Error
            </span>
          )}
          <button
            onClick={refreshAds}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh Ads
          </button>
        </div>
      </header>

      {/* Header Banner Ad */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Header Banner Ad</h2>
        <HeaderBannerAd className="mx-auto" />
      </section>

      {/* Main content with sidebar */}
      <div className="flex gap-6">
        {/* Main content */}
        <main className="flex-1">
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-3">
              Custom AdSense Component
            </h2>
            <AdSense
              adSlot="1234567890"
              adFormat="auto"
              lazy={false}
              className="border border-gray-200 rounded"
              style={{ padding: "10px" }}
            />
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-3">Article Content</h2>
            <div className="prose max-w-none">
              <p>
                This is sample content to demonstrate how ads integrate with
                your content. The AdSense components are designed to be
                responsive and load efficiently.
              </p>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris.
              </p>
            </div>
          </section>

          {/* In-content Ad */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-3">
              In-Content Ad (Lazy Loaded)
            </h2>
            <InContentAd className="my-6" />
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-3">More Content</h2>
            <div className="prose max-w-none">
              <p>
                Continue with more content here. The in-content ad above uses
                lazy loading, so it only loads when it becomes visible in the
                viewport.
              </p>
              <p>
                This helps with page performance by reducing the initial load
                time and only loading ads when users are likely to see them.
              </p>
            </div>
          </section>

          {/* Test different ad formats */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-3">Different Ad Formats</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-2">Rectangle Ad</h3>
                <AdSense
                  adSlot="2345678901"
                  adFormat="rectangle"
                  lazy={true}
                  className="border border-gray-200"
                />
              </div>
              <div>
                <h3 className="font-medium mb-2">Auto Format Ad</h3>
                <AdSense
                  adSlot="3456789012"
                  adFormat="auto"
                  lazy={true}
                  className="border border-gray-200"
                />
              </div>
            </div>
          </section>

          {/* Test Mode Example */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-3">Test Mode Example</h2>
            <p className="text-sm text-gray-600 mb-3">
              This ad uses test mode, so it will attempt to load even in
              development.
            </p>
            <AdSense
              adSlot="4567890123"
              adFormat="horizontal"
              testMode={true}
              lazy={true}
              className="border border-gray-200"
            />
          </section>
        </main>

        {/* Sidebar */}
        <aside className="w-80">
          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Sidebar Ad</h3>
            <SidebarSquareAd />
          </section>

          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Custom Sidebar Ad</h3>
            <AdSense
              adSlot="5678901234"
              adFormat="vertical"
              lazy={true}
              className="w-full"
              style={{ minHeight: "600px" }}
            />
          </section>
        </aside>
      </div>

      {/* Footer Banner Ad */}
      <footer className="mt-12 pt-8 border-t border-gray-200">
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Footer Banner Ad</h2>
          <FooterBannerAd className="mx-auto" />
        </section>

        <div className="text-center text-sm text-gray-500 py-4">
          AdSense Example Page - Daichiure Gaming Platform
        </div>
      </footer>
    </div>
  );
};

export default AdSenseExample;
