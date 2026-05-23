"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"

type ProfileItem = {
  id: string
  full_name: string
  email: string
  college_name: string | null
  is_admin: boolean
  created_at: string
}

export default function AdminUserList({ profiles, currentUserId }: { profiles: ProfileItem[]; currentUserId: string }) {
  const [users, setUsers] = useState<ProfileItem[]>(profiles)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const supabase = createClient()

  const toggleAdmin = async (profile: ProfileItem) => {
    setLoadingId(profile.id)

    const { error } = await supabase
      .from('profiles')
      .update({ is_admin: !profile.is_admin })
      .eq('id', profile.id)

    if (error) {
      toast.error('Unable to update admin status: ' + error.message)
      setLoadingId(null)
      return
    }

    setUsers((current) =>
      current.map((user) =>
        user.id === profile.id ? { ...user, is_admin: !profile.is_admin } : user
      )
    )

    toast.success(
      profile.is_admin
        ? `${profile.full_name} is no longer an admin.`
        : `${profile.full_name} is now an admin.`
    )
    setLoadingId(null)
  }

  return (
    <div className="grid gap-4">
      {users.length === 0 ? (
        <div className="glass-card p-8 text-center text-gray-500">No users found.</div>
      ) : (
        users.map((profile) => {
          const isCurrentUser = profile.id === currentUserId
          return (
            <div key={profile.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 border border-gray-200 dark:border-zinc-800 rounded-3xl bg-white/80 dark:bg-zinc-950/80 shadow-sm">
              <div>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-blue-100 text-blue-700 grid place-items-center font-semibold">{profile.full_name?.charAt(0) || 'U'}</div>
                  <div>
                    <p className="font-semibold">{profile.full_name}</p>
                    <p className="text-sm text-gray-500">{profile.email}</p>
                    <p className="text-sm text-gray-500">{profile.college_name || 'No college set'}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${profile.is_admin ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                  {profile.is_admin ? 'Admin' : 'User'}
                </span>
                <button
                  type="button"
                  disabled={loadingId === profile.id || isCurrentUser}
                  onClick={() => toggleAdmin(profile)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${isCurrentUser ? 'cursor-not-allowed bg-gray-200 text-gray-500 dark:bg-zinc-800 dark:text-gray-400' : profile.is_admin ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                >
                  {isCurrentUser ? 'Current account' : profile.is_admin ? 'Revoke admin' : 'Make admin'}
                </button>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
