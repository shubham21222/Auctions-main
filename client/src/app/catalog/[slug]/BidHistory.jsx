"use client";

import { motion } from "framer-motion";
import { Clock } from "lucide-react";

const BidHistory = ({ bids }) => {
  // Ensure bids is an array; default to empty array if not
  const validBids = Array.isArray(bids) ? bids : [];
  
  // Sort bids by bidTime descending
  const sortedBids = validBids.sort((a, b) => new Date(b.bidTime) - new Date(a.bidTime));

  const bidVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5 },
    }),
  };

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-lg shadow-xl text-white">
      <h3 className="text-2xl font-bold mb-4 text-center text-luxury-gold">
        Bid History
      </h3>
      {sortedBids.length === 0 ? (
        <p className="text-center text-gray-400">No bids yet. Be the first!</p>
      ) : (
        <div className="space-y-4 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-luxury-gold scrollbar-track-gray-800">
          {sortedBids.map((bid, index) => (
            <motion.div
              key={bid._id}
              custom={index}
              initial="hidden"
              animate="visible"
              variants={bidVariants}
              className="flex justify-between items-center p-3 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors duration-300"
            >
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-luxury-gold" />
                <span className="text-sm">
                  {new Date(bid.bidTime).toLocaleString()}
                </span>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-luxury-gold">
                  ${bid.bidAmount.toLocaleString()}
                </p>
                <p className="text-xs text-gray-400">
                  Bidder: {bid.bidder.slice(0, 8)}...
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BidHistory;