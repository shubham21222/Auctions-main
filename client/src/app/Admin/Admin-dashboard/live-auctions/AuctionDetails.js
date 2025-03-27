"use client";

import Image from "next/image";

const AuctionDetails = ({ currentAuction, upcomingLots }) => {
  if (!currentAuction) {
    return <p className="text-gray-500 text-sm">Select an auction to view details.</p>;
  }

  return (
    <div className="space-y-2">
      {/* Current Lot Card */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
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
          <div className="relative w-full h-[300px] mb-4">
            <Image
              src={currentAuction?.product?.image || "/placeholder.svg"}
              alt={currentAuction?.product?.title || "Product Image"}
              fill
              className="object-contain"
            />
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-sm">Brand: {currentAuction?.product?.brand || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm">Estimate: ${currentAuction?.startingBid || 0} - ${(currentAuction?.startingBid || 0) + 1000}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Lots */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-2">
          {upcomingLots.map((lot) => (
            <div
              key={lot._id}
              className="flex items-center gap-2 p-2 border-b last:border-b-0"
            >
              <p className="text-sm">
                Lot {lot.lotNumber} - {lot.product?.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AuctionDetails;