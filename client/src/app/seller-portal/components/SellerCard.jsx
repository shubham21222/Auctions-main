import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import Image from 'next/image';

const SellerCard = ({ seller, onEdit, onDelete }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200/30 overflow-hidden"
    >
      {/* Header with Image */}
      <div className="relative h-48 w-full">
        {seller.Documents?.frontImage ? (
          <Image
            src={seller.Documents.frontImage}
            alt={seller.General?.object || "Seller Item"}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <span className="text-gray-400">No Image Available</span>
          </div>
        )}
        <div className="absolute top-4 right-4">
          <Badge variant={seller.Approved ? "success" : "warning"}>
            {seller.Approved ? "Approved" : "Pending"}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              {seller.General?.object || "Unnamed Item"}
            </h2>
            <p className="text-sm text-gray-500">
              ID: {seller._id.slice(-6)}
            </p>
          </div>
        </div>

        {/* Quick Info */}
        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <p>
            <span className="font-medium">Category:</span> {seller.category?.name}
          </p>
          <p>
            <span className="font-medium">Price:</span>{" "}
            {seller.price?.paidPrice ? `$${seller.price.paidPrice} ${seller.price.currency}` : "N/A"}
          </p>
          <p>
            <span className="font-medium">Created:</span>{" "}
            {format(new Date(seller.createdAt), "MMM d, yyyy")}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => onEdit(seller)}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(seller._id)}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default SellerCard; 