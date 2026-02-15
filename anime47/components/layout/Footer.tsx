import React from 'react';
import Link from 'next/link';
import SocialLinks from '../ui/SocialLinks';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export default function Footer() {
    const { settings } = useSiteSettings();

    return (
        <footer className="border-t border-gray-800" style={{ backgroundColor: settings.footer.backgroundColor, color: settings.footer.textColor }}>
            {/* Main Footer Content */}
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Column 1: About / Policy */}
                    <div>
                        <h3 className="text-red-500 text-lg font-bold mb-4 uppercase tracking-wide">
                            Chính Sách Chúng Tôi
                        </h3>
                        <ul className="space-y-2">
                            <li><Link href="/gioi-thieu">Giới Thiệu</Link></li>
                            <li><Link href="/chinh-sach-bao-mat">Chính Sách Bảo Mật</Link></li>
                            <li><Link href="/dieu-khoan-su-dung">Điều Khoản Sử Dụng</Link></li>
                        </ul>
                    </div>

                    {/* Column 2: Categories - Keeping Static for now as they are links */}
                    <div>
                        <h3 className="text-red-500 text-lg font-bold mb-4 uppercase tracking-wide">
                            Danh Mục Anime47
                        </h3>
                        <ul className="space-y-2">
                            <li><Link href="/anime-bo">Anime Bộ</Link></li>
                            <li><Link href="/anime-le">Anime Lẻ</Link></li>
                            <li><Link href="/anime-dang-chieu">Anime Đang Chiếu</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Contact Info */}
                    <div>
                        <h3 className="text-red-500 text-lg font-bold mb-4 uppercase tracking-wide">
                            Địa Chỉ Liên Hệ
                        </h3>
                        <div className="space-y-3">
                            <p className="text-sm leading-relaxed whitespace-pre-line">
                                {settings.footer.content}
                            </p>

                            {/* Static Contact Info for layout structure */}
                            <p className="text-sm">
                                Hashtags: #anime47 #anime_47 #animehay #animesub #animevietsub
                            </p>
                        </div>
                    </div>
                </div>

                {/* Social Links */}
                <div className="mt-8 pt-8 border-t border-gray-800">
                    <SocialLinks />
                </div>
            </div>

            {/* Copyright */}
            <div className="bg-gray-900 py-4" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
                <div className="container mx-auto px-4 text-center text-sm text-gray-400">
                    {settings.footer.copyright}
                </div>
            </div>
        </footer>
    );
}
