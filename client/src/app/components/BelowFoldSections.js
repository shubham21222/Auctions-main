"use client"; // Mark as Client Component

import dynamic from "next/dynamic";

// Dynamic imports for below-the-fold components
const StatsSection = dynamic(() => import("./StatsSection"), {
  loading: () => <p>Loading Stats...</p>,
  ssr: false, // Safe to use here since this is a Client Component
});

const TrendingBrands = dynamic(() => import("./TrendingBrands"), {
  loading: () => <p>Loading Brands...</p>,
  ssr: false,
});

const PopularArtists = dynamic(() => import("./Artsits"), {
  loading: () => <p>Loading Artists...</p>,
  ssr: false,
});

const PartnersSection = dynamic(() => import("./PartnersSection"), {
  loading: () => <p>Loading Partners...</p>,
  ssr: false,
});

const NewsletterForm = dynamic(() => import("./NewsletterForm"), {
  loading: () => <p>Loading Newsletter...</p>,
  ssr: false,
});

export default function BelowFoldSections() {
  return (
    <>
      <StatsSection />
      <TrendingBrands />
      <PopularArtists />
      <PartnersSection />
      <NewsletterForm />
    </>
  );
}