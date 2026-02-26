'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface SubMenuItem {
    label: string;
    href: string;
}

interface MenuItem {
    label: string;
    href: string;
    submenu?: SubMenuItem[];
}

export default function Navigation({ menuItems = [] }: { menuItems?: MenuItem[] }) {
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    return (
        <nav className="flex-1">
            <ul className="flex flex-wrap items-center gap-6">
                {menuItems.map((item) => (
                    <li
                        key={item.label}
                        className="relative group"
                        onMouseEnter={() => item.submenu && setActiveDropdown(item.label)}
                        onMouseLeave={() => setActiveDropdown(null)}
                    >
                        <Link
                            href={item.href}
                            className="text-white hover:text-primary transition-colors duration-200 font-medium text-sm tracking-wide flex items-center gap-1"
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
