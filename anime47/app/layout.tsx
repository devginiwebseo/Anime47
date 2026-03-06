import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import MainLayoutWrapper from '@/components/layout/MainLayoutWrapper'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { prisma } from '@/lib/prisma'

const inter = Inter({
    subsets: ['latin', 'vietnamese'],
    display: 'swap',
})

export async function generateMetadata(): Promise<Metadata> {
    let isIndexed = false;
    let siteTitle = 'Anime47 - Xem Anime Vietsub Online Miễn Phí';
    let faviconUrl = '/favicon.ico';

    try {
        const themeSetting = await prisma.settings.findUnique({ where: { key: 'theme' } });
        if (themeSetting && themeSetting.value) {
            const val = themeSetting.value as any;
            isIndexed = val.isIndexed ?? false;
            if (val.siteTitle) siteTitle = val.siteTitle;
            if (val.faviconUrl) faviconUrl = val.faviconUrl;
        }
    } catch (e) {
        console.error(e);
    }

    return {
        title: siteTitle,
        description: 'Anime47 - trang xem anime vietsub online miễn phí, chất lượng cao. Cập nhật anime mới nhất, anime bộ, anime lẻ, hoạt hình Trung Quốc.',
        keywords: 'anime, anime vietsub, xem anime, anime47, hoat hinh, phim anime',
        icons: [
            { rel: 'icon', url: faviconUrl },
            { rel: 'shortcut icon', url: faviconUrl },
            { rel: 'apple-touch-icon', url: faviconUrl },
        ],
        openGraph: {
            title: siteTitle,
            description: 'Xem anime vietsub miễn phí chất lượng cao tại Anime47',
            url: 'https://anime47.onl',
            siteName: 'Anime47',
            locale: 'vi_VN',
            type: 'website',
        },
        robots: {
            index: isIndexed,
            follow: isIndexed,
        },
    }
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="vi" suppressHydrationWarning>
            <body className={inter.className} suppressHydrationWarning>
                <AuthProvider>
                    <MainLayoutWrapper>{children}</MainLayoutWrapper>
                </AuthProvider>
            </body>
        </html>
    )
}

