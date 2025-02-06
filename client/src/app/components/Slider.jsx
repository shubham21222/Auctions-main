// components/Carousel.js
'use client'
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const images = [
  {
    image: 'https://i.ibb.co/qCkd9jS/img1.jpg',
    name: 'Switzerland',
    description: 'X-Dev, Transforming code into visual poetry..!',
  },
  {
    image: 'https://i.ibb.co/jrRb11q/img2.jpg',
    name: 'Finland',
    description: 'X-Dev, Transforming code into visual poetry..!',
  },
  {
    image: 'https://i.ibb.co/NSwVv8D/img3.jpg',
    name: 'Iceland',
    description: 'X-Dev, Transforming code into visual poetry..!',
  },
  {
    image: 'https://i.ibb.co/Bq4Q0M8/img4.jpg',
    name: 'Australia',
    description: 'X-Dev, Transforming code into visual poetry..!',
  },
  {
    image: 'https://i.ibb.co/jTQfmTq/img5.jpg',
    name: 'Netherland',
    description: 'X-Dev, Transforming code into visual poetry..!',
  },
  {
    image: 'https://i.ibb.co/RNkk6L0/img6.jpg',
    name: 'Ireland',
    description: 'X-Dev, Transforming code into visual poetry..!',
  },
];

const Carousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5 }}
          className="absolute w-full h-full flex items-center justify-center"
        >
          <img
            src={images[currentIndex].image}
            alt={images[currentIndex].name}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-10 left-10 text-white">
            <h2 className="text-4xl font-bold">{images[currentIndex].name}</h2>
            <p className="text-xl">{images[currentIndex].description}</p>
          </div>
        </motion.div>
      </AnimatePresence>

      <button
        onClick={prevSlide}
        className="absolute left-5 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
      >
        &lt;
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-5 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
      >
        &gt;
      </button>
    </div>
  );
};

export default Carousel;