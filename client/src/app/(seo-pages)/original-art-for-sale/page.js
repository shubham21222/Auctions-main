import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

// SEO-optimized page for: original art for sale
export const metadata = {
  title: "Original Art For Sale | NY Elizabeth Auctions",
  description: "Premium original art for sale collection featuring rare and authentic pieces. Professional curation, certificate of authenticity, secure worldwide shipping.",
  keywords: "original art for sale, art collection, authentic artwork, premium art",
  openGraph: {
    title: "Original Art For Sale | NY Elizabeth Auctions",
    description: "Premium original art for sale collection featuring rare and authentic pieces. Professional curation, certificate of authenticity, secure worldwide shipping.",
    url: "https://bid.nyelizabeth.com/original-art-for-sale",
    type: "website",
    images: [
      {
        url: "https://images.unsplash.com/photo-1618748274531-74442d558432?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NzU4MDl8MHwxfHNlYXJjaHwxfHxvcmlnaW5hbCUyMGFydCUyMGZvciUyMHNhbGV8ZW58MHwwfHx8MTc1NzMzNzY1NHww&ixlib=rb-4.1.0&q=80&w=1080",
        width: 1200,
        height: 630,
        alt: "original art for sale - brown wooden framed painting of horses"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Original Art For Sale | NY Elizabeth Auctions",
    description: "Premium original art for sale collection featuring rare and authentic pieces. Professional curation, certificate of authenticity, secure worldwide shipping.",
    images: ["https://images.unsplash.com/photo-1618748274531-74442d558432?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NzU4MDl8MHwxfHNlYXJjaHwxfHxvcmlnaW5hbCUyMGFydCUyMGZvciUyMHNhbGV8ZW58MHwwfHx8MTc1NzMzNzY1NHww&ixlib=rb-4.1.0&q=80&w=1080"]
  }
};

export default function OriginalArtForSalePage() {
  const jsonLd = {
  "@context": "https://schema.org",
  "url": "https://bid.nyelizabeth.com/original-art-for-sale",
  "publisher": {
    "@type": "Organization",
    "name": "NY Elizabeth Auctions",
    "url": "https://bid.nyelizabeth.com"
  },
  "@type": "Product",
  "name": "Original Art For Sale | NY Elizabeth Auctions",
  "description": "Premium original art for sale collection featuring rare and authentic pieces. Professional curation, certificate of authenticity, secure worldwide shipping.",
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
    "https://images.unsplash.com/photo-1618748274531-74442d558432?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NzU4MDl8MHwxfHNlYXJjaHwxfHxvcmlnaW5hbCUyMGFydCUyMGZvciUyMHNhbGV8ZW58MHwwfHx8MTc1NzMzNzY1NHww&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1740598307395-3ccc0ec28a28?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NzU4MDl8MHwxfHNlYXJjaHwxfHxmaW5lJTIwYXJ0JTIwbXVzZXVtfGVufDB8MHx8fDE3NTczMjQ1MzF8MA&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.pexels.com/photos/7364068/pexels-photo-7364068.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
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
                Authentic Original Art For Sale
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                The pursuit of exceptional original art for sale requires deep understanding of materials, techniques, and market dynamics that distinguish remarkable pieces from ordinary examples. Our curatorial approach emphasizes quality over quantity, offering collectors access to pieces that represent the finest achievements within their specific categories.
              </p>
            </div>
            
            {/* Hero Image */}
            <div className="relative h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1618748274531-74442d558432?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NzU4MDl8MHwxfHNlYXJjaHwxfHxvcmlnaW5hbCUyMGFydCUyMGZvciUyMHNhbGV8ZW58MHwwfHx8MTc1NzMzNzY1NHww&ixlib=rb-4.1.0&q=80&w=1080"
                alt="original art for sale - brown wooden framed painting of horses"
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
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Original Art For Sale Are Highly Valued</h2>
                <div className="text-gray-700 leading-relaxed space-y-4">
                  
                  <p>The enduring appeal of original art for sale lies in their unique combination of artistic merit, historical significance, and investment potential. These exceptional works represent not merely decorative objects, but tangible connections to cultural heritage and artistic tradition.</p>
                  
                  <p>Each piece in our original art for sale collection has been selected for its outstanding quality, provenance, and aesthetic impact. The rarity and authenticity of these works contribute to their increasing value over time, making them excellent additions to both private collections and institutional holdings.</p>
                  
                  <p>Collectors appreciate original art for sale for their ability to transform spaces while serving as conversation pieces that reflect sophistication and cultural awareness. The emotional and intellectual satisfaction derived from owning such pieces often exceeds their monetary value, creating lasting connections between collector and artwork.</p>
                  
                </div>
                
                
              </section>
              
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">How to Choose the Perfect Original</h2>
                <div className="text-gray-700 leading-relaxed space-y-4">
                  
                  <p>Selecting exceptional original art for sale requires careful consideration of multiple factors that influence both aesthetic appeal and long-term value. Our experts evaluate condition, provenance, artistic significance, and market position to ensure each piece meets our exacting standards.</p>
                  
                  <p>Authentication plays a crucial role in the selection process, with our specialists conducting thorough research into each work's history, materials, and creation circumstances. This meticulous approach guarantees that collectors receive genuine pieces with complete documentation and verified authenticity.</p>
                  
                  <p>Consider factors such as size, subject matter, artistic period, and condition when evaluating original art for sale. Our team provides detailed condition reports and historical context for each piece, enabling informed decision-making that aligns with individual collecting goals and aesthetic preferences.</p>
                  
                </div>
                
                
                <div className="my-8">
                  <div className="relative h-80 rounded-xl overflow-hidden shadow-lg">
                    <Image
                      src="https://images.unsplash.com/photo-1740598307395-3ccc0ec28a28?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NzU4MDl8MHwxfHNlYXJjaHwxfHxmaW5lJTIwYXJ0JTIwbXVzZXVtfGVufDB8MHx8fDE3NTczMjQ1MzF8MA&ixlib=rb-4.1.0&q=80&w=1080"
                      alt="original art for sale - A large room filled with lots of paintings"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 800px"
                    />
                  </div>
                </div>
                
              </section>
              
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Building Your Original Art For Sale Collection</h2>
                <div className="text-gray-700 leading-relaxed space-y-4">
                  
                  <p>Developing a meaningful collection of original art for sale involves strategic planning, market knowledge, and access to exceptional pieces. Our curatorial team assists collectors in identifying works that complement existing holdings while expanding into new areas of interest.</p>
                  
                  <p>Proper care and conservation ensure that original art for sale maintain their beauty and value for future generations. We provide comprehensive guidance on display, storage, and maintenance, including recommendations for professional conservation services when needed.</p>
                  
                  <p>The journey of collecting original art for sale extends beyond acquisition to include ongoing research, documentation, and appreciation of the works' cultural significance. Our ongoing support helps collectors develop deeper understanding and appreciation of their growing collections.</p>
                  
                </div>
                
                
              </section>
              
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Investment Potential of Original Art For Sale</h2>
                <div className="text-gray-700 leading-relaxed space-y-4">
                  
                  <p>The market for original art for sale has demonstrated remarkable resilience and growth potential, with exceptional pieces consistently outperforming traditional investment vehicles. Our market expertise helps collectors identify works with strong appreciation potential while building collections of lasting cultural significance.</p>
                  
                  <p>Current market trends show increasing demand for original art for sale, driven by growing collector interest and institutional acquisition programs. This sustained demand, combined with limited supply of high-quality pieces, creates favorable conditions for value appreciation over time.</p>
                  
                  <p>Professional appraisal and documentation services ensure that collectors maintain accurate records of their original art for sale holdings, supporting both insurance requirements and potential future transactions. Our network of certified appraisers provides authoritative valuations recognized by leading institutions worldwide.</p>
                  
                </div>
                
                
              </section>
              
              
              {/* Internal Links Section */}
              
              <section className="my-12 p-6 bg-gray-50 rounded-xl">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  Related Collections
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  <Link href="/art-for-sale" className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                    <span className="text-blue-600 hover:text-blue-800 font-medium">
                      art for sale collection
                    </span>
                  </Link>
                  
                  <Link href="/art-paintings-for-sale" className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                    <span className="text-blue-600 hover:text-blue-800 font-medium">
                      rare art paintings for sale
                    </span>
                  </Link>
                  
                  <Link href="/art-pieces-for-sale" className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                    <span className="text-blue-600 hover:text-blue-800 font-medium">
                      art pieces for sale
                    </span>
                  </Link>
                  
                  <Link href="/fine-art-for-sale" className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                    <span className="text-blue-600 hover:text-blue-800 font-medium">
                      authentic fine art for sale
                    </span>
                  </Link>
                  
                </div>
              </section>
              
              
              {/* Final Image and Conclusion */}
              
              <div className="my-8">
                <div className="relative h-80 rounded-xl overflow-hidden shadow-lg">
                  <Image
                    src="https://images.pexels.com/photos/7364068/pexels-photo-7364068.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                    alt="original art for sale - Premium collection piece"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 800px"
                  />
                </div>
              </div>
              
              
              <section className="mt-12">
                <p className="text-lg text-gray-700 leading-relaxed">
                  Our commitment to excellence in original art for sale extends beyond mere transaction to encompass education, authentication, and ongoing collector support. Each piece represents not only an aesthetic achievement but also a sound investment in cultural heritage and artistic legacy.
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
              Explore our curated collection of authentic original art for sale and find the perfect addition to your collection.
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