"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import brandData from "../../../../public/scraped_brands_data.json"; // Adjust path
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

const BrandDetail = () => {
  const params = useParams();
  const [brandSlug, setBrandSlug] = useState(null);

  useEffect(() => {
    if (params && params.slug) {
      setBrandSlug(params.slug);
    }
  }, [params]);

  if (!brandSlug) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-100 to-blue-100">
        <div className="text-center animate-pulse">
          <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white">
            Loading...
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Fetching brand details...
          </p>
        </div>
      </div>
    );
  }

  const brand = brandData.find(
    (b) => b.brand_name.toLowerCase() === brandSlug.toLowerCase()
  );

  if (!brand) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-100 to-red-100">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white">
            Brand Not Found
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            The brand you are looking for does not exist. Requested brand: "{brandSlug}"
          </p>
        </div>
      </div>
    );
  }

  const paragraphs = brand.brand_details.detailed_content
    .split(/[.\n]/)
    .filter((para) => para.trim() !== "")
    .map((para) => para.trim());

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800">
      <Header />
      <main className="container mx-auto px-4 py-16 mt-[80px]">
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="relative w-full h-[400px] md:h-[600px]">
            <Image
              src={
                brand.brand_details.main_image_url !== "N/A" &&
                !brand.brand_details.main_image_url.startsWith("data:image/svg")
                  ? brand.brand_details.main_image_url
                  : brand.initial_image_url
              }
              alt={brand.brand_details.main_image_alt || brand.brand_name}
              layout="fill"
              objectFit="cover"
              className="rounded-xl shadow-2xl transition-transform duration-500 hover:scale-105"
            />
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
              <h1 className="text-3xl md:text-5xl font-extrabold text-white capitalize drop-shadow-lg">
                {brand.brand_name.replace(/-/g, " ")}
              </h1>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col justify-center">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4 border-b-2 border-yellow-500 pb-2">
              Summary
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              {brand.brand_details.summary_text}
            </p>
          </div>
        </section>
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-6 border-b-2 border-yellow-500 pb-2">
            Detailed Biography
          </h2>
          <div className="space-y-6">
            {paragraphs.map((para, index) => (
              <p
                key={index}
                className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700 p-4 rounded-lg"
              >
                {para}
              </p>
            ))}
          </div>
        </section>
        {brand.brand_details.gallery_images.length > 0 && (
          <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-6 border-b-2 border-yellow-500 pb-2">
              Gallery
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {brand.brand_details.gallery_images.map((image, index) => (
                <div
                  key={index}
                  className="relative w-full h-[200px] rounded-lg overflow-hidden shadow-md"
                >
                  <Image
                    src={image.thumbnail_url}
                    alt={`Gallery image ${index + 1} for ${brand.brand_name}`}
                    layout="fill"
                    objectFit="cover"
                    className="transition-transform duration-500 hover:scale-110"
                  />
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default BrandDetail;