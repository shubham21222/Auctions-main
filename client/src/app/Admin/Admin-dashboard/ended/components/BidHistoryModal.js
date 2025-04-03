import React from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const BidHistoryModal = ({ isOpen, onClose, selectedAuction, loadingBids }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl my-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Bid History - {selectedAuction?.product.title}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Auction Details</h3>
              <p className="text-sm text-gray-600">Starting Price: ${selectedAuction?.product.price}</p>
              <p className="text-sm text-gray-600">Current Bid: ${selectedAuction?.currentBid}</p>
              <p className="text-sm text-gray-600">Total Bids: {selectedAuction?.bids?.length || 0}</p>
              <p className="text-sm text-gray-600">Lot Number: {selectedAuction?.lotNumber}</p>
              <p className="text-sm text-gray-600">Category: {selectedAuction?.category?.name}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Winner Details</h3>
              <p className="text-sm text-gray-600">Name: {selectedAuction?.winner?.name}</p>
              <p className="text-sm text-gray-600">Email: {selectedAuction?.winner?.email}</p>
              <p className="text-sm text-gray-600">Winning Time: {selectedAuction?.winnerBidTime ? format(new Date(selectedAuction.winnerBidTime), "PPp") : "N/A"}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700">Bid History</h3>
            <div className="max-h-[400px] overflow-y-auto">
              {loadingBids ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : selectedAuction?.bids?.length > 0 ? (
                selectedAuction.bids.map((bid, index) => (
                  <div
                    key={bid._id}
                    className={`p-4 rounded-lg border ${
                      bid.bidAmount === selectedAuction.currentBid
                        ? "bg-green-50 border-green-200"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">
                          Bid #{selectedAuction.bids.length - index}
                        </p>
                        <p className="text-sm text-gray-600">
                          Amount: ${bid.bidAmount}
                        </p>
                        <p className="text-sm text-gray-600">
                          Time: {format(new Date(bid.bidTime), "PPp")}
                        </p>
                        <p className="text-sm text-gray-600">
                          Bidder: {bid.bidder.name.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          Email: {bid.bidder.name.email}
                        </p>
                      </div>
                      {bid.bidAmount === selectedAuction.currentBid && (
                        <Badge className="bg-green-100 text-green-800">
                          Winning Bid
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No bid history available
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BidHistoryModal; 