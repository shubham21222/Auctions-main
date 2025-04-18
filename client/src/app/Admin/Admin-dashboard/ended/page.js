"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { format } from "date-fns";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
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
  const [selectedCatalog, setSelectedCatalog] = useState(null);
  const [catalogs, setCatalogs] = useState([]);
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
          const catalogsData = response.data.items.catalogs;
          setCatalogs(catalogsData);
          
          // Flatten the catalogs array and filter for ended auctions
          const allAuctions = catalogsData.flatMap(
            (catalog) => catalog.auctions
          );
          const endedAuctions = allAuctions
            .filter((auction) => auction.status === "ENDED")
            .sort((a, b) => new Date(b.endDate) - new Date(a.endDate));
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

  const handleCatalogClick = (catalog) => {
    setSelectedCatalog(catalog);
    const catalogAuctions = catalog.auctions
      .filter((auction) => auction.status === "ENDED")
      .sort((a, b) => new Date(b.endDate) - new Date(a.endDate));
    setWinners(catalogAuctions);
  };

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
        
        // Add title and header
        doc.setFontSize(20);
        doc.setTextColor(59, 130, 246); // Blue color
        doc.text('NY Elizabeth Bid Logs', 105, 20, { align: 'center' });
        
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0); // Reset to black
        doc.text(`Auction Report - ${auctionData.product?.title || 'Untitled Auction'}`, 14, 30);
        
        // Initialize autoTable
        autoTable(doc, {
          startY: 40,
          head: [['Detail', 'Value']],
          body: [
            ['Lot Number', auctionData.lotNumber || 'N/A'],
            ['Starting Price', `$${auctionData.startingBid || '0'}`],
            ['Current Bid', `$${auctionData.currentBid || '0'}`],
            ['Reserve Price', `$${auctionData.product?.ReservePrice || '0'}`],
            ['Estimate Price', auctionData.product?.estimateprice || 'N/A'],
            ['Auction Type', auctionData.auctionType || 'N/A'],
            ['Status', auctionData.status || 'N/A'],
            ['Start Date', format(new Date(auctionData.startDate), "PPp")],
            ['End Date', format(new Date(auctionData.endDate), "PPp")],
            ['Catalog', auctionData.catalog || 'N/A']
          ],
          theme: 'grid',
          styles: { fontSize: 10 },
          headStyles: { fillColor: [59, 130, 246], textColor: 255 }
        });

        // Add winner details
        if (auctionData.winner) {
          doc.setFontSize(14);
          doc.text('Winner Details', 14, doc.lastAutoTable.finalY + 20);
          
          autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 25,
            head: [['Detail', 'Value']],
            body: [
              ['Name', auctionData.winner.name || 'N/A'],
              ['Email', auctionData.winner.email || 'N/A'],
              ['Winning Time', auctionData.winnerBidTime ? format(new Date(auctionData.winnerBidTime), "PPp") : 'N/A'],
              ['Winning Bid', `$${auctionData.currentBid}`]
            ],
            theme: 'grid',
            styles: { fontSize: 10 },
            headStyles: { fillColor: [59, 130, 246], textColor: 255 }
          });
        }

        // Add bids table
        if (auctionData.bids?.length > 0) {
          doc.setFontSize(14);
          doc.text('Bid History', 14, doc.lastAutoTable.finalY + 20);
          
          const bidRows = auctionData.bids.map((bid, index) => [
            auctionData.bids.length - index,
            `$${bid.bidAmount}`,
            bid.bidTime ? format(new Date(bid.bidTime), "PPp") : 'N/A',
            bid.bidder?.name || 'Unknown',
            bid.bidder?.email || 'N/A'
          ]);

          autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 25,
            head: [['#', 'Amount', 'Time', 'Bidder', 'Email']],
            body: bidRows,
            theme: 'grid',
            styles: { fontSize: 10 },
            headStyles: { fillColor: [59, 130, 246], textColor: 255 },
            columnStyles: {
              0: { cellWidth: 10 },
              1: { cellWidth: 25 },
              2: { cellWidth: 50 },
              3: { cellWidth: 40 },
              4: { cellWidth: 50 }
            }
          });
        }

        // Add bid logs
        if (auctionData.bidLogs?.length > 0) {
          doc.setFontSize(14);
          doc.text('Bid Logs', 14, doc.lastAutoTable.finalY + 20);
          
          const logRows = auctionData.bidLogs.map((log, index) => {
            if (log.msg) {
              return [auctionData.bidLogs.length - index, log.msg, 'N/A', 'N/A', log.ipAddress || 'N/A'];
            }
            return [
              auctionData.bidLogs.length - index,
              `$${log.bidAmount}`,
              log.bidTime ? format(new Date(log.bidTime), "PPp") : 'N/A',
              log.bidder?.name || 'Unknown',
              log.ipAddress || 'N/A'
            ];
          });

          autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 25,
            head: [['#', 'Amount/Message', 'Time', 'Bidder', 'IP Address']],
            body: logRows,
            theme: 'grid',
            styles: { fontSize: 10 },
            headStyles: { fillColor: [59, 130, 246], textColor: 255 },
            columnStyles: {
              0: { cellWidth: 10 },
              1: { cellWidth: 35 },
              2: { cellWidth: 50 },
              3: { cellWidth: 40 },
              4: { cellWidth: 40 }
            }
          });
        }

        // Add product details
        if (auctionData.product) {
          doc.setFontSize(14);
          doc.text('Product Details', 14, doc.lastAutoTable.finalY + 20);
          
          autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 25,
            head: [['Detail', 'Value']],
            body: [
              ['Title', auctionData.product.title || 'N/A'],
              ['Description', auctionData.product.description || 'N/A'],
              ['SKU Number', auctionData.product.skuNumber || 'N/A'],
              ['Stock', auctionData.product.stock || '0'],
              ['Sell Price', `$${auctionData.product.sellPrice || '0'}`]
            ],
            theme: 'grid',
            styles: { fontSize: 10 },
            headStyles: { fillColor: [59, 130, 246], textColor: 255 }
          });
        }

        // Save the PDF
        doc.save(`auction-report-${auctionData.lotNumber || 'unknown'}.pdf`);
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

      {/* Catalog Selection */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => {
            setSelectedCatalog(null);
            const allEndedAuctions = catalogs.flatMap(catalog => 
              catalog.auctions.filter(auction => auction.status === "ENDED")
            ).sort((a, b) => new Date(b.endDate) - new Date(a.endDate));
            setWinners(allEndedAuctions);
          }}
          className={`px-4 py-2 rounded-md ${
            !selectedCatalog 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All Catalogs
        </button>
        {catalogs.map((catalog) => (
          <button
            key={catalog._id}
            onClick={() => handleCatalogClick(catalog)}
            className={`px-4 py-2 rounded-md ${
              selectedCatalog?._id === catalog._id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {catalog.catalogName}
          </button>
        ))}
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
                            Lot #{winner.lotNumber} | Starting Price: ${winner.product.price}
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
                        {winner.winnerBidTime ? format(new Date(winner.winnerBidTime), "PPp") : "N/A"}
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
                    <TableCell colSpan={6} className="text-center py-8">
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
