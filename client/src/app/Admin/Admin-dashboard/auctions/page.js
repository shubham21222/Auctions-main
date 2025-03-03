"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSelector } from "react-redux";
import config from "@/app/config_BASE_URL";
import ProductTable from "./ProductTable";
import toast from "react-hot-toast";

export default function Auctions() {
  const [categories, setCategories] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [newAuction, setNewAuction] = useState({
    product: "",
    category: "",
    auctionType: "TIMED",
    startingBid: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    status: "ACTIVE",
  });
  const [loading, setLoading] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [openAuctionDialog, setOpenAuctionDialog] = useState(false);
  const auth = useSelector((state) => state.auth);
  const token = auth?.token;

  // Fetch all auctions (Live and Timed)
  const fetchAuctions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:4000/v1/api/auction/all`, {
        method: "GET",
        headers: {
          Authorization: `${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch auctions");
      const data = await response.json();

      if (data.status) {
        // Ensure data.items is an array, fallback to empty array if not
        const auctionItems = Array.isArray(data.items) ? data.items : [];
        setAuctions(auctionItems);
        toast.success("Auctions loaded successfully!");
      } else {
        throw new Error(data.message || "Unknown error");
      }
    } catch (error) {
      console.error("Error fetching auctions:", error);
      setAuctions([]);
      toast.error("Failed to load auctions.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${config.baseURL}/v1/api/category/all`, {
        method: "GET",
        headers: {
          Authorization: `${token}`,
        },
      });
      const data = await response.json();
      if (data.status) {
        setCategories(Array.isArray(data.items) ? data.items : []);
      } else {
        console.error("Failed to fetch categories:", data.message);
        toast.error("Failed to load categories.");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
      toast.error("Error fetching categories.");
    }
  };

  useEffect(() => {
    if (token) {
      fetchAuctions();
      fetchCategories();
    }
  }, [token]);

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

    const payload = {
      product: newAuction.product,
      category: newAuction.category,
      auctionType: newAuction.auctionType,
      startingBid: Number(newAuction.startingBid),
      startDate: `${newAuction.startDate}T19:00:00-08:00`,
      endDate: `${newAuction.endDate}T20:00:00-08:00`,
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
            auctionType: payload.auctionType, // Add auctionType to display
          },
        ]);
        setNewAuction({
          product: "",
          category: "",
          auctionType: "TIMED",
          startingBid: "",
          startDate: new Date().toISOString().split("T")[0],
          endDate: "",
          status: "ACTIVE",
        });
        setOpenAuctionDialog(false);
        fetchAuctions();
        toast.success("Auction created successfully!");
      } else {
        console.error("Failed to create auction:", data.message);
        toast.error("Failed to create auction.");
      }
    } catch (error) {
      console.error("Error creating auction:", error);
      toast.error("Error creating auction.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Auctions</h2>
      </div>

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
            <DialogDescription>Fill in the details to start the auction.</DialogDescription>
          </DialogHeader>
          <form onSubmit={addAuction}>
            <div className="grid gap-4 py-4">
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
                  value={newAuction.endDate}
                  onChange={(e) => setNewAuction({ ...newAuction, endDate: e.target.value })}
                  className="col-span-3 bg-white border-luxury-gold/20"
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

      <Card>
        <CardHeader>
          <CardTitle>All Auctions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading auctions...</p>
          ) : auctions.length === 0 ? (
            <p>No auctions found.</p>
          ) : !Array.isArray(auctions) ? (
            <p>Error: Invalid auction data format.</p>
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
                {auctions.map((auction) => (
                  <TableRow key={auction._id}>
                    <TableCell>{auction.product?.title || "N/A"}</TableCell>
                    <TableCell>{auction.auctionType || "N/A"}</TableCell>
                    <TableCell>${auction.startingBid || "N/A"}</TableCell>
                    <TableCell>${auction.currentBid || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant={auction.status === "ACTIVE" ? "default" : "secondary"}>
                        {auction.status || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(auction.endDate).toLocaleDateString() || "N/A"}</TableCell>
                    <TableCell>
                      <Button variant="ghost">Edit</Button>
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
    </div>
  );
}