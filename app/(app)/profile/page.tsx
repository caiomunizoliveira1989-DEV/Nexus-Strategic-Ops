import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { ensureUser } from '@/lib/user'
import { ProfileForm } from '@/components/profile/profile-form'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const session = await auth()

  if (!session?.user?.email) {
    redirect('/login')
  }

  const user = await ensureUser(
    session.user.email,
    session.user.name ?? 'Usuário',
    session.user.role ?? 'Director',
  )

  return (
    <div className="mx-auto max-w-3xl py-2">
      <ProfileForm
        initial={{
          name: user.name,
          email: user.email,
          role: user.role,
          company: user.company ?? '',
          phone: user.phone ?? '',
          location: user.location ?? '',
          bio: user.bio ?? '',
        }}
      />
    </div>
  )
}
