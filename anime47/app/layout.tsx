import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import MainLayoutWrapper from '@/components/layout/MainLayoutWrapper'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { SettingsProvider } from '@/components/providers/SettingsProvider'
import { prisma } from '@/lib/prisma'
import { SiteSettings } from '@/hooks/useSiteSettings'

const inter = Inter({
    subsets: ['latin', 'vietnamese'],
    display: 'swap',
})

const defaultSettings: SiteSettings = {
    header: {
        siteName: 'Anime47',
        logoUrl: '',
        showSearch: true,
        menuItems: [],
        announcement: '',
    },
    footer: {
        copyrightText: '',
        description: '',
        socialLinks: [],
        footerLinks: [],
        showBackToTop: true,
    },
    theme: {
        primaryColor: '#d32f2f',
        backgroundColor: '#111827',
        isIndexed: false,
        siteTitle: '',
    }
};

async function getSiteSettings(): Promise<SiteSettings> {
    try {
        const [headerSetting, footerSetting, themeSetting] = await Promise.all([
            prisma.settings.findUnique({ where: { key: 'header' } }),
            prisma.settings.findUnique({ where: { key: 'footer' } }),
            prisma.settings.findUnique({ where: { key: 'theme' } })
        ]);

        return {
            header: { ...defaultSettings.header, ...(headerSetting?.value as any || {}) },
            footer: { ...defaultSettings.footer, ...(footerSetting?.value as any || {}) },
            theme: { ...defaultSettings.theme, ...(themeSetting?.value as any || {}) },
        };
    } catch (error) {
        return defaultSettings;
    }
}

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSiteSettings();
    const { theme } = settings;
    
    const isIndexed = theme.isIndexed ?? false;
    const siteTitle = theme.siteTitle || 'Anime47 - Xem Anime Vietsub Online Miễn Phí';
    const faviconUrl = (theme as any).faviconUrl || '/favicon.ico';

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
            url: 'https://anime47.tv',
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

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const initialSettings = await getSiteSettings();

    return (
        <html lang="vi" suppressHydrationWarning>
            <body className={inter.className} suppressHydrationWarning>
                <SettingsProvider initialSettings={initialSettings}>
                    <AuthProvider>
                        <MainLayoutWrapper>{children}</MainLayoutWrapper>
                    </AuthProvider>
                </SettingsProvider>
            </body>
        </html>
    )
}
