import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import AdminUserList from "./AdminUserList"

export default async function AdminPage() {
  const supabase = createClient()

  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', session.user.id)
    .single()

  if (!currentProfile?.is_admin) {
    redirect('/dashboard')
  }

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, email, college_name, is_admin, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-6xl mx-auto animate-fade-in space-y-8 py-8">
      <div className="glass-card p-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Controls</h1>
            <p className="text-gray-500 mt-2">Manage user admin access and view site members.</p>
          </div>
          <Link href="/dashboard" className="text-blue-600 hover:underline">Back to dashboard</Link>
        </div>
      </div>

      <div className="glass-card p-8 space-y-6">
        <div className="rounded-2xl border border-blue-100 bg-blue-50/80 p-4 text-sm text-blue-700">
          Only users with a valid admin access code may become admins. From this panel, you can grant or revoke admin status for other trusted users.
        </div>
        <AdminUserList profiles={profiles ?? []} currentUserId={session.user.id} />
      </div>
    </div>
  )
}
