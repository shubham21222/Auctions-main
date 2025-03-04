"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  const activeAuctions = auctions.filter((auction) => auction.status === "ACTIVE");

  const handleEditClick = (auction) => {
    setEditAuction({
      _id: auction._id,
      product: auction.product._id,
      startingBid: auction.startingBid,
      auctionType: auction.auctionType,
      startDate: new Date(auction.startDate).toISOString().split("T")[0],
      endDate: new Date(auction.endDate).toISOString().split("T")[0],
      category: auction.category._id,
      status: auction.status,
    });
    setOpenEditDialog(true);
  };

  const handleUpdateAuction = async (e) => {
    e.preventDefault();

    const payload = {
      product: editAuction.product,
      startingBid: Number(editAuction.startingBid),
      auctionType: editAuction.auctionType,
      startDate: `${editAuction.startDate}T10:00:00Z`,
      endDate: `${editAuction.endDate}T15:00:00Z`,
      category: editAuction.category,
      status: editAuction.status,
    };

    try {
      const response = await fetch(`https://bid.nyelizabeth.com/v1/api/auction/update/${editAuction._id}`, {
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
      <Card>
        <CardHeader>
          <CardTitle>Active Auctions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading auctions...</p>
          ) : activeAuctions.length === 0 ? (
            <p>No active auctions found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Auction Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Starting Bid</TableHead>
                  <TableHead>Current Bid</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeAuctions.map((auction) => (
                  <TableRow key={auction._id}>
                    <TableCell>{auction.product?.title || "N/A"}</TableCell>
                    <TableCell>{auction.auctionType || "N/A"}</TableCell>
                    <TableCell>${auction.startingBid?.toLocaleString() || "N/A"}</TableCell>
                    <TableCell>${auction.currentBid?.toLocaleString() || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant={auction.status === "ACTIVE" ? "default" : "secondary"}>
                        {auction.status || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(auction.endDate).toLocaleDateString() || "N/A"}</TableCell>
                    <TableCell>
                      <Button variant="ghost" onClick={() => handleEditClick(auction)}>
                        Edit
                      </Button>
                      <Button variant="ghost" className="text-red-500">
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Auction Dialog */}
      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Edit Auction</DialogTitle>
          </DialogHeader>
          {editAuction && (
            <form onSubmit={handleUpdateAuction}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="startingBid" className="text-right">
                    Starting Bid
                  </Label>
                  <Input
                    id="startingBid"
                    type="number"
                    value={editAuction.startingBid}
                    onChange={(e) => setEditAuction({ ...editAuction, startingBid: e.target.value })}
                    className="col-span-3 bg-white border-luxury-gold/20"
                    placeholder="$"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="startDate" className="text-right">
                    Start Date
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={editAuction.startDate}
                    onChange={(e) => setEditAuction({ ...editAuction, startDate: e.target.value })}
                    className="col-span-3 bg-white border-luxury-gold/20"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="endDate" className="text-right">
                    End Date
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={editAuction.endDate}
                    onChange={(e) => setEditAuction({ ...editAuction, endDate: e.target.value })}
                    className="col-span-3 bg-white border-luxury-gold/20"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="auctionType" className="text-right">
                    Auction Type
                  </Label>
                  <Select
                    value={editAuction.auctionType}
                    onValueChange={(value) => setEditAuction({ ...editAuction, auctionType: value })}
                  >
                    <SelectTrigger className="col-span-3 bg-white border-luxury-gold/20">
                      <SelectValue placeholder="Select auction type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="TIMED">Timed</SelectItem>
                      <SelectItem value="LIVE">Live</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">
                    Status
                  </Label>
                  <Select
                    value={editAuction.status}
                    onValueChange={(value) => setEditAuction({ ...editAuction, status: value })}
                  >
                    <SelectTrigger className="col-span-3 bg-white border-luxury-gold/20">
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
                <Button type="submit" disabled={loading}>
                  {loading ? "Updating..." : "Update Auction"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}