import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import MainLayoutWrapper from '@/components/layout/MainLayoutWrapper'

const inter = Inter({
    subsets: ['latin', 'vietnamese'],
    display: 'swap',
})

export const metadata: Metadata = {
    title: 'Anime47 - Xem Anime Vietsub Online Miễn Phí',
    description: 'Anime47 - trang xem anime vietsub online miễn phí, chất lượng cao. Cập nhật anime mới nhất, anime bộ, anime lẻ, hoạt hình Trung Quốc.',
    keywords: 'anime, anime vietsub, xem anime, anime47, hoat hinh, phim anime',
    openGraph: {
        title: 'Anime47 - Xem Anime Vietsub Online',
        description: 'Xem anime vietsub miễn phí chất lượng cao tại Anime47',
        url: 'https://anime47.onl',
        siteName: 'Anime47',
        locale: 'vi_VN',
        type: 'website',
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="vi" suppressHydrationWarning>
            <body className={inter.className} suppressHydrationWarning>
                <MainLayoutWrapper>{children}</MainLayoutWrapper>
            </body>
        </html>
    )
}

