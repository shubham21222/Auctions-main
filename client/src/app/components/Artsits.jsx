'use client'
import React, { useState, useEffect } from "react";
import { useSelector } from 'react-redux';
import axios from 'axios';
import Image from "next/image";
import Link from "next/link";

export default function PopularArtists() {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const auth = useSelector((state) => state.auth);
  const token = auth?.token;

  const API_URL = 'https://bid.nyelizabeth.com/v1/api/artist';

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        setLoading(true);
        const response = await axios.get(API_URL, {
          headers: { Authorization: token }
        });
        const artistData = Array.isArray(response.data.items) ? response.data.items : [];
        setArtists(artistData);
      } catch (error) {
        console.error('Error fetching artists:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArtists();
  }, [token]);

  return (
    <section className="px-4 container mx-auto py-10">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
        Popular Artists
      </h2>
      <div className="w-20 h-1 bg-yellow-500 mt-2 mb-6"></div>
      
      {loading ? (
        <div className="text-center">Loading artists...</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {artists.map((artist) => (
            <Link
              key={artist._id}
              href={`/popular-artist/${artist._id}`} // Using _id instead of name
              passHref
            >
              <div
                className="relative overflow-hidden rounded-xl group transition-transform duration-300 cursor-pointer"
              >
                <Image
                  src={artist.images[0] || "https://via.placeholder.com/300x400"} // Use first image or fallback
                  alt={artist.artistName}
                  width={300}
                  height={400}
                  className="w-full h-full object-cover rounded-xl transform group-hover:scale-105 transition-all duration-300"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                  <p className="text-white text-lg font-semibold capitalize">
                    {artist.artistName}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}