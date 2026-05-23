import Link from "next/link"
import { createClient } from "@/utils/supabase/server"
import { ArrowRight, Book, Monitor, Package, Shirt, Zap } from "lucide-react"

export default async function CategoriesPage() {
  const supabase = createClient()
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  const categoryCards = categories?.map((category) => ({
    name: category.name,
    slug: category.slug,
    color: category.slug === 'textbooks' ? 'bg-blue-500' :
           category.slug === 'electronics' ? 'bg-purple-500' :
           category.slug === 'dorm' ? 'bg-orange-500' :
           category.slug === 'clothing' ? 'bg-pink-500' :
           category.slug === 'tools' ? 'bg-yellow-500' :
           'bg-slate-500',
    icon: category.slug === 'textbooks' ? Book :
          category.slug === 'electronics' ? Monitor :
          category.slug === 'dorm' ? Package :
          category.slug === 'clothing' ? Shirt :
          Zap,
  })) || []

  return (
    <div className="space-y-12 animate-fade-in">
      <div className="glass-card p-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">All Categories</h1>
            <p className="text-gray-500 mt-2">Browse by category and view all available listings for each group.</p>
          </div>
          <Link href="/explore" className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors">
            Browse all listings
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {categoryCards.length > 0 ? (
          categoryCards.map((category) => (
            <Link
              key={category.slug}
              href={`/categories/${category.slug}`}
              className="glass-card p-6 flex flex-col items-center justify-center gap-4 text-center transition-transform hover:-translate-y-1"
            >
              <div className={`p-4 rounded-3xl text-white shadow-lg ${category.color}`}>
                <category.icon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">{category.name}</h2>
                <p className="text-sm text-gray-500">View listed items in this category.</p>
              </div>
            </Link>
          ))
        ) : (
          <div className="glass-card p-8 text-center text-gray-500">
            No categories found. <Link href="/explore" className="text-blue-600 hover:underline">Browse all items</Link> instead.
          </div>
        )}
      </div>
    </div>
  )
}
