import './globals.css';

export const metadata = {
  title: '天気予報アプリ',
  description: 'OpenWeather APIを使用した天気予報アプリ',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-gray-100">{children}</body>
    </html>
  )
}
