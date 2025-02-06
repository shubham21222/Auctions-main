import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import products from "@/app/data/ProductData";


export default function RelatedProducts({ product }) {
    return (
        <section className="mt-16">
            <h2 className="text-xl font-bold text-gray-900 mb-6">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products
                    .filter((p) => p.slug !== product.slug)
                    .slice(0, 4)
                    .map((relatedProduct) => (
                        <div key={relatedProduct.slug} className="group relative">
                            <div className="relative aspect-square rounded-lg overflow-hidden shadow-md group-hover:shadow-lg transition-shadow">
                                <Image
                                    src={relatedProduct.images[0] || "/placeholder.svg"}
                                    alt={relatedProduct.name}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <button className="absolute top-2 right-2 p-1 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors">
                                    <Heart className="w-3 h-3 text-gray-800" />
                                </button>
                            </div>
                            <div className="mt-4 space-y-2">
                                <h3 className="font-medium text-gray-900 line-clamp-2 text-sm">
                                    {relatedProduct.name}
                                </h3>
                                <p className="text-xs text-gray-600">
                                    Est. ${relatedProduct.price.min.toLocaleString()} - $
                                    {relatedProduct.price.max.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    ))}
            </div>
        </section>
    );
}