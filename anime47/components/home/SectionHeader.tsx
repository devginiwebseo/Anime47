import React from 'react';
import Link from 'next/link';

interface SectionHeaderProps {
    title: string;
    icon?: string;
}

export default function SectionHeader({ title, icon = '📺' }: SectionHeaderProps) {
    return (
        <div className="relative mb-8 pb-2">
            <h2 className="w-full text-xl md:text-2xl font-black text-primary uppercase tracking-wider inline-block relative">
                {title}
                <div className="absolute -bottom-[10px] left-0 w-full h-[2px] bg-primary"></div>
            </h2>
        </div>
    );
}
