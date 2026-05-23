import { createClient } from "@/utils/supabase/server"
import Link from "next/link"
import { Search, Filter, Package } from "lucide-react"
import ProductCard from "@/components/ProductCard"

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const supabase = createClient()
  
  const query = typeof searchParams.q === 'string' ? searchParams.q : ''
  const category = typeof searchParams.category === 'string' ? searchParams.category : 'all'

  // Fetch categories for filter
  const { data: categories } = await supabase.from('categories').select('*').order('name')

  // Build products query
  let productsQuery = supabase
    .from('products')
    .select(`
      *,
      profiles:seller_id (full_name, college_name)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (query) {
    productsQuery = productsQuery.ilike('title', `%${query}%`)
  }
  
  if (category && category !== 'all') {
    productsQuery = productsQuery.eq('category_id', category)
  }

  const { data: products } = await productsQuery

  return (
    <div className="animate-fade-in flex flex-col md:flex-row gap-8">
      {/* Sidebar Filters */}
      <div className="w-full md:w-64 flex-shrink-0 space-y-6">
        <div className="glass-card p-6 sticky top-24">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">Categories</h3>
              <div className="space-y-2 flex flex-col">
                <Link 
                  href={`/explore${query ? `?q=${query}` : ''}`}
                  className={`text-sm py-1.5 px-3 rounded-lg transition-colors ${
                    category === 'all' 
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 font-medium' 
                      : 'hover:bg-gray-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  All Categories
                </Link>
                {categories?.map((cat) => (
                  <Link 
                    key={cat.id}
                    href={`/explore?category=${cat.id}${query ? `&q=${query}` : ''}`}
                    className={`text-sm py-1.5 px-3 rounded-lg transition-colors ${
                      category === cat.id 
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 font-medium' 
                        : 'hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
            
            {/* Add more filters here (Price, Condition, etc.) */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Explore</h1>
          
          {/* Search Bar */}
          <form className="relative w-full sm:w-72" action="/explore" method="GET">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
            />
            {category !== 'all' && <input type="hidden" name="category" value={category} />}
          </form>
        </div>

        {query && (
          <p className="text-gray-500">
            Showing results for <span className="font-semibold text-gray-900 dark:text-white">"{query}"</span>
          </p>
        )}

        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="glass-card p-12 text-center text-gray-500 flex flex-col items-center justify-center min-h-[400px]">
            <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No products found</h3>
            <p>Try adjusting your search or filters.</p>
            {(query || category !== 'all') && (
              <Link href="/explore" className="mt-6 text-blue-600 font-medium hover:underline">
                Clear all filters
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
