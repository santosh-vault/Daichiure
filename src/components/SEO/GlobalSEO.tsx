import React from "react";
import { Helmet } from "react-helmet-async";

interface GlobalSEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  noIndex?: boolean;
  schemaData?: any;
}

export const GlobalSEO: React.FC<GlobalSEOProps> = ({
  title = "Daichiure - Play Free Games Online & Earn Real Money",
  description = "Play the best free 2D games online and earn real money. Join Daichiure gaming platform with 100+ games, rewards system, and instant cash payouts.",
  keywords = "free online games, earn money gaming, 2D games, browser games, gaming rewards, play to earn, Nepali games, cash rewards, gaming platform",
  image = "https://www.daichiure.live/logo.png",
  url = "https://www.daichiure.live",
  type = "website",
  noIndex = false,
  schemaData,
}) => {
  const siteName = "Daichiure";
  const twitterHandle = "@daichiure";

  // Generate full URL if relative path provided
  const fullUrl = url.startsWith("http")
    ? url
    : `https://www.daichiure.live${url}`;
  const fullImageUrl = image.startsWith("http")
    ? image
    : `https://www.daichiure.live${image}`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Robots */}
      <meta
        name="robots"
        content={noIndex ? "noindex, nofollow" : "index, follow"}
      />

      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:creator" content={twitterHandle} />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />

      {/* Schema.org structured data */}
      {schemaData && (
        <script type="application/ld+json">{JSON.stringify(schemaData)}</script>
      )}
    </Helmet>
  );
};

// Common schema generators
export const generateGameSchema = (game: any, url: string) => ({
  "@context": "https://schema.org",
  "@type": "VideoGame",
  name: game.title,
  description: game.description,
  image: game.thumbnail_url || "https://www.daichiure.live/logo.png",
  applicationCategory: "Game",
  operatingSystem: "All",
  url: url,
  author: {
    "@type": "Organization",
    name: "Daichiure",
    url: "https://www.daichiure.live",
  },
  publisher: {
    "@type": "Organization",
    name: "Daichiure",
    url: "https://www.daichiure.live",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.5",
    reviewCount: "120",
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
  },
});

export const generateBlogSchema = (blog: any, url: string) => ({
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: blog.title,
  description: blog.description,
  image: blog.image_url || "https://www.daichiure.live/logo.png",
  url: url,
  datePublished: blog.created_at,
  dateModified: blog.updated_at || blog.created_at,
  author: {
    "@type": "Organization",
    name: "Daichiure",
  },
  publisher: {
    "@type": "Organization",
    name: "Daichiure",
    logo: {
      "@type": "ImageObject",
      url: "https://www.daichiure.live/logo.png",
    },
  },
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": url,
  },
});

export const generateBreadcrumbSchema = (
  breadcrumbs: Array<{ name: string; url: string }>
) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: breadcrumbs.map((crumb, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: crumb.name,
    item: crumb.url,
  })),
});
