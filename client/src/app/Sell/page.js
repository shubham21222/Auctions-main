import { Button } from '@/components/ui/button';
import { Check, Image as ImageIcon, Search } from 'lucide-react';
import Footer from '../components/Footer';
import Header from '../components/Header';
import Link from 'next/link';

const HowItWorks = () => {
  return (
    <>
      <Header />
      <div className="flex flex-col items-center px-4 mt-[80px] py-12 md:px-12">
        <h2 className="text-xl font-semibold md:text-2xl">Sell with NY Elizabeth</h2>
        <Link href="/seller-products">
        <Button className="mt-4 bg-blue-900 text-white px-6 py-2 rounded-md shadow-md hover:bg-blue-800 transition-all duration-300 hover:scale-105">
          START SELLING
        </Button>
        </Link>
        <p className="mt-2 text-sm text-gray-600">
          Looking for items you already submitted?{' '}
          <span className="text-blue-600 cursor-pointer hover:text-blue-800 transition-colors duration-300">
            Click here
          </span>
        </p>

        <div className="mt-12 text-center">
          <h3 className="text-2xl font-bold">How it Works</h3>
          <p className="mt-2 text-sm text-gray-500 font-semibold">
            <span className="font-bold">Disclaimer:</span> Preliminary estimates may be subject to change upon inspection of the item
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3 w-full max-w-5xl">
          <div className="flex flex-col items-center p-6 bg-white shadow-lg rounded-xl hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
            <Search className="w-12 h-12 text-blue-900" />
            <h4 className="mt-4 text-lg font-semibold">Tell us about your Item</h4>
            <p className="text-center text-gray-600">Add dimensions, history and any documentation</p>
          </div>

          <div className="flex flex-col items-center p-6 bg-white shadow-lg rounded-xl hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
            <ImageIcon className="w-12 h-12 text-blue-900" />
            <h4 className="mt-4 text-lg font-semibold">Upload Photos</h4>
            <p className="text-center text-gray-600">Take front and back images of your item</p>
          </div>

          <div className="flex flex-col items-center p-6 bg-white shadow-lg rounded-xl hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
            <Check className="w-12 h-12 text-blue-900" />
            <h4 className="mt-4 text-lg font-semibold">Review and Submit</h4>
            <p className="text-center text-gray-600">All set! Our specialists will review your submission</p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default HowItWorks;