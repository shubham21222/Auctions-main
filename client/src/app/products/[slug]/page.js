"use client";

import { useState, useEffect, use } from "react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import products from "@/app/data/ProductData";
import ProductBreadcrumb from "./components/ProductBreadcrumb";
import ProductImageGallery from "./components/ProductImageGallery";
import ProductDetails from "./components/ProductDetails";
import RelatedProducts from "./components/RelatedProducts";

export default function ProductPage({ params }) {
    const { slug } = use(params);
    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const foundProduct = products.find((p) => p.slug === slug);
        setProduct(foundProduct);
        setIsLoading(false);
    }, [slug]);

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
            <div className="min-h-screen mt-[120px] bg-gradient-to-b from-gray-50 to-white">
                {/* Breadcrumb */}
                <ProductBreadcrumb isLoading={isLoading} product={product} />

                {/* Main Product Section */}
                <main className="container mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_700px] gap-12">
                        {/* Image Gallery */}
                        <ProductImageGallery isLoading={isLoading} product={product} />

                        {/* Product Details */}
                        <ProductDetails isLoading={isLoading} product={product} />
                    </div>

                    {/* Related Products */}
                    {product && <RelatedProducts product={product} />}
                </main>
            </div>
            <Footer />
        </>
    );
}