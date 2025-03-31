"use client";

import Image from "next/image";
import { useState } from "react";

const CatalogCard = ({ catalog, onClick }) => {
  const [imageError, setImageError] = useState(false);
  const firstAuction = catalog.auctions[0]; // Use first auction for preview

  return (
    <div
      className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <h3 className="text-lg font-semibold mb-2">{catalog.catalogName}</h3>
      {firstAuction && (
        <>
          <div className="relative w-full h-[200px] mb-4 bg-gray-100 rounded-lg overflow-hidden">
            {imageError ? (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
                Image not available
              </div>
            ) : (
              <Image
                src={firstAuction.product?.image?.[0] || "/placeholder.svg"}
                alt={firstAuction.product?.title || "Catalog Preview"}
                fill
                className="object-contain"
                onError={() => setImageError(true)}
                priority
              />
            )}
          </div>
          <p className="text-sm">Auctions: {catalog.auctions.length}</p>
          <p className="text-sm">
            Live Auctions: {catalog.auctions.filter(a => a.status === "ACTIVE" && a.auctionType === "LIVE").length}
          </p>
        </>
      )}
    </div>
  );
};

export default CatalogCard;