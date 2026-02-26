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

export default function Navigation({
    menuItems = [],
    isMobile = false,
    onItemClick
}: {
    menuItems?: MenuItem[],
    isMobile?: boolean,
    onItemClick?: () => void
}) {
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    const toggleDropdown = (label: string) => {
        if (activeDropdown === label) {
            setActiveDropdown(null);
        } else {
            setActiveDropdown(label);
        }
    };

    return (
        <nav className={isMobile ? "w-full" : "flex-1"}>
            <ul className={isMobile ? "flex flex-col space-y-1" : "flex flex-wrap items-center gap-6"}>
                {menuItems.map((item) => (
                    <li
                        key={item.label}
                        className={`relative group ${isMobile ? 'w-full' : ''}`}
                        onMouseEnter={() => !isMobile && item.submenu && setActiveDropdown(item.label)}
                        onMouseLeave={() => !isMobile && setActiveDropdown(null)}
                    >
                        <div className={`flex items-center justify-between ${isMobile ? 'w-full border-b border-gray-800/50' : ''}`}>
                            <Link
                                href={item.href}
                                onClick={() => {
                                    if (onItemClick && (!item.submenu || !isMobile)) {
                                        onItemClick();
                                    }
                                }}
                                className={`text-white hover:text-primary transition-colors duration-200 font-medium tracking-wide flex items-center gap-1 ${isMobile ? 'py-3 flex-1 uppercase text-sm font-bold' : 'text-sm'}`}
                            >
                                {item.label}
                                {!isMobile && item.submenu && (
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

                            {isMobile && item.submenu && (
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        toggleDropdown(item.label);
                                    }}
                                    className="p-3 text-gray-400 hover:text-white"
                                >
                                    <svg
                                        className={`w-5 h-5 transition-transform duration-200 ${activeDropdown === item.label ? 'rotate-180' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {/* Dropdown Menu */}
                        {item.submenu && activeDropdown === item.label && (
                            <div className={
                                isMobile
                                    ? "w-full bg-[#1c1d22] rounded-lg mt-2 mb-1 py-3 px-3 space-y-1 border border-gray-800 shadow-inner"
                                    : "absolute top-full left-0 mt-2 w-56 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 py-2 animate-fadeIn"
                            }>
                                <div className={isMobile ? "flex flex-col gap-1" : "grid grid-cols-2 gap-1 p-2"}>
                                    {item.submenu.map((subItem) => (
                                        <Link
                                            key={subItem.label}
                                            href={subItem.href}
                                            onClick={onItemClick}
                                            className={`text-gray-300 hover:text-white hover:bg-gray-800 rounded transition-all duration-150 ${isMobile ? 'px-4 py-2.5 text-sm bg-[#111216]/50 uppercase font-bold text-[12px]' : 'px-3 py-2 text-sm'}`}
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
