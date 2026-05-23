import Link from "next/link"
import { Package } from "lucide-react"

export default function ProductCard({ product }: { product: any }) {
  return (
    <Link href={`/product/${product.id}`} className="glass-card group overflow-hidden flex flex-col h-full">
      <div className="aspect-square bg-gray-100 dark:bg-zinc-800 relative overflow-hidden">
        {product.images && product.images.length > 0 ? (
          <img 
            src={product.images[0]} 
            alt={product.title} 
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <Package className="w-12 h-12 opacity-50" />
          </div>
        )}
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-bold px-2 py-1 rounded-md shadow-sm border border-gray-100">
          {product.condition.replace('_', ' ').toUpperCase()}
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-blue-600 transition-colors mb-1">
          {product.title}
        </h3>
        <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-4">
          ₹{product.price.toLocaleString('en-IN')}
        </p>
        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-zinc-800 flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 flex items-center justify-center text-[10px] font-bold text-gray-700 dark:text-gray-300">
            {product.profiles?.full_name?.charAt(0) || 'U'}
          </div>
          <span className="text-xs text-gray-500 truncate">{product.profiles?.college_name || 'Verified Student'}</span>
        </div>
      </div>
    </Link>
  )
}
