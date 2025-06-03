"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import ProductDetails from "./components/ProductDetails";
import ProductImageGallery from "./components/ProductImageGallery";
import config from "@/app/config_BASE_URL";
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

  const handleAction = (action) => {
    console.log("Full Auth state:", JSON.stringify(auth, null, 2));
    console.log("User object:", auth.user);
    console.log("isEmailVerified in user:", auth.user?.isEmailVerified);
    console.log("isVerified in auth:", auth.isVerified);
    console.log("isEmailVerified in auth:", auth.isEmailVerified);

    // Store current URL and product ID for redirect after verification
    const currentUrl = window.location.href;
    const productId = slug; // Using the slug as product ID
    
    // Store in both localStorage and sessionStorage for redundancy
    localStorage.setItem("redirectAfterVerification", currentUrl);
    localStorage.setItem("productIdAfterVerification", productId);
    sessionStorage.setItem("tempRedirectAfterVerification", currentUrl);
    sessionStorage.setItem("tempProductIdAfterVerification", productId);
    
    // Dispatch a custom event to notify other tabs
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'redirectAfterVerification',
      newValue: currentUrl,
      url: window.location.href
    }));

    if (!auth.token) {
      console.log("User not logged in, showing login modal");
      setIsLoginModalOpen(true);
      return;
    }

    // Check all possible verification states
    if (!auth.user?.isEmailVerified) {
      console.log("User not verified, showing verification modal");
      // Modify the verification URL to include product ID
      const verificationUrl = `${window.location.origin}/verify-email?token=${auth.token}&productId=${productId}`;
      setIsVerificationModalOpen(true);
      // Store the modified verification URL
      localStorage.setItem("verificationUrl", verificationUrl);
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
              <ProductImageGallery 
                isLoading={isLoading}
                product={product}
              />
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