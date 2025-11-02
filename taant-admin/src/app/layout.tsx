import './globals.css'
import { Inter } from 'next/font/google'
import { AntdRegistry } from '@ant-design/nextjs-registry'
import { RefineProvider } from '../components/providers/refine-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Taant Admin Panel',
  description: 'Admin panel for managing the Taant platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AntdRegistry>
          <RefineProvider>
            {children}
          </RefineProvider>
        </AntdRegistry>
      </body>
    </html>
  )
}