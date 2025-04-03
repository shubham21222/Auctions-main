"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

const CatalogCard = ({ catalog, onClick }) => {
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const firstAuction = catalog.auctions[0];

  useEffect(() => {
    if (firstAuction?.product?.image?.[0]) {
      const url = firstAuction.product.image[0];
      setImageUrl(url);
      setImageError(false);
      setIsImageLoaded(false);
    }
  }, [firstAuction]);

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
                <div className="text-center">
                  <p>Image not available</p>
                </div>
              </div>
            ) : (
              <>
                <Image
                  src={imageUrl || "/placeholder.svg"}
                  alt={firstAuction?.product?.title || "Catalog Preview"}
                  fill
                  className={`object-contain transition-opacity duration-300 ${
                    isImageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onError={() => {
                    console.error("Image load error for:", imageUrl);
                    setImageError(true);
                  }}
                  onLoad={() => setIsImageLoaded(true)}
                  unoptimized={true}
                  loading="lazy"
                />
                {!isImageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin"></div>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-600">
              Total Auctions: {catalog.auctions.length}
            </p>
            <p className="text-sm text-gray-600">
              Live Auctions: {catalog.auctions.filter(a => a.status === "ACTIVE" && a.auctionType === "LIVE").length}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default CatalogCard;