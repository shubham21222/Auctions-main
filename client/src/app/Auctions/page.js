import Footer from "../components/Footer"
import Header from "../components/Header"
import { AuctionCard } from "./components/auction-card"
import { AuctionFilters } from "./components/auction-filters"
import { LuxuryBackground } from "./components/luxury-background"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles } from "lucide-react"

// Enhanced sample data
const auctions = [
  {
    id: "2561",
    title: "Hermès Birkin Handbags Collection",
    images: [
      "https://beta.nyelizabeth.com/wp-content/uploads/2025/01/product86c9a806c273e359c2dad3a6a774089b.webp",
      "https://beta.nyelizabeth.com/wp-content/uploads/2025/01/productbc9f3bcb07b6d68f74e100dba8b1fefe.webp",
      "https://beta.nyelizabeth.com/wp-content/uploads/2025/01/product517689e196639046ded814db7a5eca29.webp",
    ],
    endDate: "Feb 1, 2025",
    endTime: "7:00 PM GMT-08:00",
    currentBid: 55000,
    featured: true,
  },
  {
    id: "2562",
    title: "Fine Jewelry Collection",
    images: [
      "https://beta.nyelizabeth.com/wp-content/uploads/2025/01/product612dfd189b8b384cb5fbcf7319435a69.webp",
      "https://beta.nyelizabeth.com/wp-content/uploads/2025/01/productf0cc116dd0ca1729dcaf90f1aee103e8.webp",
      "https://beta.nyelizabeth.com/wp-content/uploads/2025/01/c1-300x300.webp",
    ],
    endDate: "Feb 1, 2025",
    endTime: "9:00 AM GMT-08:00",
    currentBid: 125000,
    featured: true,
  },
]

export default function AuctionCalendar() {
  return (
    <>
    <Header />
      <LuxuryBackground />
      <div className="container relative mx-auto px-4 mt-[100px] py-12">
        <div className="mb-12 text-center">
          <div className="mb-4 flex items-center justify-center gap-2 text-sm font-medium text-luxury-gold">
            <Sparkles className="h-4 w-4" />
            <span>LUXURY AUCTIONS</span>
            <Sparkles className="h-4 w-4" />
          </div>
          <h1 className="mb-4 text-5xl font-bold tracking-tight text-luxury-charcoal">Auction Calendar</h1>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Discover extraordinary pieces from the world's most prestigious collections. Each auction is carefully
            curated to bring you the finest in luxury.
          </p>
        </div>

        <div className="mb-8 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Showing {auctions.length} Exceptional Pieces</span>
          <Select>
            <SelectTrigger className="w-[240px] border-luxury-gold/20">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="title-asc">By title (A-Z)</SelectItem>
              <SelectItem value="title-desc">By title (Z-A)</SelectItem>
              <SelectItem value="price-asc">By price (Low to High)</SelectItem>
              <SelectItem value="price-desc">By price (High to Low)</SelectItem>
              <SelectItem value="date-asc">By date (Newest)</SelectItem>
              <SelectItem value="date-desc">By date (Oldest)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
          <aside className="h-fit rounded-xl border border-luxury-gold/20 bg-white/80 p-6 backdrop-blur-sm">
            <AuctionFilters />
          </aside>
          <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3 ">
            {auctions.map((auction) => (
              <AuctionCard key={auction.id} auction={auction} />
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

