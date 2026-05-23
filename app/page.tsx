import Link from "next/link";
import { ArrowRight, Book, Monitor, Package, Shirt, Zap } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

export default async function Home() {
  const supabase = createClient();
  
  // Fetch latest active products
  const { data: products } = await supabase
    .from('products')
    .select(`
      *,
      profiles:seller_id (full_name, college_name)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(8);

  const categories = [
    { name: "Textbooks", icon: Book, color: "bg-blue-500", href: "/categories/textbooks" },
    { name: "Electronics", icon: Monitor, color: "bg-purple-500", href: "/categories/electronics" },
    { name: "Dorm Essentials", icon: Package, color: "bg-orange-500", href: "/categories/dorm" },
    { name: "Clothing", icon: Shirt, color: "bg-pink-500", href: "/categories/clothing" },
    { name: "Engineering Tools", icon: Zap, color: "bg-yellow-500", href: "/categories/tools" },
  ];

  return (
    <div className="space-y-16 animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-blue-800 to-blue-900 text-white p-8 md:p-16 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-blue-400 opacity-20 rounded-full blur-2xl"></div>
        
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            Your Campus.<br />
            <span className="text-blue-300">Your Marketplace.</span>
          </h1>
          <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-xl">
            Buy, sell, and trade with verified students at your college. From textbooks to mini-fridges, find it all on CampusCart.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/create" className="px-6 py-3 bg-white text-blue-900 rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all">
              Start Selling
            </Link>
            <Link href="/explore" className="px-6 py-3 bg-blue-800/50 backdrop-blur-sm border border-blue-400/30 text-white rounded-full font-semibold hover:bg-blue-700/50 transition-all">
              Browse Items
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold tracking-tight">Browse Categories</h2>
          <Link href="/categories" className="text-blue-600 font-medium flex items-center gap-1 hover:gap-2 transition-all">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((category) => (
            <Link 
              key={category.name} 
              href={category.href}
              className="glass-card p-6 flex flex-col items-center justify-center gap-3 group"
            >
              <div className={`p-4 rounded-2xl text-white shadow-lg ${category.color} group-hover:scale-110 transition-transform`}>
                <category.icon className="w-6 h-6" />
              </div>
              <span className="font-semibold text-sm text-center">{category.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Recently Added */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold tracking-tight">Recently Added</h2>
        </div>
        
        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link key={product.id} href={`/product/${product.id}`} className="glass-card group overflow-hidden flex flex-col">
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
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-bold px-2 py-1 rounded-md shadow-sm">
                    {product.condition.replace('_', ' ').toUpperCase()}
                  </div>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-blue-600 transition-colors">{product.title}</h3>
                  </div>
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-4">
                    ₹{product.price.toLocaleString('en-IN')}
                  </p>
                  <div className="mt-auto pt-4 border-t border-gray-100 dark:border-zinc-800 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-zinc-700 flex items-center justify-center text-xs font-medium">
                      {product.profiles?.full_name?.charAt(0) || 'U'}
                    </div>
                    <span className="text-xs text-gray-500 truncate">{product.profiles?.college_name || 'Verified Student'}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="glass-card p-12 text-center text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No products listed yet. Be the first to sell!</p>
          </div>
        )}
      </section>
    </div>
  );
}
