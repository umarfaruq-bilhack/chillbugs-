import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { AdminDashboardClient } from './AdminDashboardClient'

export default async function AdminDashboard() {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value

  if (token !== process.env.ADMIN_SECRET) {
    redirect('/admin')
  }

  return <AdminDashboardClient />
}
