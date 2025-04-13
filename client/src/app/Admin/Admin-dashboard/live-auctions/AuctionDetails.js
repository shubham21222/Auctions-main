"use client";

import Image from "next/image";
import { memo, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import config from "@/app/config_BASE_URL";

const AuctionDetails = memo(({ currentAuction, upcomingLots, onSelectLot }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    if (currentAuction?.product?.image?.[0]) {
      const newImageUrl = currentAuction.product.image[0];
      if (newImageUrl !== imageUrl) {
        console.log("Setting image URL for AuctionDetails:", newImageUrl);
        setImageUrl(newImageUrl);
      }
    }
  }, [currentAuction?.product?.image]);

  useEffect(() => {
    console.log("AuctionDetails re-rendered with props:", { currentAuction, upcomingLots });
  }, [currentAuction, upcomingLots]);

  const handleReopenLot = async (lot) => {
    if (!lot.catalog || !lot.lotNumber) {
      toast.error("Cannot reopen lot: Missing catalog name or lot number.");
      return;
    }

    // Convert lotNumber to a number
    const lotNumberAsNumber = parseInt(lot.lotNumber, 10);
    if (isNaN(lotNumberAsNumber)) {
      toast.error("Invalid lot number: Must be a valid number.");
      return;
    }

    // Create the payload object with lotNumber as a number
    const payload = {
      catalog: lot.catalog, // String
      lotNumber: lotNumberAsNumber, // Number
    };

    // Log the payload before sending to verify the type
    console.log("Reopen Lot Payload:", payload);
    console.log("lotNumber type:", typeof payload.lotNumber);

    try {
      const response = await fetch(`${config.baseURL}/v1/api/auction/updateCatalog`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to reopen lot");
      }

      toast.success("Lot reopened successfully!");
      // Update the lot status locally to "ACTIVE"
      onSelectLot({ ...lot, status: "ACTIVE" });
    } catch (error) {
      console.error("Error reopening lot:", error);
      toast.error(`Failed to reopen lot: ${error.message}`);
    }
  };

  if (!currentAuction) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <p className="text-gray-500">No active auction selected.</p>
      </div>
    );
  }

  const displayStatus = currentAuction.status === "ENDED" ? "SOLD" : currentAuction.status;

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
            <p className="text-sm text-gray-600">
              Current Bid: ${currentAuction.currentBid?.toLocaleString() || 0}
            </p>
            <p className="text-sm text-gray-600">Status: {displayStatus}</p>
          </div>
        </div>
        {currentAuction.status === "ENDED" && (
          <button
            onClick={() => handleReopenLot(currentAuction)}
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Reopen Lot
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Upcoming Lots</h2>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {upcomingLots.length > 0 ? (
            upcomingLots.map((lot) => (
              <div
                key={lot._id}
                className={`flex gap-4 p-3 rounded-lg border ${
                  lot.status === "ENDED" ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-gray-400"
                } transition-colors duration-200`}
              >
                <div className={`flex gap-4 w-full ${lot.status !== "ENDED" ? "cursor-pointer" : ""}`} 
                  onClick={lot.status !== "ENDED" ? () => onSelectLot(lot) : undefined}>
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
                  <div className="flex-1">
                    <h3 className="text-md font-medium">{lot.product?.title || "Unnamed Item"}</h3>
                    <p className="text-sm text-gray-600">Lot: {lot.lotNumber || "N/A"}</p>
                    <p className="text-sm text-gray-600">Status: {lot.status}</p>
                    {lot.status === "ENDED" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReopenLot(lot);
                        }}
                        className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        Reopen Lot
                      </button>
                    )}
                  </div>
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