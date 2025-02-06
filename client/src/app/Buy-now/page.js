import Footer from "../components/Footer"
import Header from "../components/Header"
import { CategoryNav } from "./components/category-nav"
import { Filters } from "./components/filters"
import { ProductCard } from "./components/product-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SlidersHorizontal } from "lucide-react"

const products = [
  {
    image: "https://beta.nyelizabeth.com/wp-content/uploads/2025/01/product4ccd551f28184638f7c306b6172c7158.webp",
    name: "Hermès Kelly Picnic Mini",
    price: 45807,
    slug: "hermes-kelly-picnic-mini-swift-willow-blue-du-nord-silver-metal-fittings", // Unique slug for this product
  },
  {
    image: "https://beta.nyelizabeth.com/wp-content/uploads/2025/01/product612dfd189b8b384cb5fbcf7319435a69.webp",
    name: "Cartier Love Pavé",
    price: 32355,
    slug: "cartier-love-pave-diamond-bracelet-750-yg", // Unique slug for this product
  },
  {
    image: "https://beta.nyelizabeth.com/wp-content/uploads/2025/01/productf0cc116dd0ca1729dcaf90f1aee103e8.webp",
    name: "Tiffany Jean Schlumberger",
    price: 32554,
    slug: "tiffany-jean-schlumberger-apollo-diamond-brooch", // Unique slug for this product
  },
];

export default function Home() {
  return (
    <>
    <Header />
    <main className="min-h-screen bg-gradient-to-br from-gray-50 pt-[80px] to-gray-100">
      <div className="container mx-auto px-6 py-12">
        {/* <CategoryNav /> */}

        <div className="mt-4 flex flex-col md:flex-row gap-8">
          <aside className="w-full md:w-72 shrink-0">
            <Filters />
          </aside>

          <div className="flex-1 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Featured Products
              </h2>

              <div className="flex items-center gap-4">
                <SlidersHorizontal className="w-5 h-5 text-gray-400" />
                <Select defaultValue="featured">
                  <SelectTrigger className="w-[200px] rounded-xl ">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product, index) => (
                <ProductCard key={index} {...product} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
    <Footer />
    </>
  )
}

