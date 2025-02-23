"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import artistData from "../../../../public/scraped_artists_data.json"; // Adjust path as needed
import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";

const ArtistDetail = () => {
  const params = useParams();
  const [artistname, setArtistname] = useState(null);

  useEffect(() => {
    if (params && params.slug) {
      setArtistname(params.slug);
    }
  }, [params]);

  if (!artistname) {
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

  const artist = artistData.find(
    (a) => a.artist_name.toLowerCase() === artistname.toLowerCase()
  );

  if (!artist) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-100 to-red-100">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white">
            Artist Not Found
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            The artist you are looking for does not exist. Requested artist: "{artistname}"
          </p>
        </div>
      </div>
    );
  }

  // Split detailed content into paragraphs at em dash (–) or periods for natural breaks
  const paragraphs = artist.artist_details.detailed_content
    .split(/[.–]/) // Split on em dash (–) or period (.) followed by optional space
    .filter((para) => para.trim() !== "")
    .map((para) => para.trim());

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800">
      <Header />
      <main className="container mx-auto px-4 py-16 mt-[80px]">
        {/* Hero Section with Image and Summary */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Left: Full Image */}
          <div className="relative w-full h-[400px] md:h-[600px]">
            <Image
              src={
                artist.artist_details.main_image_url !== "N/A" &&
                !artist.artist_details.main_image_url.startsWith("data:image/svg")
                  ? artist.artist_details.main_image_url
                  : artist.initial_image_url
              }
              alt={artist.artist_details.main_image_alt || artist.artist_name}
              layout="fill"
              objectFit="cover"
              className="rounded-xl shadow-2xl transition-transform duration-500 hover:scale-105"
            />
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
              <h1 className="text-3xl md:text-5xl font-extrabold text-white capitalize drop-shadow-lg">
                {artist.artist_name.replace("-", " ")}
              </h1>
            </div>
          </div>

          {/* Right: Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col justify-center">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4 border-b-2 border-yellow-500 pb-2">
              Summary
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              {artist.artist_details.summary_text}
            </p>
          </div>
        </section>

        {/* Detailed Biography Section */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
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
      </main>
      <Footer />
    </div>
  );
};

export default ArtistDetail;