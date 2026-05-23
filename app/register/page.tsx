"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Mail, Lock, Eye, EyeOff, User, Loader2, ArrowRight, Building } from "lucide-react"

export default function Register() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [collegeName, setCollegeName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    setLoading(true)
    setError(null)

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          college_name: collegeName,
        }
      }
    })

    if (signUpError) {
      const message = signUpError.message || "Failed to create account."
      if (message.toLowerCase().includes("email rate")) {
        setError("Too many signup emails sent. Please try again later.")
      } else {
        setError(message)
      }
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 animate-fade-in">
        <div className="w-full max-w-md glass-card p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold">Check your email</h2>
          <p className="text-gray-500">We've sent a confirmation link to <strong>{email}</strong>. Please verify your email to continue.</p>
          <div className="pt-4">
            <Link href="/login" className="text-blue-600 font-medium hover:underline">
              Return to login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 animate-fade-in py-12">
      <div className="w-full max-w-md glass-card p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Join CampusCart</h1>
          <p className="text-gray-500 mt-2 text-sm">Create an account with your college email</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/10 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-900/50">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl text-gray-900 dark:text-slate-100 placeholder:text-gray-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">College Name</label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                required
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                placeholder="Stanford University"
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl text-gray-900 dark:text-slate-100 placeholder:text-gray-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">College Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yourname@gmail.com"
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl text-gray-900 dark:text-slate-100 placeholder:text-gray-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <p className="text-xs text-gray-500 ml-1">Use any email address to register</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                minLength={6}
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
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 font-medium hover:underline inline-flex items-center gap-1">
            Sign In <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  )
}
