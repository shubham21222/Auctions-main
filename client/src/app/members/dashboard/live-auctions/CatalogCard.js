"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const CatalogCard = ({ catalog, onSelect, isSelected }) => {
  const liveAuctions = catalog.auctions.filter((a) => a.status === "ACTIVE" && a.auctionType === "LIVE");
  const totalLots = catalog.auctions.length;
  const activeLots = liveAuctions.length;

  const handleClick = () => {
    console.log("CatalogCard clicked:", catalog);
    if (onSelect) {
      onSelect(catalog);
    } else {
      console.error("No onSelect handler provided to CatalogCard");
    }
  };

  return (
    <Card 
      className={`cursor-pointer hover:shadow-md transition-shadow duration-200 ${
        isSelected ? 'border-2 border-blue-500' : ''
      }`}
      onClick={handleClick}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold">{catalog.catalogName}</h3>
            <p className="text-sm text-gray-600">{catalog.description}</p>
          </div>
          <Badge variant={activeLots > 0 ? "default" : "secondary"}>
            {activeLots} Active
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-600">Total Lots</p>
            <p className="text-lg font-semibold">{totalLots}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Live Lots</p>
            <p className="text-lg font-semibold">{activeLots}</p>
          </div>
        </div>

        {activeLots > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Current Live Lots:</h4>
            {liveAuctions.slice(0, 3).map((auction) => (
              <div
                key={auction._id}
                className="flex justify-between items-center p-2 bg-gray-50 rounded"
              >
                <div>
                  <p className="text-sm font-medium">Lot {auction.lotNumber}</p>
                  <p className="text-xs text-gray-600">{auction.product?.title}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">${auction.currentBid?.toLocaleString()}</p>
                  <p className="text-xs text-gray-600">Current Bid</p>
                </div>
              </div>
            ))}
            {activeLots > 3 && (
              <p className="text-sm text-gray-600 text-center">
                +{activeLots - 3} more lots...
              </p>
            )}
          </div>
        )}

        {activeLots === 0 && (
          <div className="text-center py-4">
            <p className="text-sm text-gray-600">No live auctions in this catalog</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default CatalogCard; 