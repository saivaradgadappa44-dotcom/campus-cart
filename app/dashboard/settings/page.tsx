import Link from "next/link"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import ProfileUpdateForm from "./ProfileUpdateForm"
import PasswordResetForm from "./PasswordResetForm"

export default async function DashboardSettingsPage() {
  const supabase = createClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  return (
    <div className="max-w-4xl mx-auto animate-fade-in space-y-8">
      <div className="glass-card p-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
            <p className="text-gray-500 mt-2">Manage your profile and account preferences.</p>
          </div>
          <Link href="/dashboard" className="text-blue-600 hover:underline">Back to dashboard</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Profile Update Section */}
        <div className="glass-card p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-semibold">Profile Information</h2>
            <p className="text-gray-500 mt-1">Update your name, college, and profile details.</p>
          </div>
          <ProfileUpdateForm profile={profile} userId={session.user.id} />
        </div>

        {/* Password Reset Section */}
        <div className="glass-card p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-semibold">Security & Password</h2>
            <p className="text-gray-500 mt-1">Update your password and manage your account security.</p>
          </div>
          <PasswordResetForm userEmail={session.user.email} />
        </div>
      </div>
    </div>
  )
}
