"use client"

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

export function AuctionFilters() {
  const [date, setDate] = useState(null);
  const [priceRange, setPriceRange] = useState([0, 100000]);

  return (
    <div className="space-y-8 ">
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
              onSelect={setDate}
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
              <Checkbox id={format.toLowerCase().replace(" ", "-")} />
              <Label htmlFor={format.toLowerCase().replace(" ", "-")}>{format}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4 ">
        <h3 className="text-sm font-medium text-luxury-charcoal">Categories</h3>
        <div className="flex flex-wrap gap-2">
          {["Jewelry", "Watches", "Handbags", "Art", "Wine"].map((category) => (
            <Button
              key={category}
              variant="outline"
              className="border-luxury-gold/20 hover:border-luxury-gold/40 hover:bg-luxury-gold/5"
              size="sm"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full border-luxury-gold/20 text-luxury-gold hover:border-luxury-gold/40 hover:bg-luxury-gold/5"
      >
        Reset Filters
      </Button>
    </div>
  );
}