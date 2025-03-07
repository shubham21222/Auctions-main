"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useState, useEffect } from "react";

export function AuctionFilters({ onFilterChange }) {
  const [date, setDate] = useState(""); // Store as YYYY-MM-DD string
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [auctionTypes, setAuctionTypes] = useState({
    "Live Auction": false,
    "Timed Auction": false,
  });
  const [categories, setCategories] = useState({}); // Checkbox states
  const [categoryData, setCategoryData] = useState([]); // Raw API data
  const [status, setStatus] = useState({
    Active: true, // Default to Active
    Ended: false,
  });
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch categories on mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch("https://bid.nyelizabeth.com/v1/api/category/all");
        if (!response.ok) throw new Error("Failed to fetch categories");
        const data = await response.json();
        setCategoryData(data.items); // Store raw data
        const categoryObj = data.items.reduce((acc, category) => {
          acc[category.name] = false; // Initialize all as unchecked
          return acc;
        }, {});
        setCategories(categoryObj);
      } catch (error) {
        console.error("Error fetching categories:", error.message);
      }
    }
    fetchCategories();
  }, []);

  const categoryMap = categoryData.reduce((acc, category) => {
    acc[category.name] = category._id;
    return acc;
  }, {});

  const auctionTypeMap = {
    "Live Auction": "LIVE",
    "Timed Auction": "TIMED",
  };

  const applyFilters = () => {
    const selectedCategories = Object.entries(categories)
      .filter(([_, checked]) => checked)
      .map(([category]) => categoryMap[category])
      .join(",");
    const selectedAuctionType = Object.entries(auctionTypes)
      .filter(([_, checked]) => checked)
      .map(([type]) => auctionTypeMap[type])
      .join(",");
    const selectedStatus = Object.entries(status)
      .filter(([_, checked]) => checked)
      .map(([status]) => status.toUpperCase())
      .join(",");

    onFilterChange({
      category: selectedCategories || "",
      priceRange: priceRange,
      searchQuery: searchQuery.trim(),
      auctionType: selectedAuctionType || "",
      status: selectedStatus || "ACTIVE",
      date: date ? new Date(date) : null,
    });
  };

  useEffect(() => {
    applyFilters();
  }, [date, priceRange, auctionTypes, categories, status, searchQuery]);

  const handleStatusChange = (statusOption) => (checked) => {
    if (checked) {
      setStatus({
        Active: statusOption === "Active",
        Ended: statusOption === "Ended",
      });
    } else {
      setStatus({
        Active: statusOption === "Ended",
        Ended: statusOption === "Active",
      });
    }
  };

  const handleResetFilters = () => {
    setDate("");
    setPriceRange([0, 100000]);
    setAuctionTypes({ "Live Auction": false, "Timed Auction": false });
    setCategories((prev) =>
      Object.keys(prev).reduce((acc, key) => {
        acc[key] = false;
        return acc;
      }, {})
    );
    setStatus({ Active: true, Ended: false });
    setSearchQuery("");
    onFilterChange({
      category: "",
      priceRange: [0, 100000],
      searchQuery: "",
      auctionType: "",
      status: "ACTIVE",
      date: null,
    });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-luxury-charcoal">Search</h3>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by title or lot number"
          className="w-full border border-luxury-gold/20 p-2 rounded-md"
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-luxury-charcoal">Auction Date</h3>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full border border-luxury-gold/20 p-2 rounded-md text-luxury-charcoal focus:outline-none focus:border-luxury-gold/40 hover:border-luxury-gold/40"
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-luxury-charcoal">Price Range</h3>
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            max={100000}
            step={1000}
            className="[&_[role=slider]]:border-luxury-gold bg-luxury-gold [&_[role=slider]]:bg-luxury-gold"
          />
          <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
            <span>${priceRange[0].toLocaleString()}</span>
            <span>${priceRange[1].toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-luxury-charcoal">Buying Format</h3>
        <div className="space-y-3">
          {Object.keys(auctionTypes).map((format) => (
            <div key={format} className="flex items-center space-x-2">
              <Checkbox
                id={format.replace(" ", "-")}
                checked={auctionTypes[format]}
                onCheckedChange={(checked) =>
                  setAuctionTypes((prev) => ({ ...prev, [format]: checked }))
                }
              />
              <Label htmlFor={format.toLowerCase().replace(" ", "-")}>{format}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-luxury-charcoal">Categories</h3>
        <div className="space-y-3">
          {Object.keys(categories).length > 0 ? (
            Object.keys(categories).map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={category.toLowerCase()}
                  checked={categories[category]}
                  onCheckedChange={(checked) =>
                    setCategories((prev) => ({ ...prev, [category]: checked }))
                  }
                />
                <Label htmlFor={category.toLowerCase()}>{category}</Label>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Loading categories...</p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-luxury-charcoal">Status</h3>
        <div className="space-y-3">
          {Object.keys(status).map((statusOption) => (
            <div key={statusOption} className="flex items-center space-x-2">
              <Checkbox
                id={statusOption.toLowerCase()}
                checked={status[statusOption]}
                onCheckedChange={handleStatusChange(statusOption)}
              />
              <Label htmlFor={statusOption.toLowerCase()}>{statusOption}</Label>
            </div>
          ))}
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full border-luxury-gold/20 text-luxury-gold hover:border-luxury-gold/40 hover:bg-luxury-gold/5"
        onClick={handleResetFilters}
      >
        Reset Filters
      </Button>
    </div>
  );
}