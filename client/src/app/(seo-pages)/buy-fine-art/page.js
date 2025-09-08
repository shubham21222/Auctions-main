import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

// SEO-optimized page for: buy fine art
export const metadata = {
  title: "Buy Fine Art | NY Elizabeth Auctions",
  description: "Find exceptional buy fine art in our exclusive collection. Museum-quality pieces, expert authentication, and worldwide delivery available.",
  keywords: "buy fine art, art collection, authentic artwork, premium art",
  openGraph: {
    title: "Buy Fine Art | NY Elizabeth Auctions",
    description: "Find exceptional buy fine art in our exclusive collection. Museum-quality pieces, expert authentication, and worldwide delivery available.",
    url: "https://bid.nyelizabeth.com/buy-fine-art",
    type: "website",
    images: [
      {
        url: "https://images.unsplash.com/photo-1730103516371-6412af538b5b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NzU4MDl8MHwxfHNlYXJjaHwxfHxidXklMjBmaW5lJTIwYXJ0fGVufDB8MHx8fDE3NTczMzc1OTl8MA&ixlib=rb-4.1.0&q=80&w=1080",
        width: 1200,
        height: 630,
        alt: "buy fine art - A realty is for people who can't cope with art"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Buy Fine Art | NY Elizabeth Auctions",
    description: "Find exceptional buy fine art in our exclusive collection. Museum-quality pieces, expert authentication, and worldwide delivery available.",
    images: ["https://images.unsplash.com/photo-1730103516371-6412af538b5b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NzU4MDl8MHwxfHNlYXJjaHwxfHxidXklMjBmaW5lJTIwYXJ0fGVufDB8MHx8fDE3NTczMzc1OTl8MA&ixlib=rb-4.1.0&q=80&w=1080"]
  }
};

export default function BuyFineArtPage() {
  const jsonLd = {
  "@context": "https://schema.org",
  "url": "https://bid.nyelizabeth.com/buy-fine-art",
  "publisher": {
    "@type": "Organization",
    "name": "NY Elizabeth Auctions",
    "url": "https://bid.nyelizabeth.com"
  },
  "@type": "Product",
  "name": "Buy Fine Art | NY Elizabeth Auctions",
  "description": "Find exceptional buy fine art in our exclusive collection. Museum-quality pieces, expert authentication, and worldwide delivery available.",
  "category": "Art & Collectibles",
  "brand": {
    "@type": "Brand",
    "name": "NY Elizabeth Auctions"
  },
  "offers": {
    "@type": "AggregateOffer",
    "availability": "https://schema.org/InStock",
    "priceCurrency": "USD",
    "seller": {
      "@type": "Organization",
      "name": "NY Elizabeth Auctions"
    }
  },
  "image": [
    "https://images.unsplash.com/photo-1730103516371-6412af538b5b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NzU4MDl8MHwxfHNlYXJjaHwxfHxidXklMjBmaW5lJTIwYXJ0fGVufDB8MHx8fDE3NTczMzc1OTl8MA&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1740598307395-3ccc0ec28a28?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NzU4MDl8MHwxfHNlYXJjaHwxfHxmaW5lJTIwYXJ0JTIwbXVzZXVtfGVufDB8MHx8fDE3NTczMjQ1MzF8MA&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.pexels.com/photos/318238/pexels-photo-318238.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
  ]
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
                Buy Fine Art
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Buy Fine Art represent specialized fields of collecting that demand expertise, patience, and access to authentic examples with verifiable provenance. Our carefully assembled collection features pieces that have been rigorously authenticated and evaluated, ensuring collectors receive objects of genuine historical and cultural significance.
              </p>
            </div>
            
            {/* Hero Image */}
            <div className="relative h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1730103516371-6412af538b5b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NzU4MDl8MHwxfHNlYXJjaHwxfHxidXklMjBmaW5lJTIwYXJ0fGVufDB8MHx8fDE3NTczMzc1OTl8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="buy fine art - A realty is for people who can't cope with art"
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
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Buy Fine Art Are Highly Valued</h2>
                <div className="text-gray-700 leading-relaxed space-y-4">
                  
                  <p>The enduring appeal of buy fine art lies in their unique combination of artistic merit, historical significance, and investment potential. These exceptional works represent not merely decorative objects, but tangible connections to cultural heritage and artistic tradition.</p>
                  
                  <p>Each piece in our buy fine art collection has been selected for its outstanding quality, provenance, and aesthetic impact. The rarity and authenticity of these works contribute to their increasing value over time, making them excellent additions to both private collections and institutional holdings.</p>
                  
                  <p>Collectors appreciate buy fine art for their ability to transform spaces while serving as conversation pieces that reflect sophistication and cultural awareness. The emotional and intellectual satisfaction derived from owning such pieces often exceeds their monetary value, creating lasting connections between collector and artwork.</p>
                  
                </div>
                
                
              </section>
              
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">How to Choose the Perfect Buy</h2>
                <div className="text-gray-700 leading-relaxed space-y-4">
                  
                  <p>Selecting exceptional buy fine art requires careful consideration of multiple factors that influence both aesthetic appeal and long-term value. Our experts evaluate condition, provenance, artistic significance, and market position to ensure each piece meets our exacting standards.</p>
                  
                  <p>Authentication plays a crucial role in the selection process, with our specialists conducting thorough research into each work's history, materials, and creation circumstances. This meticulous approach guarantees that collectors receive genuine pieces with complete documentation and verified authenticity.</p>
                  
                  <p>Consider factors such as size, subject matter, artistic period, and condition when evaluating buy fine art. Our team provides detailed condition reports and historical context for each piece, enabling informed decision-making that aligns with individual collecting goals and aesthetic preferences.</p>
                  
                </div>
                
                
                <div className="my-8">
                  <div className="relative h-80 rounded-xl overflow-hidden shadow-lg">
                    <Image
                      src="https://images.unsplash.com/photo-1740598307395-3ccc0ec28a28?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NzU4MDl8MHwxfHNlYXJjaHwxfHxmaW5lJTIwYXJ0JTIwbXVzZXVtfGVufDB8MHx8fDE3NTczMjQ1MzF8MA&ixlib=rb-4.1.0&q=80&w=1080"
                      alt="buy fine art - A large room filled with lots of paintings"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 800px"
                    />
                  </div>
                </div>
                
              </section>
              
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Building Your Buy Fine Art Collection</h2>
                <div className="text-gray-700 leading-relaxed space-y-4">
                  
                  <p>Developing a meaningful collection of buy fine art involves strategic planning, market knowledge, and access to exceptional pieces. Our curatorial team assists collectors in identifying works that complement existing holdings while expanding into new areas of interest.</p>
                  
                  <p>Proper care and conservation ensure that buy fine art maintain their beauty and value for future generations. We provide comprehensive guidance on display, storage, and maintenance, including recommendations for professional conservation services when needed.</p>
                  
                  <p>The journey of collecting buy fine art extends beyond acquisition to include ongoing research, documentation, and appreciation of the works' cultural significance. Our ongoing support helps collectors develop deeper understanding and appreciation of their growing collections.</p>
                  
                </div>
                
                
              </section>
              
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Investment Potential of Buy Fine Art</h2>
                <div className="text-gray-700 leading-relaxed space-y-4">
                  
                  <p>The market for buy fine art has demonstrated remarkable resilience and growth potential, with exceptional pieces consistently outperforming traditional investment vehicles. Our market expertise helps collectors identify works with strong appreciation potential while building collections of lasting cultural significance.</p>
                  
                  <p>Current market trends show increasing demand for buy fine art, driven by growing collector interest and institutional acquisition programs. This sustained demand, combined with limited supply of high-quality pieces, creates favorable conditions for value appreciation over time.</p>
                  
                  <p>Professional appraisal and documentation services ensure that collectors maintain accurate records of their buy fine art holdings, supporting both insurance requirements and potential future transactions. Our network of certified appraisers provides authoritative valuations recognized by leading institutions worldwide.</p>
                  
                </div>
                
                
              </section>
              
              
              {/* Internal Links Section */}
              
              <section className="my-12 p-6 bg-gray-50 rounded-xl">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  Related Collections
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  <Link href="/buy-original-art" className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                    <span className="text-blue-600 hover:text-blue-800 font-medium">
                      buy original art collection
                    </span>
                  </Link>
                  
                  <Link href="/fine-art-for-sale" className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                    <span className="text-blue-600 hover:text-blue-800 font-medium">
                      authentic fine art for sale
                    </span>
                  </Link>
                  
                  <Link href="/art-painting" className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                    <span className="text-blue-600 hover:text-blue-800 font-medium">
                      rare art painting
                    </span>
                  </Link>
                  
                  <Link href="/ancient-art" className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                    <span className="text-blue-600 hover:text-blue-800 font-medium">
                      ancient art
                    </span>
                  </Link>
                  
                </div>
              </section>
              
              
              {/* Final Image and Conclusion */}
              
              <div className="my-8">
                <div className="relative h-80 rounded-xl overflow-hidden shadow-lg">
                  <Image
                    src="https://images.pexels.com/photos/318238/pexels-photo-318238.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                    alt="buy fine art - Premium collection piece"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 800px"
                  />
                </div>
              </div>
              
              
              <section className="mt-12">
                <p className="text-lg text-gray-700 leading-relaxed">
                  Whether seeking to begin a new collection or enhance an existing one, our buy fine art selection offers unparalleled quality and authenticity. Contact our specialists to learn more about specific pieces and discover how these remarkable works can enrich your collecting journey.
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
              Explore our curated collection of authentic buy fine art and find the perfect addition to your collection.
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