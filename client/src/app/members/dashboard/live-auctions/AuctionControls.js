"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import config from "@/app/config_BASE_URL";

const AuctionControls = ({
  currentAuction,
  bidHistory,
  handleAdminAction,
  handleSendMessage,
  message,
  setMessage,
  watchers,
  socket,
  setAuctionMode,
  auctionMode,
  onBack,
  placeBid,
  getBidIncrement,
  token,
}) => {
  if (!currentAuction) return null;

  const currentBid = currentAuction.currentBid || currentAuction.startingBid || 0;
  const bidIncrement = getBidIncrement(currentBid);
  const nextBid = currentBid + bidIncrement;

  const handleAddCompetitorBid = async () => {
    if (!currentAuction) {
      toast.error("No active auction selected.");
      return;
    }

    if (!token) {
      toast.error("Authentication token missing. Please log in.");
      return;
    }

    try {
      // Show loading toast
      const loadingToast = toast.loading("Placing bid...");
      
      // Place the bid using the API
      await placeBid(currentAuction._id, "competitor", nextBid);
      
      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success(`Competitive bid placed at $${nextBid.toLocaleString()}`);
    } catch (error) {
      console.error("Error placing competitive bid:", error);
      toast.error(error.message || "Failed to place competitive bid");
    }
  };

  const competitorBids = bidHistory
    .filter((bid) => bid.bidType === "competitor")
    .slice(-5)
    .map((bid) => ({
      amount: bid.bidAmount,
      label: "Competing Bid",
    }));

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Auction Controls</h2>
          <Button variant="outline" onClick={onBack}>
            Back to Catalogs
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="text-sm font-semibold mb-1">Current Bid</h3>
            <p className="text-2xl font-bold">${currentBid.toLocaleString()}</p>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="text-sm font-semibold mb-1">Watchers</h3>
            <p className="text-2xl font-bold">{watchers}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold mb-2">Send Message</h3>
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
              />
              <Button onClick={handleSendMessage}>Send</Button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-2">Auction Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => handleAdminAction("FAIR_WARNING")}
                className="bg-yellow-100 hover:bg-yellow-200"
              >
                Fair Warning
              </Button>
              <Button
                variant="outline"
                onClick={() => handleAdminAction("FINAL_CALL")}
                className="bg-red-100 hover:bg-red-200"
              >
                Final Call
              </Button>
              <Button
                variant="outline"
                onClick={() => handleAdminAction("NEXT_LOT")}
                className="col-span-2"
              >
                Next Lot
              </Button>
              <Button
                variant="outline"
                onClick={() => handleAdminAction("SOLD")}
                className="bg-green-100 hover:bg-green-200"
              >
                Sold
              </Button>
              <Button
                variant="outline"
                onClick={() => handleAdminAction("PASS")}
                className="bg-gray-100 hover:bg-gray-200"
              >
                Pass
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-2">Competitive Bidding</h3>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-100 p-2 rounded text-center">
                  <p className="text-sm font-semibold">Bid Increment</p>
                  <p className="text-lg">${bidIncrement.toLocaleString()}</p>
                </div>
                <div className="bg-gray-100 p-2 rounded text-center">
                  <p className="text-sm font-semibold">Next Bid Amount</p>
                  <p className="text-lg">${nextBid.toLocaleString()}</p>
                </div>
              </div>
              <Button
                onClick={handleAddCompetitorBid}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Add Competitive Bid
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="text-sm font-semibold mb-2">Bid History</h3>
        <div className="space-y-1 max-h-40 overflow-y-auto">
          {bidHistory.slice(-10).map((entry, index) => (
            <div key={index} className="text-sm">
              {entry.message ? (
                <span className="text-blue-600">{entry.message}</span>
              ) : (
                <span>
                  ${entry.bidAmount?.toLocaleString()} - {entry.bidType}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AuctionControls;