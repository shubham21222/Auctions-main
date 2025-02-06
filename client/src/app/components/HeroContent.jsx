import { FadeInStaggerTwo, FadeInStaggerTwoChildren } from "./FadeInStaggerTwo";
import Link from "next/link";

function HeroContent() {
  return (
    <FadeInStaggerTwo className="flex flex-col items-center justify-center text-center">
      <FadeInStaggerTwoChildren>
        <p className="text-sm sm:text-base md:text-lg font-semibold text-yellow-400 mb-2 sm:mb-4">
          <span>Your trusted auction consultants</span>
        </p>
      </FadeInStaggerTwoChildren>

      <FadeInStaggerTwoChildren>
        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-8">
          Transforming your auctions into
          <span className="relative inline-block pl-2">
            <span className="text-yellow-400">experiences</span>
            <span className="absolute -bottom-1 sm:-bottom-2 left-0 w-full h-1 sm:h-2 bg-yellow-400 rounded-full"></span>
          </span>
        </h1>
      </FadeInStaggerTwoChildren>

      <FadeInStaggerTwoChildren>
        <p className="text-xs sm:text-sm md:text-lg text-gray-200 max-w-2xl mx-auto mb-6 sm:mb-12">
          We&apos;re dedicated to helping you discover and acquire rare, valuable, and unique items. With years of
          expertise in auctions, we provide tailored solutions to meet your collecting and investment needs.
        </p>
      </FadeInStaggerTwoChildren>

      <FadeInStaggerTwoChildren className="flex flex-col md:flex-row gap-2 sm:gap-4">
        <Link
          href="/contact-us"
          className="bg-yellow-400 text-gray-900 font-semibold px-4 sm:px-8 py-2 sm:py-3 rounded-full hover:bg-yellow-500 transition-colors duration-300 text-sm sm:text-base"
        >
          Explore Auctions
        </Link>
        <Link
          href="/portfolio-one"
          className="border-2 border-yellow-400 text-yellow-400 font-semibold px-4 sm:px-8 py-2 sm:py-3 rounded-full hover:bg-yellow-400 hover:text-gray-900 transition-colors duration-300 text-sm sm:text-base"
        >
          Buy now
        </Link>
      </FadeInStaggerTwoChildren>
    </FadeInStaggerTwo>
  );
}

export default HeroContent;