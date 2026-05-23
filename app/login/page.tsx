"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push("/dashboard")
      router.refresh()
    }
  }

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 animate-fade-in">
      <div className="w-full max-w-md glass-card p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg mx-auto mb-4">
            C
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-gray-500 mt-2 text-sm">Sign in to your CampusCart account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/10 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-900/50">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-medium">College Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@college.edu"
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl text-gray-900 dark:text-slate-100 placeholder:text-gray-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Password</label>
              <Link href="#" className="text-xs text-blue-600 hover:underline">Forgot password?</Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-12 py-2 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl text-gray-900 dark:text-slate-100 placeholder:text-gray-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-6"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500">
          New to CampusCart?{" "}
          <Link href="/register" className="text-blue-600 font-medium hover:underline inline-flex items-center gap-1">
            Create an account <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  )
}
