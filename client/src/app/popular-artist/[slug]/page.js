'use client'
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSelector } from 'react-redux';
import axios from 'axios';
import Image from "next/image";
import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";

const ArtistDetail = () => {
  const params = useParams();
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const auth = useSelector((state) => state.auth);
  const token = auth?.token;

  useEffect(() => {
    if (params && params.slug) {
      fetchArtist(params.slug);
    }
  }, [params]);

  const fetchArtist = async (id) => {
    try {
      setLoading(true);
      const response = await axios.get(`https://bid.nyelizabeth.com/v1/api/artist/${id}`, {
        headers: { Authorization: token } // Add token to headers
      });
      // Extract artist from 'items' object
      const artistData = response.data.items;
      setArtist(artistData);
    } catch (err) {
      console.error('Error fetching artist:', err);
      setError('Failed to load artist details');
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
            Fetching artist details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !artist) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-100 to-red-100">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white">
            Artist Not Found
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            {error || `The artist with ID "${params?.slug}" does not exist.`}
          </p>
        </div>
      </div>
    );
  }

  // Split biography into paragraphs
  const paragraphs = artist.Biography
    ? artist.Biography.split(/[.–]/)
      .filter((para) => para.trim() !== "")
      .map((para) => para.trim())
    : [];

  // Handle images safely
  const artistImage = Array.isArray(artist.images) && artist.images.length > 0 
    ? artist.images[0] 
    : "https://via.placeholder.com/600";

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800">
      <Header />
      <main className="container mx-auto px-4 py-16 mt-[80px]">
        {/* Hero Section with Image and Summary */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Left: Full Image */}
          <div className="relative w-full h-[400px] md:h-[600px]">
            <Image
              src={artistImage}
              alt={artist.artistName}
              layout="fill"
              objectFit="cover"
              className="rounded-xl shadow-2xl transition-transform duration-500 hover:scale-105"
            />
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
              <h1 className="text-3xl md:text-5xl font-extrabold text-white capitalize drop-shadow-lg">
                {artist.artistName}
              </h1>
            </div>
          </div>

          {/* Right: Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col justify-center">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4 border-b-2 border-yellow-500 pb-2">
              Summary
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              {artist.summary || "No summary available"}
            </p>
          </div>
        </section>

        {/* Detailed Biography Section */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
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
      </main>
      <Footer />
    </div>
  );
};

export default ArtistDetail;