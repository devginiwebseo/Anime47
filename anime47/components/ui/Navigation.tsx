'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
    const pathname = usePathname();
    const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
    const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const toggleDropdown = (index: number) => {
        if (activeDropdown === index) {
            setActiveDropdown(null);
        } else {
            setActiveDropdown(index);
        }
    };

    const openDropdown = (index: number) => {
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }

        setActiveDropdown(index);
    };

    const closeDropdownWithDelay = () => {
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
        }

        closeTimeoutRef.current = setTimeout(() => {
            setActiveDropdown(null);
            closeTimeoutRef.current = null;
        }, 120);
    };

    return (
        <nav className={isMobile ? "w-full" : "relative flex-1"}>
            <ul className={isMobile ? "flex flex-col space-y-1" : "flex flex-wrap items-center gap-6"}>
                {menuItems.map((item, index) => {
                    const isActive = pathname === item.href || (item.submenu?.some(sub => sub.href === pathname));
                    const isDropdownActive = activeDropdown === index;

                    return (
                        <li
                            key={`${item.label}-${index}`}
                            className={`relative group ${isMobile ? 'w-full' : ''}`}
                            onMouseEnter={() => !isMobile && item.submenu && openDropdown(index)}
                            onMouseLeave={() => !isMobile && closeDropdownWithDelay()}
                        >
                            <div className={`flex items-center justify-between ${isMobile ? 'w-full border-b border-gray-800/50' : ''}`}>
                                <Link
                                    href={item.href}
                                    onClick={() => {
                                        if (onItemClick && (!item.submenu || !isMobile)) {
                                            onItemClick();
                                        }
                                    }}
                                    className={`uppercase transition-colors duration-200 font-bold tracking-wide flex items-center gap-1 ${isActive ? 'text-primary' : 'text-white hover:text-primary'} ${isMobile ? 'py-3 flex-1 text-sm' : 'text-sm md:text-base'}`}
                                >
                                    {item.label}
                                    {!isMobile && item.submenu && (
                                        <svg
                                            className={`w-3.5 h-3.5 transition-transform duration-200 ${isDropdownActive ? 'rotate-180 text-primary' : 'text-gray-400 group-hover:text-primary'}`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    )}
                                </Link>

                                {isMobile && item.submenu && (
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            toggleDropdown(index);
                                        }}
                                        className="p-3 text-gray-400 hover:text-white"
                                    >
                                        <svg
                                            className={`w-5 h-5 transition-transform duration-200 ${activeDropdown === index ? 'rotate-180' : ''}`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                )}
                            </div>

                            {/* Mobile Submenu Inline */}
                            {isMobile && item.submenu && activeDropdown === index && (
                                <div className="w-full  rounded-lg mt-2 mb-1 py-3  space-y-1">
                                    <div className="flex flex-col gap-1">
                                        {item.submenu.map((subItem) => (
                                            <Link
                                                key={subItem.label}
                                                href={subItem.href}
                                                onClick={onItemClick}
                                                className={`px-4 py-2.5 bg-[#111216]/50 rounded transition-all duration-150 uppercase font-normal text-xs tracking-tight ${pathname === subItem.href ? 'text-primary' : 'text-gray-200 hover:text-primary'}`}
                                            >
                                                {subItem.label}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Desktop Mega Menu - Styled to match Reference Image */}
                            {!isMobile && item.submenu && activeDropdown === index && (
                                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 z-50">
                                    {/* The small triangle pointing up - centered and matching the border */}
                                    <div className="absolute top-[11px] left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-[#0b1016] border-t border-l border-primary/50 rotate-45 z-[51]"></div>

                                    <div
                                        className="relative w-[650px] bg-[#0b1016] border border-primary/50 rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.8)] p-8 animate-fadeIn"
                                    >
                                        <div className="grid grid-cols-4 gap-y-6">
                                            {item.submenu.map((subItem) => (
                                                <Link
                                                    key={subItem.label}
                                                    href={subItem.href}
                                                    onClick={onItemClick}
                                                    className={`block transition-colors duration-200 uppercase font-semibold text-[13px] tracking-wide text-center ${pathname === subItem.href ? 'text-primary' : 'text-gray-200 hover:text-primary'}`}
                                                >
                                                    {subItem.label}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
