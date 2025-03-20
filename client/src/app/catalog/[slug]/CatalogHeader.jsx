"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock } from "lucide-react";

export default function CatalogHeader({ productName, auctionEndDate }) {
  return (
    <div className="bg-white border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{productName}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Lot #{auctionEndDate?.split('T')[0] || 'N/A'}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Ends</p>
              <p className="text-lg font-semibold text-red-600">
                {auctionEndDate ? new Date(auctionEndDate).toLocaleString() : 'N/A'}
              </p>
            </div>
            <div className="h-12 w-px bg-gray-200"></div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Status</p>
              <p className="text-lg font-semibold text-green-600">Active</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}