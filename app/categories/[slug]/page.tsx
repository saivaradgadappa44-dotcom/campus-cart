import Link from "next/link"
import { createClient } from "@/utils/supabase/server"

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const supabase = createClient()

  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (!category) {
    return (
      <div className="glass-card p-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Category not found</h1>
        <p className="text-gray-500">The category you are looking for does not exist.</p>
        <Link href="/categories" className="mt-4 inline-block text-blue-600 hover:underline">Back to categories</Link>
      </div>
    )
  }

  const { data: products } = await supabase
    .from('products')
    .select(`*, profiles:seller_id (full_name, college_name)`)
    .eq('category_id', category.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="glass-card p-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{category.name}</h1>
            <p className="text-gray-500 mt-2">Showing active listings for this category.</p>
          </div>
          <Link href="/categories" className="text-blue-600 hover:underline">Back to categories</Link>
        </div>
      </div>

      {products && products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              className="glass-card overflow-hidden group"
            >
              <div className="aspect-square bg-gray-100 dark:bg-zinc-800 relative overflow-hidden">
                {product.images?.length ? (
                  <img src={product.images[0]} alt={product.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
                )}
              </div>
              <div className="p-4">
                <h2 className="font-semibold text-lg line-clamp-1 group-hover:text-blue-600 transition-colors">{product.title}</h2>
                <p className="mt-2 text-xl font-bold text-blue-600">₹{Number(product.price).toLocaleString('en-IN')}</p>
                <p className="mt-3 text-sm text-gray-500 line-clamp-2">{product.description}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="glass-card p-12 text-center text-gray-500">
          <p>No active listings found in this category yet.</p>
          <Link href="/explore" className="mt-4 inline-block text-blue-600 hover:underline">Browse all listings</Link>
        </div>
      )}
    </div>
  )
}
