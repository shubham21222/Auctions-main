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
    url: "https://nyelizabeth.com",
    siteName: "NY Elizabeth",
    images: [
      {
        url: "https://beta.nyelizabeth.com/wp-content/uploads/2024/05/Rectangle.svg",
        width: 800,
        height: 600,
        alt: "NY Elizabeth Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NY Elizabeth - Luxury Auctions & Antiques",
    description: "Discover unique treasures and luxury items through our curated auctions. NY Elizabeth brings you the finest antiques, collectibles, and exclusive pieces.",
    images: ["https://beta.nyelizabeth.com/wp-content/uploads/2024/05/Rectangle.svg"],
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  icons: {
    icon: "https://beta.nyelizabeth.com/wp-content/uploads/2024/05/Rectangle.svg",
    shortcut: "https://beta.nyelizabeth.com/wp-content/uploads/2024/05/Rectangle.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <ReduxProvider>
        <SocketProvider>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {children}
          {/* Add the Toaster component here */}
          <Toaster />
        </body>
        </SocketProvider>
      </ReduxProvider>
    </html>
  );
}