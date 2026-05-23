'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { Loader2, Check, Eye, EyeOff } from 'lucide-react'

export default function PasswordResetForm({ userEmail }: { userEmail?: string }) {
  const supabase = createClient()
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [resetEmailSent, setResetEmailSent] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Validation
    if (!formData.newPassword || !formData.confirmPassword) {
      toast.error('Please fill in all password fields')
      setIsLoading(false)
      return
    }

    if (formData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long')
      setIsLoading(false)
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.newPassword,
      })

      if (error) {
        toast.error('Failed to update password: ' + error.message)
        return
      }

      toast.success('Password updated successfully!')
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error: any) {
      toast.error('An error occurred: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(userEmail || '', {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard/settings`,
      })

      if (error) {
        toast.error('Failed to send reset email: ' + error.message)
        return
      }

      setResetEmailSent(true)
      toast.success('Password reset link sent to your email!')
      setTimeout(() => setResetEmailSent(false), 5000)
    } catch (error: any) {
      toast.error('An error occurred: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Password Reset via Email */}
      <div className="border-b border-gray-200 dark:border-zinc-700 pb-6">
        <h3 className="text-lg font-semibold mb-3">Reset Password via Email</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Send a password reset link to your email address to securely update your password.
        </p>
        <form onSubmit={handlePasswordReset}>
          <button
            type="submit"
            disabled={isLoading || resetEmailSent}
            className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : resetEmailSent ? (
              <>
                <Check className="w-4 h-4" />
                Email Sent
              </>
            ) : (
              'Send Reset Email'
            )}
          </button>
        </form>
      </div>

      {/* Direct Password Change */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Change Password</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Update your password directly from here.
        </p>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Enter new password (min 8 characters)"
                className="w-full px-4 py-2.5 pr-10 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
                className="w-full px-4 py-2.5 pr-10 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-6 w-full sm:w-auto px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Update Password
              </>
            )}
          </button>
        </form>
      </div>

      {/* Security Tips */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">🔒 Security Tips</h4>
        <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
          <li>✓ Use a strong password with uppercase, lowercase, numbers, and symbols</li>
          <li>✓ Never share your password with anyone</li>
          <li>✓ Update your password regularly for better security</li>
          <li>✓ Be cautious of suspicious emails asking to reset your password</li>
        </ul>
      </div>
    </div>
  )
}
