"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import img2 from "../../../public/1-3.webp"
import img3 from "../../../public/1-4.webp"
import img4 from "../../../public/1-5.webp"


const partners = [
  { name: "LOT TISSIMO", logo: img2 },
  { name: "the saleroom", logo: img3 },
  { name: "liveauctioneers", logo: img4 },
  // { name: "IDSQUAR", logo: "https://beta.nyelizabeth.com/wp-content/uploads/2024/03/Logo_Updated.png" },
];

const PartnersSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === partners.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000); // Change slide every 3 seconds

    return () => clearInterval(interval); // Cleanup the interval
  }, []);

  return (
    <section className="py-16">
      <div className=" container mx-auto px-4">
        {/* Section Title */}
        
        {/* Carousel */}
        <div className="statsSection2 bg-gradient-to-r from-blue-800 to-blue-500 rounded-lg p-6 overflow-hidden">
        <div className="text-start mb-8">
          <h2 className="text-3xl font-bold text-white">Our Partners</h2>
          <div className="w-16 h-1 bg-yellow-500  mt-2"></div>
        </div>
          <div className="flex transition-transform duration-500" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
            {partners.map((partner, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-full flex items-center justify-center space-x-8"
                style={{ minWidth: "100%" }}
              >
                <Image
                  src={partner.logo}
                  alt={partner.name}
                  className="object-contain"
                  height={40}
                  width={146}
                  style={{ width: '146px', height: '40px' }}

                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
