"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock } from "lucide-react";

export default function CatalogHeader({ productName, auctionEndDate }) {
  return (
    <div className="relative bg-gradient-to-b from-luxury-charcoal to-gray-900 text-white py-12 px-4">
      <div className="container mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-6 opacity-80">
          <Link href="/" className="hover:text-luxury-gold transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/catalog" className="hover:text-luxury-gold transition-colors">
            Catalog
          </Link>
          <span>/</span>
          <span className="font-medium">{productName || "Loading..."}</span>
        </nav>

        {/* Title and End Date */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight animate-fade-in">
            {productName || "Loading..."}
          </h1>
          <div className="mt-4 md:mt-0 flex items-center gap-2 text-luxury-gold animate-pulse">
            <Clock className="w-5 h-5" />
            <span>Ends: {auctionEndDate ? new Date(auctionEndDate).toLocaleDateString() : "N/A"}</span>
          </div>
        </div>

        {/* Brand Section */}
        <div className="mt-8 flex items-center gap-4">
          <Image
            src="https://beta.nyelizabeth.com/wp-content/uploads/2024/05/Rectangle.svg"
            alt="NY ELIZABETH"
            width={80}
            height={80}
            className="rounded-full shadow-lg border-2 border-luxury-gold"
          />
          <h2 className="text-2xl font-semibold tracking-wide text-luxury-gold">NY ELIZABETH</h2>
        </div>
      </div>
      {/* Subtle Overlay */}
      <div className="absolute inset-0 bg-black/20 z-[-1]"></div>
    </div>
  );
}