"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { CalendarIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";

export function AuctionFilters({ onFilterChange }) {
  const [date, setDate] = useState(null);
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [auctionTypes, setAuctionTypes] = useState({
    "Live Auction": false,
    "Timed Auction": false,
    "Buy Now": false,
  });
  const [categories, setCategories] = useState({
    Jewelry: false,
    Watches: false,
    Handbags: false,
    Art: false,
    Wine: false,
  });
  const [status, setStatus] = useState({
    Active: true,  // Default to Active
    Ended: false,
  });
  const [searchQuery, setSearchQuery] = useState("");

  const categoryMap = {
    Jewelry: "67a86485dc96bf86883785cc",
    Art: "67a8644cdc96bf86883785c8",
    Handbags: "67a8643adc96bf86883785c4",
    Watches: "67a86485dc96bf86883785cc",
    Wine: "67aacb6f376f82a7736b3616",
  };

  const applyFilters = () => {
    const selectedCategories = Object.entries(categories)
      .filter(([_, checked]) => checked)
      .map(([category]) => categoryMap[category])
      .join(",");
    const selectedAuctionType = Object.entries(auctionTypes)
      .filter(([_, checked]) => checked)
      .map(([type]) => (type === "Timed Auction" ? "TIMED" : type))
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
      status: selectedStatus || "ACTIVE", // Default to ACTIVE if nothing selected
      date: date,
    });
  };

  useEffect(() => {
    applyFilters();
  }, [date, priceRange, auctionTypes, categories, status, searchQuery]);

  const handleStatusChange = (statusOption) => (checked) => {
    if (checked) {
      // If checking one option, uncheck the other
      setStatus({
        Active: statusOption === "Active",
        Ended: statusOption === "Ended",
      });
    } else {
      // If unchecking the only checked option, keep Active checked by default
      setStatus({
        Active: statusOption === "Ended", // If Ended was unchecked, set Active to true
        Ended: statusOption === "Active", // If Active was unchecked, set Ended to true
      });
    }
  };

  const handleResetFilters = () => {
    setDate(null);
    setPriceRange([0, 100000]);
    setAuctionTypes({ "Live Auction": false, "Timed Auction": false, "Buy Now": false });
    setCategories({ Jewelry: false, Watches: false, Handbags: false, Art: false, Wine: false });
    setStatus({ Active: true, Ended: false }); // Reset to Active only
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
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start border-luxury-gold/20 font-normal hover:border-luxury-gold/40 hover:bg-luxury-gold/5"
            >
              <CalendarIcon className="mr-2 h-4 w-4 text-luxury-gold" />
              {date ? format(date, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => setDate(newDate)}
              initialFocus
              className="rounded-md border bg-white border-luxury-gold/20"
            />
          </PopoverContent>
        </Popover>
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
          {["Live Auction", "Timed Auction", "Buy Now"].map((format) => (
            <div key={format} className="flex items-center space-x-2">
              <Checkbox
                id={format.toLowerCase().replace(" ", "-")}
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
          {["Jewelry", "Watches", "Handbags", "Art", "Wine"].map((category) => (
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
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-luxury-charcoal">Status</h3>
        <div className="space-y-3">
          {["Active", "Ended"].map((statusOption) => (
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