"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Send, ArrowLeft, Loader2 } from "lucide-react"

export default function ChatRoom({ params }: { params: { id: string } }) {
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [chatDetails, setChatDetails] = useState<any>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sendError, setSendError] = useState<string | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const initChat = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      setCurrentUser(session.user)

      // Fetch chat details
      const { data: chat } = await supabase
        .from('chats')
        .select(`
          *,
          product:product_id (id, title, price, images, status),
          buyer:buyer_id (id, full_name, avatar_url),
          seller:seller_id (id, full_name, avatar_url)
        `)
        .eq('id', params.id)
        .single()

      if (!chat) {
        router.push('/chat')
        return
      }
      setChatDetails(chat)

      // Fetch existing messages
      const { data: existingMessages } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', params.id)
        .order('created_at', { ascending: true })

      if (existingMessages) {
        setMessages(existingMessages)
        
        // Mark unread as read
        const unreadIds = existingMessages
          .filter(m => !m.is_read && m.sender_id !== session.user.id)
          .map(m => m.id)
          
        if (unreadIds.length > 0) {
          await supabase.from('messages').update({ is_read: true }).in('id', unreadIds)
        }
      }
      setLoading(false)

      // Set up Realtime Subscription
      const channel = supabase
        .channel(`chat_${params.id}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${params.id}`,
        }, (payload) => {
          setMessages(prev => [...prev, payload.new])
          // If we receive a message and we're looking at the chat, mark it as read
          if (payload.new.sender_id !== session.user.id) {
            supabase.from('messages').update({ is_read: true }).eq('id', payload.new.id).then()
          }
        })
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }

    initChat()
  }, [params.id, supabase, router])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !currentUser) return

    const messageText = newMessage.trim()
    setNewMessage("")
    setSendError(null)

    const { data, error } = await supabase.from('messages').insert({
      chat_id: params.id,
      sender_id: currentUser.id,
      content: messageText,
    }).select().single()

    if (error) {
      console.error("Error sending message:", error)
      setSendError(error.message || "Failed to send message.")
      setNewMessage(messageText)
      return
    }

    if (data) {
      setMessages((prev) => [...prev, data])
    }

    await supabase.from('chats').update({ updated_at: new Date().toISOString() }).eq('id', params.id)
  }

  if (loading) {
    return <div className="flex justify-center items-center h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
  }

  const isBuyer = chatDetails?.buyer.id === currentUser?.id
  const otherUser = isBuyer ? chatDetails?.seller : chatDetails?.buyer

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col glass-card overflow-hidden animate-fade-in">
      {/* Chat Header */}
      <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-gray-200 dark:border-zinc-800 p-4 flex items-center justify-between z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/chat" className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold overflow-hidden">
              {otherUser?.avatar_url ? (
                <img src={otherUser.avatar_url} alt={otherUser.full_name} className="w-full h-full object-cover" />
              ) : (
                otherUser?.full_name?.charAt(0) || "U"
              )}
            </div>
            <div>
              <h2 className="font-bold">{otherUser?.full_name}</h2>
              <p className="text-xs text-gray-500">
                {isBuyer ? 'Seller' : 'Buyer'}
              </p>
            </div>
          </div>
        </div>

        {/* Product Context Snippet */}
        {chatDetails?.product && (
          <Link href={`/product/${chatDetails.product.id}`} className="hidden md:flex items-center gap-3 p-2 bg-gray-50 dark:bg-zinc-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors border border-gray-100 dark:border-zinc-700">
            {chatDetails.product.images?.[0] && (
              <img src={chatDetails.product.images[0]} alt="product" className="w-10 h-10 rounded-lg object-cover" />
            )}
            <div className="text-right">
              <div className="font-medium text-sm line-clamp-1 max-w-[150px]">{chatDetails.product.title}</div>
              <div className="text-blue-600 dark:text-blue-400 font-bold text-sm">₹{chatDetails.product.price}</div>
            </div>
          </Link>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-zinc-950/50">
        {/* Date / Security notice */}
        <div className="text-center text-xs text-gray-400 my-4 flex items-center justify-center gap-2">
          <div className="h-px bg-gray-200 dark:bg-zinc-800 flex-1 max-w-[100px]"></div>
          Messages are protected by CampusCart
          <div className="h-px bg-gray-200 dark:bg-zinc-800 flex-1 max-w-[100px]"></div>
        </div>

        {messages.map((msg, idx) => {
          const isMe = msg.sender_id === currentUser?.id
          const showAvatar = !isMe && (idx === 0 || messages[idx - 1].sender_id !== msg.sender_id)

          return (
            <div key={msg.id} className={`flex gap-3 ${isMe ? 'justify-end' : 'justify-start'}`}>
              {!isMe && (
                <div className="w-8 h-8 flex-shrink-0">
                  {showAvatar ? (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                      {otherUser?.avatar_url ? (
                        <img src={otherUser.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        otherUser?.full_name?.charAt(0) || "U"
                      )}
                    </div>
                  ) : <div className="w-8 h-8" />}
                </div>
              )}
              
              <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                isMe 
                  ? 'bg-blue-600 text-white rounded-tr-sm' 
                  : 'bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-tl-sm'
              }`}>
                {msg.content}
                <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800">
        {sendError && (
          <div className="mb-3 p-3 rounded-xl text-sm text-red-600 bg-red-50 dark:bg-red-900/10 dark:text-red-400 border border-red-200 dark:border-red-900/50">
            {sendError}
          </div>
        )}
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-gray-100 dark:bg-zinc-800/50 border-none rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
          />
          <button 
            type="submit"
            disabled={!newMessage.trim()}
            className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Send className="w-5 h-5 ml-1" />
          </button>
        </form>
      </div>
    </div>
  )
}
