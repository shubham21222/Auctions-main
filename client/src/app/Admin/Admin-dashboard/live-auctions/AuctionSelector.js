"use client";

import { useState, useEffect } from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import toast from "react-hot-toast";
import config from "@/app/config_BASE_URL";

const AuctionSelector = ({ auctions, onAuctionSelect, selectedAuction, token }) => {
  const [liveAuctions, setLiveAuctions] = useState([]);
  const [endedAuctions, setEndedAuctions] = useState([]);

  useEffect(() => {
    const filteredLiveAuctions = auctions.filter(
      (auction) => auction.status === "ACTIVE" && auction.auctionType === "LIVE"
    );
    const filteredEndedAuctions = auctions.filter(
      (auction) => auction.status === "ENDED" && auction.auctionType === "LIVE"
    );
    setLiveAuctions(filteredLiveAuctions);
    setEndedAuctions(filteredEndedAuctions);
  }, [auctions]);

  const handleReopenLot = async (auction) => {
    if (!auction.catalog || !auction.lotNumber) {
      toast.error("Cannot reopen lot: Missing catalog name or lot number.");
      return;
    }

    try {
      const response = await fetch(`${config.baseURL}/v1/api/auction/updateCatalog`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify({
          catalog: auction.catalog,
          lotNumber: auction.lotNumber,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to reopen lot");
      }

      toast.success("Lot reopened successfully!");
      // Update the auction status locally
      onAuctionSelect({ ...auction, status: "ACTIVE" });
    } catch (error) {
      console.error("Error reopening lot:", error);
      toast.error(`Failed to reopen lot: ${error.message}`);
    }
  };

  return (
    <div className="mb-4">
      <div className="mb-2">
        <h2 className="text-sm font-semibold text-gray-900 mb-1">Select Live Auction</h2>
        <Select
          value={selectedAuction?._id || ""}
          onValueChange={(value) => {
            const selected = liveAuctions.find((auction) => auction._id === value);
            onAuctionSelect(selected);
          }}
        >
          <SelectTrigger className="w-full md:w-1/3 text-xs py-1">
            <SelectValue placeholder="Select an auction" />
          </SelectTrigger>
          <SelectContent>
            {liveAuctions.length > 0 ? (
              liveAuctions.map((auction) => (
                <SelectItem key={auction._id} value={auction._id} className="text-xs">
                  Lot {auction.lotNumber} - {auction.product?.title}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="no-auctions" disabled className="text-xs">
                No live auctions available
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {endedAuctions.length > 0 && (
        <div className="mt-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">Ended Auctions</h2>
          <div className="space-y-2">
            {endedAuctions.map((auction) => (
              <div key={auction._id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="text-sm text-gray-600">
                  Lot {auction.lotNumber} - {auction.product?.title}
                </div>
                <button
                  onClick={() => handleReopenLot(auction)}
                  className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Reopen Lot
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AuctionSelector;