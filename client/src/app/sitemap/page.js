"use client";

import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useState, useEffect } from 'react';
import config from '../config_BASE_URL';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from 'axios';
import { useSelector } from 'react-redux';

export default function SitemapPage() {
  const [auctions, setAuctions] = useState([]);
  const [products, setProducts] = useState([]);
  const [artists, setArtists] = useState([]);
  const [brands, setBrands] = useState([]);
  const [searchAuction, setSearchAuction] = useState('');
  const [searchProduct, setSearchProduct] = useState('');
  const [searchArtist, setSearchArtist] = useState('');
  const [searchBrand, setSearchBrand] = useState('');
  const [loadingAuctions, setLoadingAuctions] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingArtists, setLoadingArtists] = useState(false);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const auth = useSelector((state) => state.auth);
  const token = auth?.token;

  useEffect(() => {
    const fetchAuctions = async () => {
      setLoadingAuctions(true);
      try {
        const response = await fetch(`${config.baseURL}/v1/api/auction/bulk`);
        if (!response.ok) throw new Error('Failed to fetch auctions');
        const data = await response.json();
        
        if (data.status) {
          const allAuctions = data.items.catalogs.flatMap(catalog => 
            catalog.auctions.map(auction => ({
              title: auction.product?.title || 'Untitled Auction',
              lotNumber: auction.lotNumber
            }))
          );
          setAuctions(allAuctions);
        }
      } catch (error) {
        console.error('Error fetching auctions:', error);
      } finally {
        setLoadingAuctions(false);
      }
    };

    const fetchArtists = async () => {
      setLoadingArtists(true);
      try {
        const response = await axios.get(`${config.baseURL}/v1/api/artist`, {
          headers: { Authorization: token }
        });
        const artistData = Array.isArray(response.data.items) ? response.data.items : [];
        setArtists(artistData);
      } catch (error) {
        console.error('Error fetching artists:', error);
      } finally {
        setLoadingArtists(false);
      }
    };

    const fetchBrands = async () => {
      setLoadingBrands(true);
      try {
        const response = await axios.get(`${config.baseURL}/v1/api/brands`, {
          headers: { Authorization: token }
        });
        if (response.data.status) {
          setBrands(response.data.items || []);
        }
      } catch (error) {
        console.error('Error fetching brands:', error);
      } finally {
        setLoadingBrands(false);
      }
    };

    fetchAuctions();
    fetchArtists();
    fetchBrands();
  }, [token]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const response = await fetch(`${config.baseURL}/v1/api/product/filter?page=${currentPage}&limit=100`);
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        
        if (data.status) {
          const newProducts = data.items?.items || [];
          setTotalProducts(data.items?.total || 0);
          
          if (currentPage === 1) {
            setProducts(newProducts);
          } else {
            setProducts(prevProducts => [...prevProducts, ...newProducts]);
          }
          
          setHasMoreProducts(newProducts.length === 100);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [currentPage]);

  const loadMoreProducts = () => {
    setCurrentPage(prevPage => prevPage + 1);
  };

  const filteredAuctions = auctions.filter(auction => 
    auction.title.toLowerCase().includes(searchAuction.toLowerCase())
  );

  const filteredProducts = products.filter(product => 
    product.title.toLowerCase().includes(searchProduct.toLowerCase())
  );

  const filteredArtists = artists.filter(artist => 
    artist.artistName?.toLowerCase().includes(searchArtist.toLowerCase())
  );

  const filteredBrands = brands.filter(brand => 
    brand.brandName?.toLowerCase().includes(searchBrand.toLowerCase())
  );

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 mt-10 py-8">
        <h1 className="text-4xl font-bold mb-12">Site Map</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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

          {/* Auctions Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold border-b pb-2">Auctions</h2>
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Search auctions..."
                value={searchAuction}
                onChange={(e) => setSearchAuction(e.target.value)}
                className="w-full"
              />
              {loadingAuctions ? (
                <p>Loading auctions...</p>
              ) : (
                <ul className="space-y-2 max-h-[400px] overflow-y-auto">
                  {filteredAuctions.map((auction, index) => (
                    <li key={index} className="text-gray-600">
                      {auction.title} (Lot #{auction.lotNumber})
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Buy Now Products Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold border-b pb-2">Buy Now Products</h2>
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Search products..."
                value={searchProduct}
                onChange={(e) => setSearchProduct(e.target.value)}
                className="w-full"
              />
              {loadingProducts && currentPage === 1 ? (
                <p>Loading products...</p>
              ) : (
                <>
                  <ul className="space-y-2 max-h-[400px] overflow-y-auto">
                    {filteredProducts.map((product) => (
                      <li key={product._id}>
                        <Link 
                          href={`/products/${product._id}`}
                          className="hover:text-primary"
                        >
                          {product.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  {hasMoreProducts && !loadingProducts && (
                    <Button
                      onClick={loadMoreProducts}
                      className="w-full mt-4"
                      variant="outline"
                    >
                      Load More Products
                    </Button>
                  )}
                  {loadingProducts && currentPage > 1 && (
                    <p className="text-center mt-2">Loading more products...</p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Artists Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold border-b pb-2">Artists</h2>
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Search artists..."
                value={searchArtist}
                onChange={(e) => setSearchArtist(e.target.value)}
                className="w-full"
              />
              {loadingArtists ? (
                <p>Loading artists...</p>
              ) : (
                <ul className="space-y-2 max-h-[400px] overflow-y-auto">
                  {filteredArtists.map((artist) => (
                    <li key={artist._id}>
                      <Link 
                        href={`/popular-artist/${artist._id}`}
                        className="hover:text-primary"
                      >
                        {artist.artistName}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Brands Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold border-b pb-2">Brands</h2>
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Search brands..."
                value={searchBrand}
                onChange={(e) => setSearchBrand(e.target.value)}
                className="w-full"
              />
              {loadingBrands ? (
                <p>Loading brands...</p>
              ) : (
                <ul className="space-y-2 max-h-[400px] overflow-y-auto">
                  {filteredBrands.map((brand) => (
                    <li key={brand._id}>
                      <Link 
                        href={`/trending-brands/${brand._id}`}
                        className="hover:text-primary"
                      >
                        {brand.brandName}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
} 