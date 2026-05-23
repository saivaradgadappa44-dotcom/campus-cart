"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { MessageCircle, Heart, Edit, Trash2, CheckCircle, Loader2 } from "lucide-react"

type ActionButtonsProps = {
  productId: string
  sellerId: string
  isOwner: boolean
  status: string
  sessionExists: boolean
}

export default function ActionButtons({ productId, sellerId, isOwner, status, sessionExists }: ActionButtonsProps) {
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false) // Note: In a real app, initialize this from DB
  const router = useRouter()
  const supabase = createClient()

  const handleMessage = async () => {
    if (!sessionExists) {
      router.push(`/login?redirect_to=/product/${productId}`)
      return
    }
    
    setLoading(true)
    // Create or find chat
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    // Check if chat exists
    let { data: chat } = await supabase
      .from('chats')
      .select('id')
      .eq('product_id', productId)
      .eq('buyer_id', session.user.id)
      .single()

    if (!chat) {
      // Create new chat
      const { data: newChat, error } = await supabase
        .from('chats')
        .insert({
          product_id: productId,
          buyer_id: session.user.id,
          seller_id: sellerId,
        })
        .select('id')
        .single()
        
      if (!error && newChat) chat = newChat
    }

    setLoading(false)
    if (chat) {
      router.push(`/chat/${chat.id}`)
    }
  }

  const toggleSave = async () => {
    if (!sessionExists) {
      router.push(`/login?redirect_to=/product/${productId}`)
      return
    }
    setSaved(!saved)
    // Add real DB save logic here
  }

  const markAsSold = async () => {
    setLoading(true)
    await supabase.from('products').update({ status: 'sold' }).eq('id', productId)
    setLoading(false)
    router.refresh()
  }

  const deleteListing = async () => {
    if (confirm("Are you sure you want to delete this listing?")) {
      setLoading(true)
      await supabase.from('products').delete().eq('id', productId)
      setLoading(false)
      router.push('/dashboard')
    }
  }

  const undoSold = async () => {
    setLoading(true)
    await supabase.from('products').update({ status: 'active' }).eq('id', productId)
    setLoading(false)
    router.refresh()
  }

  if (status === 'sold') {
    return (
      <div className="flex flex-col gap-3">
        <div className="w-full bg-gray-100 dark:bg-zinc-800 text-gray-500 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 border border-gray-200 dark:border-zinc-700 shadow-sm">
          <CheckCircle className="w-5 h-5" />
          This item has been sold
        </div>
        {isOwner && (
          <button
            onClick={undoSold}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg shadow-blue-600/20 transition-all flex justify-center items-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Undo Sold</span>}
          </button>
        )}
      </div>
    )
  }

  if (isOwner) {
    return (
      <div className="flex flex-col sm:flex-row gap-3">
        <button 
          onClick={markAsSold}
          disabled={loading}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg shadow-green-600/20 transition-all flex justify-center items-center gap-2 hover:-translate-y-0.5"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
          Mark as Sold
        </button>
        <button 
          onClick={() => router.push(`/edit/${productId}`)}
          className="flex-1 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-900 dark:text-white font-semibold py-4 px-6 rounded-2xl transition-all flex justify-center items-center gap-2 border border-gray-200 dark:border-zinc-700"
        >
          <Edit className="w-5 h-5" />
          Edit
        </button>
        <button 
          onClick={deleteListing}
          className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-2xl transition-colors border border-red-100 dark:border-red-900/50 flex justify-center items-center"
          title="Delete Listing"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    )
  }

  return (
    <div className="flex gap-3">
      <button 
        onClick={handleMessage}
        disabled={loading}
        className="flex-[3] bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-2xl shadow-xl shadow-blue-600/20 transition-all flex justify-center items-center gap-2 hover:-translate-y-0.5 active:scale-95 disabled:opacity-70"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <MessageCircle className="w-5 h-5" />}
        Message Seller
      </button>
      <button 
        onClick={toggleSave}
        className={`flex-1 flex justify-center items-center rounded-2xl border-2 transition-all active:scale-95 ${
          saved 
            ? "border-pink-500 bg-pink-50 dark:bg-pink-900/20 text-pink-500" 
            : "border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-500 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:border-gray-300 dark:hover:border-zinc-600"
        }`}
      >
        <Heart className={`w-6 h-6 ${saved ? "fill-pink-500" : ""}`} />
      </button>
    </div>
  )
}
