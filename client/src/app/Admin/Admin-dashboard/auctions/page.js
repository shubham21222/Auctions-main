"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import config from "@/app/config_BASE_URL";
import AuctionForm from "./AuctionForm";
import AuctionList from "./AuctionList";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as XLSX from "xlsx";
import moment from "moment-timezone";

export default function Auctions() {
  const [auctions, setAuctions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialFetchDone, setInitialFetchDone] = useState(false);
  const [openBulkUploadDialog, setOpenBulkUploadDialog] = useState(false);
  const [bulkUploadFile, setBulkUploadFile] = useState(null);
  const [catalogName, setCatalogName] = useState("");
  const [catalogDescription, setCatalogDescription] = useState("");
  const [startDate, setStartDate] = useState(moment().tz("Asia/Kolkata").format("DD-MM-YYYY"));
  const [endDate, setEndDate] = useState(moment().tz("Asia/Kolkata").add(5, "days").format("DD-MM-YYYY"));
  const [productsToUpload, setProductsToUpload] = useState([]);
  const auth = useSelector((state) => state.auth);
  const token = auth?.token;

  // Fetch all auctions and categories (unchanged)
  const fetchAuctions = async () => {
    if (!token) {
      console.error("No token available for fetching auctions.");
      setAuctions([]);
      toast.error("Authentication token is missing. Please log in.");
      setLoading(false);
      setInitialFetchDone(true);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${config.baseURL}/v1/api/auction/bulk`, {
        method: "GET",
        headers: {
          Authorization: `${token}`,
        },
      });
      if (!response.ok) throw new Error(`Failed to fetch auctions: ${response.statusText}`);
      const data = await response.json();

      if (!data.status || !data.items || !Array.isArray(data.items.catalogs)) {
        throw new Error("Invalid auction data structure");
      }

      const formattedAuctions = data.items.catalogs.flatMap((catalog) => {
        if (!catalog || !Array.isArray(catalog.auctions)) {
          console.warn("Catalog missing auctions:", catalog);
          return [];
        }
        return catalog.auctions.map((auction) => ({
          _id: auction._id || "",
          product: {
            _id: auction.product?._id || "",
            title: auction.product?.title || "N/A",
            price: auction.product?.price || 0,
            lotNumber: auction.lotNumber || "N/A",
            skuNumber: auction.skuNumber || "N/A",
          },
          startingBid: auction.startingBid || 0,
          currentBid: auction.currentBid || 0,
          status: auction.status || "N/A",
          endDate: auction.endDate || "",
          auctionType: auction.auctionType || "N/A",
          category: auction.category || {},
          catalog: auction.catalog || "N/A",
          startDate: auction.startDate || "",
        }));
      });

      setAuctions(formattedAuctions);
      toast.success("Auctions loaded successfully!");
    } catch (error) {
      console.error("Error fetching auctions:", error);
      setAuctions([]);
      toast.error("Failed to load auctions.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    if (!token) {
      console.error("No token available for fetching categories.");
      setCategories([]);
      toast.error("Authentication token is missing. Please log in.");
      return;
    }

    try {
      const response = await fetch(`${config.baseURL}/v1/api/category/all`, {
        method: "GET",
        headers: {
          Authorization: `${token}`,
        },
      });
      if (!response.ok) throw new Error(`Failed to fetch categories: ${response.statusText}`);
      const data = await response.json();

      if (!data.status || !Array.isArray(data.items)) {
        throw new Error("Invalid categories data structure");
      }

      setCategories(data.items);
      toast.success("Categories loaded successfully!");
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
      toast.error("Failed to load categories.");
    }
  };

  useEffect(() => {
    if (token && !initialFetchDone) {
      Promise.all([fetchAuctions(), fetchCategories()]).then(() => {
        setInitialFetchDone(true);
      });
    } else if (!token) {
      setAuctions([]);
      setCategories([]);
      setInitialFetchDone(true);
    }
  }, [token, initialFetchDone]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    if (!catalogName || !catalogDescription || !startDate || !endDate) {
      toast.error("Please enter all required fields before uploading the file.");
      return;
    }
  
    setBulkUploadFile(file);
    const reader = new FileReader();
  
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
  
      const products = jsonData.map((row) => ({
        title: row.Title || "N/A", // Ensure title is mapped
        description: row.Description || "No description provided", // Full description from Excel
        price: Number(row.StartPrice) || 0, // Starting bid
        estimateprice: `${Number(row.LowEst) || 0}-${Number(row.HighEst) || 0}`, // Estimate range
        offerAmount: 0, // Default to 0 as per your example
        onlinePrice: Number(row.Online_Price) || 0, // Online price
        sellPrice: Number(row.Sell_Price) || 0, // Sell price
        ReservePrice: Number(row["Reserve Price"]) || 0, // Reserve price
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
        ].filter(Boolean), // Filter out empty strings
        skuNumber: row["SKU No"] || "N/A",
        lotNumber: String(row.LotNum || "N/A"),
        sortByPrice: row.SortByPrice || "Low Price", // Default sorting
        stock: 1, // Fixed stock value
        type: "Jewelry", // Static type (adjust if dynamic)
        auctionType: row.auction_type || "TIMED", // Auction type from Excel
      }));
  
      setProductsToUpload(products);
      toast.success("File parsed successfully. Click 'Add Products' to upload.");
    };
  
    reader.readAsArrayBuffer(file);
  };


  const handleBulkCreate = async () => {
    if (productsToUpload.length === 0) {
      toast.error("No products to upload. Please upload a valid file.");
      return;
    }
  
    if (!catalogName || !catalogDescription || !startDate || !endDate) {
      toast.error("Please enter all required fields.");
      return;
    }
  
    setLoading(true);
  
    const batchSize = 2; // Process 2 products per batch
    const batches = [];
    for (let i = 0; i < productsToUpload.length; i += batchSize) {
      batches.push(productsToUpload.slice(i, i + batchSize));
    }
  
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
  
      // Convert dates to UTC with proper formatting
      const startDateTimeUTC = moment
        .tz(`${startDate} 00:00`, "DD-MM-YYYY HH:mm", "Asia/Kolkata")
        .utc()
        .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
      const endDateTimeUTC = moment
        .tz(`${endDate} 23:59`, "DD-MM-YYYY HH:mm", "Asia/Kolkata")
        .utc()
        .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
  
      const payload = {
        category: catalogName, // Catalog name as category
        stateDate: startDateTimeUTC, // Typo fixed: "stateDate" -> "startDate" if that's what the backend expects
        endDate: endDateTimeUTC,
        description: catalogDescription, // Catalog description
        products: batch.map((product) => ({
          title: product.title,
          description: product.description,
          price: product.price,
          estimateprice: product.estimateprice,
          offerAmount: product.offerAmount,
          onlinePrice: product.onlinePrice,
          sellPrice: product.sellPrice,
          ReservePrice: product.ReservePrice,
          image: product.image, // Include image array
          skuNumber: product.skuNumber,
          lotNumber: product.lotNumber,
          sortByPrice: product.sortByPrice,
          stock: product.stock,
          type: product.type,
          auctionType: product.auctionType,
        })),
      };
  
      console.log("Final payload being sent:", JSON.stringify(payload, null, 2)); // Debug log
  
      try {
        const response = await fetch(`${config.baseURL}/v1/api/auction/bulkCreate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
          body: JSON.stringify(payload),
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Backend error response:", errorData);
          throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
        }
  
        const data = await response.json();
        console.log("Backend response:", data);
  
        if (!data.status) {
          throw new Error(data.message || `Failed to upload batch ${batchIndex + 1}`);
        }
  
        batch.forEach((product) => {
          toast.success(`Product "${product.title}" uploaded successfully!`);
        });
      } catch (error) {
        console.error(`Error uploading batch ${batchIndex + 1}:`, error);
        toast.error(`Failed to upload batch ${batchIndex + 1}: ${error.message}`);
        setLoading(false);
        return;
      }
    }
  
    // Reset and cleanup
    fetchAuctions();
    setOpenBulkUploadDialog(false);
    setCatalogName("");
    setCatalogDescription("");
    setStartDate(moment().tz("Asia/Kolkata").format("DD-MM-YYYY"));
    setEndDate(moment().tz("Asia/Kolkata").add(5, "days").format("DD-MM-YYYY"));
    setBulkUploadFile(null);
    setProductsToUpload([]);
    toast.success("All products uploaded successfully!");
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Auctions</h2>
        <Button onClick={() => setOpenBulkUploadDialog(true)}>Add Auctions</Button>
      </div>

      {/* {initialFetchDone ? (
        <AuctionForm
          categories={categories}
          auctions={auctions}
          setAuctions={setAuctions}
          fetchAuctions={fetchAuctions}
          token={token}
        />
      ) : (
        <p>Loading form...</p>
      )} */}

      {initialFetchDone ? (
        <AuctionList auctions={auctions} loading={loading} token={token} fetchAuctions={fetchAuctions} />
      ) : (
        <p>Loading auctions...</p>
      )}

      <Dialog open={openBulkUploadDialog} onOpenChange={setOpenBulkUploadDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Add Auctions in Bulk</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="catalogName" className="text-right">
                Catalog Name
              </Label>
              <Input
                id="catalogName"
                type="text"
                value={catalogName}
                onChange={(e) => setCatalogName(e.target.value)}
                className="col-span-3 bg-white border-luxury-gold/20"
                placeholder="e.g., newcatgosdry"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="catalogDescription" className="text-right">
                Catalog Description
              </Label>
              <Input
                id="catalogDescription"
                type="text"
                value={catalogDescription}
                onChange={(e) => setCatalogDescription(e.target.value)}
                className="col-span-3 bg-white border-luxury-gold/20"
                placeholder="e.g., new file"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startDate" className="text-right">
                Start Date
              </Label>
              <Input
                id="startDate"
                type="text"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="col-span-3 bg-white border-luxury-gold/20"
                placeholder="DD-MM-YYYY"
                required
                pattern="\d{2}-\d{2}-\d{4}"
                title="Please enter date in DD-MM-YYYY format"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endDate" className="text-right">
                End Date
              </Label>
              <Input
                id="endDate"
                type="text"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="col-span-3 bg-white border-luxury-gold/20"
                placeholder="DD-MM-YYYY"
                required
                pattern="\d{2}-\d{2}-\d{4}"
                title="Please enter date in DD-MM-YYYY format"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bulkUpload" className="text-right">
                Upload Excel/CSV File
              </Label>
              <Input
                id="bulkUpload"
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                className="col-span-3 bg-white border-luxury-gold/20"
                disabled={!catalogName || !catalogDescription || !startDate || !endDate}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setOpenBulkUploadDialog(false);
                setCatalogName("");
                setCatalogDescription("");
                setStartDate(moment().tz("Asia/Kolkata").format("DD-MM-YYYY"));
                setEndDate(moment().tz("Asia/Kolkata").add(5, "days").format("DD-MM-YYYY"));
                setBulkUploadFile(null);
                setProductsToUpload([]);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkCreate}
              disabled={loading || productsToUpload.length === 0 || !catalogName || !catalogDescription || !startDate || !endDate}
            >
              {loading ? "Uploading..." : "Add Products"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}