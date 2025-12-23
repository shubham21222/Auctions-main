import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ReduxProvider from "@/redux/provider";
import { Toaster } from "react-hot-toast"; // Import the Toaster component
import { SocketProvider } from "@/context/SocketContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "NY Elizabeth - Luxury Auctions & Antiques",
  description: "Discover unique treasures and luxury items through our curated auctions. NY Elizabeth brings you the finest antiques, collectibles, and exclusive pieces.",
  keywords: "auctions, antiques, luxury items, collectibles, NY Elizabeth, online auctions, vintage items",
  authors: [{ name: "NY Elizabeth" }],
  openGraph: {
    title: "NY Elizabeth - Luxury Auctions & Antiques",
    description: "Discover unique treasures and luxury items through our curated auctions. NY Elizabeth brings you the finest antiques, collectibles, and exclusive pieces.",
    url: "http://bid.nyelizabeth.com/",
    siteName: "NY Elizabeth",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ReduxProvider>
          <SocketProvider>
            {children}
            <Toaster />
          </SocketProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}