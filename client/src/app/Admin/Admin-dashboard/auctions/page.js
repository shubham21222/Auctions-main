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
  DialogDescription,
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
  const [startDate, setStartDate] = useState(moment().tz("Asia/Kolkata").format("DD-MM-YYYY"));
  const [endDate, setEndDate] = useState(moment().tz("Asia/Kolkata").add(5, "days").format("DD-MM-YYYY"));
  const [productsToUpload, setProductsToUpload] = useState([]);
  const [auctionType, setAuctionType] = useState("");
  const [catalogs, setCatalogs] = useState([]);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [catalogToDelete, setCatalogToDelete] = useState("");
  const [selectedCatalog, setSelectedCatalog] = useState(null);
  const auth = useSelector((state) => state.auth);
  const token = auth?.token;

  // Fetch all auctions and categories
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
          catalog: catalog.catalogName || "N/A",
          startDate: auction.startDate || "",
        }));
      });

      setAuctions(formattedAuctions);
      setCatalogs(data.items.catalogs.map(catalog => catalog.catalogName));
      toast.success("Auctions and catalogs loaded successfully!");
    } catch (error) {
      console.error("Error fetching auctions:", error);
      setAuctions([]);
      setCatalogs([]);
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
      setCatalogs([]);
      setInitialFetchDone(true);
    }
  }, [token, initialFetchDone]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!catalogName || !startDate || !auctionType) {
      toast.error("Please enter all required fields before uploading the file, including auction type.");
      return;
    }

    if (auctionType === "TIMED" && !endDate) {
      toast.error("Timed auctions require an end date.");
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

      // Generate a unique identifier for this upload batch
      const batchId = Date.now().toString();

      const products = jsonData.map((row, index) => ({
        title: `${row.Title || "N/A"}-${batchId}-${index}`,
        description: row.Description || "No description provided",
        price: Number(row.StartPrice) || 0,
        estimateprice: `${Number(row.LowEst) || 0}-${Number(row.HighEst) || 0}`,
        offerAmount: 0,
        onlinePrice: Number(row.Online_Price) || 0,
        sellPrice: Number(row.Sell_Price) || 0,
        ReservePrice: Number(row["Reserve Price"]) || 0,
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
        ].filter(Boolean),
        skuNumber: row["SKU No"] || "N/A",
        lotNumber: String(row.LotNum || `LOT${index + 1}`),
        sortByPrice: row.SortByPrice || "Low Price",
        stock: 1,
        type: "Jewelry",
        auctionType: auctionType,
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

    if (!catalogName || !startDate || !auctionType) {
      toast.error("Please enter all required fields, including auction type.");
      return;
    }

    if (auctionType === "TIMED" && !endDate) {
      toast.error("Timed auctions require an end date.");
      return;
    }

    if (!["LIVE", "TIMED"].includes(auctionType)) {
      toast.error("Invalid auction type. Please select LIVE or TIMED.");
      return;
    }

    setLoading(true);

    // Convert dates to UTC with proper formatting
    const startDateTimeUTC = moment
      .tz(`${startDate} 00:00`, "DD-MM-YYYY HH:mm", "Asia/Kolkata")
      .utc()
      .format("YYYY-MM-DDTHH:mm:ss.SSSZ");
    let endDateTimeUTC = null;
    if (auctionType === "TIMED") {
      endDateTimeUTC = moment
        .tz(`${endDate} 23:59`, "DD-MM-YYYY HH:mm", "Asia/Kolkata")
        .utc()
        .format("YYYY-MM-DDTHH:mm:ss.SSSZ");
    }

    const payload = {
      category: catalogName,
      stateDate: startDateTimeUTC,
      endDate: endDateTimeUTC,
      status: "ACTIVE",
      desciptions: "Catalog description", // Workaround for backend typo
      products: productsToUpload.map((product) => ({
        title: product.title,
        description: product.description, // Keep product-level description
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
        auctionType: auctionType,
      })),
    };

    console.log("Final payload being sent:", JSON.stringify(payload, null, 2));

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
        throw new Error(data.message || "Failed to upload products");
      }

      productsToUpload.forEach((product) => {
        toast.success(`Product "${product.title}" uploaded successfully!`);
      });
    } catch (error) {
      console.error("Error uploading products:", error);
      toast.error(`Failed to upload products: ${error.message}`);
      setLoading(false);
      return;
    }

    // Reset and cleanup
    fetchAuctions();
    setOpenBulkUploadDialog(false);
    setCatalogName("");
    setStartDate(moment().tz("Asia/Kolkata").format("DD-MM-YYYY"));
    setEndDate(moment().tz("Asia/Kolkata").add(5, "days").format("DD-MM-YYYY"));
    setAuctionType("");
    setBulkUploadFile(null);
    setProductsToUpload([]);
    toast.success("All products uploaded successfully!");
    setLoading(false);
  };

  // Handle catalog deletion
  const handleDeleteCatalog = async () => {
    if (!catalogToDelete) return;

    setLoading(true);
    const payload = {
      catalogs: [catalogToDelete],
    };

    try {
      const response = await fetch(`${config.baseURL}/v1/api/auction/deleteCatalog`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to delete catalog: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.status) {
        toast.success(`Catalog "${catalogToDelete}" deleted successfully!`);
        fetchAuctions();
        setOpenDeleteDialog(false);
        setCatalogToDelete("");
      } else {
        throw new Error(data.message || "Failed to delete catalog");
      }
    } catch (error) {
      console.error("Error deleting catalog:", error);
      toast.error(`Failed to delete catalog: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Auctions</h2>
        <div>
          <Button onClick={() => setOpenBulkUploadDialog(true)}>Add Auctions</Button>
          <Button
            variant="destructive"
            className="ml-2"
            onClick={() => setOpenDeleteDialog(true)}
            disabled={catalogs.length === 0}
          >
            Delete Catalog
          </Button>
        </div>
      </div>

      {initialFetchDone ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {catalogs.map((catalog) => (
            <div
              key={catalog}
              className="group relative bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-luxury-gold/20"
              onClick={() => setSelectedCatalog(catalog)}
            >
              <div className="absolute top-4 right-4">
                <div className="w-12 h-12 rounded-full bg-luxury-gold/10 flex items-center justify-center">
                  <span className="text-luxury-gold text-lg font-semibold">
                    {auctions.filter(a => a.catalog === catalog).length}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-gray-800 group-hover:text-luxury-gold transition-colors">
                  {catalog}
                </h3>
                <p className="text-gray-600">
                  {auctions.filter(a => a.catalog === catalog).length} products available
                </p>
                <div className="pt-4">
                  <Button
                    variant="outline"
                    className="w-full border-luxury-gold/20 text-luxury-gold hover:bg-luxury-gold/10"
                  >
                    View Products
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-gold"></div>
        </div>
      )}

      {selectedCatalog && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-3xl font-bold text-gray-800">Products in {selectedCatalog}</h3>
              <p className="text-gray-600 mt-1">Manage your auction products</p>
            </div>
            <Button
              variant="outline"
              onClick={() => setSelectedCatalog(null)}
              className="border-luxury-gold/20 text-luxury-gold hover:bg-luxury-gold/10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Catalogs
            </Button>
          </div>
          <AuctionList
            auctions={auctions.filter(a => a.catalog === selectedCatalog)}
            loading={loading}
            token={token}
            fetchAuctions={fetchAuctions}
          />
        </div>
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
                placeholder="e.g., newcatalog"
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
              <Label className="text-right">Auction Type (Select One)</Label>
              <div className="col-span-3 space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="liveAuction"
                    checked={auctionType === "LIVE"}
                    onChange={() => setAuctionType("LIVE")}
                  />
                  <Label htmlFor="liveAuction">Live Auction</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="timedAuction"
                    checked={auctionType === "TIMED"}
                    onChange={() => setAuctionType("TIMED")}
                  />
                  <Label htmlFor="timedAuction">Timed Auction</Label>
                </div>
                {!auctionType && (
                  <p className="text-red-500 text-sm">Please select an auction type.</p>
                )}
              </div>
            </div>

            {auctionType === "TIMED" && (
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
            )}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bulkUpload" className="text-right">
                Upload Excel/CSV File
              </Label>
              <div className="col-span-3 flex flex-col space-y-2">
                <Input
                  id="bulkUpload"
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                  className="bg-white border-luxury-gold/20"
                  disabled={!catalogName || !startDate || !auctionType}
                />
                <Button
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = "/sample_auctions.xlsx";
                    link.download = "sample_auctions.xlsx";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Download Sample Excel File
                </Button>
                <p className="text-sm text-gray-500">
                  Note: Please ensure your Excel file column names match with this sample file.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setOpenBulkUploadDialog(false);
                setCatalogName("");
                setStartDate(moment().tz("Asia/Kolkata").format("DD-MM-YYYY"));
                setEndDate(moment().tz("Asia/Kolkata").add(5, "days").format("DD-MM-YYYY"));
                setAuctionType("");
                setBulkUploadFile(null);
                setProductsToUpload([]);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkCreate}
              disabled={loading || productsToUpload.length === 0 || !catalogName || !startDate || !auctionType}
            >
              {loading ? "Uploading..." : "Add Products"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Delete Catalog</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Select a catalog to delete:
            <select
              value={catalogToDelete}
              onChange={(e) => setCatalogToDelete(e.target.value)}
              className="w-full mt-2 p-2 border border-gray-300 rounded"
              disabled={catalogs.length === 0}
            >
              <option value="">Select a catalog</option>
              {catalogs.map((catalog) => (
                <option key={catalog} value={catalog}>
                  {catalog}
                </option>
              ))}
            </select>
            {catalogs.length === 0 && <p className="text-red-500 text-sm mt-2">No catalogs available.</p>}
          </DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCatalog}
              disabled={!catalogToDelete || loading}
            >
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}