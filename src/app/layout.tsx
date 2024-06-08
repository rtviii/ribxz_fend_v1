'use client'
import { Inter } from 'next/font/google'
import './globals.css'
import StoreProvider from './store_provider'

const inter = Inter({ subsets: ['latin'] })


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <StoreProvider>
      <body className={inter.className}>{children}</body>
      </StoreProvider>
    </html>
  )
}
