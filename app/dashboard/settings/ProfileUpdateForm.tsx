'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { Loader2, Check } from 'lucide-react'

export default function ProfileUpdateForm({ profile, userId }: { profile: any; userId: string }) {
  const supabase = createClient()
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    college_name: profile?.college_name || '',
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          college_name: formData.college_name,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)

      if (error) {
        toast.error('Failed to update profile: ' + error.message)
        return
      }

      toast.success('Profile updated successfully!')
    } catch (error: any) {
      toast.error('An error occurred: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Full Name
        </label>
        <input
          type="text"
          name="full_name"
          value={formData.full_name}
          onChange={handleChange}
          placeholder="Your full name"
          className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          College / University
        </label>
        <input
          type="text"
          name="college_name"
          value={formData.college_name}
          onChange={handleChange}
          placeholder="Your college name"
          className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="mt-6 w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Check className="w-4 h-4" />
            Update Profile
          </>
        )}
      </button>
    </form>
  )
}
