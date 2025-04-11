"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import config from "@/app/config_BASE_URL";
import { useState, useEffect, useCallback } from "react";

const AuctionControls = ({
  currentAuction,
  setCurrentAuction,
  bidHistory,
  handleAdminAction, // Use handleAdminAction instead of handleClerkAction
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
  getAuctionData,
  token,
  userId,
}) => {
  const [isPlacingBid, setIsPlacingBid] = useState(false);
  const [localBidHistory, setLocalBidHistory] = useState(bidHistory);

  useEffect(() => {
    if (currentAuction?._id) {
      const fetchLatestAuctionData = async () => {
        try {
          const data = await getAuctionData(currentAuction._id);
          if (data) {
            setCurrentAuction((prev) => ({
              ...prev,
              currentBid: data.currentBid,
              currentBidder: data.currentBidder,
              minBidIncrement: data.minBidIncrement,
              bids: data.bids,
            }));
            setLocalBidHistory(data.bids || []);
          }
        } catch (error) {
          console.error("Failed to fetch latest auction data:", error);
        }
      };

      const intervalId = setInterval(fetchLatestAuctionData, 5000);

      const handleBidUpdate = ({ auctionId, bidAmount, bidderId, bidType, timestamp, bids }) => {
        if (auctionId === currentAuction._id) {
          console.log("AuctionControls: Received bidUpdate:", { auctionId, bidAmount, bidType });
          setCurrentAuction((prev) => ({
            ...prev,
            currentBid: bidAmount,
            currentBidder: bidderId,
            bids: bids || [
              ...(prev.bids || []),
              { bidder: bidderId, bidAmount, bidTime: timestamp || new Date(), bidType },
            ],
          }));
          setLocalBidHistory((prev) => bids || [
            ...prev,
            { bidder: bidderId, bidAmount, bidTime: timestamp || new Date(), bidType },
          ]);
        }
      };

      socket.on("bidUpdate", handleBidUpdate);

      return () => {
        clearInterval(intervalId);
        socket.off("bidUpdate", handleBidUpdate);
      };
    }
  }, [currentAuction?._id, getAuctionData, socket, setCurrentAuction]);

  const waitForSocketConnection = useCallback(
    (callback, maxAttempts = 10, interval = 500) => {
      let attempts = 0;
      const checkConnection = () => {
        if (socket && socket.connected) {
          callback();
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(checkConnection, interval);
        } else {
          toast.error("Failed to reconnect to server. Please refresh the page.");
          setIsPlacingBid(false);
        }
      };
      checkConnection();
    },
    [socket]
  );

  useEffect(() => {
    setLocalBidHistory(bidHistory);
  }, [bidHistory]);

  if (!currentAuction) return null;

  const handleAddCompetitorBid = async () => {
    console.log("Add Competitive Bid clicked", { currentAuction });
    if (!currentAuction) {
      toast.error("No active auction selected.");
      return;
    }
    if (!socket || !token || !userId) {
      toast.error("Socket, token, or user ID not available.");
      return;
    }

    setIsPlacingBid(true);

    const placeCompetitorBid = async () => {
      try {
        console.log("Attempting to place competitor bid...");
        const auctionId = currentAuction._id;

        const auctionData = await getAuctionData(auctionId);
        const currentBid = auctionData.currentBid || 0;
        const bidIncrement = getBidIncrement(currentBid);
        const nextBid = currentBid + bidIncrement;

        console.log(`Calculated nextBid: $${nextBid} based on currentBid: $${currentBid}`);

        const success = await placeBid(auctionId, "competitor", nextBid);
        if (!success) {
          throw new Error("Failed to place bid via socket");
        }

        console.log("Clerk: Competitive bid placed via socket:", { auctionId, bidAmount: nextBid });
        const response = await fetch(`${config.baseURL}/v1/api/auction/placeBid`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
          body: JSON.stringify({
            auctionId,
            bidAmount: nextBid.toString(),
            bidType: "competitor",
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
      } finally {
        setIsPlacingBid(false);
      }
    };

    if (!socket.connected) {
      toast.warn("Socket disconnected. Attempting to reconnect...");
      waitForSocketConnection(placeCompetitorBid);
    } else {
      placeCompetitorBid();
    }
  };

  const currentBid = currentAuction.currentBid || currentAuction.startingBid || 0;
  const bidIncrement = getBidIncrement(currentBid);
  const nextBid = currentBid + bidIncrement;

  return (
    <div className="bg-white border border-gray-200">
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-gray-600 mr-2">Lot:</span>
            <span className="font-medium">{currentAuction?.lotNumber || ""}</span>
          </div>
          <div className="text-right">
            <span className="text-gray-600">Online: {watchers}</span>
          </div>
        </div>
        <h2 className="text-lg font-bold mt-2">{currentAuction?.product?.title || ""}</h2>
      </div>

      <div className="border-b border-gray-200 p-4">
        <div className="space-y-2">
          {localBidHistory.slice(-10).map((entry, index) => (
            <div key={index} className="text-sm">
              {entry.message ? (
                <div className={`flex justify-between items-center ${
                  entry.type === "clerk_action" ? "bg-gray-100 px-2 py-1 rounded" : ""
                }`}>
                  <span className={`${
                    entry.type === "clerk_action" ? "font-semibold" : "text-blue-600"
                  }`}>{entry.message}</span>
                  {entry.timestamp && (
                    <span className="text-gray-500 text-xs">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex justify-between">
                  <span className="text-gray-800">
                    ${entry.bidAmount?.toLocaleString()} ({entry.bidType === "online" ? "Online Bid" : "Competitive Bid"})
                  </span>
                  <span className="text-gray-500">{new Date(entry.bidTime).toLocaleTimeString()}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="p-4">
        <div className="flex gap-2 mb-4">
          <Button
            onClick={() => handleAdminAction("FAIR_WARNING")}
            className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded hover:bg-gray-200"
          >
            Fair Warning
          </Button>
          <Button
            onClick={() => handleAdminAction("FINAL_CALL")}
            className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded hover:bg-gray-200"
          >
            Final Call
          </Button>
          <Button
            onClick={() => handleAdminAction("RESERVE_NOT_MET")}
            className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded hover:bg-gray-200"
          >
            Reserve Not Met
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-sm text-gray-600">Bid Increment</div>
            <div className="text-xl font-bold">${bidIncrement.toLocaleString()}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">Current Ask</div>
            <div className="text-xl font-bold">${nextBid.toLocaleString()}</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => handleAdminAction("NEXT_LOT")}
            className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded hover:bg-gray-200"
          >
            Pass
          </Button>
          <Button
            onClick={() => handleAdminAction("SOLD")}
            className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded hover:bg-gray-200"
          >
            Sold
          </Button>
          <Button
            onClick={() => handleAdminAction("NEXT_LOT")}
            className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded hover:bg-gray-200"
          >
            Next Lot
          </Button>
          <Button
            onClick={handleAddCompetitorBid}
            disabled={isPlacingBid}
            className={`px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded hover:bg-gray-200 ${
              isPlacingBid ? "opacity-50" : ""
            }`}
          >
            Competing Bid
          </Button>
          <Button
            onClick={() => handleAdminAction("RETRACT")}
            className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded hover:bg-gray-200"
          >
            Retract
          </Button>
        </div>

        <div className="mt-4">
          <div className="flex gap-2">
            <Input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
              onKeyPress={(e) => {
                if (e.key === "Enter" && message.trim()) {
                  handleSendMessage();
                }
              }}
            />
            <Button
              onClick={handleSendMessage}
              className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded hover:bg-gray-200"
            >
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionControls;