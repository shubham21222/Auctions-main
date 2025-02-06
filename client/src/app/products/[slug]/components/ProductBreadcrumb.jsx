import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductBreadcrumb({ isLoading, product }) {
    return (
        <div className="container mx-auto px-4 py-4 text-sm">
            <nav className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors">
                <Link href="/" className="hover:text-blue-600 transition-colors">
                    Home
                </Link>
                <span>/</span>
                <Link href="/fashion" className="hover:text-blue-600 transition-colors">
                    Fashion
                </Link>
                <span>/</span>
                <span className="truncate font-medium text-gray-800">
                    {isLoading ? <Skeleton className="w-40 h-4" /> : product.name}
                </span>
            </nav>
        </div>
    );
}