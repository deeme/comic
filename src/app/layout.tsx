import { fonts } from '@/lib/fonts'
import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI 漫画工厂',
  description: '使用 LLM + SDXL 生成漫画',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={fonts.actionman.className}>
        {children}
      </body>
    </html>
  )
}
