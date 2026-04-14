'use client';

import React, { useState } from 'react';
import SearchBar from '../ui/SearchBar';
import Logo from '../ui/Logo';
import Navigation from '../ui/Navigation';
import LoginModal from '../ui/LoginModal';
import { useSettings } from '@/components/providers/SettingsProvider';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function Header() {
    const { settings } = useSettings();
    const { data: session } = useSession();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);
    const primaryColor = settings.theme.primaryColor || '#d32f2f';

    return (
        <>
            <header className="sticky top-0 z-50 border-b border-gray-800 text-white" style={{ backgroundColor: settings.theme.backgroundColor }}>
            {/* Announcement Bar if any */}
            {settings.header.announcement && (
                <div className="text-white text-center py-1 text-sm font-medium tracking-wide" style={{ backgroundColor: settings.theme.primaryColor }}>
                    {settings.header.announcement}
                </div>
            )}
            {/* Top Header with Logo, Navigation, and Search */}
            <div className="container mx-auto px-3 sm:px-4 py-2.5 sm:py-3">
                <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 xl:gap-8">

                    {/* Mobile Hamburger Button */}
                    <button
                        onClick={toggleMobileMenu}
                        className="lg:hidden shrink-0 p-2.5 rounded-lg transition-colors shadow-sm"
                        style={{ backgroundColor: primaryColor }}
                    >
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    {/* Logo */}
                    <div className="shrink-0">
                        <Logo src={settings.header.logoUrl || '/logo.png'} compact />
                    </div>

                    {/* Mobile Search Bar */}
                    <div className="min-w-0 flex-1 lg:hidden">
                        {settings.header.showSearch && <SearchBar compact />}
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:block flex-1 min-w-0">
                        <Navigation menuItems={settings.header.menuItems} />
                    </div>

                    {/* Desktop Search Bar */}
                    <div className="hidden lg:block w-full max-w-[160px] xl:max-w-[220px]">
                        {settings.header.showSearch && <SearchBar compact={true} />}
                    </div>

                    {/* Desktop User Actions */}
                    <div className="hidden lg:flex items-center gap-3 shrink-0">
                        {session ? (
                            <div className="relative">
                                <button
                                    onClick={toggleUserMenu}
                                    className="flex items-center gap-2 p-1.5 rounded-full hover:bg-white/5 transition-colors border border-gray-800 group"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden border border-primary/30 group-hover:border-primary transition-colors">
                                        {session.user?.image ? (
                                            <img src={session.user.image} alt={session.user.name || 'User'} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-gray-400 text-lg">👤</span>
                                        )}
                                    </div>
                                    <div className="hidden xl:block text-left mr-2">
                                        <p className="text-xs text-gray-400 leading-none mb-1">Chào mừng,</p>
                                        <p className="text-sm font-bold truncate max-w-[100px]">{session.user?.name || 'Thành viên'}</p>
                                    </div>
                                </button>

                                {isUserMenuOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)}></div>
                                        <div className="absolute right-0 mt-3 w-56 bg-[#111216] border border-gray-800 rounded-xl shadow-2xl p-2 z-50 animate-fadeIn slide-in-from-top-2">
                                            <Link
                                                href="/user/tu-phim"
                                                className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-white/5 text-sm transition-colors"
                                                onClick={() => setIsUserMenuOpen(false)}
                                            >
                                                <span className="text-lg">⭐</span> Tủ phim của tôi
                                            </Link>
                                            <Link
                                                href="/user/profile"
                                                className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-white/5 text-sm transition-colors"
                                                onClick={() => setIsUserMenuOpen(false)}
                                            >
                                                <span className="text-lg">👤</span> Thông tin tài khoản
                                            </Link>
                                            {session.user?.role === 'ADMIN' && (
                                                <Link
                                                    href="/admin"
                                                    className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-primary/20 text-primary text-sm font-bold transition-colors"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                >
                                                    <span className="text-lg">🛡️</span> Trang quản trị
                                                </Link>
                                            )}
                                            <div className="h-px bg-gray-800 my-2 mx-2"></div>
                                            <button
                                                onClick={() => {
                                                    signOut();
                                                    setIsUserMenuOpen(false);
                                                }}
                                                className="flex items-center gap-3 w-full text-left px-4 py-2.5 rounded-lg hover:bg-red-500/10 text-red-500 text-sm transition-colors"
                                            >
                                                <span className="text-lg">🚪</span> Đăng xuất
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsLoginModalOpen(true)}
                                className="px-5 py-2.5 rounded-lg font-bold text-sm text-white transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0"
                                style={{ backgroundColor: primaryColor }}
                            >
                                Đăng nhập
                            </button>
                        )}
                    </div>
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
                        <div className="flex items-center justify-between gap-3 p-4 border-b border-gray-800">
                            <Logo src={settings.header.logoUrl || '/logo.png'} compact />
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
                                    <SearchBar compact />
                                </div>
                            )}

                            <div className="mt-4">
                                <Navigation menuItems={settings.header.menuItems} isMobile={true} onItemClick={toggleMobileMenu} />
                            </div>

                            {/* Mobile Auth Actions */}
                            <div className="border-t border-gray-800 pt-6 mt-6 pb-10">
                                {session ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-gray-800">
                                            <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden border-2 border-primary/40">
                                                {session.user?.image ? (
                                                    <img src={session.user.image} alt="User" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-2xl">👤</span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">{session.user?.name || 'Thành viên'}</p>
                                                <p className="text-xs text-gray-500">{session.user?.email}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 gap-2">
                                            <Link
                                                href="/user/tu-phim"
                                                onClick={toggleMobileMenu}
                                                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 text-sm font-medium transition-colors"
                                            >
                                                <span className="text-xl">⭐</span> Tủ phim của tôi
                                            </Link>
                                            {session.user?.role === 'ADMIN' && (
                                                <Link
                                                    href="/admin"
                                                    onClick={toggleMobileMenu}
                                                    className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 text-primary text-sm font-bold border border-primary/20 transition-colors"
                                                >
                                                    <span className="text-xl">🛡️</span> Trang quản trị
                                                </Link>
                                            )}
                                            <button
                                                onClick={() => {
                                                    signOut();
                                                    toggleMobileMenu();
                                                }}
                                                className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg hover:bg-red-500/5 text-red-500/80 text-sm font-medium transition-colors"
                                            >
                                                <span className="text-xl">🚪</span> Đăng xuất
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2 px-1">Tài khoản</p>
                                        <button
                                            onClick={() => {
                                                toggleMobileMenu();
                                                setIsLoginModalOpen(true);
                                            }}
                                            className="w-full py-3.5 rounded-xl font-bold text-white text-center shadow-lg shadow-primary/20 transition-transform active:scale-95"
                                            style={{ backgroundColor: primaryColor }}
                                        >
                                            Đăng nhập
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </header>

        {/* Login Modal — đặt ngoài header để tránh bị clip */}
        <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
        </>
    );
}
