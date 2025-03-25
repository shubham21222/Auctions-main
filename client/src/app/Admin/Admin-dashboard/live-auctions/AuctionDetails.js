"use client";

import Image from "next/image";

const AuctionDetails = ({ currentAuction, upcomingLots }) => {
  if (!currentAuction) {
    return <p className="text-gray-500 text-lg">Select an auction to view details.</p>;
  }

  return (
    <div className="space-y-6">
      {/* Current Lot Card */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                LOT: {currentAuction?.lotNumber || "N/A"}
              </span>
              <h3 className="text-xl font-bold text-gray-900 mt-2">
                {currentAuction?.product?.title || "N/A"}
              </h3>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Brand</p>
              <p className="font-semibold text-gray-900">{currentAuction?.product?.brand || "N/A"}</p>
            </div>
          </div>
          <div className="relative w-full h-72 mb-4 rounded-lg overflow-hidden">
            <Image
              src={currentAuction?.product?.image || "/placeholder.svg"}
              alt={currentAuction?.product?.title || "Product Image"}
              fill
              className="object-contain"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Estimate</p>
              <p className="font-semibold text-gray-900">
                ${currentAuction?.startingBid || 0} - ${(currentAuction?.startingBid || 0) + 1000}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Current Bid</p>
              <p className="font-semibold text-blue-600">
                ${currentAuction?.currentBid?.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Lots */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Lots</h3>
          {upcomingLots.length > 0 ? (
            <div className="space-y-3">
              {upcomingLots.slice(0, 4).map((lot) => (
                <div
                  key={lot._id}
                  className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                >
                  <div className="w-12 h-12 relative rounded-md overflow-hidden">
                    <Image
                      src={lot.product?.image || "/placeholder.svg"}
                      alt={lot.product?.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Lot {lot.lotNumber}</p>
                    <p className="text-xs text-gray-600">{lot.product?.title}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No upcoming lots available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuctionDetails;