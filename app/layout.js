import './globals.css'

export const metadata = {
  title: '电子画册管理系统',
  description: '云画册展示与获客系统',
}

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
