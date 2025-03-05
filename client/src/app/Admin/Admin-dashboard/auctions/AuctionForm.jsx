"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import ProductTable from "./ProductTable";
import moment from "moment-timezone"; // Import moment-timezone

export default function AuctionForm({ categories, auctions, setAuctions, fetchAuctions, token }) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [timeZone, setTimeZone] = useState("Asia/Kolkata"); // Default time zone
  const [newAuction, setNewAuction] = useState({
    product: "",
    category: "",
    auctionType: "TIMED",
    startingBid: "",
    startDate: moment().tz(timeZone).format("YYYY-MM-DD"),
    startTime: moment().tz(timeZone).format("HH:mm"),
    endDate: moment().tz(timeZone).format("YYYY-MM-DD"),
    endTime: moment().tz(timeZone).add(5, "minutes").format("HH:mm"),
    status: "ACTIVE",
  });
  const [loading, setLoading] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [openAuctionDialog, setOpenAuctionDialog] = useState(false);

  const handleAddToAuction = (product) => {
    setSelectedProduct(product);
    setNewAuction({
      ...newAuction,
      product: product._id,
      category: product.category._id,
    });
    setOpenConfirmDialog(true);
  };

  const confirmAddAuction = () => {
    setOpenConfirmDialog(false);
    setOpenAuctionDialog(true);
  };

  const addAuction = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate all fields are filled
    if (
      !newAuction.startDate ||
      !newAuction.startTime ||
      !newAuction.endDate ||
      !newAuction.endTime ||
      !newAuction.startingBid ||
      !newAuction.category
    ) {
      toast.error("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    // Combine date and time into local date strings
    const startDateTimeLocal = `${newAuction.startDate}T${newAuction.startTime}`;
    const endDateTimeLocal = `${newAuction.endDate}T${newAuction.endTime}`;

    // Convert local date/time to UTC
    const startDateTimeUTC = moment.tz(startDateTimeLocal, timeZone).utc().format();
    const endDateTimeUTC = moment.tz(endDateTimeLocal, timeZone).utc().format();

    // Validate endDate is in the future
    const nowUTC = moment().utc();
    if (moment(endDateTimeUTC).isSameOrBefore(nowUTC)) {
      toast.error("End date and time must be in the future.");
      setLoading(false);
      return;
    }

    // Log for debugging
    console.log("Entered Local Start:", startDateTimeLocal, "Converted UTC Start:", startDateTimeUTC);
    console.log("Entered Local End:", endDateTimeLocal, "Converted UTC End:", endDateTimeUTC);

    const payload = {
      product: newAuction.product,
      category: newAuction.category,
      auctionType: newAuction.auctionType,
      startingBid: Number(newAuction.startingBid),
      startDate: startDateTimeUTC,
      endDate: endDateTimeUTC,
      status: newAuction.status,
    };

    try {
      const response = await fetch(`${config.baseURL}/v1/api/auction/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (data.status) {
        setAuctions((prev) => [
          ...prev,
          {
            _id: data.items._id,
            product: { title: selectedProduct.title },
            startingBid: payload.startingBid,
            currentBid: payload.startingBid,
            status: payload.status,
            endDate: payload.endDate,
            auctionType: payload.auctionType,
          },
        ]);
        setNewAuction({
          product: "",
          category: "",
          auctionType: "TIMED",
          startingBid: "",
          startDate: moment().tz(timeZone).format("YYYY-MM-DD"),
          startTime: moment().tz(timeZone).format("HH:mm"),
          endDate: moment().tz(timeZone).format("YYYY-MM-DD"),
          endTime: moment().tz(timeZone).add(5, "minutes").format("HH:mm"),
          status: "ACTIVE",
        });
        setOpenAuctionDialog(false);
        fetchAuctions();
        toast.success("Auction created successfully!");
      } else {
        throw new Error(data.message || "Failed to create auction");
      }
    } catch (error) {
      console.error("Error creating auction:", error);
      toast.error("Error creating auction.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ProductTable token={token} onAddToAuction={handleAddToAuction} />

      {/* Confirmation Dialog */}
      <Dialog open={openConfirmDialog} onOpenChange={setOpenConfirmDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Confirm Auction Creation</DialogTitle>
            <DialogDescription>
              Do you want to add "{selectedProduct?.title}" to an auction?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenConfirmDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmAddAuction}>Yes, Proceed</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Auction Creation Dialog */}
      <Dialog open={openAuctionDialog} onOpenChange={setOpenAuctionDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Create Auction for {selectedProduct?.title}</DialogTitle>
            <DialogDescription>Fill in the details to start the auction (times in {timeZone}).</DialogDescription>
          </DialogHeader>
          <form onSubmit={addAuction}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="timeZone" className="text-right">
                  Time Zone
                </Label>
                <Select value={timeZone} onValueChange={(value) => setTimeZone(value)}>
                  <SelectTrigger className="col-span-3 bg-white border-luxury-gold/20">
                    <SelectValue placeholder="Select a time zone" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {moment.tz.names().map((tz) => (
                      <SelectItem key={tz} value={tz}>
                        {tz}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <Select
                  value={newAuction.category}
                  onValueChange={(value) => setNewAuction({ ...newAuction, category: value })}
                >
                  <SelectTrigger className="col-span-3 bg-white border-luxury-gold/20">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="startingBid" className="text-right">
                  Starting Bid
                </Label>
                <Input
                  id="startingBid"
                  type="number"
                  value={newAuction.startingBid}
                  onChange={(e) => setNewAuction({ ...newAuction, startingBid: e.target.value })}
                  className="col-span-3 bg-white border-luxury-gold/20"
                  placeholder="$"
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="startDate" className="text-right">
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={newAuction.startDate}
                  onChange={(e) => setNewAuction({ ...newAuction, startDate: e.target.value })}
                  className="col-span-2 bg-white border-luxury-gold/20"
                  required
                />
                <Input
                  id="startTime"
                  type="time"
                  value={newAuction.startTime}
                  onChange={(e) => setNewAuction({ ...newAuction, startTime: e.target.value })}
                  className="col-span-1 bg-white border-luxury-gold/20"
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="endDate" className="text-right">
                  End Date
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={newAuction.endDate}
                  onChange={(e) => setNewAuction({ ...newAuction, endDate: e.target.value })}
                  className="col-span-2 bg-white border-luxury-gold/20"
                  required
                />
                <Input
                  id="endTime"
                  type="time"
                  value={newAuction.endTime}
                  onChange={(e) => setNewAuction({ ...newAuction, endTime: e.target.value })}
                  className="col-span-1 bg-white border-luxury-gold/20"
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="auctionType" className="text-right">
                  Auction Type
                </Label>
                <Select
                  value={newAuction.auctionType}
                  onValueChange={(value) => setNewAuction({ ...newAuction, auctionType: value })}
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
                  value={newAuction.status}
                  onValueChange={(value) => setNewAuction({ ...newAuction, status: value })}
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
              <Button
                type="submit"
                disabled={loading || !newAuction.category || !newAuction.startingBid}
              >
                {loading ? "Creating..." : "Create Auction"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}