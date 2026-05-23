import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Settings, Package, Heart, CheckCircle, Clock, Lock } from "lucide-react"
import ProductCard from "@/components/ProductCard"
import LogoutButton from "./LogoutButton"

export default async function Dashboard() {
  const supabase = createClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/login')
  }

  // Fetch Profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  // Fetch My Listings
  const { data: myListings } = await supabase
    .from('products')
    .select('*, profiles:seller_id(full_name, college_name)')
    .eq('seller_id', session.user.id)
    .order('created_at', { ascending: false })

  // Active vs Sold listings
  const activeListings = myListings?.filter(p => p.status === 'active') || []
  const soldListings = myListings?.filter(p => p.status === 'sold') || []

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your listings, profile, and activities.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/create" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-sm">
            New Listing
          </Link>
          <LogoutButton />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Sidebar */}
        <div className="md:col-span-1 space-y-6">
          <div className="glass-card p-6 text-center">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                profile?.full_name?.charAt(0) || "U"
              )}
            </div>
            <h2 className="text-xl font-bold">{profile?.full_name}</h2>
            <p className="text-sm text-gray-500 mb-2">{profile?.college_name}</p>
            {profile?.is_admin && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold mb-4">
                Admin Access
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 border-t border-gray-100 dark:border-zinc-800 pt-6">
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{activeListings.length}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Active</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{soldListings.length}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Sold</div>
              </div>
            </div>
          </div>

          <div className="glass-card overflow-hidden">
            <Link href="/dashboard/settings" className="flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors border-b border-gray-100 dark:border-zinc-800">
              <Settings className="w-5 h-5 text-gray-400" />
              <span className="font-medium">Profile Settings</span>
            </Link>
            {profile?.is_admin && (
              <Link href="/admin" className="flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors border-b border-gray-100 dark:border-zinc-800">
                <Lock className="w-5 h-5 text-gray-400" />
                <span className="font-medium">Admin Panel</span>
              </Link>
            )}
            <Link href="/chat" className="flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
              <Heart className="w-5 h-5 text-gray-400" />
              <span className="font-medium">Saved Items</span>
            </Link>
          </div>
        </div>

        {/* Main Content (Listings) */}
        <div className="md:col-span-2 space-y-8">
          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              Active Listings
            </h2>
            {activeListings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {activeListings.map(listing => (
                  <ProductCard key={listing.id} product={listing} />
                ))}
              </div>
            ) : (
              <div className="glass-card p-12 text-center text-gray-500 border border-dashed border-gray-300 dark:border-zinc-700">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>You have no active listings.</p>
                <Link href="/create" className="text-blue-600 font-medium hover:underline mt-2 inline-block">
                  Create your first listing
                </Link>
              </div>
            )}
          </section>

          {soldListings.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Sold Listings
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 opacity-75 grayscale hover:grayscale-0 transition-all duration-500">
                {soldListings.map(listing => (
                  <ProductCard key={listing.id} product={listing} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
