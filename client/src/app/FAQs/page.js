'use client';

import Footer from '../components/Footer';
import Header from '../components/Header';
// import Header2 from '@/components/Header2';
import React, { useEffect, useState } from 'react';

const FAQPage = () => {
  const [location, setLocation] = useState('your area');
  const [faqs, setFaqs] = useState([
    {
      question: 'What types of items can I find in auctions in {Keyword}?',
      answer:
        'You’ll find a wide range of items, including vehicles, electronics, real estate, collectibles, and more.',
    },
    {
      question: 'Are online auctions in {Keyword} secure?',
      answer:
        'Yes, our platform ensures secure transactions with verified buyers and sellers in {Keyword}.',
    },
    {
      question: 'How do I sell items in auctions in {Keyword}?',
      answer:
        'Simply register as a seller, list your items, and reach thousands of potential buyers in {Keyword}.',
    },
  ]);

  const [expandedIndex, setExpandedIndex] = useState(null);

  // Fetch user location
  useEffect(() => {
    const fetchLocation = async () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
              );
              const data = await response.json();
              const city = data.address.city || 'your city';
              const state = data.address.state || 'your state';
              const country = data.address.country || 'your country';
              setLocation(`${city}, ${state}, ${country}`);
            } catch (error) {
              console.error('Error fetching location:', error);
              setLocation('your area');
            }
          },
          (error) => {
            console.error('Error accessing geolocation:', error);
            setLocation('your area');
          }
        );
      } else {
        console.error('Geolocation is not supported by this browser.');
        setLocation('your area');
      }
    };

    fetchLocation();
  }, []);

  // Handle accordion toggle
  const toggleAccordion = (index) => {
    setExpandedIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-white text-black px-6 py-10 mt-[100px]">
        <h1 className="text-4xl font-bold text-center mb-8">Frequently Asked Questions</h1>
        <div className="max-w-3xl mx-auto space-y-6">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`bg-black text-white rounded-3xl p-4 ${expandedIndex === index ? 'shadow-lg' : 'shadow-md'
                } transition-shadow duration-300`}
            >
              <button
                onClick={() => toggleAccordion(index)}
                className="w-full flex justify-between items-center text-left focus:outline-none"
              >
                <span className="text-lg font-semibold">
                  {faq.question.replace('{Keyword}', location)}
                </span>
                <span className="text-2xl">{expandedIndex === index ? '-' : '+'}</span>
              </button>
              {expandedIndex === index && (
                <p className="text-gray-300 text-base mt-2">
                  {faq.answer.replace('{Keyword}', location)}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default FAQPage;
