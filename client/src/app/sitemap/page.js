import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';    
export default function SitemapPage() {
  return (
    <>
    <Header />
    <div className="container mx-auto px-4 mt-6 py-8">
      <h1 className="text-4xl font-bold mb-12">Site Map</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Pages Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold border-b pb-2">Pages</h2>
          <ul className="space-y-2">
            <li><Link href="/about-us" className="hover:text-primary">About</Link></li>
            <li><Link href="/Auctions" className="hover:text-primary">Auctions Catalog</Link></li>
            <li><Link href="/terms" className="hover:text-primary">Business Principles</Link></li>
            <li><Link href="/Buy-now" className="hover:text-primary">Buy Now</Link></li>
            <li><Link href="/contact-us" className="hover:text-primary">Contacts</Link></li>
            <li><Link href="/exclusive-access" className="hover:text-primary">Exclusive Access</Link></li>
            <li><Link href="/FAQs" className="hover:text-primary">FAQs</Link></li>
            <li><Link href="/press" className="hover:text-primary">Press</Link></li>
            <li><Link href="/privacy-policy" className="hover:text-primary">Privacy Policy</Link></li>
            <li><Link href="/private-sales" className="hover:text-primary">Private Sales</Link></li>
            <li><Link href="/Sell" className="hover:text-primary">Sell</Link></li>
            <li><Link href="/terms" className="hover:text-primary">Terms</Link></li>
          </ul>
        </div>

        {/* Collections Section */}
        {/* <div className="space-y-6">
          <h2 className="text-2xl font-semibold border-b pb-2">Collections</h2>
          <ul className="space-y-2">
            <li><Link href="/collections/summer-handbags" className="hover:text-primary">Summer Collection of Designer Handbags</Link></li>
            <li><Link href="/collections/beverly-hills-luxury" className="hover:text-primary">Beverly Hills Luxury Watch Collection</Link></li>
            <li><Link href="/collections/european-art" className="hover:text-primary">Centuries Collection of European Art</Link></li>
            <li><Link href="/collections/decorative-art" className="hover:text-primary">Important Collection of Decorative Art</Link></li>
          </ul>
        </div> */}

        {/* Popular Artists Section */}
        {/* <div className="space-y-6">
          <h2 className="text-2xl font-semibold border-b pb-2">Popular Artists</h2>
          <ul className="space-y-2">
            <li><Link href="/artists/claude-monet" className="hover:text-primary">Claude Monet</Link></li>
            <li><Link href="/artists/georges-seurat" className="hover:text-primary">Georges Seurat</Link></li>
            <li><Link href="/artists/jean-michel-basquiat" className="hover:text-primary">Jean Michel Basquiat</Link></li>
            <li><Link href="/artists/johannes-vermeer" className="hover:text-primary">Johannes Vermeer</Link></li>
            <li><Link href="/artists/pablo-picasso" className="hover:text-primary">Pablo Picasso</Link></li>
            <li><Link href="/artists/pierre-auguste-renoir" className="hover:text-primary">Pierre Auguste Renoir</Link></li>
            <li><Link href="/artists/vincent-van-gogh" className="hover:text-primary">Vincent Van Gogh</Link></li>
          </ul>
        </div>

        {/* Trending Brands Section */}
        {/* <div className="space-y-6">
          <h2 className="text-2xl font-semibold border-b pb-2">Trending Brands</h2>
          <ul className="space-y-2">
            <li><Link href="/brands/hermes" className="hover:text-primary">Hermes</Link></li>
            <li><Link href="/brands/louis-vuitton" className="hover:text-primary">Louis Vuitton</Link></li>
            <li><Link href="/brands/patek-philippe" className="hover:text-primary">Patek Philippe</Link></li>
            <li><Link href="/brands/rolex" className="hover:text-primary">Rolex</Link></li>
          </ul>
        </div>  */}
      </div>
    </div>
    <Footer />
    </>
  );
} 