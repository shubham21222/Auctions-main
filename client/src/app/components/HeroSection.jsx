"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Timer,
  Gavel,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const AuctionHero = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  // Refs for GSAP animations
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const titleSpanRef = useRef(null);
  const statsRef = useRef(null);
  const carouselRef = useRef(null);
  const badgeRef = useRef(null);

  const featuredAuctions = [
    {
      title: "Rare Vintage Rolex Daytona",
      description: "1960s collector's timepiece in pristine condition",
      currentBid: "$125,000",
      timeLeft: "2h 15m",
      image:
        "https://p1.liveauctioneers.com/6177/359048/196659420_1_x.jpg?quality=1&version=1736800629&width=486",
    },
    {
      title: "Original Banksy Artwork",
      description: "Authenticated street art piece with provenance",
      currentBid: "$450,000",
      timeLeft: "4h 30m",
      image:
        "https://p1.liveauctioneers.com/6177/359796/197222495_1_x.jpg?quality=1&version=1737394813&width=486",
    },
    {
      title: "1967 Ferrari 275 GTB/4",
      description: "Fully restored classic in Rosso Corsa",
      currentBid: "$2,750,000",
      timeLeft: "1h 45m",
      image:
        "https://p1.liveauctioneers.com/6177/359796/197222496_1_x.jpg?quality=1&version=1737394813&width=486",
    },
  ];

  useEffect(() => {
    // Initial animation timeline
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(heroRef.current, { opacity: 0 }, { opacity: 1, duration: 1 })
      .fromTo(
        badgeRef.current,
        { y: -50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 }
      )
      .fromTo(
        titleRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 }
      )
      .fromTo(
        titleSpanRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        "-=0.6"
      )
      .fromTo(
        ".hero-description",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        "-=0.4"
      )
      .fromTo(
        statsRef.current.children,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1 },
        "-=0.4"
      )
      .fromTo(
        ".cta-button",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1 },
        "-=0.2"
      )
      .fromTo(
        carouselRef.current,
        { x: 100, opacity: 0 },
        { x: 0, opacity: 1, duration: 1, ease: "power2.out" },
        "-=0.8"
      );

    // Continuous gradient animation for the title
    gsap.to(".animate-gradient-text", {
      backgroundPosition: "200% center",
      duration: 5,
      repeat: -1,
      ease: "none",
    });

    // Stats counter animation
    const statElements = document.querySelectorAll(".stat-number");
    statElements.forEach((stat) => {
      const value = parseInt(stat.getAttribute("data-value"));
      gsap.from(stat, {
        innerText: 0,
        duration: 2,
        snap: { innerText: 1 },
        scrollTrigger: {
          trigger: stat,
          start: "top center",
        },
        onUpdate: function () {
          stat.innerText = Math.ceil(
            this.targets()[0].innerText
          ).toLocaleString();
          if (stat.getAttribute("data-suffix")) {
            stat.innerText += stat.getAttribute("data-suffix");
          }
        },
      });
    });

    // Parallax effect on scroll
    gsap.to(".parallax-bg", {
      yPercent: 30,
      ease: "none",
      scrollTrigger: {
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });

    // Cleanup function
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  // Carousel and interaction logic remains the same
  useEffect(() => {
    if (!isHovering) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % featuredAuctions.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [isHovering]);

  const nextSlide = () => {
    gsap.to(carouselRef.current, {
      opacity: 0,
      x: -20,
      duration: 0.3,
      onComplete: () => {
        setCurrentIndex((prev) => (prev + 1) % featuredAuctions.length);
        gsap.fromTo(
          carouselRef.current,
          { opacity: 0, x: 20 },
          { opacity: 1, x: 0, duration: 0.3 }
        );
      },
    });
  };

  const prevSlide = () => {
    gsap.to(carouselRef.current, {
      opacity: 0,
      x: 20,
      duration: 0.3,
      onComplete: () => {
        setCurrentIndex(
          (prev) =>
            (prev - 1 + featuredAuctions.length) % featuredAuctions.length
        );
        gsap.fromTo(
          carouselRef.current,
          { opacity: 0, x: -20 },
          { opacity: 1, x: 0, duration: 0.3 }
        );
      },
    });
  };

  return (
    <div
      ref={heroRef}
      className="relative min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden"
    >
      {/* Animated Background */}
      <div className="parallax-bg absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(76,29,149,0.1),rgba(0,0,0,0.1))]"></div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-7xl mt-[100px] mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div
                ref={badgeRef}
                className="inline-block px-4 py-2 bg-purple-600/20 rounded-full text-purple-400 text-sm font-semibold mb-4"
              >
                Premium Auctions Live Now
              </div>
              <h1 ref={titleRef} className="text-5xl font-bold leading-tight">
                Discover
                <span
                  ref={titleSpanRef}
                  className="block text-6xl animate-gradient-text"
                  style={{
                    backgroundImage:
                      "linear-gradient(to right, #A78BFA, #EC4899, #EF4444, #A78BFA)",
                    backgroundSize: "200% auto",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  Extraordinary Treasures
                </span>
              </h1>
              <p className="hero-description text-xl text-gray-300">
                Where exceptional items find their perfect match. Join elite
                collectors in bidding on the world's most coveted pieces.
              </p>
            </div>

            {/* Live Stats */}
            <div ref={statsRef} className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-white/5 rounded-xl backdrop-blur-lg border border-white/10 hover:border-purple-500/50 transition-all duration-300">
                <Gavel className="w-6 h-6 text-purple-400 mb-2" />
                <div className="text-2xl font-bold">
                  <span
                    className="stat-number"
                    data-value="1000"
                    data-suffix="+"
                  >
                    0
                  </span>
                </div>
                <div className="text-sm text-gray-400">Active Auctions</div>
              </div>
              <div className="p-4 bg-white/5 rounded-xl backdrop-blur-lg border border-white/10 hover:border-purple-500/50 transition-all duration-300">
                <TrendingUp className="w-6 h-6 text-purple-400 mb-2" />
                <div className="text-2xl font-bold">
                  <span
                    className="stat-number"
                    data-value="50000"
                    data-suffix="+"
                  >
                    0
                  </span>
                </div>
                <div className="text-sm text-gray-400">Registered Bidders</div>
              </div>
              <div className="p-4 bg-white/5 rounded-xl backdrop-blur-lg border border-white/10 hover:border-purple-500/50 transition-all duration-300">
                <Timer className="w-6 h-6 text-purple-400 mb-2" />
                <div className="text-2xl font-bold">
                  <span
                    className="stat-number"
                    data-value="24"
                    data-suffix="/7"
                  >
                    0
                  </span>
                </div>
                <div className="text-sm text-gray-400">Live Bidding</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-4">
              <button className="cta-button group px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold transition-all hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25">
                Start Bidding
                <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">
                  →
                </span>
              </button>
              <button className="cta-button px-8 py-3 border border-white/20 hover:bg-white/10 rounded-lg font-semibold transition-all hover:border-purple-500/50">
                Explore Auctions
              </button>
            </div>
          </div>

          {/* Right Column - Enhanced Carousel */}
          <div
            ref={carouselRef}
            className="relative overflow-hidden rounded-2xl group"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            {/* Featured Items Carousel */}
            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden">
              <div
                className="absolute inset-0 transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                <div className="flex">
                  {featuredAuctions.map((auction, index) => (
                    <div key={index} className="relative min-w-full">
                      <img
                        src={auction.image}
                        alt={auction.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                        <div className="absolute bottom-0 left-0 right-0 p-8">
                          <h3 className="text-3xl font-bold mb-2">
                            {auction.title}
                          </h3>
                          <p className="text-gray-300 mb-4">
                            {auction.description}
                          </p>
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="text-sm text-gray-300">
                                Current Bid
                              </div>
                              <div className="text-2xl font-bold text-purple-400">
                                {auction.currentBid}
                              </div>
                            </div>
                            <div className="bg-black/40 px-6 py-3 rounded-lg backdrop-blur-sm">
                              <Timer className="inline-block w-5 h-5 mr-2 text-purple-400" />
                              {auction.timeLeft}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Progress Indicators */}
              <div className="absolute bottom-4 right-4 flex gap-2">
                {featuredAuctions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-12 h-1 rounded-full transition-all ${
                      index === currentIndex
                        ? "bg-purple-500 w-16"
                        : "bg-white/30 hover:bg-white/50"
                    }`}
                    className={`w-12 h-1 rounded-full transition-all ${
                      index === currentIndex
                        ? "bg-purple-500 w-16"
                        : "bg-white/30 hover:bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionHero;
