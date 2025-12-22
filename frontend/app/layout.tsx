import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MCP-powered Ultimate AI Assistant',
  description: 'Chat interface for interacting with MCP (Model Context Protocol) servers',
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

