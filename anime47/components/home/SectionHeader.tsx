import React from 'react';
import Link from 'next/link';

interface SectionHeaderProps {
    title: string;
    href?: string;
    icon?: string;
}

export default function SectionHeader({ title, href, icon = '📺' }: SectionHeaderProps) {
    return (
        <div className="flex items-center justify-between mb-6 pb-3 border-b-2 border-red-600">
            <h2 className="text-2xl font-bold text-red-500 uppercase tracking-wide flex items-center gap-2">
                <span>{icon}</span>
                {title}
            </h2>
            {href && (
                <Link
                    href={href}
                    className="text-gray-400 hover:text-red-500 transition-colors text-sm font-medium flex items-center gap-1"
                >
                    Xem tất cả
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </Link>
            )}
        </div>
    );
}
