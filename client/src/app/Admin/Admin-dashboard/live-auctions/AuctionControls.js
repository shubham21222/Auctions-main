"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

const AuctionControls = ({
  currentAuction,
  bidHistory,
  competingBids,
  handleAdminAction,
  handleSendMessage,
  message,
  setMessage,
  watchers,
  socket, // Add socket as a prop
}) => {
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [competitorBidAmount, setCompetitorBidAmount] = useState("");

  if (!currentAuction) return null;

  const visibleBidHistory = showFullHistory ? bidHistory : bidHistory.slice(-5);

  const handleAddCompetitorBid = () => {
    if (!competitorBidAmount || !currentAuction) {
      toast.error("Please enter a competitor bid amount.");
      return;
    }
    if (!socket) {
      toast.error("Socket connection not available.");
      return;
    }
    socket.emit("placeBid", {
      auctionId: currentAuction._id,
      bidAmount: parseFloat(competitorBidAmount),
      userId: "admin",
      bidType: "competitor",
    });
    setCompetitorBidAmount("");
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Competitor Bids</h3>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {competingBids.length > 0 ? (
              competingBids.slice(-5).map((bid, index) => (
                <div key={index} className="bg-gray-50 p-2 rounded-lg">
                  <p className="text-xs text-gray-600">{bid.label}</p>
                  <p className="text-sm font-semibold text-gray-900">${bid.amount.toLocaleString()}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No competitor bids yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-gray-900">Bid History</h3>
            <Button
              variant="link"
              onClick={() => setShowFullHistory(!showFullHistory)}
              className="text-blue-600 text-sm"
            >
              {showFullHistory ? "Show Less" : "Show More"}
            </Button>
          </div>
          <div className="max-h-40 overflow-y-auto space-y-2">
            {visibleBidHistory.length > 0 ? (
              visibleBidHistory.map((entry, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-2 p-2 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                >
                  <div className="flex-shrink-0 w-2 h-2 mt-1 rounded-full bg-blue-500"></div>
                  <div className="flex-1">
                    <p className="text-sm">
                      {entry.message ? (
                        <span className="text-blue-600 font-medium">{entry.message}</span>
                      ) : (
                        <span className="text-gray-900">
                          ${entry.bidAmount?.toLocaleString()} -{" "}
                          {entry.bidType === "competitor" ? "Competitor" : "User"} -{" "}
                          {entry.bidder?.name || entry.bidder?._id || "Unknown"}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(entry.bidTime).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-2">No bids yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 bg-white rounded-xl shadow-md p-4 border-t z-10">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Admin Controls</h3>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Button
              onClick={() => handleAdminAction("FAIR_WARNING")}
              className="flex-1 bg-yellow-500 text-white hover:bg-yellow-600 text-sm py-1"
              disabled={currentAuction?.status === "ENDED"}
            >
              Fair Warning
            </Button>
            <Button
              onClick={() => handleAdminAction("FINAL_CALL")}
              className="flex-1 bg-orange-500 text-white hover:bg-orange-600 text-sm py-1"
              disabled={currentAuction?.status === "ENDED"}
            >
              Final Call
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={currentAuction?.currentBid || 0}
              readOnly
              className="bg-gray-50 text-sm py-1 flex-1"
            />
            <Button
              onClick={() => handleAdminAction("SOLD")}
              className="bg-green-500 text-white hover:bg-green-600 text-sm py-1 px-2"
              disabled={currentAuction?.status === "ENDED"}
            >
              Sold
            </Button>
            <Button
              onClick={() => handleAdminAction("PASS")}
              className="bg-red-500 text-white hover:bg-red-600 text-sm py-1 px-2"
              disabled={currentAuction?.status === "ENDED"}
            >
              Pass
            </Button>
            <Button
              onClick={() => handleAdminAction("NEXT_LOT")}
              className="bg-blue-500 text-white hover:bg-blue-600 text-sm py-1 px-2"
            >
              Next
            </Button>
          </div>
          <div className="flex gap-2">
            <Input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter message..."
              className="flex-1 text-sm py-1"
            />
            <Button
              onClick={handleSendMessage}
              className="bg-gray-600 text-white hover:bg-gray-700 text-sm py-1 px-2"
            >
              Send
            </Button>
          </div>
          <div className="flex gap-2">
            <Input
              type="number"
              value={competitorBidAmount}
              onChange={(e) => setCompetitorBidAmount(e.target.value)}
              placeholder="Competitor bid"
              className="flex-1 text-sm py-1"
            />
            <Button
              onClick={handleAddCompetitorBid}
              className="bg-purple-500 text-white hover:bg-purple-600 text-sm py-1 px-2"
            >
              Add Bid
            </Button>
          </div>
          <p className="text-xs text-gray-600">Online Watchers: {watchers}</p>
        </div>
      </div>
    </div>
  );
};

export default AuctionControls;