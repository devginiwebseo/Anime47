import React from 'react';
import Link from 'next/link';
import SocialLinks from '../ui/SocialLinks';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export default function Footer() {
    const { settings } = useSiteSettings();

    return (
        <footer className="border-t border-gray-800 text-white" style={{ backgroundColor: settings.theme.backgroundColor }}>
            {/* Main Footer Content */}
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Column 1: About / Policy */}
                    <div>
                        <h3 className="text-lg font-bold mb-4 uppercase tracking-wide" style={{ color: settings.theme.primaryColor }}>
                            Chính Sách Chúng Tôi
                        </h3>
                        <ul className="space-y-2">
                            {settings.footer.footerLinks?.map((link, idx) => (
                                <li key={idx}>
                                    <Link href={link.href}>{link.label}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 2: Categories - Keeping Static for now as they are links */}
                    <div>
                        <h3 className="text-lg font-bold mb-4 uppercase tracking-wide" style={{ color: settings.theme.primaryColor }}>
                            Danh Mục Anime47
                        </h3>
                        <ul className="space-y-2">
                            <li><Link href="/anime-bo">Anime Bộ</Link></li>
                            <li><Link href="/anime-le">Anime Lẻ</Link></li>
                            <li><Link href="/moi-cap-nhat">Anime Mới Cập Nhật</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Contact Info */}
                    <div>
                        <h3 className="text-lg font-bold mb-4 uppercase tracking-wide" style={{ color: settings.theme.primaryColor }}>
                            Địa Chỉ Liên Hệ
                        </h3>
                        <div className="space-y-3">
                            <p className="text-sm leading-relaxed whitespace-pre-line">
                                {settings.footer.description}
                            </p>

                            {/* Static Contact Info for layout structure */}
                            <p className="text-sm text-gray-400">
                                Hệ thống xem anime vietsub tốt nhất
                            </p>
                        </div>
                    </div>
                </div>

                {/* Social Links */}
                {settings.footer.socialLinks && settings.footer.socialLinks.length > 0 && (
                    <div className="mt-8 pt-8 border-t border-gray-800">
                        <SocialLinks links={settings.footer.socialLinks} />
                    </div>
                )}
            </div>

            {/* Copyright */}
            <div className="py-4" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
                <div className="container mx-auto px-4 text-center text-sm text-gray-400">
                    {settings.footer.copyrightText}
                </div>
            </div>
        </footer>
    );
}
