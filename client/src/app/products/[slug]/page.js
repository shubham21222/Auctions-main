"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import ProductDetails from "./components/ProductDetails";
import config from "@/app/config_BASE_URL";
import Image from "next/image";
import { VerificationModal } from "@/app/components/VerificationModal";
import LoginModal from "@/app/components/LoginModal";
import SignupModal from "@/app/components/SignupModal";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function ProductPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const auth = useSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    console.log("ProductPage slug:", slug);

    async function fetchProduct() {
      try {
        setIsLoading(true);
        const response = await fetch(`${config.baseURL}/v1/api/product/${slug}`);
        if (!response.ok) {
          throw new Error("Failed to fetch product");
        }
        const data = await response.json();

        if (data.status && data.items) {
          const apiProduct = data.items;
          const transformedProduct = {
            name: apiProduct.title || "Product Name",
            description: apiProduct.description || "No description available.",
            sku: apiProduct.sku || "SKU-Not-Available",
            price: {
              min: parseFloat(apiProduct.estimateprice?.match(/\$(\d+)/)?.[1]) || 0,
              max: parseFloat(apiProduct.estimateprice?.match(/\$(\d+)/g)?.[1]?.replace('$', '')) || 0,
            },
            reservePrice: apiProduct.offerAmount || 0,
            location: "Beverly Hills, CA",
            images: apiProduct.image?.map((img) => img.trim()) || [],
          };
          setProduct(transformedProduct);
        } else {
          console.error("Invalid product data:", data);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (slug) {
      fetchProduct();
    } else {
      setIsLoading(false);
    }
  }, [slug]);

  const handleImageClick = (index) => {
    setSelectedImageIndex(index);
  };

  const handleAction = (action) => {
    console.log("Full Auth state:", JSON.stringify(auth, null, 2)); // Detailed debug log
    console.log("User object:", auth.user);
    console.log("isEmailVerified in user:", auth.user?.isEmailVerified);
    console.log("isVerified in auth:", auth.isVerified);
    console.log("isEmailVerified in auth:", auth.isEmailVerified);

    if (!auth.token) {
      console.log("User not logged in, showing login modal");
      setIsLoginModalOpen(true);
      return;
    }

    // Check all possible verification states
    if (!auth.user?.isEmailVerified) {
      console.log("User not verified, showing verification modal");
      setIsVerificationModalOpen(true);
      return;
    }

    console.log("User is verified, proceeding with action");
    // If we reach here, user is logged in and verified
    // Open the offer modal
    if (action === 'offer') {
      console.log("Opening offer modal");
      setIsOfferModalOpen(true);
    }
  };

  const handleOpenSignup = () => {
    setIsLoginModalOpen(false);
    setIsSignupModalOpen(true);
  };

  const handleOpenLogin = () => {
    setIsSignupModalOpen(false);
    setIsLoginModalOpen(true);
  };

  if (!slug) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        No product ID provided in the URL
      </div>
    );
  }

  if (!product && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        Product not found
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen mt-[120px] ">
        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_700px] gap-12">
            <div className="space-y-6">
              {isLoading ? (
                <div className="space-y-4">
                  <div className="aspect-square rounded-xl overflow-hidden shadow-xl">
                    <div className="w-full h-full bg-gray-300 animate-pulse"></div>
                  </div>
                  <div className="flex gap-2">
                    {[...Array(3)].map((_, index) => (
                      <div key={index} className="w-20 h-20 bg-gray-300 animate-pulse rounded-md"></div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex gap-4">
                  {/* Thumbnails on left */}
                  <div className="flex flex-col gap-4 w-[120px]">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => handleImageClick(index)}
                        className={`relative aspect-square overflow-hidden rounded-lg bg-gray-50
                                  hover:ring-2 ring-luxury-gold/50 transition-all duration-300
                                  cursor-pointer transform hover:scale-95 active:scale-90
                                  shadow-sm hover:shadow-md ${selectedImageIndex === index ? 'ring-2 ring-luxury-gold' : ''}`}
                      >
                        <Image
                          src={image}
                          alt={`${product.name} thumbnail ${index + 1}`}
                          fill
                          className="object-cover transition-transform duration-300 hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/10 hover:bg-black/0 transition-colors duration-300" />
                      </button>
                    ))}
                  </div>

                  {/* Main Image */}
                  <div className="flex-1 relative aspect-square rounded-xl overflow-hidden bg-gray-50 shadow-md">
                    <Image
                      src={product.images[selectedImageIndex] || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                </div>
              )}
            </div>
            <ProductDetails
              isLoading={isLoading}
              product={product}
              productId={slug}
              onAction={handleAction}
              isOfferModalOpen={isOfferModalOpen}
              setIsOfferModalOpen={setIsOfferModalOpen}
            />
          </div>
        </main>
      </div>
      <Footer />
      <VerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        email={auth.user?.email}
      />
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onOpenSignup={handleOpenSignup}
      />
      <SignupModal
        isOpen={isSignupModalOpen}
        onClose={() => setIsSignupModalOpen(false)}
        onOpenLogin={handleOpenLogin}
      />
    </>
  );
}