"use client";

import { useState, useEffect } from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const AuctionSelector = ({ auctions, onAuctionSelect, selectedAuction }) => {
  const [liveAuctions, setLiveAuctions] = useState([]);

  useEffect(() => {
    const filteredLiveAuctions = auctions.filter(
      (auction) => auction.status === "ACTIVE" && auction.auctionType === "LIVE"
    );
    setLiveAuctions(filteredLiveAuctions);
  }, [auctions]);

  return (
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
  );
};

export default AuctionSelector;