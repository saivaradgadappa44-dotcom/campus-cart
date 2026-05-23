"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, ShoppingBag, MessageCircle, User, PlusCircle, LogIn, Menu, X } from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"

export default function Navbar() {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [session, setSession] = useState<any>(null)
  
  const supabase = createClient()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
    }
    fetchSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const navLinks = [
    { name: "Explore", href: "/", icon: Search },
    { name: "Categories", href: "/categories", icon: ShoppingBag },
  ]

  const actionLinks = session ? [
    { name: "Messages", href: "/chat", icon: MessageCircle },
    { name: "Sell Item", href: "/create", icon: PlusCircle, primary: true },
    { name: "Profile", href: "/dashboard", icon: User },
  ] : [
    { name: "Log In", href: "/login", icon: LogIn, primary: true },
  ]

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? "glass py-3" 
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                C
              </div>
              <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                CampusCart
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <div className="flex items-center gap-6">
                {navLinks.map((link) => (
                  <Link 
                    key={link.name} 
                    href={link.href}
                    className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                      pathname === link.href ? "text-blue-600" : "text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>

              <div className="flex items-center gap-4">
                {actionLinks.map((link) => (
                  <Link 
                    key={link.name} 
                    href={link.href}
                    className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full transition-all ${
                      link.primary 
                        ? "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md hover:shadow-blue-500/20" 
                        : "bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-zinc-700"
                    }`}
                  >
                    <link.icon className="w-4 h-4" />
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden p-2 text-gray-600 dark:text-gray-300"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation (App-like feel) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-gray-200 dark:border-zinc-800 pb-safe">
        <div className="flex items-center justify-around p-3">
          {[...navLinks, ...actionLinks].slice(0, 5).map((link) => {
            const isActive = pathname === link.href
            return (
              <Link 
                key={link.name} 
                href={link.href}
                className={`flex flex-col items-center gap-1 p-2 ${
                  isActive ? "text-blue-600" : "text-gray-500 dark:text-gray-400"
                }`}
              >
                <link.icon className={`w-6 h-6 ${isActive ? "fill-blue-50" : ""}`} />
                <span className="text-[10px] font-medium">{link.name}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}
