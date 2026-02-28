import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BarackOllama — AI Resume Generator',
  description:
    'Generate a tailored resume, GitHub README, and portfolio from your GitHub and LinkedIn profiles using AI.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
