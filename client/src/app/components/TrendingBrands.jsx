import React from "react";
import Image from "next/image";
import Link from "next/link";
import rolex from "../../../public/rolex.webp";
import louis from "../../../public/Louis.webp";
import Hermes from "../../../public/Hermes.webp";

const brands = [
  {
    name: "Rolex",
    logo: rolex,
  },
  {
    name: "Hermes",
    logo: Hermes,
  },
  {
    name: "Patek Philippe",
    logo: "https://beta.nyelizabeth.com/wp-content/uploads/2024/03/i.webp",
  },
  {
    name: "Louis Vuitton",
    logo: louis,
  },
];

const TrendingBrands = () => {
  return (
    <section className="py-16 px-4 container mx-auto max-w-screen-2xl bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="text-start mb-12">
        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Trending Brands
        </h2>
        <div className="w-24 h-1 text-start  bg-yellow-500 mt-4  rounded-full"></div>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
          Discover the world’s most iconic luxury brands.
        </p>
      </div>

      {/* Brand Grid */}
      <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {brands.map((brand, index) => (
          <Link
            key={index}
            href={`/trending-brands/${brand.name.toLowerCase().replace(/\s+/g, "-")}`}
            passHref
          >
            <div className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transform transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer">
              {/* Image Container */}
              <div className="relative w-full h-40 flex items-center justify-center">
                <Image
                  src={brand.logo}
                  alt={brand.name}
                  width={150}
                  height={100}
                  className="object-contain transition-transform duration-500 group-hover:scale-110"
                  style={{
                    width: "auto",
                    height: "100%", // Ensures all images fill the container height
                    maxHeight: "100px", // Consistent max height
                  }}
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity duration-300 flex items-center justify-center">
                  <span className="text-white text-xl font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {brand.name}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default TrendingBrands;