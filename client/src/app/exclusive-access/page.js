'use client';
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useState } from "react";
import { loadStripe } from '@stripe/stripe-js';
import { useSelector } from "react-redux";
import LoginModal from "@/app/components/LoginModal";
import toast from "react-hot-toast";

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function PrivateSales() {    
    const images = [
        "https://beta.nyelizabeth.com/wp-content/uploads/2024/03/p3.png",
        "https://beta.nyelizabeth.com/wp-content/uploads/2024/03/p1.png",
        "https://beta.nyelizabeth.com/wp-content/uploads/2024/03/p4-1.png",
    ];

    const [currentSlide, setCurrentSlide] = useState(0);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
    const user = useSelector((state) => state.auth.user);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % images.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
    };

    const handlePayment = async (amount) => {
        if (!isLoggedIn) {
            setIsLoginModalOpen(true);
            return;
        }

        try {
            // Create payment intent
            const response = await fetch('/api/create-payment-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: amount * 100, // Convert to cents
                    currency: 'usd',
                    metadata: {
                        type: 'membership',
                        tier: amount === 120 ? 'Tier 1' : 'Tier 2 Gold',
                        email: user?.email || 'customer@example.com'
                    }
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create payment session');
            }

            const { sessionId } = await response.json();

            // Initialize Stripe
            const stripe = await stripePromise;
            
            // Open Stripe Checkout
            const { error } = await stripe.redirectToCheckout({
                sessionId: sessionId,
            });

            if (error) {
                console.error('Payment error:', error);
                toast.error('Payment failed: ' + error.message);
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error: ' + error.message);
        }
    };

    const handleOpenSignup = () => {
        setIsLoginModalOpen(false);
        toast.info("Please implement the signup modal logic.");
    };

    return (
        <>
            <Header />
            <div className="min-h-screen mt-[80px] bg-gray-50">
                <main className="container mx-auto px-4 py-12">
                    {/* Header */}
                    <h1 className="text-center text-5xl font-serif text-indigo-900 mb-16">NY Elizabeth Membership Program</h1>

                    {/* Stats Grid */}
                    <div className="grid md:grid-cols-3 gap-8 mb-20">
                        {[
                            { title: "Est. 1956", description: "NY Elizabeth private sales is catered to qualified clients with a range of $100,000 to $50 million USD per transaction" },
                            { title: "700+ Auctions", description: "NY Elizabeth conducted over 700+ auctions in 2022 - 2023 with $1m+ in bids. 10,000+ Active Bidders 18+ Countries" },
                            { title: "Representation", description: "NY Elizabeth client list includes museums, private collectors, celebrities, architectural firms, movie studios, interior designers, family offices, private equities, venture capitals, hotels, and hedge funds." },
                        ].map(({ title, description }, index) => (
                            <div key={index} className="text-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                                <h2 className="text-xl font-medium mb-2 text-indigo-800">{title}</h2>
                                <p className="text-gray-600 text-sm">{description}</p>
                            </div>
                        ))}
                    </div>

                    {/* Approval Process */}
                    <section className="mb-20">
                        <h2 className="text-3xl font-serif text-indigo-900 text-center mb-6">Approval Process</h2>

                        <p className="text-center max-w-3xl mx-auto text-gray-600 mb-4">
                            To join our membership program, you must receive an invitation. We offer two membership tiers to cater to different needs and preferences.
                        </p>

                        <p className="text-center max-w-3xl mx-auto text-gray-600 mb-4">
                            Tier 1 membership costs $120 annually and provides instant approval to our upcoming auctions with a bid limit of up to $5,000. Additionally, members in this tier can take advantage of after-auction offers for jewelry and handbags only.
                        </p>

                        <p className="text-center max-w-3xl mx-auto text-gray-600 mb-4">
                            Tier 2 membership is priced at $480 annually and includes instant approval to our upcoming auctions with a higher bid limit of up to $25,000. Members also receive up to 12 monthly certificates of authenticity and insurance appraisal PDFs from NY Elizabeth for jewelry, watches, or handbags purchased through our auctions or private sales. After-auction offers are available for all categories.
                        </p>

                        <p className="text-center max-w-3xl mx-auto text-gray-600 mb-4">
                            For those requiring unlimited NY Elizabeth authenticity certificates and insurance appraisals for jewelry, watches, and handbags, please contact us directly to discuss your needs.
                        </p>

                        <p className="text-center max-w-3xl mx-auto text-gray-600">
                            Our expertise spans a wide range of luxury and collectible items, including designer jewelry, designer handbags, master paintings, modern art, rare watches, automotive, important glass and decorative art, as well as Islamic and ancient art.
                        </p>
                    </section>

                    {/* Pricing Cards */}
                    <section className="mb-20">
                        <h2 className="text-3xl font-serif text-indigo-900 text-center mb-10">Membership Tiers</h2>
                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Tier 1 Card */}
                            <div className="relative p-8 bg-white rounded-lg shadow-md border border-transparent overflow-hidden group hover:shadow-lg transition-shadow duration-300">
                                {/* Pulse Animation */}
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                                <div className="absolute inset-0 border-2 border-indigo-500 rounded-lg animate-pulse"></div>
                                <h3 className="text-2xl font-semibold text-indigo-900 mb-4">Tier 1</h3>
                                <p className="text-gray-600 mb-4">
                                    Annual membership fee: <span className="font-bold text-indigo-700">$120</span>
                                </p>
                                <ul className="space-y-2 text-sm text-gray-600">
                                    <li>Instant approval to upcoming auctions</li>
                                    <li>Bid limit up to $5,000</li>
                                    <li>After-auction offers for jewelry and handbags only</li>
                                </ul>
                                <Button 
                                    className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white transition-all duration-300 transform hover:scale-105"
                                    onClick={() => handlePayment(120)}
                                >
                                    Join Now
                                </Button>
                            </div>

                            {/* Tier 2 Card */}
                            <div className="relative p-8 bg-white rounded-lg shadow-md border border-transparent overflow-hidden group hover:shadow-lg transition-shadow duration-300">
                                {/* Pulse Animation */}
                                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                                <div className="absolute inset-0 border-2 border-yellow-500 rounded-lg animate-pulse"></div>
                                <h3 className="text-2xl font-semibold text-indigo-900 mb-4">Tier 2 Gold</h3>
                                <p className="text-gray-600 mb-4">
                                    Annual membership fee: <span className="font-bold text-indigo-700">$480</span>
                                </p>
                                <ul className="space-y-2 text-sm text-gray-600">
                                    <li>Instant approval to upcoming auctions</li>
                                    <li>Bid limit up to $25,000</li>
                                    <li>Up to 12 monthly certificates of authenticity and insurance appraisal PDFs</li>
                                    <li>After-auction offers for all categories</li>
                                </ul>
                                <Button 
                                    className="mt-6 w-full bg-yellow-600 hover:bg-yellow-700 text-white transition-all duration-300 transform hover:scale-105"
                                    onClick={() => handlePayment(480)}
                                >
                                    Join Now
                                </Button>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
            <Footer />

            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                onOpenSignup={handleOpenSignup}
            />
        </>
    );
}