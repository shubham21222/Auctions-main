'use client'
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSelector } from 'react-redux';
import axios from 'axios';
import Image from "next/image";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import config from "@/app/config_BASE_URL";
const BrandDetail = () => {
  const params = useParams();
  const [brand, setBrand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const auth = useSelector((state) => state.auth);
  const token = auth?.token;

  useEffect(() => {
    if (params && params.slug) {
      fetchBrand(params.slug);
    }
  }, [params]);

  const fetchBrand = async (id) => {
    try {
      setLoading(true);
      const response = await axios.get(`${config.baseURL}/v1/api/brands/${id}`, {
        headers: { Authorization: token }
      });
      setBrand(response.data.items); // Extract brand from 'items'
    } catch (err) {
      console.error('Error fetching brand:', err);
      setError('Failed to load brand details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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

  if (error || !brand) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-100 to-red-100">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white">
            Brand Not Found
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            {error || `The brand with ID "${params?.slug}" does not exist.`}
          </p>
        </div>
      </div>
    );
  }

  const paragraphs = brand.Biography
    ? brand.Biography.split(/[.\n]/)
      .filter((para) => para.trim() !== "")
      .map((para) => para.trim())
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800">
      <Header />
      <main className="container mx-auto px-4 py-16 mt-[80px]">
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="relative w-full h-[400px] md:h-[600px]">
            <Image
              src={brand.images[0] || "https://via.placeholder.com/600"} // Use first image
              alt={brand.brandName}
              layout="fill"
              objectFit="cover"
              className="rounded-xl shadow-2xl transition-transform duration-500 hover:scale-105"
            />
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
              <h1 className="text-3xl md:text-5xl font-extrabold text-white capitalize drop-shadow-lg">
                {brand.brandName.replace(/-/g, " ")}
              </h1>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col justify-center">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4 border-b-2 border-yellow-500 pb-2">
              Summary
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              {brand.summary || "No summary available"}
            </p>
          </div>
        </section>
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-6 border-b-2 border-yellow-500 pb-2">
            Detailed Biography
          </h2>
          <div className="space-y-6">
            {paragraphs.length > 0 ? (
              paragraphs.map((para, index) => (
                <p
                  key={index}
                  className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700 p-4 rounded-lg"
                >
                  {para}
                </p>
              ))
            ) : (
              <p className="text-lg text-gray-700 dark:text-gray-300">
                No detailed biography available.
              </p>
            )}
          </div>
        </section>
        {brand.images.length > 1 && (
          <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-6 border-b-2 border-yellow-500 pb-2">
              Gallery
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {brand.images.slice(1).map((image, index) => ( // Skip first image used in hero
                <div
                  key={index}
                  className="relative w-full h-[200px] rounded-lg overflow-hidden shadow-md"
                >
                  <Image
                    src={image}
                    alt={`Gallery image ${index + 1} for ${brand.brandName}`}
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