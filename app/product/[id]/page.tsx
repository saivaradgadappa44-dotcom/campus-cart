import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"
import ImageGallery from "./ImageGallery"
import ActionButtons from "./ActionButtons"
import { timeAgo } from "@/lib/utils"
import { MapPin, ShieldCheck, Clock, User } from "lucide-react"

export default async function ProductPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  
  const { data: product } = await supabase
    .from('products')
    .select(`
      *,
      profiles:seller_id (id, full_name, college_name, avatar_url, created_at),
      categories:category_id (name)
    `)
    .eq('id', params.id)
    .single()

  if (!product) {
    notFound()
  }

  // Get current user to see if they are the seller
  const { data: { session } } = await supabase.auth.getSession()
  const isOwner = session?.user?.id === product.seller_id

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Images */}
        <div className="space-y-4">
          <ImageGallery images={product.images} />
        </div>

        {/* Right: Details */}
        <div className="space-y-8">
          <div className="space-y-4 border-b border-gray-100 dark:border-zinc-800 pb-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">
                  {product.categories?.name}
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {product.title}
                </h1>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-zinc-800 px-3 py-1 rounded-full">
                <Clock className="w-4 h-4" />
                <span>Listed {timeAgo(product.created_at)}</span>
              </div>
              <div className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 px-3 py-1 rounded-full font-medium capitalize border border-blue-100 dark:border-blue-800">
                Condition: {product.condition.replace('_', ' ')}
              </div>
            </div>

            <div className="text-4xl font-extrabold text-gray-900 dark:text-white py-2">
              ₹{product.price.toLocaleString('en-IN')}
            </div>
          </div>

          <div className="space-y-4 border-b border-gray-100 dark:border-zinc-800 pb-6">
            <h2 className="text-xl font-semibold">Description</h2>
            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="glass-card p-6 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-green-500" />
              Seller Information
            </h2>
            
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold overflow-hidden">
                {product.profiles?.avatar_url ? (
                  <img src={product.profiles.avatar_url} alt={product.profiles.full_name} className="w-full h-full object-cover" />
                ) : (
                  product.profiles?.full_name?.charAt(0) || <User />
                )}
              </div>
              
              <div className="flex-1">
                <h3 className="font-bold text-lg">{product.profiles?.full_name}</h3>
                <div className="flex items-center gap-1 text-gray-500 text-sm">
                  <MapPin className="w-4 h-4" />
                  {product.profiles?.college_name || 'Verified College Student'}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Member since {new Date(product.profiles?.created_at).getFullYear()}
                </div>
              </div>
            </div>
          </div>

          <div className="sticky bottom-4 z-10 pt-4">
            <ActionButtons 
              productId={product.id} 
              sellerId={product.seller_id}
              isOwner={isOwner} 
              status={product.status}
              sessionExists={!!session}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
