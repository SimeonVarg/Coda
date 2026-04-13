import type { Metadata } from 'next'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import './globals.css'
import NavBar from '@/components/NavBar'
import DemoBanner from '@/components/DemoBanner'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const displayFont = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-display',
  display: 'swap',
})

const bodyFont = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Coda',
  description: 'Lessons organized, progress in crescendo.',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  const role = (user?.app_metadata?.role as 'teacher' | 'student' | null) ?? null
  const isDemo = user?.user_metadata?.is_demo === true

  return (
    <html lang="en" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Music&display=swap" rel="stylesheet" />
      </head>
      <body className={`bg-studio-bg${isDemo ? ' pt-10' : ''}`}>
        {isDemo && role && <DemoBanner role={role} />}
        <NavBar role={role} />
        {children}
      </body>
    </html>
  )
}
