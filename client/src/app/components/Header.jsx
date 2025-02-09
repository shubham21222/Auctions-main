'use client';
import React, { useState, useEffect } from "react";
import TopBar from "./TopBar";
import MainHeader from "./MainHeader";
import LoginModal from './LoginModal';
import SignupModal from "./SignupModal";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchBar, setShowSearchBar] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery);
      // You can redirect or trigger a search API here
    }
  };

  return (
    <>
      <TopBar  setShowLoginModal={setShowLoginModal} // Pass this prop
        setShowSignupModal={setShowSignupModal} />
      <MainHeader
        isScrolled={isScrolled}
        isMobile={isMobile}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        showSearchBar={showSearchBar}
        setShowSearchBar={setShowSearchBar}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearch}
        setShowLoginModal={setShowLoginModal} // Pass this prop
        setShowSignupModal={setShowSignupModal} // Pass this prop
      />
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      <SignupModal isOpen={showSignupModal} onClose={() => setShowSignupModal(false)} />
    </>
  );
};

export default Header;