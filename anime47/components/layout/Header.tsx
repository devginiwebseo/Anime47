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
        <header className="border-b border-gray-800" style={{ backgroundColor: settings.header.backgroundColor, color: settings.header.textColor }}>
            {/* Top Header with Logo, Navigation, and Search */}
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between gap-6">
                    {/* Logo */}
                    <Logo src={settings.logoUrl} />

                    {/* Navigation */}
                    <Navigation />

                    {/* Search Bar */}
                    {settings.header.showSearch && <SearchBar />}
                </div>
            </div>
        </header>
    );
}
