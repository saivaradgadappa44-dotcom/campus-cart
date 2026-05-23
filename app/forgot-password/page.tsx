"use client"

import { useState } from "react"
import Link from "next/link"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"
import { Mail, Loader2, Check } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (!email) {
      toast.error("Please enter your email address.")
      setIsLoading(false)
      return
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    })

    if (error) {
      toast.error("Failed to send reset email: " + error.message)
      setIsLoading(false)
      return
    }

    setSent(true)
    toast.success("Password reset link sent to your email.")
    setIsLoading(false)
  }

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 animate-fade-in py-12">
      <div className="w-full max-w-md glass-card p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg mx-auto mb-4">
            <Mail className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Forgot your password?</h1>
          <p className="text-gray-500 mt-2 text-sm">Enter your email and we’ll send you a reset link.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@college.edu"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl text-gray-900 dark:text-slate-100 placeholder:text-gray-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || sent}
            className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : sent ? (
              <>
                <Check className="w-4 h-4" />
                Email sent
              </>
            ) : (
              "Send reset link"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <Link href="/login" className="text-blue-600 font-medium hover:underline">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  )
}
