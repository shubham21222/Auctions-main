"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import config from "@/app/config_BASE_URL";
import BidHistoryModal from "./components/BidHistoryModal";

const EndedAuctionsPage = () => {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingBids, setLoadingBids] = useState(false);
  const auth = useSelector((state) => state.auth);
  const token = auth?.token;

  const shippingStatuses = [
    { value: "PENDING", label: "Pending", color: "bg-gray-100 text-gray-800" },
    { value: "SHIPPED", label: "Shipped", color: "bg-blue-100 text-blue-800" },
    { value: "DELIVERED", label: "Delivered", color: "bg-green-100 text-green-800" },
    { value: "CANCELED", label: "Canceled", color: "bg-red-100 text-red-800" },
    { value: "RETURNED", label: "Returned", color: "bg-yellow-100 text-yellow-800" },
    { value: "FAILED", label: "Failed", color: "bg-gray-100 text-gray-800" },
  ];

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const response = await axios.get(
          `${config.baseURL}/v1/api/auction/bulk`,
          {
            headers: {
              Authorization: `${token}`,
            },
          }
        );

        if (response.data.status) {
          // Flatten the catalogs array and filter for ended auctions
          const allAuctions = response.data.items.catalogs.flatMap(
            (catalog) => catalog.auctions
          );
          const endedAuctions = allAuctions.filter(
            (auction) => auction.status === "ENDED"
          );
          setWinners(endedAuctions);
        } else {
          setError("Failed to fetch auctions");
          toast.error("Failed to fetch auctions");
        }
      } catch (err) {
        setError(err.message);
        toast.error("Error fetching auctions");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchAuctions();
    }
  }, [token]);

  const handleStatusUpdate = async (auctionId, newStatus) => {
    setUpdating(true);
    try {
      const response = await axios.post(
        `${config.baseURL}/v1/api/auction/update/${auctionId}`,
        {
          shipping_status: newStatus,
          status: "ENDED",
        },
        {
          headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status) {
        toast.success("Shipping status updated successfully");
        setWinners((prev) =>
          prev.map((winner) =>
            winner._id === auctionId
              ? { ...winner, shipping_status: newStatus }
              : winner
          )
        );
      } else {
        toast.error(response.data.message || "Failed to update shipping status");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error updating shipping status");
      console.error("Update error:", err);
    } finally {
      setUpdating(false);
    }
  };

  const handleImageError = (winnerId) => {
    setImageErrors((prev) => ({
      ...prev,
      [winnerId]: true,
    }));
  };

  const handleRowClick = async (winner) => {
    setLoadingBids(true);
    try {
      const response = await axios.get(
        `${config.baseURL}/v1/api/auction/bulkgetbyId/${winner._id}`,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      if (response.data.status) {
        setSelectedAuction(response.data.items);
        setIsModalOpen(true);
      } else {
        toast.error("Failed to fetch auction details");
      }
    } catch (err) {
      toast.error("Error fetching auction details");
      console.error("Error fetching auction details:", err);
    } finally {
      setLoadingBids(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Ended Auctions</h1>
        <Badge variant="secondary" className="text-sm">
          Total Auctions: {winners.length}
        </Badge>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Winner</TableHead>
                  <TableHead>Winning Bid</TableHead>
                  <TableHead>Bid Time</TableHead>
                  <TableHead>Shipping Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {winners.map((winner) => (
                  <TableRow 
                    key={winner._id}
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleRowClick(winner)}
                  >
                    <TableCell>
                      <div className="flex items-center space-x-4">
                        <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-gray-100">
                          {!imageErrors[winner._id] ? (
                            <Image
                              src={winner.product.image[0]}
                              alt={winner.product.title}
                              fill
                              className="object-cover"
                              onError={() => handleImageError(winner._id)}
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <span className="text-xs text-gray-500 text-center px-2">
                                Image not available
                              </span>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {winner.product.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            Starting Price: ${winner.product.price}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">
                          {winner.winner?.name || "No winner"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {winner.winner?.email || "N/A"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-green-600">
                        ${winner.currentBid}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {format(new Date(winner.endDate), "PPp")}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={winner.shipping_status || "PENDING"}
                        onValueChange={(value) => handleStatusUpdate(winner._id, value)}
                        disabled={updating}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {shippingStatuses.map((status) => (
                            <SelectItem
                              key={status.value}
                              value={status.value}
                              className="flex items-center gap-2"
                            >
                              <span className={`px-2 py-1 rounded-full text-xs ${status.color}`}>
                                {status.label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
                {winners.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <p className="text-gray-500">No ended auctions found</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <BidHistoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedAuction={selectedAuction}
        loadingBids={loadingBids}
      />
    </div>
  );
};

export default EndedAuctionsPage;
