'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import SearchBar from '../ui/SearchBar';
import Logo from '../ui/Logo';
import Navigation from '../ui/Navigation';

import { useSiteSettings } from '@/hooks/useSiteSettings';

export default function Header() {
    const { settings } = useSiteSettings();

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
                <div className="flex items-center justify-between gap-8">
                    {/* Logo */}
                    <Logo src={settings.header.logoUrl || '/logo.png'} />

                    {/* Navigation */}
                    <Navigation menuItems={settings.header.menuItems} />

                    {/* Search Bar */}
                    {settings.header.showSearch && <SearchBar />}
                </div>
            </div>
        </header>
    );
}
