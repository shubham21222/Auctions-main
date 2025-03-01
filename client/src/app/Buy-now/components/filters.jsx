'use client';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Search, Filter } from "lucide-react";
import { useState } from "react";

export function Filters({
  categories,
  selectedCategories,
  setSelectedCategories,
  selectedStatus,
  setSelectedStatus,
  selectedPriceRange,
  setSelectedPriceRange,
  selectedSortField,
  setSelectedSortField,
  selectedSortOrder,
  setSelectedSortOrder,
  searchQuery,
  setSearchQuery,
  onReset, // Add a callback to notify Home of reset
}) {
  const [isOpen, setIsOpen] = useState({
    search: false,
    categories: false,
    status: false,
    priceRange: false,
  });

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const toggleSection = (section) => {
    setIsOpen((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleReset = () => {
    setSelectedCategories([]);
    setSelectedStatus("");
    setSelectedPriceRange("");
    setSelectedSortField("created_at");
    setSelectedSortOrder("asc");
    setSearchQuery("");
    if (onReset) onReset(); // Notify parent component of reset
  };

  return (
    <div className="relative">
      {/* Mobile Dropdown Toggle */}
      <div className="lg:hidden">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
          className="flex items-center space-x-2"
        >
          <Filter className="w-4 h-4" />
          <span>Filters</span>
        </Button>
      </div>

      {/* Mobile Filters Dropdown */}
      {mobileFiltersOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute z-10 top-full left-0 w-full mt-2 p-4 bg-white rounded-2xl shadow-lg lg:hidden"
        >
          <div className="space-y-4">
            {/* Search Section */}
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type="search"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-100 focus:border-blue-600 transition-colors duration-300"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
            </div>

            {/* Categories Section */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-blue-700">Categories</h3>
              <div className="space-y-3">
                {categories.map((category) => (
                  <div key={category._id} className="flex items-center space-x-3">
                    <Checkbox
                      id={category._id}
                      checked={selectedCategories.includes(category._id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedCategories((prev) => [...prev, category._id]);
                        } else {
                          setSelectedCategories((prev) =>
                            prev.filter((cat) => cat !== category._id)
                          );
                        }
                      }}
                      className="data-[state=checked]:bg-blue-600"
                    />
                    <Label htmlFor={category._id} className="cursor-pointer">
                      {category.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-lg text-blue-700">Status</h3>
              <RadioGroup
                value={selectedStatus}
                onValueChange={setSelectedStatus}
                className="space-y-3"
              >
                {["Sold", "Not Sold"].map((status) => (
                  <div key={status} className="flex items-center space-x-3">
                    <RadioGroupItem
                      value={status}
                      id={status.replace(" ", "-").toLowerCase()}
                      className="text-blue-600"
                    />
                    <Label htmlFor={status.replace(" ", "-").toLowerCase()} className="cursor-pointer">
                      {status}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Price Range Section */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-blue-700">Price Range</h3>
              <RadioGroup
                value={selectedPriceRange}
                onValueChange={setSelectedPriceRange}
                className="space-y-3"
              >
                {["High Price", "Low Price"].map((price) => (
                  <div key={price} className="flex items-center space-x-3">
                    <RadioGroupItem
                      value={price.toLowerCase()}
                      id={price.toLowerCase().replace(" ", "-")}
                      className="text-blue-600"
                    />
                    <Label htmlFor={price.toLowerCase().replace(" ", "-")} className="cursor-pointer">
                      {price}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Reset Filters Button */}
            <Button
              variant="outline"
              onClick={handleReset}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-6 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Reset Filters
            </Button>
          </div>
        </motion.div>
      )}

      {/* Desktop Filters */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full max-w-xs space-y-8 p-6 bg-white rounded-2xl shadow-lg hidden lg:block"
      >
        {/* Search Section */}
        <div className="space-y-2">
          <div className="relative">
            <Input
              type="search"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-100 focus:border-blue-600 transition-colors duration-300"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
        </div>

        {/* Categories Section */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg text-blue-700">Categories</h3>
          <div className="space-y-3">
            {categories.map((category) => (
              <div key={category._id} className="flex items-center space-x-3">
                <Checkbox
                  id={category._id}
                  checked={selectedCategories.includes(category._id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedCategories((prev) => [...prev, category._id]);
                    } else {
                      setSelectedCategories((prev) =>
                        prev.filter((cat) => cat !== category._id)
                      );
                    }
                  }}
                  className="data-[state=checked]:bg-blue-600"
                />
                <Label htmlFor={category._id} className="cursor-pointer">
                  {category.name}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Status Section */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg text-blue-700">Status</h3>
          <RadioGroup
            value={selectedStatus}
            onValueChange={setSelectedStatus}
            className="space-y-3"
          >
            {["Sold", "Not Sold"].map((status) => (
              <div key={status} className="flex items-center space-x-3">
                <RadioGroupItem
                  value={status}
                  id={status.replace(" ", "-").toLowerCase()}
                  className="text-blue-600"
                />
                <Label htmlFor={status.replace(" ", "-").toLowerCase()} className="cursor-pointer">
                  {status}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Price Range Section */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg text-blue-700">Price Range</h3>
          <RadioGroup
            value={selectedPriceRange}
            onValueChange={setSelectedPriceRange}
            className="space-y-3"
          >
            {["High Price", "Low Price"].map((price) => (
              <div key={price} className="flex items-center space-x-3">
                <RadioGroupItem
                  value={price.toLowerCase()}
                  id={price.toLowerCase().replace(" ", "-")}
                  className="text-blue-600"
                />
                <Label htmlFor={price.toLowerCase().replace(" ", "-")} className="cursor-pointer">
                  {price}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Reset Filters Button */}
        <Button
          variant="outline"
          onClick={handleReset}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-6 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          Reset Filters
        </Button>
      </motion.div>
    </div>
  );
}