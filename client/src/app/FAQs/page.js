'use client';

import Footer from '../components/Footer';
import Header from '../components/Header';
// import Header2 from '@/components/Header2';
import React, { useEffect, useState } from 'react';

const FAQPage = () => {
  const [location, setLocation] = useState('your area');
  const [faqs, setFaqs] = useState([
    {
      question: 'What is NY Elizabeth auction premium?',
      answer: 'The auction premium at NY Elizabeth is 25%.'
    },
    {
      question: 'Where does my item ship from and what is your processing time?',
      answer: 'The shipping origin is stated in each lot’s condition section. Processing takes 7-10 business days, as some items are shipped from other locations to our headquarters before being sent to you. Wooden crate shipments require additional time for custom crate construction.'
    },
    {
      question: 'Do you accept credit cards?',
      answer: 'We accept credit cards for transactions up to $500. Credit cards are not accepted for jewelry and watches.'
    },
    {
      question: 'What forms of payment do you accept?',
      answer: 'We accept bank wire, Zelle, and ACH. Payment instructions are emailed in your invoice after the auction. ACH payments must clear before shipping and are limited to $20,000 per month. For transactions via Live Auctioneers, payments may take two weeks to clear. Credit card ACH payments up to $2,000 per day (max $8,000) can be made via wise.com. Businesses can use Melio for credit card payments up to $10,000 per month. All payments are due within 2 business days.'
    },
    {
      question: 'When do I need to submit a payment after I win a lot(s)?',
      answer: 'All payments are due within 2 business days of the auction.'
    },
    {
      question: 'How can I obtain the tracking number of my goods?',
      answer: 'Once packing is complete and the shipping company sends your items, the tracking number is added to the shipping section of your receipt.'
    },
    {
      question: 'Can I pick my items after payment?',
      answer: 'For security reasons, we no longer offer pick-up services; all items are shipped.'
    },
    {
      question: 'Can I purchase more insurance for my art?',
      answer: 'Yes, email us the desired insurance amount, and we will obtain a quote for you.'
    },
    {
      question: 'How can I cancel a bid I placed on a lot?',
      answer: 'You can cancel a bid via your Live Auctioneers, Bidsquare, or NY Elizabeth dashboard, depending on where it was placed. Contact Live Auctioneers support for assistance. Sold or closed lots cannot be canceled; canceling a won transaction incurs a loss fee per our terms at nyelizabeth.com/terms.'
    },
    {
      question: 'How can I consign items with NY Elizabeth?',
      answer: 'Fill out the application on our website or email hello@nyelizabeth.com with the item description, JPG photos, and any additional information.'
    },
    {
      question: 'Do you ship to a P.O. Box?',
      answer: 'No, we do not ship to P.O. Boxes.'
    },
    {
      question: 'Once I make a payment, how can I confirm receipt?',
      answer: 'You should receive an email confirmation after payment. Bank transfers may take up to 48 hours to reflect in our systems. Contact our billing team for specific questions.'
    },
    {
      question: 'How can I obtain the reserve price of a lot?',
      answer: 'We do not disclose reserve prices to maintain auction integrity. If bidding does not meet the reserve, the item will not be sold.'
    },
    {
      question: 'My request to bid in your auction was declined, how can I get approved?',
      answer: 'If declined due to an unverified account, open dispute, or no payment history, email us via the contact page at nyelizabeth.com with your full name, address, mobile number, identification, catalog, and requested bidding amount. A bank wire deposit or Tier 1/2 membership is required.'
    },
    {
      question: 'Do you offer phone support?',
      answer: 'We provide email support only, as it allows for the fastest and most effective assistance.'
    },
    {
      question: 'Can I request additional pictures?',
      answer: 'Due to the volume of auctions, we no longer offer additional images. If the provided images are insufficient for bidding, we recommend not participating in that lot. Clicking an image enlarges it for higher resolution.'
    },
    {
      question: 'What bidding strategies can I use?',
      answer: 'You can use Absentee Bidding, placing a maximum bid before the auction, which increases only as needed to keep you in the lead, or Live Bidding, where you bid during the auction via the bidding console.'
    },
    {
      question: 'Do you have an internet surcharge?',
      answer: 'A 3% surcharge applies for bids won via Live Auctioneers, Invaluable, Bidsquare, Lot-tissimo, and The Saleroom. There is no surcharge for bidding directly with NY Elizabeth.'
    },
    {
      question: 'How do I become a member with NY Elizabeth?',
      answer: 'We offer Tier 1 ($120/year, $5,000 bid limit, jewelry/handbag offers) and Tier 2 ($480/year, $25,000 bid limit, up to 12 monthly authenticity/insurance PDFs, offers for all categories). Membership is by invitation only.'
    },
    {
      question: 'Can we see the certificate of the watch?',
      answer: 'We do not share watch certificates, as they contain the serial number.'
    },
    {
      question: 'I’m a dealer and have a resale certificate. What should I do?',
      answer: 'Email a PDF copy of your resale certificate and identification card to hello@nyelizabeth.com before the auction for approval.'
    },
    {
      question: 'Can you remove a painting’s frame and measure the canvas only?',
      answer: 'We do not remove frames to measure canvases. Certain private sales or high-priced paintings may include both canvas and frame measurements.'
    },
    {
      question: 'Why do I see an artwork that was sold back in the auction?',
      answer: 'This may occur if payment was not received, the reserve was not met and sold to the floor, or a dealer purchased and chose to re-list it.'
    },
    {
      question: 'Could there be a delay for my vehicle, which I won and paid for, to ship to me?',
      answer: 'Yes, certain vehicles may require a CHP safety inspection, taking 8–12 weeks if shipped within the United States.'
    },
    {
      question: 'Are your vehicle descriptions accurate?',
      answer: 'Vehicle descriptions are accurate to the best of our knowledge at posting, but not guaranteed. We assume no liability for omissions or errors.'
    },
    {
      question: 'I reside in California and am looking to bid on a vehicle in your auction. Can I bid?',
      answer: 'California residents should contact hello@nyelizabeth.com with the vehicle link so we can verify if it will pass CA smog requirements.'
    },
    {
      question: 'I placed an absentee bid, and it says reserve not met. What does this mean?',
      answer: 'Consigners may adjust reserve prices. Only bids during the live auction when the hammer falls determine the winner.'
    },
    {
      question: 'What is the definition of Art Attribution?',
      answer: 'Art attributions include: “Attributed to [Artist]” (likely by the artist, less certainty), “Studio of [Artist]” (by an unknown hand in the studio), “Circle of [Artist]” (by an unidentified hand closely associated), “Style of or Follower of [Artist]” (in the artist’s style, contemporary), “Manner of [Artist]” (later style imitation), “After [Artist]” (copy of a known work). “Signed/dated/inscribed” implies the artist’s hand; “bears a signature/date/inscription” implies added by another.'
    },
    {
      question: 'Are all live auction bids binding, even if they were accidental?',
      answer: 'Yes, all live auction bids are binding, including accidental ones. Clients are responsible for device security during auctions.'
    },
    {
      question: 'What happens if my child, pet, or someone else places a bid on my device?',
      answer: 'You are fully responsible for any bids placed through your account, even by children, pets, or others. Ensure your device is secure during live auctions.'
    },
    {
      question: 'Can I cancel an accidental live bid?',
      answer: 'No, live bids cannot be canceled under any circumstances. They are final and binding.'
    },
    {
      question: 'What should I do if I realize I’ve accidentally placed a bid?',
      answer: 'Accidental live bids cannot be undone. If you win, you must complete the purchase per NY Elizabeth’s terms.'
    },
    {
      question: 'Can I cancel an accidental absentee bid?',
      answer: 'Yes, accidental absentee bids can be canceled up to 48 hours before the auction begins.'
    },
    {
      question: 'How can I cancel an absentee bid?',
      answer: 'Log in to your account, go to your dashboard, select the lot, locate your absentee bid, and follow the prompts to cancel before the 48-hour deadline.'
    },
    {
      question: 'What steps can I take to avoid accidental bids?',
      answer: 'Double-check bids before confirming, secure your device, and familiarize yourself with the platform’s interface. No exceptions are made for accidental live bids. Nonpayment incurs a $1,450 legal fee, cancellation fee, and $75 administrative fee. Contact hello@nyelizabeth.com for further questions.'
    }
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
