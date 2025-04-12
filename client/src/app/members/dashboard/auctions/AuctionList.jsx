"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast";
import config from "@/app/config_BASE_URL";

export default function AuctionList({ auctions, loading, token, fetchAuctions }) {
  const [editAuction, setEditAuction] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);

  // Log the auctions prop for debugging
  console.log("Auctions in AuctionList:", auctions);

  // Ensure auctions is an array, default to empty array if undefined or null
  const activeAuctions = (auctions || []).filter((auction) => auction.status === "ACTIVE");

  const handleEditClick = (auction) => {
    setEditAuction({
      _id: auction._id,
      product: auction.product?._id || "",
      startingBid: auction.startingBid || 0,
      auctionType: auction.auctionType || "",
      startDate: auction.startDate ? new Date(auction.startDate).toISOString().split("T")[0] : "",
      endDate: auction.endDate ? new Date(auction.endDate).toISOString().split("T")[0] : "",
      category: auction.category?._id || "",
      status: auction.status || "",
    });
    setOpenEditDialog(true);
  };

  const handleDeleteClick = async (auctionId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this auction?");
    if (!confirmDelete) return;

    const payload = {
      ids: [auctionId], // Sending a single ID in an array as per the API requirement
    };

    try {
      const response = await fetch(`${config.baseURL}/v1/api/auction/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to delete auction: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.status) {
        toast.success("Auction deleted successfully!");
        fetchAuctions(); // Refresh the auction list after deletion
      } else {
        throw new Error(data.message || "Failed to delete auction");
      }
    } catch (error) {
      console.error("Error deleting auction:", error);
      toast.error(`Failed to delete auction: ${error.message}`);
    }
  };

  const handleUpdateAuction = async (e) => {
    e.preventDefault();

    const payload = {
      product: editAuction.product,
      startingBid: Number(editAuction.startingBid),
      auctionType: editAuction.auctionType,
      startDate: `${editAuction.startDate}T10:00:00Z`,
      endDate: editAuction.endDate ? `${editAuction.endDate}T15:00:00Z` : null,
      category: editAuction.category,
      status: editAuction.status,
    };

    try {
      const response = await fetch(`${config.baseURL}/v1/api/auction/update/${editAuction._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (data.status) {
        setOpenEditDialog(false);
        fetchAuctions(); // Refresh the auction list
        toast.success("Auction updated successfully!");
      } else {
        throw new Error(data.message || "Failed to update auction");
      }
    } catch (error) {
      console.error("Error updating auction:", error);
      toast.error("Failed to update auction.");
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-gold"></div>
          </div>
        ) : auctions.length === 0 ? (
          <div className="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="mt-4 text-xl text-gray-600">No products found in this catalog</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <thead>
                <tr className="bg-gray-50">
                  <th className="w-24 px-4 py-4 text-left text-sm font-semibold text-gray-600">Lot Number</th>
                  <th className="w-48 px-4 py-4 text-left text-sm font-semibold text-gray-600">Product Name</th>
                  <th className="w-32 px-4 py-4 text-left text-sm font-semibold text-gray-600">Type</th>
                  <th className="w-32 px-4 py-4 text-left text-sm font-semibold text-gray-600">Starting Bid</th>
                  <th className="w-32 px-4 py-4 text-left text-sm font-semibold text-gray-600">Current Bid</th>
                  <th className="w-24 px-4 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                  <th className="w-32 px-4 py-4 text-left text-sm font-semibold text-gray-600">Start Date</th>
                  <th className="w-40 px-4 py-4 text-left text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {auctions.map((auction) => (
                  <tr key={auction._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {auction.product?.lotNumber || "N/A"}
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900 line-clamp-2">
                        {auction.product?.title || "N/A"}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {auction.auctionType || "N/A"}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      ${auction.startingBid?.toLocaleString() || "N/A"}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      ${auction.currentBid?.toLocaleString() || "N/A"}
                    </td>
                    <td className="px-4 py-4">
                      <Badge 
                        variant={auction.status === "ACTIVE" ? "default" : "secondary"}
                        className="px-3 py-1"
                      >
                        {auction.status || "N/A"}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {auction.startDate ? new Date(auction.startDate).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditClick(auction)}
                          className="border-luxury-gold/20 text-luxury-gold hover:bg-luxury-gold/10"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteClick(auction._id)}
                          className="hover:bg-red-600"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Auction Dialog */}
      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent className="bg-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800">Edit Auction</DialogTitle>
          </DialogHeader>
          {editAuction && (
            <form onSubmit={handleUpdateAuction} className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="startingBid" className="text-gray-700">Starting Bid</Label>
                  <Input
                    id="startingBid"
                    type="number"
                    value={editAuction.startingBid}
                    onChange={(e) => setEditAuction({ ...editAuction, startingBid: e.target.value })}
                    className="mt-1 bg-white border-luxury-gold/20"
                    placeholder="$"
                  />
                </div>

                <div>
                  <Label htmlFor="startDate" className="text-gray-700">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={editAuction.startDate}
                    onChange={(e) => setEditAuction({ ...editAuction, startDate: e.target.value })}
                    className="mt-1 bg-white border-luxury-gold/20"
                  />
                </div>

                <div>
                  <Label htmlFor="endDate" className="text-gray-700">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={editAuction.endDate}
                    onChange={(e) => setEditAuction({ ...editAuction, endDate: e.target.value })}
                    className="mt-1 bg-white border-luxury-gold/20"
                  />
                </div>

                <div>
                  <Label htmlFor="auctionType" className="text-gray-700">Auction Type</Label>
                  <Select
                    value={editAuction.auctionType}
                    onValueChange={(value) => setEditAuction({ ...editAuction, auctionType: value })}
                  >
                    <SelectTrigger className="mt-1 bg-white border-luxury-gold/20">
                      <SelectValue placeholder="Select auction type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="TIMED">Timed</SelectItem>
                      <SelectItem value="LIVE">Live</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status" className="text-gray-700">Status</Label>
                  <Select
                    value={editAuction.status}
                    onValueChange={(value) => setEditAuction({ ...editAuction, status: value })}
                  >
                    <SelectTrigger className="mt-1 bg-white border-luxury-gold/20">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="ENDED">Ended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-luxury-gold hover:bg-luxury-gold/90"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </div>
                  ) : "Update Auction"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}