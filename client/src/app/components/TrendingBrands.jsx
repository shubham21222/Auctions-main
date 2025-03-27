'use client'
import React, { useState, useEffect } from "react";
import { useSelector } from 'react-redux';
import axios from 'axios';
import Image from "next/image";
import Link from "next/link";

const TrendingBrands = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const auth = useSelector((state) => state.auth);
  const token = auth?.token;

  const API_URL = 'https://bid.nyelizabeth.com/v1/api/brands';

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true);
        const response = await axios.get(API_URL, {
          headers: { Authorization: token }
        });
        const brandData = Array.isArray(response.data.items) ? response.data.items : [];
        setBrands(brandData);
      } catch (error) {
        console.error('Error fetching brands:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, [token]);

  return (
    <section className="py-16 px-4 container mx-auto max-w-screen-2xl bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="text-start mb-12">
        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Trending Brands
        </h2>
        <div className="w-24 h-1 text-start bg-yellow-500 mt-4 rounded-full"></div>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
          Discover the world’s most iconic luxury brands.
        </p>
      </div>

      {/* Brand Grid */}
      {loading ? (
        <div className="text-center">Loading brands...</div>
      ) : (
        <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {brands.map((brand) => (
            <Link
              key={brand._id}
              href={`/trending-brands/${brand._id}`} // Use _id instead of name
              passHref
            >
              <div className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transform transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer">
                {/* Image Container */}
                <div className="relative w-full h-40 flex items-center justify-center">
                  <Image
                    src={brand.images[0] || "https://via.placeholder.com/150"} // Use first image or fallback
                    alt={brand.brandName}
                    width={150}
                    height={100}
                    className="object-contain transition-transform duration-500 group-hover:scale-110"
                    style={{
                      width: "auto",
                      height: "100%",
                      maxHeight: "100px",
                    }}
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity duration-300 flex items-center justify-center">
                    <span className="text-white text-xl font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {brand.brandName}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
};

export default TrendingBrands;