import './globals.css'
import { Inter } from 'next/font/google'
import { AntdRegistry } from '@ant-design/nextjs-registry'
import { RefineProvider } from '../components/providers/refine-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Taant Supplier Panel',
  description: 'Supplier panel for managing your Taant account',
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