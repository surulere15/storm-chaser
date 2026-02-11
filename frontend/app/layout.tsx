import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Storm Chaser - Real-Time Storm Intelligence for Contractors',
  description: 'Get instant alerts when severe weather hits your service area. AI-powered lead generation for roofing contractors.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          {children}
        </div>
      </body>
    </html>
  )
}
