"use client";

import Link from "next/link";

export default function CatalogFooter() {
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

  return (
    <div className="container mx-auto px-4 py-12 bg-gray-100">
      <div className="grid md:grid-cols-2 gap-12">
        {/* Bid Increments */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-luxury-charcoal mb-6">Auction Details</h2>
          <h3 className="font-semibold text-gray-900 mb-4">Bid Increments</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="font-medium text-gray-700">Price</div>
            <div className="font-medium text-gray-700">Bid Increment</div>
            {bidIncrements.map((bid, index) => (
              <>
                <div key={`price-${index}`} className="text-gray-600">{bid.price}</div>
                <div key={`increment-${index}`} className="text-gray-600">{bid.increment}</div>
              </>
            ))}
          </div>
        </div>

        {/* Additional Info */}
        <div className="space-y-8">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Preview</h3>
            <p className="text-gray-600">Contact us to schedule a preview of the items.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Buyers Premium</h3>
            <p className="text-gray-600">25%</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Terms & Conditions</h3>
            <p className="text-gray-600">
              TERMS AND CONDITIONS This website is operated by NY Elizabeth Holdings, Inc., a Wyoming corporation...
            </p>
            <Link href="#" className="text-luxury-gold hover:underline mt-2 inline-block">
              Read More
            </Link>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Autopay</h3>
            <p className="text-gray-600">
              If you have not contacted NY Elizabeth to arrange payment within 3 days...
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Sales Tax</h3>
            <p className="text-gray-600">
              Online purchases from NY Elizabeth may be subject to sales tax...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}