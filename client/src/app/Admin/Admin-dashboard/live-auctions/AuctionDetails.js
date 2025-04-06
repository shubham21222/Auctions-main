"use client";

import Image from "next/image";
import { memo, useEffect, useState } from "react";

const AuctionDetails = memo(({ currentAuction, upcomingLots, onSelectLot }) => {
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    if (currentAuction?.product?.image?.[0]) {
      const newImageUrl = currentAuction.product.image[0];
      if (newImageUrl !== imageUrl) {
        console.log("Setting image URL for AuctionDetails:", newImageUrl);
        setImageUrl(newImageUrl);
      }
    }
  }, [currentAuction?.product?.image]);

  // Debug re-renders
  useEffect(() => {
    console.log("AuctionDetails re-rendered with props:", { currentAuction, upcomingLots });
  }, [currentAuction, upcomingLots]);

  if (!currentAuction) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <p className="text-gray-500">No active auction selected.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Current Auction</h2>
        <div className="flex gap-4">
          <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-gray-100">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={currentAuction.product?.title || "Auction Item"}
                fill
                className="object-cover"
                onError={(e) => {
                  console.error(`Failed to load image: ${imageUrl}`);
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                No image
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center text-gray-500 hidden">
              Image not available
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium">{currentAuction.product?.title || "Unnamed Item"}</h3>
            <p className="text-sm text-gray-600">Lot: {currentAuction.lotNumber || "N/A"}</p>
            <p className="text-sm text-gray-600">Current Bid: ${currentAuction.currentBid?.toLocaleString() || 0}</p>
            <p className="text-sm text-gray-600">Status: {currentAuction.status}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Upcoming Lots</h2>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {upcomingLots.length > 0 ? (
            upcomingLots.map((lot) => (
              <div 
                key={lot._id} 
                className="flex gap-4 p-3 rounded-lg border border-gray-200 hover:border-gray-400 cursor-pointer transition-colors duration-200"
                onClick={() => onSelectLot(lot)}
              >
                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                  {lot.product?.image?.[0] ? (
                    <Image
                      src={lot.product.image[0]}
                      alt={lot.product?.title || "Upcoming Lot"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                      No image
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-md font-medium">{lot.product?.title || "Unnamed Item"}</h3>
                  <p className="text-sm text-gray-600">Lot: {lot.lotNumber || "N/A"}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No upcoming lots.</p>
          )}
        </div>
      </div>
    </div>
  );
});

AuctionDetails.displayName = "AuctionDetails";

export default AuctionDetails;