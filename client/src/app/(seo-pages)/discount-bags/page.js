import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

// SEO-optimized page for: discount bags
export const metadata = {
  title: "Discount Bags | NY Elizabeth Auctions",
  description: "Premium discount bags collection featuring rare and authentic pieces. Professional curation, certificate of authenticity, secure worldwide shipping.",
  keywords: "discount bags, art collection, authentic artwork, premium art",
  openGraph: {
    title: "Discount Bags | NY Elizabeth Auctions",
    description: "Premium discount bags collection featuring rare and authentic pieces. Professional curation, certificate of authenticity, secure worldwide shipping.",
    url: "https://bid.nyelizabeth.com/discount-bags",
    type: "website",
    images: [
      {
        url: "https://images.unsplash.com/photo-1696774772895-013333d6d7fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NzU4MDl8MHwxfHNlYXJjaHwxfHxkaXNjb3VudCUyMGJhZ3N8ZW58MHwwfHx8MTc1NzMzNzYzMXww&ixlib=rb-4.1.0&q=80&w=1080",
        width: 1200,
        height: 630,
        alt: "discount bags - a pile of purses and handbags sitting next to each other"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Discount Bags | NY Elizabeth Auctions",
    description: "Premium discount bags collection featuring rare and authentic pieces. Professional curation, certificate of authenticity, secure worldwide shipping.",
    images: ["https://images.unsplash.com/photo-1696774772895-013333d6d7fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NzU4MDl8MHwxfHNlYXJjaHwxfHxkaXNjb3VudCUyMGJhZ3N8ZW58MHwwfHx8MTc1NzMzNzYzMXww&ixlib=rb-4.1.0&q=80&w=1080"]
  }
};

export default function DiscountBagsPage() {
  const jsonLd = {
  "@context": "https://schema.org",
  "url": "https://bid.nyelizabeth.com/discount-bags",
  "publisher": {
    "@type": "Organization",
    "name": "NY Elizabeth Auctions",
    "url": "https://bid.nyelizabeth.com"
  },
  "@type": "Article",
  "headline": "Authentic Discount Bags",
  "description": "Premium discount bags collection featuring rare and authentic pieces. Professional curation, certificate of authenticity, secure worldwide shipping.",
  "author": {
    "@type": "Organization",
    "name": "NY Elizabeth Auctions"
  },
  "datePublished": "2025-09-08T14:14:20.758Z",
  "dateModified": "2025-09-08T14:14:20.758Z",
  "image": [
    "https://images.unsplash.com/photo-1696774772895-013333d6d7fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NzU4MDl8MHwxfHNlYXJjaHwxfHxkaXNjb3VudCUyMGJhZ3N8ZW58MHwwfHx8MTc1NzMzNzYzMXww&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.pexels.com/photos/5868127/pexels-photo-5868127.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "/placeholder-artwork.jpg"
  ],
  "articleSection": "Art & Collectibles"
};

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <Header />

      <section className="py-12 md:py-20 mt-[80px] bg-gradient-to-b from-gray-50 to-white overflow-hidden">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                Authentic Discount Bags
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                The pursuit of exceptional discount bags requires deep understanding of materials, techniques, and market dynamics that distinguish remarkable pieces from ordinary examples. Our curatorial approach emphasizes quality over quantity, offering collectors access to pieces that represent the finest achievements within their specific categories.
              </p>
            </div>
            
            {/* Hero Image */}
            <div className="relative h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1696774772895-013333d6d7fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NzU4MDl8MHwxfHNlYXJjaHwxfHxkaXNjb3VudCUyMGJhZ3N8ZW58MHwwfHx8MTc1NzMzNzYzMXww&ixlib=rb-4.1.0&q=80&w=1080"
                alt="discount bags - a pile of purses and handbags sitting next to each other"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1200px"
              />
              <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <article className="prose prose-lg mx-auto">
              
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Discount Bags Are Highly Valued</h2>
                <div className="text-gray-700 leading-relaxed space-y-4">
                  
                  <p>The enduring appeal of discount bags lies in their unique combination of artistic merit, historical significance, and investment potential. These exceptional works represent not merely decorative objects, but tangible connections to cultural heritage and artistic tradition.</p>
                  
                  <p>Each piece in our discount bags collection has been selected for its outstanding quality, provenance, and aesthetic impact. The rarity and authenticity of these works contribute to their increasing value over time, making them excellent additions to both private collections and institutional holdings.</p>
                  
                  <p>Collectors appreciate discount bags for their ability to transform spaces while serving as conversation pieces that reflect sophistication and cultural awareness. The emotional and intellectual satisfaction derived from owning such pieces often exceeds their monetary value, creating lasting connections between collector and artwork.</p>
                  
                </div>
                
                
              </section>
              
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">How to Choose the Perfect Discount</h2>
                <div className="text-gray-700 leading-relaxed space-y-4">
                  
                  <p>Selecting exceptional discount bags requires careful consideration of multiple factors that influence both aesthetic appeal and long-term value. Our experts evaluate condition, provenance, artistic significance, and market position to ensure each piece meets our exacting standards.</p>
                  
                  <p>Authentication plays a crucial role in the selection process, with our specialists conducting thorough research into each work's history, materials, and creation circumstances. This meticulous approach guarantees that collectors receive genuine pieces with complete documentation and verified authenticity.</p>
                  
                  <p>Consider factors such as size, subject matter, artistic period, and condition when evaluating discount bags. Our team provides detailed condition reports and historical context for each piece, enabling informed decision-making that aligns with individual collecting goals and aesthetic preferences.</p>
                  
                </div>
                
                
                <div className="my-8">
                  <div className="relative h-80 rounded-xl overflow-hidden shadow-lg">
                    <Image
                      src="https://images.pexels.com/photos/5868127/pexels-photo-5868127.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                      alt="discount bags - Premium collection piece"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 800px"
                    />
                  </div>
                </div>
                
              </section>
              
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Building Your Discount Bags Collection</h2>
                <div className="text-gray-700 leading-relaxed space-y-4">
                  
                  <p>Developing a meaningful collection of discount bags involves strategic planning, market knowledge, and access to exceptional pieces. Our curatorial team assists collectors in identifying works that complement existing holdings while expanding into new areas of interest.</p>
                  
                  <p>Proper care and conservation ensure that discount bags maintain their beauty and value for future generations. We provide comprehensive guidance on display, storage, and maintenance, including recommendations for professional conservation services when needed.</p>
                  
                  <p>The journey of collecting discount bags extends beyond acquisition to include ongoing research, documentation, and appreciation of the works' cultural significance. Our ongoing support helps collectors develop deeper understanding and appreciation of their growing collections.</p>
                  
                </div>
                
                
              </section>
              
              
              {/* Internal Links Section */}
              
              <section className="my-12 p-6 bg-gray-50 rounded-xl">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  Related Collections
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  <Link href="/discount-designer-bags" className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                    <span className="text-blue-600 hover:text-blue-800 font-medium">
                      authentic discount designer bags
                    </span>
                  </Link>
                  
                  <Link href="/discount-handbags" className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                    <span className="text-blue-600 hover:text-blue-800 font-medium">
                      discount handbags collection
                    </span>
                  </Link>
                  
                  <Link href="/outlet-bags" className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                    <span className="text-blue-600 hover:text-blue-800 font-medium">
                      outlet bags collection
                    </span>
                  </Link>
                  
                  <Link href="/cheap-branded-bags" className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                    <span className="text-blue-600 hover:text-blue-800 font-medium">
                      premium cheap branded bags
                    </span>
                  </Link>
                  
                </div>
              </section>
              
              
              {/* Final Image and Conclusion */}
              
              <div className="my-8">
                <div className="relative h-80 rounded-xl overflow-hidden shadow-lg">
                  <Image
                    src="/placeholder-artwork.jpg"
                    alt="discount bags - Premium artwork collection"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 800px"
                  />
                </div>
              </div>
              
              
              <section className="mt-12">
                <p className="text-lg text-gray-700 leading-relaxed">
                  The exceptional quality and authenticity of our discount bags collection reflect decades of expertise in identifying and acquiring remarkable works. We invite discerning collectors to explore these extraordinary pieces and discover the perfect additions to their collections.
                </p>
              </section>
            </article>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gray-900 text-white">
          <div className="container mx-auto px-4 text-center max-w-4xl">
            <h2 className="text-3xl font-bold mb-4">
              Discover Your Next Masterpiece
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Explore our curated collection of authentic discount bags and find the perfect addition to your collection.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/Auctions" className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg font-semibold transition-colors">
                Browse Auctions
              </Link>
              <Link href="/Buy-now" className="bg-transparent border-2 border-white hover:bg-white hover:text-gray-900 px-8 py-3 rounded-lg font-semibold transition-colors">
                Shop Collection
              </Link>
            </div>
          </div>
        </section>
      
      <Footer />
    </>
  );
}