import React from 'react';
import Link from 'next/link';

interface SeeMoreButtonProps {
    href: string;
    text?: string;
}

export default function SeeMoreButton({ href, text = 'XEM THÊM' }: SeeMoreButtonProps) {
    return (
        <div className="mt-8">
            <Link
                href={href}
                className="block w-full py-3.5 bg-gray-800 hover:bg-gray-700 text-[#cccccc] hover:text-white transition-all rounded font-bold tracking-[0.25em] text-center text-[13px] uppercase border border-white/5 hover:border-white/10"
            >
                {text}
            </Link>
        </div>
    );
}
