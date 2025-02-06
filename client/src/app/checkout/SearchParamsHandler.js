"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function SearchParamsHandler({ setProductDetails }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!searchParams) return;

    const productName = searchParams.get("name") || "Product Name";
    const productImage = searchParams.get("image") || "";
    const offerPrice = searchParams.get("price") || "0.00";

    setProductDetails({
      productName,
      productImage,
      offerPrice,
    });
  }, [searchParams, setProductDetails]);

  return null;
}