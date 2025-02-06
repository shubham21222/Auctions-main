'use client'
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useState } from "react";

export default function PrivateSales() {
    const images = [
        "https://beta.nyelizabeth.com/wp-content/uploads/2024/03/p3.png",
        "https://beta.nyelizabeth.com/wp-content/uploads/2024/03/p1.png",
        "https://beta.nyelizabeth.com/wp-content/uploads/2024/03/p4-1.png",
    ];

    const [currentSlide, setCurrentSlide] = useState(0);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % images.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <>
            <Header />
            <div className="min-h-screen mt-[80px] bg-gray-50">
                <main className="container mx-auto px-4 py-12">
                    {/* Header */}
                    <h1 className="text-center text-5xl font-serif text-indigo-900 mb-16">Private Sales</h1>

                    {/* Stats Grid */}
                    <div className="grid md:grid-cols-3 gap-8 mb-20">
                        {[
                            { title: "Est. 1956", description: "NY Elizabeth private sales is catered to qualified clients with a range of $100,000 to $50 million USD per transaction" },
                            { title: "700+ Auctions", description: "NY Elizabeth conducted over 700+ auctions in 2022 - 2023 with $1m+ in bids. 10,000+ Active Bidders 18+ Countries" },
                            { title: "Representation", description: "NY Elizabeth client list includes museums, private collectors, celebrities, architectural firms, movie studios, interior designers, family offices, private equities, venture capitals, hotels, and hedge funds." },
                        ].map(({ title, description }, index) => (
                            <div key={index} className="text-center p-6 bg-white rounded-lg shadow-md">
                                <h2 className="text-xl font-medium mb-2 text-indigo-800">{title}</h2>
                                <p className="text-gray-600 text-sm">{description}</p>
                            </div>
                        ))}
                    </div>

                    {/* Approval Process */}
                    <section className="mb-20">
                        <h2 className="text-3xl font-serif text-indigo-900 text-center mb-6">Approval Process</h2>
                        <p className="text-center max-w-3xl mx-auto text-gray-600">
                            To join our private sales, you must be invited. We offer two options in our private sales. One: You can buy individual pieces or collections as they become available, we will notify you via email. Two: You can allocate a minimum deposit of $1 million USD for NY Elizabeth to acquire on your behalf.
                        </p>
                    </section>

                    {/* Expertise */}
                    <section className="mb-20">
                        <h2 className="text-3xl font-serif text-indigo-900 text-center mb-6">Our Expertise</h2>
                        <p className="text-center max-w-3xl mx-auto text-gray-600">
                            Designer jewelry, designer handbags, master paintings, modern art, rare watches, automotive, important glass & decorative art, islamic & ancient art
                        </p>
                    </section>

                    {/* Product Section */}
                    <section className="max-w-4xl mx-auto">
                        <h2 className="text-4xl font-serif text-indigo-900 text-center mb-8">
                            Private Art Sales: Important Large Enameled Vase
                        </h2>

                        {/* Image Carousel */}
                        <div className="relative mb-12">
                            <div className="aspect-square relative overflow-hidden rounded-lg shadow-lg">
                                <Image
                                    src={images[currentSlide]}
                                    alt="Large Enameled Vase"
                                    fill
                                    className="object-contain transition-transform duration-300"
                                />
                            </div>
                            <button
                                onClick={prevSlide}
                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg hover:bg-white"
                            >
                                <ChevronLeft className="w-6 h-6 text-indigo-900" />
                            </button>
                            <button
                                onClick={nextSlide}
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg hover:bg-white"
                            >
                                <ChevronRight className="w-6 h-6 text-indigo-900" />
                            </button>
                        </div>

                        {/* Product Details */}
                        <div className="prose prose-slate max-w-none">
                            <h3 className="text-center font-medium text-indigo-900">EXTREMELY RARE LARGE, BEAUTIFUL AMBER ENAMELED GLASS</h3>
                            <p className="text-gray-700">
                                Each is a twisted globular form of amber tint with a wide flared neck; the sides are applied with six suspension loops, enameled in opaque red, blue, and white with additional gilt thuluth inscriptions on the body and neck; blazons in roundels depicting bands of scroll, floral rosettes and foliate decoration; and the foot has a gilt band.
                            </p>
                            <div className="text-center text-sm space-y-1 text-gray-600">
                                <p>ORIGIN: FRANCE CIRCA: 19TH CENTURY</p>
                                <p>HEIGHT: 24.5 CM</p>
                                <p>CULTURE: ISLAMIC WORLD</p>
                                <p>Condition: Perfect</p>
                            </div>
                        </div>
                    </section>

                    {/* Upcoming Auctions */}
                    <section className="mt-20 text-center">
                        <h2 className="text-3xl font-serif text-indigo-900 mb-6">NY Elizabeth Upcoming Auctions</h2>
                        <Button variant="outline" className="mx-auto bg-indigo-900 text-white hover:bg-indigo-800">
                            CLICK HERE TO VIEW OUR UPCOMING AUCTIONS
                        </Button>
                    </section>
                </main>
            </div>
            <Footer />
        </>
    );
}