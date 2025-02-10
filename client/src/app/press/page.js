"use client";

import Image from "next/image";
import Header from "../components/Header";
import Footer from "../components/Footer";

const articles = [
    {
        title: "Forbes: NFT, The Future Of Art",
        image: "https://beta.nyelizabeth.com/wp-content/uploads/2024/03/nye-press-1.webp", // Replace with actual image path
    },
    {
        title: "Forbes: Lessons Learned In Art Authentication And Digital Transformation",
        image: "https://beta.nyelizabeth.com/wp-content/uploads/2024/03/nye-press-2.webp", // Replace with actual image path
    },
    {
        title: "Forbes: The Expansion Of Hybrid Models In The Art World",
        image: "https://beta.nyelizabeth.com/wp-content/uploads/2024/03/nye-press-3.webp", // Replace with actual image path
    },
];

export default function PressPage() {
    return (
        <>
            <Header />
            <div className="min-h-screen mt-[80px] bg-gray-100 flex justify-center px-4 py-10">
                <div className="max-w-4xl w-full bg-white rounded-2xl shadow-lg p-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">Press</h1>
                    <div className="space-y-6">
                        {articles.map((article, index) => (
                            <div key={index} className="flex items-center gap-6 bg-gray-50 p-4 rounded-lg hover:shadow-md transition-shadow">
                                <div className="relative w-36 h-24 rounded-lg overflow-hidden">
                                    <Image src={article.image} alt={article.title} fill className="object-cover" />
                                </div>
                                <p className="text-lg font-semibold text-gray-700">{article.title}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}
