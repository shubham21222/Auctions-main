"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

const CatalogCard = ({ catalog, onClick }) => {
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const firstAuction = catalog?.auctions?.[0];

  useEffect(() => {
    if (firstAuction?.product?.image?.[0]) {
      const url = firstAuction.product.image[0];
      console.log("Setting image URL for CatalogCard:", url);
      setImageUrl(url);
      setImageError(false);
      setIsImageLoaded(false);
    } else {
      console.log("No valid image found for CatalogCard, using placeholder");
      setImageUrl("/placeholder.svg");
      setImageError(false);
      setIsImageLoaded(true); // Placeholder doesn’t need loading
    }
  }, [firstAuction]);

  return (
    <div
      className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <h3 className="text-lg font-semibold mb-2">{catalog?.catalogName || "Unnamed Catalog"}</h3>
      {firstAuction ? (
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
                  src={imageUrl}
                  alt={firstAuction?.product?.title || "Catalog Preview"}
                  fill
                  className={`object-contain transition-opacity duration-300 ${
                    isImageLoaded ? "opacity-100" : "opacity-0"
                  }`}
                  onError={(e) => {
                    console.error("Image load error for CatalogCard:", imageUrl, e);
                    setImageError(true);
                  }}
                  onLoad={() => {
                    console.log("Image loaded successfully for CatalogCard:", imageUrl);
                    setIsImageLoaded(true);
                  }}
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
              Live Auctions: {catalog.auctions.filter((a) => a.status === "ACTIVE" && a.auctionType === "LIVE").length}
            </p>
          </div>
        </>
      ) : (
        <p className="text-sm text-gray-500">No auctions available</p>
      )}
    </div>
  );
};

export default CatalogCard;