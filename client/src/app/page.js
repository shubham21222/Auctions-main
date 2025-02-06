import Image from "next/image";
import Header from "./components/Header";
import HeroThumbs from "./components/HeroThumbs";
import HeroContent from "./components/HeroContent";
import HeroBg from "../../public/hero-bg.png";
import AboutUs from "./components/Aboutus";
import StatsSection from "./components/StatsSection";
import Footer from "./components/Footer";
import TrendingBrands from "./components/TrendingBrands";
import NewsletterForm from "./components/NewsletterForm";
import { ProductCard } from "./Buy-now/components/product-card";
import PartnersSection from "./components/PartnersSection";
import PopularArtists from "./components/Artsits";

export default function Home() {

  const products = [
    {
      image: "https://beta.nyelizabeth.com/wp-content/uploads/2025/01/product4ccd551f28184638f7c306b6172c7158.webp",
      name: "Hermès Kelly Picnic Mini",
      price: 45807,
      slug: "hermes-kelly-picnic-mini-swift-willow-blue-du-nord-silver-metal-fittings", // Unique slug for this product
    },
    {
      image: "https://beta.nyelizabeth.com/wp-content/uploads/2025/01/product612dfd189b8b384cb5fbcf7319435a69.webp",
      name: "Cartier Love Pavé",
      price: 32355,
      slug: "cartier-love-pave-diamond-bracelet-750-yg", // Unique slug for this product
    },
    {
      image: "https://beta.nyelizabeth.com/wp-content/uploads/2025/01/productf0cc116dd0ca1729dcaf90f1aee103e8.webp",
      name: "Tiffany Jean Schlumberger",
      price: 32554,
      slug: "tiffany-jean-schlumberger-apollo-diamond-brooch", // Unique slug for this product
    },
  ];


  return (
    <>
      <Header />
      <div className="relative mx-auto max-w-[100vw] lg:mx-[50px] md:mx-[30px] sm:mx-[12px] mt-[80px] rounded-[20px] overflow-hidden h-[82vh]">
        {/* Background image */}
        <Image
          src="https://beta.nyelizabeth.com/wp-content/uploads/2024/11/banner-Image2_3_11zon.webp"
          alt="Hero Background"
          fill
          className="object-cover object-center"
          quality={100}
          priority
        />

        {/* Semi-transparent overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-50 z-10"></div>

        {/* Hero content */}
        <div className="absolute inset-0 z-20 flex items-center justify-center text-center px-4">
          <div className="max-w-4xl mx-auto">
            <HeroContent />
          </div>
        </div>
      </div>
      <AboutUs />
      {/* <HeroThumbs /> */}
      <div className="grid mx-auto max-w-7xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product, index) => (
          <ProductCard key={index} {...product} />
        ))}
      </div>
      <StatsSection />
      <TrendingBrands />
      <PopularArtists />
      <PartnersSection />
      <NewsletterForm />
      <Footer />
    </>
  );
}