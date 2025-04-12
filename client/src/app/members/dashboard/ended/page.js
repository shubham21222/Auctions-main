"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { format } from "date-fns";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
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

  const exportToPDF = async (auction) => {
    try {
      const response = await axios.get(
        `${config.baseURL}/v1/api/auction/bulkgetbyId/${auction._id}`,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      if (response.data.status) {
        const auctionData = response.data.items;
        const doc = new jsPDF();

        // Add title
        doc.setFontSize(16);
        doc.text(`Bid History - ${auctionData.product?.title || 'Untitled Auction'}`, 14, 20);

        // Add auction details
        doc.setFontSize(12);
        doc.text(`Lot Number: ${auctionData.lotNumber || 'N/A'}`, 14, 30);
        doc.text(`Starting Price: $${auctionData.startingBid || '0'}`, 14, 40);
        doc.text(`Current Bid: $${auctionData.currentBid || '0'}`, 14, 50);
        doc.text(`Total Bids: ${auctionData.bids?.length || 0}`, 14, 60);
        doc.text(`Total Bid Logs: ${auctionData.bidLogs?.length || 0}`, 14, 70);

        // Add winner details if exists
        if (auctionData.winner) {
          doc.text(`Winner: ${auctionData.winner.name || 'N/A'}`, 14, 80);
          doc.text(`Email: ${auctionData.winner.email || 'N/A'}`, 14, 90);
          doc.text(`Winning Time: ${auctionData.winnerBidTime ? format(new Date(auctionData.winnerBidTime), "PPp") : 'N/A'}`, 14, 100);
        }

        let y = 110;

        // Add bids table if exists
        if (auctionData.bids?.length > 0) {
          doc.setFontSize(14);
          doc.text("Bids", 14, y);
          y += 10;

          // Table headers
          const headers = ["Bid #", "Amount", "Time", "Bidder", "Email"];
          const columnWidths = [20, 30, 50, 40, 50];

          // Draw table header
          doc.setFillColor(59, 130, 246);
          doc.setTextColor(255, 255, 255);
          headers.forEach((header, i) => {
            doc.rect(14 + columnWidths.slice(0, i).reduce((a, b) => a + b, 0), y, columnWidths[i], 10, 'F');
            doc.text(header, 17 + columnWidths.slice(0, i).reduce((a, b) => a + b, 0), y + 7);
          });
          y += 10;

          // Draw table rows
          doc.setTextColor(0, 0, 0);
          auctionData.bids.forEach((bid, index) => {
            const bidderName = bid.bidder?.name || 'Unknown';
            const bidderEmail = bid.bidder?.email || 'N/A';
            
            const row = [
              auctionData.bids.length - index,
              `$${bid.bidAmount || '0'}`,
              bid.bidTime ? format(new Date(bid.bidTime), "PPp") : 'N/A',
              bidderName,
              bidderEmail
            ];

            // Alternate row colors
            if (index % 2 === 0) {
              doc.setFillColor(245, 245, 245);
              doc.rect(14, y, columnWidths.reduce((a, b) => a + b, 0), 10, 'F');
            }

            row.forEach((cell, i) => {
              const text = cell.toString();
              const maxWidth = columnWidths[i] - 6;
              if (doc.getTextWidth(text) > maxWidth) {
                const lines = doc.splitTextToSize(text, maxWidth);
                lines.forEach((line, lineIndex) => {
                  doc.text(line, 17 + columnWidths.slice(0, i).reduce((a, b) => a + b, 0), y + 7 + (lineIndex * 5));
                });
                y += (lines.length - 1) * 5;
              } else {
                doc.text(text, 17 + columnWidths.slice(0, i).reduce((a, b) => a + b, 0), y + 7);
              }
            });
            y += 10;
          });
          y += 10;
        }

        // Add bid logs table if exists
        if (auctionData.bidLogs?.length > 0) {
          doc.setFontSize(14);
          doc.text("Bid Logs", 14, y);
          y += 10;

          // Table headers for bid logs
          const logHeaders = ["Log #", "Action", "Amount", "Time", "User"];
          const logColumnWidths = [20, 40, 30, 50, 40];

          // Draw table header
          doc.setFillColor(59, 130, 246);
          doc.setTextColor(255, 255, 255);
          logHeaders.forEach((header, i) => {
            doc.rect(14 + logColumnWidths.slice(0, i).reduce((a, b) => a + b, 0), y, logColumnWidths[i], 10, 'F');
            doc.text(header, 17 + logColumnWidths.slice(0, i).reduce((a, b) => a + b, 0), y + 7);
          });
          y += 10;

          // Draw table rows
          doc.setTextColor(0, 0, 0);
          auctionData.bidLogs.forEach((log, index) => {
            const row = [
              auctionData.bidLogs.length - index,
              log.action || 'N/A',
              log.amount ? `$${log.amount}` : 'N/A',
              log.timestamp ? format(new Date(log.timestamp), "PPp") : 'N/A',
              log.user?.name || 'Unknown'
            ];

            // Alternate row colors
            if (index % 2 === 0) {
              doc.setFillColor(245, 245, 245);
              doc.rect(14, y, logColumnWidths.reduce((a, b) => a + b, 0), 10, 'F');
            }

            row.forEach((cell, i) => {
              const text = cell.toString();
              const maxWidth = logColumnWidths[i] - 6;
              if (doc.getTextWidth(text) > maxWidth) {
                const lines = doc.splitTextToSize(text, maxWidth);
                lines.forEach((line, lineIndex) => {
                  doc.text(line, 17 + logColumnWidths.slice(0, i).reduce((a, b) => a + b, 0), y + 7 + (lineIndex * 5));
                });
                y += (lines.length - 1) * 5;
              } else {
                doc.text(text, 17 + logColumnWidths.slice(0, i).reduce((a, b) => a + b, 0), y + 7);
              }
            });
            y += 10;
          });
        }

        // Add message if no bids or logs
        if (!auctionData.bids?.length && !auctionData.bidLogs?.length) {
          doc.setFontSize(12);
          doc.text("No bid history or logs available", 14, y);
        }

        // Save the PDF
        doc.save(`bid-history-${auctionData.lotNumber || 'unknown'}.pdf`);
      } else {
        toast.error("Failed to fetch auction details");
      }
    } catch (err) {
      toast.error("Error generating PDF");
      console.error("Error generating PDF:", err);
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
                  <TableHead>Actions</TableHead>
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
                    <TableCell>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          exportToPDF(winner);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Export PDF
                      </button>
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
