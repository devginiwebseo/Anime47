'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface MenuItem {
    label: string;
    href: string;
    submenu?: { label: string; href: string }[];
}

const menuItems: MenuItem[] = [
    { label: 'ANIME47', href: '/' },
    { label: 'ANIME BỘ', href: '/anime-bo' },
    { label: 'ANIME LẺ', href: '/anime-le' },
    {
        label: 'THỂ LOẠI',
        href: '/the-loai',
        submenu: [
            { label: 'Hành Động', href: '/the-loai/hanh-dong' },
            { label: 'Phiêu Lưu', href: '/the-loai/phieu-luu' },
            { label: 'Viễn Tưởng', href: '/the-loai/vien-tuong' },
            { label: 'Khoa Học', href: '/the-loai/khoa-hoc' },
            { label: 'Hài Hước', href: '/the-loai/hai-huoc' },
            { label: 'Giả Tưởng', href: '/the-loai/gia-tuong' },
            { label: 'Võ Thuật', href: '/the-loai/vo-thuat' },
            { label: 'Cờ Trang', href: '/the-loai/co-trang' },
            { label: 'Tình Cảm', href: '/the-loai/tinh-cam' },
            { label: 'Tâm Lý', href: '/the-loai/tam-ly' },
            { label: 'Thần Thoại', href: '/the-loai/than-thoai' },
            { label: 'Thần Thoại', href: '/the-loai/than-thoai' },
        ],
    },
    { label: 'QUỐC GIA', href: '/quoc-gia' },
    { label: 'LỊCH CHIẾU', href: '/lich-chieu' },
];

export default function Navigation() {
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    return (
        <nav className="flex-1">
            <ul className="flex items-center gap-6">
                {menuItems.map((item) => (
                    <li
                        key={item.label}
                        className="relative group"
                        onMouseEnter={() => item.submenu && setActiveDropdown(item.label)}
                        onMouseLeave={() => setActiveDropdown(null)}
                    >
                        <Link
                            href={item.href}
                            className="text-white hover:text-red-500 transition-colors duration-200 font-medium text-sm tracking-wide flex items-center gap-1"
                        >
                            {item.label}
                            {item.submenu && (
                                <svg
                                    className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            )}
                        </Link>

                        {/* Dropdown Menu */}
                        {item.submenu && activeDropdown === item.label && (
                            <div className="absolute top-full left-0 mt-2 w-56 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 py-2 animate-fadeIn">
                                <div className="grid grid-cols-2 gap-1 p-2">
                                    {item.submenu.map((subItem) => (
                                        <Link
                                            key={subItem.label}
                                            href={subItem.href}
                                            className="text-gray-300 hover:text-white hover:bg-gray-800 px-3 py-2 rounded text-sm transition-all duration-150"
                                        >
                                            {subItem.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </nav>
    );
}
