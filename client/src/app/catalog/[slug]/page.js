"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Clock } from "lucide-react";
import { useParams } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

const products = [
  {
    id: 1,
    name: "Van Cleef & Arpels Sapphire diamond Necklace 750(WG)",
    price: { min: 204147, max: 236403 },
    image:
      "https://beta.nyelizabeth.com/wp-content/uploads/2025/01/product612dfd189b8b384cb5fbcf7319435a69.webp",
  },
  {
    id: 2,
    name: "Tiffany Jean Schrambergsee Apollo diamond Brooch",
    price: { min: 42320, max: 56070 },
    image:
      "https://beta.nyelizabeth.com/wp-content/uploads/2025/01/productf0cc116dd0ca1729dcaf90f1aee103e8.webp",
  },
  {
    id: 3,
    name: "Cartier Love Pavé diamond Bracelet 750(YG)",
    price: { min: 42062, max: 56621 },
    image:
      "https://beta.nyelizabeth.com/wp-content/uploads/2025/01/c1-300x300.webp",
  },
];

const bidIncrements = [
  { price: "$0", increment: "$1" },
  { price: "$30", increment: "$2" },
  { price: "$100", increment: "$5" },
  { price: "$500", increment: "$10" },
  { price: "$1,000", increment: "$25" },
  { price: "$2,000", increment: "$50" },
  { price: "$5,000", increment: "$100" },
  { price: "$10,000", increment: "$250" },
  { price: "$50,000", increment: "$500" },
  { price: "$100,000", increment: "$1,000" },
];

export default function CatalogPage() {
  const { slug } = useParams();
  // Extract ID and formatted title from slug
  const match = slug.match(/^(\d+)-(.+)$/); // Match "2562-fine-jewelry-collection"
  const auctionId = match ? match[1] : ""; // Extract ID
  const auctionTitle = match
    ? match[2].replace(/-/g, " ")
    : ""; // Convert slug back to title

  return (
    <>
      <Header />
      <div className="min-h-screen mt-[120px] mb-[60px] bg-gray-50">
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 py-4 text-sm text-gray-500">
          <nav className="flex items-center gap-2">
            <Link href="/" className="hover:text-blue-600">
              Home
            </Link>
            <span>/</span>
            <Link href="/catalog" className="hover:text-blue-600">
              Catalog
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">
              {auctionId} | {auctionTitle}
            </span>
          </nav>
        </div>

        {/* Featured Images */}
        <div className="container mx-auto px-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {products.map((product) => (
              <div key={product.id} className="relative aspect-square">
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-cover rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Auction Header */}
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Ended : February 1st, 2025</span>
            </div>
            <Link
              href="#"
              className="text-blue-600 hover:underline transition-colors"
            >
              Auction Details
            </Link>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            {auctionTitle}
          </h1>

          {/* Brand Section */}
          <div className="flex items-center gap-4 mb-8">
            <Image
              src="https://beta.nyelizabeth.com/wp-content/uploads/2024/05/Rectangle.svg"
              alt="NY ELIZABETH"
              width={80}
              height={80}
              className="rounded-full shadow-md"
            />
            <h2 className="text-2xl font-semibold text-gray-900">
              NY ELIZABETH
            </h2>
          </div>

          {/* Description */}
          <p className="text-gray-600 mb-8 max-w-3xl">
            Join us for the Fine Jewelry Collection, a spectacular event
            showcasing an extraordinary selection of luxury pieces from iconic
            designer brands including Cartier, Tiffany & Co., Van Cleef &
            Arpels, and more. Hosted by NY Elizabeth on Sunday, February 2nd,
            2025, this exclusive auction offers a dazzling array of timeless
            treasures and exquisite designs. From classic elegance to modern
            sophistication, each piece in this curated collection embodies the
            pinnacle of craftsmanship and style. Don't miss your chance to
            acquire one-of-a-kind jewelry and elevate your collection with
            these coveted masterpieces.
          </p>

          {/* Search and Sort */}
          <div className="flex gap-4 mb-8">
            <div className="relative w-full max-w-sm">
              <input
                type="search"
                placeholder="Search..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-all"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <select className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-all">
              <option>Sort</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Newest First</option>
            </select>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {products.map((product) => (
              <div
                key={product.id}
                className="group relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="relative aspect-square">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <button className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg">
                    <Heart className="w-4 h-4 text-red-500" />
                  </button>
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="font-medium text-gray-900 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Est. ${product.price.min.toLocaleString()} - $
                    {product.price.max.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Auction Details */}
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Auction Details
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Bid Increments
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="font-medium text-gray-700">Price</div>
                    <div className="font-medium text-gray-700">
                      Bid Increment
                    </div>
                    {bidIncrements.map((bid, index) => (
                      <>
                        <div
                          key={`price-${index}`}
                          className="text-gray-600"
                        >
                          {bid.price}
                        </div>
                        <div
                          key={`increment-${index}`}
                          className="text-gray-600"
                        >
                          {bid.increment}
                        </div>
                      </>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Preview</h3>
                <p className="text-gray-600">
                  Contact us to schedule a preview of the items.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-4">
                  Buyers Premium
                </h3>
                <p className="text-gray-600">25%</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-4">
                  Terms & Conditions
                </h3>
                <p className="text-gray-600">
                  TERMS AND CONDITIONS This website is operated by NY Elizabeth
                  Holdings, Inc., a Wyoming corporation, (hereinafter, "NY
                  Elizabeth Auction," "we," or "Us"). These terms of service
                  (the "Terms") govern your access to the NY Elizabeth Auction
                  website (https://nyelizabeth.com/), and any other services
                  owned, controlled, or offered by NY Elizabeth Auction.
                </p>
                <Link
                  href="#"
                  className="text-blue-600 hover:underline mt-2 inline-block"
                >
                  Read More
                </Link>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Autopay</h3>
                <p className="text-gray-600">
                  If you have not contacted NY Elizabeth to arrange payment
                  within 3 days of the time that invoice is sent, we will charge
                  the credit card you used to register for the auction for the
                  amount of your invoice.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Sales Tax</h3>
                <p className="text-gray-600">
                  Online purchases from NY Elizabeth may be subject to sales
                  tax. Please see the following for more details. If you are
                  tax-exempt, you can submit your tax-exempt certificate to
                  prevent the collection of tax. Learn more about
                  tax-exemption.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}