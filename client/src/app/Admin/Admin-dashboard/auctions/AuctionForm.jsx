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
import moment from "moment-timezone";
import * as XLSX from "xlsx";

export default function AuctionForm({ categories, auctions, setAuctions, fetchAuctions, token }) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [timeZone, setTimeZone] = useState("Asia/Kolkata");
  const [newAuction, setNewAuction] = useState({
    product: "",
    category: "",
    auctionType: "", // No default, will be set by checkbox
    startingBid: "",
    startDate: moment().tz(timeZone).format("DD-MM-YYYY"), // Date only
    startTime: "12:00", // Default start time
    endDate: moment().tz(timeZone).add(5, "days").format("DD-MM-YYYY"), // Date only
    endTime: "12:00", // Default end time
    status: "ACTIVE",
  });
  const [loading, setLoading] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [openAuctionDialog, setOpenAuctionDialog] = useState(false);
  const [bulkUploadFile, setBulkUploadFile] = useState(null);

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

    if (!newAuction.startDate || !newAuction.startTime || !newAuction.startingBid || !newAuction.category || !newAuction.auctionType) {
      toast.error("Please fill in all required fields, including selecting an auction type.");
      setLoading(false);
      return;
    }

    // Convert DD-MM-YYYY and HH:mm to ISO 8601 format
    const startDateTimeLocal = `${newAuction.startDate} ${newAuction.startTime}`;
    const startDateTimeUTC = moment(startDateTimeLocal, "DD-MM-YYYY HH:mm").tz(timeZone).utc().format();

    let endDateTimeUTC = null;
    if (newAuction.auctionType === "TIMED" && newAuction.endDate && newAuction.endTime) {
      const endDateTimeLocal = `${newAuction.endDate} ${newAuction.endTime}`;
      endDateTimeUTC = moment(endDateTimeLocal, "DD-MM-YYYY HH:mm").tz(timeZone).utc().format();

      const nowUTC = moment().utc();
      if (moment(endDateTimeUTC).isSameOrBefore(nowUTC)) {
        toast.error("End date and time must be in the future for TIMED auctions.");
        setLoading(false);
        return;
      }
    }

    const payload = {
      product: newAuction.product,
      category: newAuction.category,
      auctionType: newAuction.auctionType,
      startingBid: Number(newAuction.startingBid),
      startDate: startDateTimeUTC,
      endDate: endDateTimeUTC, // Null for Live, actual date for Timed
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
            endDate: payload.endDate || null, // Include endDate only if it exists
            auctionType: payload.auctionType,
          },
        ]);
        setNewAuction({
          product: "",
          category: "",
          auctionType: "", // Reset auction type
          startingBid: "",
          startDate: moment().tz(timeZone).format("DD-MM-YYYY"),
          startTime: "12:00",
          endDate: moment().tz(timeZone).add(5, "days").format("DD-MM-YYYY"),
          endTime: "12:00",
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

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setBulkUploadFile(file);
    const reader = new FileReader();

    reader.onload = async (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const products = jsonData.map((row) => ({
        title: row.Title || "N/A",
        description: row.Description || "",
        price: Number(row.StartPrice) || 0,
        estimateprice: `${row.LowEst || 0}-${row.HighEst || 0}`,
        offerAmount: 0,
        onlinePrice: Number(row.Online_Price) || 0,
        sellPrice: Number(row.Sell_Price) || 0,
        ReservePrice: Number(row["Reserve Price"] || 0),
        image: [
          row["ImageFile.1"] || "",
          row["ImageFile.2"] || "",
          row["ImageFile.3"] || "",
          row["ImageFile.4"] || "",
          row["ImageFile.5"] || "",
          row["ImageFile.6"] || "",
          row["ImageFile.7"] || "",
          row["ImageFile.8"] || "",
          row["ImageFile.9"] || "",
          row["ImageFile.10"] || "",
          row["ImageFile.11"] || "",
          row["ImageFile.12"] || "",
        ].filter(Boolean),
        skuNumber: row["SKU No"] || "N/A",
        lotNumber: String(row.LotNum || "N/A"),
        sortByPrice: row.SortByPrice || "Low Price",
        stock: 1,
        type: "Painting",
        auctionType: row.auction_type || "TIMED", // Default to TIMED if not specified
      }));

      const categoryName = jsonData[0]?.Category || "Painting";
      const category = (categories || []).find((cat) => cat.name === categoryName);
      if (!category) {
        toast.error("Category not found. Please ensure the category exists.");
        return;
      }

      const startDateTimeUTC = moment.tz("2025-04-01 12:00", "YYYY-MM-DD HH:mm", timeZone).utc().format();
      let endDateTimeUTC = null;
      if (products.every(p => p.auctionType === "TIMED")) {
        endDateTimeUTC = moment.tz("2025-04-12 12:00", "YYYY-MM-DD HH:mm", timeZone).utc().format();
      }

      const payload = {
        category: category._id,
        startDate: startDateTimeUTC,
        endDate: endDateTimeUTC, // Will be null if all are Live
        description: "new file",
        products: products.map((product) => ({
          title: product.title,
          description: product.description,
          price: product.price,
          estimateprice: product.estimateprice,
          offerAmount: product.offerAmount,
          onlinePrice: product.onlinePrice,
          sellPrice: product.sellPrice,
          ReservePrice: product.ReservePrice,
          image: product.image,
          skuNumber: product.skuNumber,
          lotNumber: product.lotNumber,
          sortByPrice: product.sortByPrice,
          stock: product.stock,
          type: product.type,
          auctionType: product.auctionType,
        })),
      };

      try {
        await handleBulkCreate(payload);
        toast.success("All products uploaded successfully!");
      } catch (error) {
        toast.error(`Failed to upload products: ${error.message}`);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleBulkCreate = async (payload) => {
    setLoading(true);
    try {
      const response = await fetch(`${config.baseURL}/v1/api/auction/bulkCreate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.status) {
        fetchAuctions();
        return true;
      } else {
        throw new Error(data.message || "Failed to create bulk auctions");
      }
    } catch (error) {
      console.error("Error creating bulk auctions:", error.message);
      throw error;
    } finally {
      setLoading(false);
      setBulkUploadFile(null);
    }
  };

  const handleAuctionTypeChange = (type) => {
    setNewAuction({ ...newAuction, auctionType: type });
    if (type === "LIVE") {
      setNewAuction({ ...newAuction, auctionType: type, endDate: "", endTime: "12:00" });
    }
  };

  return (
    <>
      <div className="mb-4">
        <Label htmlFor="bulkUpload">Bulk Upload Auctions (Excel/CSV)</Label>
        <Input
          id="bulkUpload"
          type="file"
          accept=".xlsx, .xls, .csv"
          onChange={handleFileUpload}
          className="mt-2"
        />
      </div>

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

      <Dialog open={openAuctionDialog} onOpenChange={setOpenAuctionDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Create Auction for {selectedProduct?.title}</DialogTitle>
            <DialogDescription>Fill in the details to start the auction (dates in DD-MM-YYYY and times in HH:mm format).</DialogDescription>
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
                    {(categories || []).map((category) => (
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
                  type="text"
                  value={newAuction.startDate}
                  onChange={(e) => setNewAuction({ ...newAuction, startDate: e.target.value })}
                  className="col-span-2 bg-white border-luxury-gold/20"
                  placeholder="DD-MM-YYYY"
                  required
                  pattern="\d{2}-\d{2}-\d{4}"
                  title="Please enter date in DD-MM-YYYY format"
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
                <Label className="text-right">Auction Type (Select One)</Label>
                <div className="col-span-3 space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="liveAuction"
                      checked={newAuction.auctionType === "LIVE"}
                      onChange={() => handleAuctionTypeChange("LIVE")}
                    />
                    <Label htmlFor="liveAuction">Live Auction</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="timedAuction"
                      checked={newAuction.auctionType === "TIMED"}
                      onChange={() => handleAuctionTypeChange("TIMED")}
                    />
                    <Label htmlFor="timedAuction">Timed Auction</Label>
                  </div>
                  {(!newAuction.auctionType) && (
                    <p className="text-red-500 text-sm">Please select an auction type.</p>
                  )}
                </div>
              </div>

              {newAuction.auctionType === "TIMED" && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="endDate" className="text-right">
                    End Date
                  </Label>
                  <Input
                    id="endDate"
                    type="text"
                    value={newAuction.endDate}
                    onChange={(e) => setNewAuction({ ...newAuction, endDate: e.target.value })}
                    className="col-span-2 bg-white border-luxury-gold/20"
                    placeholder="DD-MM-YYYY"
                    required
                    pattern="\d{2}-\d{2}-\d{4}"
                    title="Please enter date in DD-MM-YYYY format"
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
              )}

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
                disabled={loading || !newAuction.category || !newAuction.startingBid || !newAuction.auctionType}
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