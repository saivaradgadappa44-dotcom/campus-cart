"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCcw } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="w-full h-[60vh] flex flex-col items-center justify-center space-y-6 px-4 text-center">
      <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mb-2">
        <AlertTriangle className="w-10 h-10" />
      </div>
      
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Something went wrong!</h2>
        <p className="text-gray-500 max-w-md mx-auto">
          We encountered an unexpected error while trying to load this page. Our team has been notified.
        </p>
      </div>
      
      <button
        onClick={() => reset()}
        className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-medium flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg"
      >
        <RefreshCcw className="w-4 h-4" />
        Try again
      </button>
    </div>
  )
}
