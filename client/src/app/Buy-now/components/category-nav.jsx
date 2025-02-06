'use client'
import Image from "next/image";
import { motion } from "framer-motion";

function CategoryItem({ icon, label, isActive }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.95 }}
      className={`flex flex-col items-center gap-3 p-6 cursor-pointer
        bg-white rounded-xl shadow-lg
        hover:shadow-2xl hover:shadow-primary/20
        transition-all duration-500 ease-out
        group relative overflow-hidden
        ${isActive ? "bg-primary/5 ring-2 ring-primary" : ""}
      `}
    >
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <Image
          src={icon || "/placeholder.svg"}
          alt={label}
          fill
          className="object-contain transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <span className="font-semibold text-base bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-luxury-gold">
        {label}
      </span>
      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </motion.div>
  );
}

export function CategoryNav() {
  return (
    <div className="w-full overflow-x-auto scrollbar-hide">
      <div className="flex justify-between min-w-max gap-6 p-6">
        <CategoryItem
          icon="https://beta.nyelizabeth.com/wp-content/uploads/2025/01/Rectangle-79-1.webp"
          label="AUTOMOTIVES"
        />
        <CategoryItem
          icon="https://beta.nyelizabeth.com/wp-content/uploads/2024/04/fashion-sell-page-300x300.jpeg"
          label="FASHION"
        />
        <CategoryItem
          icon="https://beta.nyelizabeth.com/wp-content/uploads/2025/01/Rectangle-76.webp"
          label="FINE ART"
        />
        <CategoryItem
          icon="https://beta.nyelizabeth.com/wp-content/uploads/2024/04/sell-page-jewelry-image-300x300.jpeg"
          label="JEWELRY"
        />
        <CategoryItem
          icon="https://beta.nyelizabeth.com/wp-content/uploads/2024/03/Rectangle-80.webp"
          label="MODERN ART"
        />
      </div>
    </div>
  );
}
