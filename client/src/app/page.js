import Image from "next/image";
import Header from "./components/Header";
import HeroContent from "./components/HeroContent";
import AboutUs from "./components/Aboutus";
import Footer from "./components/Footer";
import LatestProducts from "./components/LatestProducts";
import BelowFoldSections from "./components/BelowFoldSections";
import { Suspense } from "react";

// Placeholder image (create a tiny version, e.g., 10 KB, in public/)
const placeholderImage = "/banner-placeholder.webp";

export default function Home() {  
  const products = [
    {
      image: "https://beta.nyelizabeth.com/wp-content/uploads/2025/01/product4ccd551f28184638f7c306b6172c7158.webp",
      name: "Hermès Kelly Picnic Mini",
      price: 45807,
      slug: "hermes-kelly-picnic-mini-swift-willow-blue-du-nord-silver-metal-fittings",
    },
    {
      image: "https://beta.nyelizabeth.com/wp-content/uploads/2025/01/product612dfd189b8b384cb5fbcf7319435a69.webp",
      name: "Cartier Love Pavé",
      price: 32355,
      slug: "cartier-love-pave-diamond-bracelet-750-yg",
    },
    {
      image: "https://beta.nyelizabeth.com/wp-content/uploads/2025/01/productf0cc116dd0ca1729dcaf90f1aee103e8.webp",
      name: "Tiffany Jean Schlumberger",
      price: 32554,
      slug: "tiffany-jean-schlumberger-apollo-diamond-brooch",
    },
  ];

  return (
    <>
      <Header />
      <div className="relative mx-auto max-w-[100vw] lg:mx-[50px] md:mx-[30px] sm:mx-[12px] mt-[80px] rounded-[20px] overflow-hidden h-[82vh]">
        <link
          rel="preload"
          href={placeholderImage}
          as="image"
          fetchPriority="high"
        />

        {/* Initial Placeholder Image (tiny, fast-loading) */}
        <Image
          src={placeholderImage}
          alt="Hero Background Placeholder"
          fill
          className="object-cover object-center"
          quality={10} // Ultra-low quality for speed
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
          placeholder="blur"
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/+F9PQAI8wNPJ7PZuAAAAABJRU5ErkJggg=="
        />

        {/* Full Image (lazy-loaded in Suspense) */}
        <Suspense fallback={null}>
          <Image
            src="/banner.webp"
            alt="Hero Background"
            fill
            className="object-cover object-center"
            quality={50}
            loading="lazy" // Lazy-load the full image
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
          />
        </Suspense>

        {/* Semi-transparent overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-50 z-10"></div>

        {/* Hero content */}
        <div className="absolute inset-0 z-20 flex items-center justify-center text-center px-4">
          <div className="max-w-4xl mx-auto">
            <HeroContent />
          </div>
        </div>
      </div>

      {/* Above-the-fold components */}
      <AboutUs />
      <LatestProducts />

      {/* Below-the-fold components */}
      <BelowFoldSections />

      <Footer />
    </>
  );
}