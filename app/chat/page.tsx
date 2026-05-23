import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { MessageCircle, Package } from "lucide-react"

export default async function ChatList() {
  const supabase = createClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/login?redirect_to=/chat')
  }

  // Fetch all chats where user is either buyer or seller
  const { data: chats } = await supabase
    .from('chats')
    .select(`
      id,
      updated_at,
      product:product_id (id, title, images),
      buyer:buyer_id (id, full_name, avatar_url),
      seller:seller_id (id, full_name, avatar_url),
      messages (content, created_at, is_read, sender_id)
    `)
    .or(`buyer_id.eq.${session.user.id},seller_id.eq.${session.user.id}`)
    .order('updated_at', { ascending: false })

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        <p className="text-gray-500 mt-1">Chat with buyers and sellers on CampusCart.</p>
      </div>

      <div className="glass-card overflow-hidden">
        {chats && chats.length > 0 ? (
          <div className="divide-y divide-gray-100 dark:divide-zinc-800">
            {chats.map((chat: any) => {
              const isBuyer = chat.buyer.id === session.user.id
              const otherUser = isBuyer ? chat.seller : chat.buyer
              const latestMessage = chat.messages && chat.messages.length > 0 
                ? chat.messages.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
                : null
                
              const unreadCount = chat.messages ? chat.messages.filter((m: any) => !m.is_read && m.sender_id !== session.user.id).length : 0

              return (
                <Link 
                  key={chat.id} 
                  href={`/chat/${chat.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold overflow-hidden">
                      {otherUser.avatar_url ? (
                        <img src={otherUser.avatar_url} alt={otherUser.full_name} className="w-full h-full object-cover" />
                      ) : (
                        otherUser.full_name?.charAt(0) || "U"
                      )}
                    </div>
                    {/* Small product image indicator */}
                    {chat.product?.images?.[0] && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white dark:border-zinc-900 overflow-hidden">
                        <img src={chat.product.images[0]} alt="product" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className={`font-semibold truncate ${unreadCount > 0 ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                        {otherUser.full_name}
                      </h3>
                      {latestMessage && (
                        <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                          {new Date(latestMessage.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center gap-2">
                      <div className="text-sm truncate">
                        <span className="font-medium text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded mr-2">
                          {chat.product?.title}
                        </span>
                        <span className={`${unreadCount > 0 ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500'}`}>
                          {latestMessage ? (
                            latestMessage.sender_id === session.user.id ? `You: ${latestMessage.content}` : latestMessage.content
                          ) : (
                            <span className="italic text-gray-400">No messages yet</span>
                          )}
                        </span>
                      </div>
                      
                      {unreadCount > 0 && (
                        <div className="bg-blue-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full flex-shrink-0">
                          {unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No messages</h3>
            <p>You don't have any active conversations yet.</p>
            <Link href="/explore" className="text-blue-600 font-medium hover:underline mt-4 inline-block">
              Browse products to start a chat
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
