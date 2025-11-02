import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import SessionProvider from './providers/session-provider'
import { AuthProvider } from '@/contexts/auth-context'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Taant Supplier Panel',
  description: 'Supplier management dashboard for Taant platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </SessionProvider>
      </body>
    </html>
  )
}