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
  token, // Ensure token is received
}) => {
  if (!currentAuction) return null;

  const currentBid = currentAuction.currentBid || currentAuction.startingBid || 0;
  const bidIncrement = getBidIncrement(currentBid);
  const nextBid = currentBid + bidIncrement;

  const handleAddCompetitorBid = async () => {
    console.log("Add Competitive Bid clicked", { auctionMode, currentAuction });
    if (!currentAuction) {
      toast.error("No active auction selected.");
      return;
    }
    if (!socket || !token) {
      toast.error("Socket or token not available.");
      return;
    }
    if (!socket.connected) {
      toast.error("Socket is not connected. Please refresh the page.");
      return;
    }

    try {
      console.log("Placing competitive bid via socket:", { auctionId: currentAuction._id, bidAmount: nextBid });
      await placeBid(currentAuction._id, "competitor", nextBid);

      // Additional API call for competitive bid
      console.log("Placing competitive bid via API:", { auctionId: currentAuction._id, bidAmount: nextBid });
      const response = await fetch(`${config.baseURL}/v1/api/auction/placeBid`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify({
          auctionId: currentAuction._id,
          bidAmount: nextBid.toString(),
          bidType: "competitor", // Explicitly set bidType for API
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to place competitive bid via API");
      }

      toast.success(`Competitive bid placed at $${nextBid.toLocaleString()}`);
    } catch (error) {
      console.error("Error placing competitive bid:", error);
      toast.error(error.message || "Failed to place competitive bid");
    }
  };

  const handleSetMode = (mode) => {
    if (!currentAuction) {
      toast.error("No active auction selected.");
      return;
    }
    console.log(`Switching auction mode to: ${mode}`);
    setAuctionMode(mode);
    toast.success(`Auction mode switched to ${mode}`);
  };

  const competitorBids = bidHistory
    .filter((bid) => bid.bidType === "competitor")
    .slice(-5)
    .map((bid) => ({
      amount: bid.bidAmount,
      label: "Competing Bid",
    }));

  const onlineBids = bidHistory
    .filter((bid) => bid.bidType === "online")
    .slice(-5)
    .map((bid) => ({
      amount: bid.bidAmount,
      label: "Online Bid",
    }));

  return (
    <div className="space-y-2">
      <Button onClick={onBack} className="mb-4 bg-gray-600 text-white hover:bg-gray-700 cursor-pointer">
        Back to Catalogs
      </Button>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="text-sm font-semibold mb-2">Bid Information</h3>
        <div className="space-y-1">
          <p className="text-sm">Current Bid: ${currentBid.toLocaleString()}</p>
          <p className="text-sm">Next Competitive Bid: ${nextBid.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="space-y-2">
          <div>
            {competitorBids.map((bid, index) => (
              <div key={index} className="flex justify-between items-center py-1">
                <span className="text-sm">${bid.amount} (Competing Bid)</span>
              </div>
            ))}
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-1">Online: {watchers}</h3>
            {onlineBids.map((bid, index) => (
              <div key={index} className="flex justify-between items-center py-1">
                <span className="text-sm">${bid.amount} (Online Bid)</span>
              </div>
            ))}
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

      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="grid grid-cols-2 gap-2 mb-2">
          <button
            onClick={() => handleAdminAction("FAIR_WARNING")}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 cursor-pointer"
          >
            Fair Warning
          </button>
          <button
            onClick={() => handleAdminAction("FINAL_CALL")}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer"
          >
            Final Call
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-2">
          <div className="bg-gray-100 p-2 rounded text-center">
            <p className="text-sm font-semibold">Bid Increment</p>
            <p className="text-lg">${bidIncrement.toLocaleString()}</p>
          </div>
          <div className="bg-gray-100 p-2 rounded text-center">
            <p className="text-sm font-semibold">Next Bid Amount</p>
            <p className="text-lg">${nextBid.toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-2">
          <button
            onClick={handleAddCompetitorBid}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
          >
            Add Competitive Bid
          </button>
          <button
            onClick={() => handleSetMode(auctionMode === "online" ? "competitor" : "online")}
            className={`px-4 py-2 rounded ${
              auctionMode === "online" ? "bg-gray-200 text-gray-700" : "bg-blue-600 text-white hover:bg-blue-700"
            } cursor-pointer`}
          >
            {auctionMode === "online" ? "Switch to Competitor" : "Switch to Online"}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleAdminAction("PASS")}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 cursor-pointer"
          >
            Pass
          </button>
          <button
            onClick={() => handleAdminAction("SOLD")}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 cursor-pointer"
          >
            Sold
          </button>
          <button
            onClick={() => handleAdminAction("NEXT_LOT")}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
          >
            Next Lot
          </button>
        </div>

        <div className="mt-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter message..."
              className="flex-1 px-3 py-2 border rounded"
            />
            <button
              onClick={handleSendMessage}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 cursor-pointer"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionControls;