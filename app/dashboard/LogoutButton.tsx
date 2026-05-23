"use client"

import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"

export default function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <button 
      onClick={handleLogout}
      className="px-5 py-2.5 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 text-red-600 border border-gray-200 dark:border-zinc-700 rounded-xl font-medium transition-colors shadow-sm flex items-center gap-2"
    >
      <LogOut className="w-4 h-4" />
      <span className="hidden sm:inline">Log Out</span>
    </button>
  )
}
