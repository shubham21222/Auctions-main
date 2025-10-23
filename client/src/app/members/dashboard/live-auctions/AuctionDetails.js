"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPriceWithCurrency } from "@/utils/priceFormatter";

const AuctionDetails = ({ currentAuction, upcomingLots }) => {
  if (!currentAuction) return null;

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-semibold mb-1">Lot {currentAuction.lotNumber}</h2>
            <h3 className="text-lg font-medium text-gray-700">{currentAuction.product?.title}</h3>
          </div>
          <Badge variant={currentAuction.status === "ACTIVE" ? "default" : "secondary"}>
            {currentAuction.status}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-600">Starting Bid</p>
            <p className="text-lg font-semibold">{formatPriceWithCurrency(currentAuction.startingBid, true)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Current Bid</p>
            <p className="text-lg font-semibold">{formatPriceWithCurrency(currentAuction.currentBid, true)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Reserve Price</p>
            <p className="text-lg font-semibold">{formatPriceWithCurrency(currentAuction.reservePrice, true)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Time Remaining</p>
            <p className="text-lg font-semibold">{currentAuction.timeRemaining || "N/A"}</p>
          </div>
        </div>

        {currentAuction.product?.description && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold mb-2">Description</h4>
            <p className="text-sm text-gray-600">{currentAuction.product.description}</p>
          </div>
        )}

        {currentAuction.product?.images && currentAuction.product.images.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold mb-2">Images</h4>
            <div className="grid grid-cols-2 gap-2">
              {currentAuction.product.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Product image ${index + 1}`}
                  className="w-full h-32 object-cover rounded"
                />
              ))}
            </div>
          </div>
        )}
      </Card>

      {upcomingLots && upcomingLots.length > 0 && (
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Upcoming Lots</h3>
          <div className="space-y-2">
            {upcomingLots.map((lot) => (
              <div
                key={lot._id}
                className="flex justify-between items-center p-2 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer"
              >
                <div>
                  <p className="text-sm font-medium">Lot {lot.lotNumber}</p>
                  <p className="text-xs text-gray-600">{lot.product?.title}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">${lot.startingBid?.toLocaleString()}</p>
                  <p className="text-xs text-gray-600">Starting Bid</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default AuctionDetails;