"use client";

import Image from "next/image";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useState } from "react";

const articles = [
  {
    title: "Forbes: NFT, The Future Of Art",
    image: "https://beta.nyelizabeth.com/wp-content/uploads/2024/03/nye-press-1.webp",
    url: "https://www.forbes.com/sites/forbesbusinesscouncil/2021/04/28/a-guide-to-non-fungible-tokens-the-future-of-art/?sh=19598d6a546c",
  },
  {
    title: "Forbes: Lessons Learned In Art Authentication And Digital Transformation",
    image: "https://beta.nyelizabeth.com/wp-content/uploads/2024/03/nye-press-2.webp",
    url: "https://www.forbes.com/sites/forbesbusinesscouncil/2021/03/31/lessons-learned-in-art-authentication-and-digital-transformation/?sh=5309afdc2b80",
  },
  {
    title: "Forbes: The Expansion Of Hybrid Models In The Art World",
    image: "https://beta.nyelizabeth.com/wp-content/uploads/2024/03/nye-press-3.webp",
    url: "https://www.forbes.com/sites/forbesbusinesscouncil/2021/03/10/the-expansion-of-hybrid-models-in-the-art-world/?sh=69afdd4a32e1",
  },
  {
    title: "NY Elizabeth: Where Distinction and Tradition Converge",
    image: "https://beta.nyelizabeth.com/wp-content/uploads/2024/03/nye-press-4567.png",
    url: "https://markets.businessinsider.com/news/stocks/ny-elizabeth-where-distinction-and-tradition-converge-1029547286#",
  },
  {
    title: "Paul Allen: A Passion for Art",
    image: "https://beta.nyelizabeth.com/wp-content/uploads/2024/03/nye-press-4567.png",
    url: "https://apnews.com/press-release/newswire/business-lifestyle-paul-allen-bea3c6e1e37241ebcf34e941cc4912d6",
  },
  {
    title: "NY Elizabeth Announces Expansion Of Authentication Services",
    image: "https://beta.nyelizabeth.com/wp-content/uploads/2024/03/nye-press-4567.png",
    url: "http://www.prweb.com/releases/ny_elizabeth_announces_expansion_of_authentication_services/prweb17684722.htm",
  },
  {
    title: "How an Art Gallery transformed into one of the leading online art auctions",
    image: "https://beta.nyelizabeth.com/wp-content/uploads/2024/03/nye-press-4567.png",
    url: "https://www.issuewire.com/how-an-art-gallery-transformed-into-one-of-the-leading-online-art-auctions-for-the-xennials-millennials-1663484847319442",
  },
  {
    title: "Forbes: What Art Dealers Should Know About Non-Fungible Tokens",
    image: "https://beta.nyelizabeth.com/wp-content/uploads/2024/03/nye-press-8.webp",
    url: "https://www.forbes.com/sites/forbesbusinesscouncil/2021/06/18/what-art-dealers-should-know-about-non-fungible-tokens/?sh=171ab4c6893e",
  },
  {
    title: "Forbes: The Emergence Of Art Collection As An Investment Against Inflation",
    image: "https://beta.nyelizabeth.com/wp-content/uploads/2024/03/nye-press-9.webp",
    url: "https://www.forbes.com/sites/forbesbusinesscouncil/2021/08/03/the-emergence-of-art-collection-as-an-investment-against-inflation/?sh=74020f5f7831",
  },
  {
    title: "Forbes: How The Art World Is Revamping To Meet The Demands And Needs Of Constituents",
    image: "https://beta.nyelizabeth.com/wp-content/uploads/2024/03/nye-press-10.webp",
    url: "https://www.forbes.com/sites/forbesbusinesscouncil/2021/09/10/how-the-art-world-is-revamping-to-meet-the-demands-and-needs-of-constituents/?sh=1b72492422d3",
  },
  {
    title: "Forbes: The Role Of The Younger Generation In Influencing The Art Industry",
    image: "https://beta.nyelizabeth.com/wp-content/uploads/2024/03/nye-press-11.webp",
    url: "https://www.forbes.com/sites/forbesbusinesscouncil/2021/10/07/the-role-of-the-younger-generation-in-influencing-the-art-industry/?sh=64b276cf5fc7",
  },
];

export default function PressPage() {
  const [imageErrors, setImageErrors] = useState({});

  const handleImageError = (index) => {
    setImageErrors((prev) => ({ ...prev, [index]: true }));
  };

  return (
    <>
      <Header />
      <div className="min-h-screen mt-[80px] bg-gray-100 flex justify-center px-4 py-10">
        <div className="max-w-4xl w-full bg-white rounded-2xl shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Press</h1>
          <div className="space-y-6">
            {articles.map((article, index) => (
              <div
                key={index}
                className="flex items-center gap-6 bg-gray-50 p-4 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="relative w-36 h-24 rounded-lg overflow-hidden">
                  {imageErrors[index] || !article.image ? (
                    <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 text-sm">
                      Image not available
                    </div>
                  ) : (
                    <a href={article.url} target="_blank" rel="noopener noreferrer">
                      <Image
                        src={article.image}
                        alt={article.title}
                        fill
                        className="object-cover"
                        onError={() => handleImageError(index)}
                      />
                    </a>
                  )}
                </div>
                <p className="text-lg font-semibold text-gray-700">
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {article.title}
                  </a>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}