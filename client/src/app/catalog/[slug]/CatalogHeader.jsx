"use client";

import { Clock, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function CatalogHeader({ 
  productName = "Loading...", 
  auctionEndDate, 
  lotNumber = "N/A", 
  catalog = "Uncategorized",
  status = "Loading"
}) {
  // Status colors mapping
  const statusColors = {
    ACTIVE: "text-green-600",
    ENDED: "text-red-600",
    PENDING: "text-yellow-600",
    Loading: "text-gray-500"
  };

  // Safe date formatting
  const formatDate = (date) => {
    if (!date) return "N/A";
    try {
      return new Date(date).toLocaleString();
    } catch {
      return "N/A";
    }
  };

  return (
    <div className="bg-gradient-to-r from-luxury-gold/10 to-luxury-gold/5 border-b border-luxury-gold/20 p-6">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          {/* Left Section - Always visible */}
          <div className="space-y-2">
            <motion.h1
              key={`title-${productName}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-luxury-charcoal"
            >
              {productName}
            </motion.h1>

            <div className="flex flex-wrap gap-4">
              <motion.div
                key={`lot-${lotNumber}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-sm text-luxury-gold bg-luxury-gold/10 px-3 py-1 rounded-full"
              >
                Lot #{lotNumber}
              </motion.div>

              <motion.div
                key={`catalog-${catalog}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-sm text-luxury-charcoal/80"
              >
                Catalog: {catalog}
              </motion.div>
            </div>
          </div>

          {/* Right Section - Always visible */}
          <div className="flex flex-col items-end gap-2">
            <motion.div
              key={`date-${auctionEndDate}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2 text-sm text-luxury-charcoal/80"
            >
              {/* <Clock className="h-4 w-4 text-luxury-gold" /> */}
              {/* <span>Ends: {formatDate(auctionEndDate)}</span> */}
            </motion.div>

            <motion.div
              key={`status-${status}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-2 text-sm"
            >
              <span className="text-luxury-charcoal/80">Status:</span>
              <span className={`font-medium ${statusColors[status] || statusColors.Loading}`}>
                {status}
              </span>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}