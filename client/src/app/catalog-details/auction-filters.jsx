"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import config from "@/app/config_BASE_URL";
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

export function AuctionFilters({ onFilterChange }) {
  const [date, setDate] = useState("");
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(500000);
  const [auctionTypes, setAuctionTypes] = useState({
    "Live Auction": false,
    "Timed Auction": false,
  });
  const [catalogs, setCatalogs] = useState({}); // Checkbox states for catalogs
  const [catalogData, setCatalogData] = useState([]); // Raw catalog data
  const [status, setStatus] = useState({
    Active: true,
    Ended: false,
  });
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch catalogs on mount
  useEffect(() => {
    async function fetchCatalogs() {
      try {
        const response = await fetch(`${config.baseURL}/v1/api/auction/bulk?page=1&minPrice=${minPrice}&maxPrice=${maxPrice}`);
        if (!response.ok) throw new Error("Failed to fetch catalogs");
        const data = await response.json();
        const catalogNames = data.items?.catalogs?.map((catalog) => catalog.catalogName) || [];
        setCatalogData(catalogNames);
        const catalogObj = catalogNames.reduce((acc, catalog) => {
          acc[catalog] = false;
          return acc;
        }, {});
        setCatalogs(catalogObj);
      } catch (error) {
        console.error("Error fetching catalogs:", error.message);
      }
    }
    fetchCatalogs();
  }, [minPrice, maxPrice]);

  // Add effect to sync price inputs with slider
  useEffect(() => {
    setPriceRange([minPrice, maxPrice]);
  }, [minPrice, maxPrice]);

  // Add handler for price input changes
  const handlePriceInputChange = (type, value) => {
    const numValue = Number(value);
    if (isNaN(numValue)) return;

    if (type === 'min') {
      if (numValue <= maxPrice) {
        setMinPrice(numValue);
        onFilterChange({
          page: 1,
          minPrice: numValue,
          maxPrice: maxPrice,
          category: Object.entries(catalogs).filter(([_, checked]) => checked).map(([catalog]) => catalog).join(",") || "",
          searchQuery: searchQuery.trim(),
          auctionType: Object.entries(auctionTypes).filter(([_, checked]) => checked).map(([type]) => auctionTypeMap[type]).join(",") || "",
          status: Object.entries(status).filter(([_, checked]) => checked).map(([status]) => status.toUpperCase()).join(",") || "ACTIVE",
          date: date ? new Date(date).toISOString().split('T')[0] : null,
        });
      }
    } else {
      if (numValue >= minPrice) {
        setMaxPrice(numValue);
        onFilterChange({
          page: 1,
          minPrice: minPrice,
          maxPrice: numValue,
          category: Object.entries(catalogs).filter(([_, checked]) => checked).map(([catalog]) => catalog).join(",") || "",
          searchQuery: searchQuery.trim(),
          auctionType: Object.entries(auctionTypes).filter(([_, checked]) => checked).map(([type]) => auctionTypeMap[type]).join(",") || "",
          status: Object.entries(status).filter(([_, checked]) => checked).map(([status]) => status.toUpperCase()).join(",") || "ACTIVE",
          date: date ? new Date(date).toISOString().split('T')[0] : null,
        });
      }
    }
  };

  const handleSliderChange = (value) => {
    setMinPrice(value[0]);
    setMaxPrice(value[1]);
    onFilterChange({
      page: 1,
      minPrice: value[0],
      maxPrice: value[1],
      category: Object.entries(catalogs).filter(([_, checked]) => checked).map(([catalog]) => catalog).join(",") || "",
      searchQuery: searchQuery.trim(),
      auctionType: Object.entries(auctionTypes).filter(([_, checked]) => checked).map(([type]) => auctionTypeMap[type]).join(",") || "",
      status: Object.entries(status).filter(([_, checked]) => checked).map(([status]) => status.toUpperCase()).join(",") || "ACTIVE",
      date: date ? new Date(date).toISOString().split('T')[0] : null,
    });
  };

  const auctionTypeMap = {
    "Live Auction": "LIVE",
    "Timed Auction": "TIMED",
  };

  const applyFilters = () => {
    onFilterChange({
      page: 1,
      minPrice: minPrice,
      maxPrice: maxPrice,
      category: Object.entries(catalogs).filter(([_, checked]) => checked).map(([catalog]) => catalog).join(",") || "",
      searchQuery: searchQuery.trim(),
      auctionType: Object.entries(auctionTypes).filter(([_, checked]) => checked).map(([type]) => auctionTypeMap[type]).join(",") || "",
      status: Object.entries(status).filter(([_, checked]) => checked).map(([status]) => status.toUpperCase()).join(",") || "ACTIVE",
      date: date ? new Date(date).toISOString().split('T')[0] : null,
    });
  };

  useEffect(() => {
    applyFilters();
  }, [date, priceRange, auctionTypes, catalogs, status, searchQuery]);

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
    setMinPrice(0);
    setMaxPrice(5000);
    setPriceRange([0, 5000]);
    setAuctionTypes({ "Live Auction": false, "Timed Auction": false });
    setCatalogs((prev) =>
      Object.keys(prev).reduce((acc, key) => {
        acc[key] = false;
        return acc;
      }, {})
    );
    setStatus({ Active: true, Ended: false });
    setSearchQuery("");
    onFilterChange({
      page: 1,
      minPrice: 0,
      maxPrice: 5000,
      category: "",
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
          className="w-full border border-luxury-gold/20 p-2.5 rounded-lg text-luxury-charcoal focus:outline-none focus:border-luxury-gold/40 hover:border-luxury-gold/40 transition-all bg-white/50 backdrop-blur-sm"
        />
      </div>

      {/* <div className="space-y-4">
        <h3 className="text-sm font-medium text-luxury-charcoal">Auction Date</h3>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full border border-luxury-gold/20 p-2.5 rounded-lg text-luxury-charcoal focus:outline-none focus:border-luxury-gold/40 hover:border-luxury-gold/40 transition-all bg-white/50 backdrop-blur-sm"
        />
      </div> */}

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-luxury-charcoal">Price Range</h3>
        <div className="px-2">
          <div className="relative">
            <Slider
              range
              min={0}
              max={5000}
              step={100}
              value={[minPrice, maxPrice]}
              onChange={handleSliderChange}
              trackStyle={[{ backgroundColor: '#B8860B' }]}
              handleStyle={[
                { borderColor: '#B8860B', backgroundColor: '#B8860B' },
                { borderColor: '#B8860B', backgroundColor: '#B8860B' }
              ]}
              railStyle={{ backgroundColor: '#B8860B20' }}
            />
            <div className="flex justify-between mt-2">
              <span className="text-xs text-muted-foreground">${minPrice}</span>
              <span className="text-xs text-muted-foreground">${maxPrice}</span>
            </div>
          </div>
          <div className="mt-6 flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="min-price" className="text-sm text-muted-foreground">Min Price</Label>
              <input
                type="number"
                id="min-price"
                value={minPrice}
                onChange={(e) => handlePriceInputChange('min', e.target.value)}
                className="w-full border border-luxury-gold/20 p-2 rounded-lg text-luxury-charcoal focus:outline-none focus:border-luxury-gold/40 hover:border-luxury-gold/40 transition-all bg-white/50 backdrop-blur-sm"
                min={0}
                max={maxPrice}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="max-price" className="text-sm text-muted-foreground">Max Price</Label>
              <input
                type="number"
                id="max-price"
                value={maxPrice}
                onChange={(e) => handlePriceInputChange('max', e.target.value)}
                className="w-full border border-luxury-gold/20 p-2 rounded-lg text-luxury-charcoal focus:outline-none focus:border-luxury-gold/40 hover:border-luxury-gold/40 transition-all bg-white/50 backdrop-blur-sm"
                min={minPrice}
                max={5000}
              />
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Note: Price filter shows items between the selected minimum and maximum prices
          </p>
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
                className="border-luxury-gold/20 data-[state=checked]:bg-luxury-gold"
              />
              <Label htmlFor={format.toLowerCase().replace(" ", "-")} className="text-luxury-charcoal">
                {format}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* <div className="space-y-4">
        <h3 className="text-sm font-medium text-luxury-charcoal">Catalogs</h3>
        <div className="space-y-3">
          {Object.keys(catalogs).length > 0 ? (
            Object.keys(catalogs).map((catalog) => (
              <div key={catalog} className="flex items-center space-x-2">
                <Checkbox
                  id={catalog.toLowerCase()}
                  checked={catalogs[catalog]}
                  onCheckedChange={(checked) =>
                    setCatalogs((prev) => ({ ...prev, [catalog]: checked }))
                  }
                  className="border-luxury-gold/20 data-[state=checked]:bg-luxury-gold"
                />
                <Label htmlFor={catalog.toLowerCase()} className="text-luxury-charcoal">
                  {catalog}
                </Label>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Loading catalogs...</p>
          )}
        </div>
      </div> */}

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-luxury-charcoal">Status</h3>
        <div className="space-y-3">
          {Object.keys(status).map((statusOption) => (
            <div key={statusOption} className="flex items-center space-x-2">
              <Checkbox
                id={statusOption.toLowerCase()}
                checked={status[statusOption]}
                onCheckedChange={handleStatusChange(statusOption)}
                className="border-luxury-gold/20 data-[state=checked]:bg-luxury-gold"
              />
              <Label htmlFor={statusOption.toLowerCase()} className="text-luxury-charcoal">
                {statusOption}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full border-luxury-gold/20 text-luxury-gold hover:border-luxury-gold/40 hover:bg-luxury-gold/5 transition-all"
        onClick={handleResetFilters}
      >
        Reset Filters
      </Button>
    </div>
  );
}