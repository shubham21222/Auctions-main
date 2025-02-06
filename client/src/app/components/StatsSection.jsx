import React from "react";
import { BarChart, Globe, DollarSign, Gavel } from "lucide-react";

const stats = [
  {
    icon: <BarChart size={64} className="text-white" />, // Lucide icon for "Active Bidders"
    value: "14,000+",
    label: "Active Bidders",
  },
  {
    icon: <Globe size={64} className="text-white" />, // Lucide icon for "Countries"
    value: "18+",
    label: "Countries",
  },
  {
    icon: <DollarSign size={64} className="text-white" />, // Lucide icon for "In Bids"
    value: "$1b",
    label: "In Bids",
  },
  {
    icon: <Gavel size={64} className="text-white" />, // Lucide icon for "Auctions"
    value: "600+",
    label: "Auctions",
  },
];
  
const StatsSection = () => {
  return (
    <section className="statsSection2 bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20 mb-12 mt-12 container mx-auto max-w-screen-2xl px-4">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
        {stats.map((stat, index) => (
          <div key={index} className="flex flex-col items-center">
            {/* Icon */}
            <div className="mb-4">{stat.icon}</div>

            {/* Value */}
            <h3 className="text-3xl font-semibold">{stat.value}</h3>

            {/* Label */}
            <p className="text-xl mt-2">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StatsSection;