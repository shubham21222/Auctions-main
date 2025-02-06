'use client'
import Image from "next/image";
import { motion } from "framer-motion";

export default function AboutUs() {
  return (
    <section className="py-12 md:py-20 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      <div className="container mx-auto px-4">
        {/* First Row: Image Left, Content Right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center mb-16 md:mb-20">
          {/* Left Column: Image */}
          <motion.div
            className="relative w-full h-[300px] md:h-[500px] rounded-lg overflow-hidden shadow-2xl"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Image
              src="https://beta.nyelizabeth.com/wp-content/uploads/2025/01/product612dfd189b8b384cb5fbcf7319435a69.webp"
              alt="About Us Image 1"
              fill
              className="object-cover"
              quality={100}
            />
          </motion.div>

          {/* Right Column: Content */}
          <motion.div
            className="space-y-6 md:space-y-8"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900">
              About Us
            </h2>
            <p className="text-base md:text-lg text-gray-600">
              At <span className="font-semibold text-yellow-500">NY Elizabeth</span>, we are passionate about connecting collectors, investors, and enthusiasts with rare and valuable items. With decades of experience in the auction industry, we pride ourselves on delivering exceptional service and unparalleled expertise.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xl md:text-2xl">✓</span>
                </div>
                <p className="text-base md:text-lg text-gray-600">
                  Trusted by thousands of clients worldwide.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xl md:text-2xl">✓</span>
                </div>
                <p className="text-base md:text-lg text-gray-600">
                  Expertise in antiques, and luxury collectibles.
                </p>
              </div>
            </div>
            <button className="mt-4 md:mt-6 px-6 py-2 md:px-8 md:py-3 bg-yellow-500 text-white font-semibold rounded-full hover:bg-yellow-600 transition-colors duration-300 shadow-lg hover:shadow-xl text-sm md:text-base">
              Learn More
            </button>
          </motion.div>
        </div>

        {/* Second Row: Content Left, Image Right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left Column: Content */}
          <motion.div
            className="space-y-6 md:space-y-8 order-2 lg:order-1"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900">
              Our Mission
            </h2>
            <p className="text-base md:text-lg text-gray-600">
              Our mission is to make auctions accessible, transparent, and enjoyable for everyone. Whether you're a seasoned collector or a first-time bidder, we're here to guide you every step of the way.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xl md:text-2xl">✓</span>
                </div>
                <p className="text-base md:text-lg text-gray-600">
                  Secure and seamless bidding experience.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xl md:text-2xl">✓</span>
                </div>
                <p className="text-base md:text-lg text-gray-600">
                  Professional valuation, authentication services.
                </p>
              </div>
            </div>
            <button className="mt-4 md:mt-6 px-6 py-2 md:px-8 md:py-3 bg-yellow-500 text-white font-semibold rounded-full hover:bg-yellow-600 transition-colors duration-300 shadow-lg hover:shadow-xl text-sm md:text-base">
              Learn More
            </button>
          </motion.div>

          {/* Right Column: Image */}
          <motion.div
            className="relative w-full h-[300px] md:h-[500px] rounded-lg overflow-hidden shadow-2xl order-1 lg:order-2"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Image
              src="https://beta.nyelizabeth.com/wp-content/uploads/2025/01/c1.webp"
              alt="About Us Image 2"
              fill
              className="object-cover"
              quality={100}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}