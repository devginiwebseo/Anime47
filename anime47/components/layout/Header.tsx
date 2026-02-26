'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import SearchBar from '../ui/SearchBar';
import Logo from '../ui/Logo';
import Navigation from '../ui/Navigation';

import { useSiteSettings } from '@/hooks/useSiteSettings';

export default function Header() {
    const { settings } = useSiteSettings();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const primaryColor = settings.theme.primaryColor || '#d32f2f';

    return (
        <header className="border-b border-gray-800 text-white" style={{ backgroundColor: settings.theme.backgroundColor }}>
            {/* Announcement Bar if any */}
            {settings.header.announcement && (
                <div className="text-white text-center py-1 text-sm font-medium tracking-wide" style={{ backgroundColor: settings.theme.primaryColor }}>
                    {settings.header.announcement}
                </div>
            )}
            {/* Top Header with Logo, Navigation, and Search */}
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between gap-4 md:gap-8">

                    {/* Mobile Hamburger Button */}
                    <button
                        onClick={toggleMobileMenu}
                        className="lg:hidden p-2.5 rounded-lg transition-colors shadow-sm"
                        style={{ backgroundColor: primaryColor }}
                    >
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    {/* Logo - Centered on Mobile */}
                    <div className="flex-1 flex justify-center lg:justify-start lg:flex-none">
                        <Logo src={settings.header.logoUrl || '/logo.png'} />
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:block flex-1">
                        <Navigation menuItems={settings.header.menuItems} />
                    </div>

                    {/* Desktop Search Bar */}
                    <div className="hidden lg:block w-full max-w-sm">
                        {settings.header.showSearch && <SearchBar />}
                    </div>

                    {/* Mobile helper div to keep logo centered */}
                    <div className="w-11 lg:hidden"></div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-black/80 z-[100] lg:hidden backdrop-blur-sm" onClick={toggleMobileMenu}>
                    <div
                        className="fixed inset-y-0 left-0 w-[280px] bg-[#111216] shadow-2xl flex flex-col transform transition-transform duration-300 border-r border-gray-800 shrink-0 animate-fadeInLeft"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Mobile Menu Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-800">
                            <Logo src={settings.header.logoUrl || '/logo.png'} />
                            <button onClick={toggleMobileMenu} className="p-2 text-gray-400 hover:text-white transition-colors">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Mobile Menu Content */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
                            {settings.header.showSearch && (
                                <div className="w-full">
                                    <SearchBar />
                                </div>
                            )}

                            <div className="mt-4">
                                <Navigation menuItems={settings.header.menuItems} isMobile={true} onItemClick={toggleMobileMenu} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
