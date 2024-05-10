import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import StoreProvider from './store_provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title      : 'ribxz',
  description: 'a library of ribosomal components',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <StoreProvider>
      <body className={inter.className}>{children}</body>
      </StoreProvider>
    </html>
  )
}
