'use client'
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSelector } from 'react-redux';
import axios from 'axios';
import Image from "next/image";
import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";
import config from "@/app/config_BASE_URL"; 
import { Play, ChevronLeft, ChevronRight } from "lucide-react";

const ArtistDetail = () => {
  const params = useParams();
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const auth = useSelector((state) => state.auth);
  const token = auth?.token;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (params && params.slug) {
      fetchArtist(params.slug);
    }
  }, [params]);

  const fetchArtist = async (id) => {
    try {
      setLoading(true);
      const response = await axios.get(`${config.baseURL}/v1/api/artist/${id}`, {
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
  const artistImages = Array.isArray(artist?.images) && artist.images.length > 0 
    ? artist.images 
    : ["https://via.placeholder.com/600"];

  const artistVideos = Array.isArray(artist?.videos) && artist.videos.length > 0 
    ? artist.videos 
    : [];

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === artistImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? artistImages.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800">
      <Header />
      <main className="container mx-auto px-4 py-16 mt-[80px]">
        {/* Hero Section with Image and Summary */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Left: Image Gallery */}
          <div className="relative w-full h-[400px] md:h-[600px] group">
            <Image
              src={artistImages[currentImageIndex]}
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
            
            {/* Image Navigation */}
            {artistImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-all duration-300 opacity-0 group-hover:opacity-100"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-all duration-300 opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {artistImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentImageIndex ? 'bg-white w-4' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
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

        {/* Video Section */}
        {artistVideos.length > 0 && (
          <section className="mb-12">
            <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-6 border-b-2 border-yellow-500 pb-2">
              Videos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {artistVideos.map((video, index) => (
                <div key={index} className="relative aspect-video rounded-xl overflow-hidden shadow-lg group">
                  <iframe
                    src={video}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Play className="w-12 h-12 text-white" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

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