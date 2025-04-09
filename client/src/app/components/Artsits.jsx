'use client'
import React, { useState, useEffect } from "react";
import { useSelector } from 'react-redux';
import axios from 'axios';
import Image from "next/image";
import Link from "next/link";
import config from "@/app/config_BASE_URL";
export default function PopularArtists() {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const auth = useSelector((state) => state.auth);
  const token = auth?.token;

  const API_URL = `${config.baseURL}/v1/api/artist`;

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
                className="relative overflow-hidden rounded-xl group transition-transform duration-300 cursor-pointer bg-white dark:bg-gray-800"
              >
                {artist.images && artist.images.length > 0 ? (
                  <Image
                    src={artist.images[0]}
                    alt={artist.artistName}
                    width={300}
                    height={400}
                    className="w-full h-full object-cover rounded-xl transform group-hover:scale-105 transition-all duration-300"
                  />
                ) : (
                  <div className="w-full h-[300px] flex flex-col items-center justify-center text-gray-400">
                    <svg
                      className="w-16 h-16 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-lg">Image not available</span>
                  </div>
                )}
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