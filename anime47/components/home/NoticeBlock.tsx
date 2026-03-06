import React from 'react';
import Link from 'next/link';

interface NoticeBlockProps {
    content: string;
    alertType: 'info' | 'success' | 'warning' | 'danger';
    showIcon?: boolean;
    textLink?: string;
    urlLink?: string;
}

export default function NoticeBlock({ content, alertType, showIcon = true, textLink, urlLink }: NoticeBlockProps) {
    if (!content) return null;

    let colors = {
        bg: 'bg-blue-50/50',
        border: 'border-blue-100',
        text: 'text-blue-800',
        icon: 'text-blue-500',
        symbol: 'ℹ️'
    };

    switch (alertType) {
        case 'success':
            colors = {
                bg: 'bg-green-50/50',
                border: 'border-green-100',
                text: 'text-green-800',
                icon: 'text-green-500',
                symbol: '✅'
            };
            break;
        case 'warning':
            colors = {
                bg: 'bg-yellow-50/50',
                border: 'border-yellow-100',
                text: 'text-yellow-800',
                icon: 'text-yellow-600',
                symbol: '⚠️'
            };
            break;
        case 'danger':
            colors = {
                bg: 'bg-red-50/50',
                border: 'border-red-100',
                text: 'text-red-800',
                icon: 'text-red-500',
                symbol: '🔥'
            };
            break;
    }

    return (
        <div className={`mb-8 border rounded-xl p-6 flex gap-4 backdrop-blur-sm transition-all shadow-sm ${colors.bg} ${colors.border}`}>
            {showIcon && (
                <div className={`text-xl flex-shrink-0 mt-0.5 ${colors.icon}`}>
                    {colors.symbol}
                </div>
            )}
            <div className="flex-1 space-y-3">
                <div
                    className={`text-sm md:text-base font-medium leading-relaxed ${colors.text}`}
                    dangerouslySetInnerHTML={{ __html: content }}
                />

                {textLink && urlLink && (
                    <Link
                        href={urlLink}
                        className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors group"
                    >
                        {textLink}
                        <span className="group-hover:translate-x-1 transition-transform">›</span>
                    </Link>
                )}
            </div>
        </div>
    );
}
