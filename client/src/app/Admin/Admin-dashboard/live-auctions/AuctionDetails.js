"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

const AuctionDetails = ({ currentAuction, upcomingLots }) => {
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    if (currentAuction?.product?.image?.[0]) {
      const url = currentAuction.product.image[0];
      setImageUrl(url);
      setImageError(false);
      setIsImageLoaded(false);
    }
  }, [currentAuction]);

  if (!currentAuction) {
    return <p className="text-gray-500 text-sm">Select an auction to view details.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">Lot:</span>
                <span className="text-lg font-bold">{currentAuction?.lotNumber || "N/A"}</span>
              </div>
              <h2 className="text-lg font-bold mt-1 uppercase">
                {currentAuction?.product?.title || "N/A"}
              </h2>
            </div>
          </div>
          
          <div className="relative w-full h-[300px] bg-gray-100 rounded-lg overflow-hidden">
            {imageError ? (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <p>Image not available</p>
                </div>
              </div>
            ) : (
              <>
                <Image
                  src={imageUrl || "/placeholder.svg"}
                  alt={currentAuction?.product?.title || "Product Image"}
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

          <div className="mt-4 space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">Brand:</p>
              <p className="text-sm font-medium">{currentAuction?.product?.brand || "N/A"}</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">Estimate:</p>
              <p className="text-sm font-medium">
                ${currentAuction?.startingBid?.toLocaleString() || "0"} - ${((currentAuction?.startingBid || 0) + 1000).toLocaleString()}
              </p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">Status:</p>
              <p className={`text-sm font-medium ${
                currentAuction.status === "ACTIVE" ? "text-green-600" : "text-gray-600"
              }`}>
                {currentAuction.status}
              </p>
            </div>
          </div>
        </div>
      </div>

      {upcomingLots.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Upcoming Lots</h3>
            <div className="space-y-2">
              {upcomingLots.map((lot) => (
                <div
                  key={lot._id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                >
                  <p className="text-sm">
                    Lot {lot.lotNumber}
                  </p>
                  <p className="text-sm font-medium text-gray-600">
                    {lot.product?.title}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuctionDetails;