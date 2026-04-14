'use client';

import React from 'react';
import Link from 'next/link';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { getSiteDisplayName } from '@/lib/site-branding';

interface EpisodeNavigationProps {
    animeTitle: string;
    animeSlug: string;
    currentEpisode: number;
    totalEpisodes: number;
    hasNextEpisode: boolean;
    hasPrevEpisode: boolean;
}

export default function EpisodeNavigation({
    animeTitle,
    animeSlug,
    currentEpisode,
    totalEpisodes,
    hasNextEpisode,
    hasPrevEpisode,
}: EpisodeNavigationProps) {
    const { settings } = useSiteSettings();
    const siteDisplayName = getSiteDisplayName(settings);

    return (
        <div className="space-y-4">
            {/* Breadcrumb Container */}
            <div className="bg-[#1a1c23] border border-gray-800 rounded px-4 py-2.5 flex flex-wrap items-center gap-2 text-[13px] text-gray-300">
                <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1.5 font-bold text-primary text-[16px]">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" style={{ marginTop: '-2px' }}>
                        <path d="M12 3L1 12h3v9h6v-6h4v6h6v-9h3L12 3z"/>
                    </svg>
                    {siteDisplayName}
                </Link>
                <span className="text-gray-500 font-bold mx-0.5">»</span>
                <Link href="/anime" className="hover:text-primary transition-colors font-bold text-primary">
                    Anime Bộ
                </Link>
                <span className="text-gray-500 font-bold mx-0.5">»</span>
                <Link
                    href={`/anime/${animeSlug}`}
                    className="hover:text-primary transition-colors font-bold text-primary line-clamp-1 max-w-[200px] sm:max-w-[400px]"
                >
                    {animeTitle}
                </Link>
                <span className="text-gray-500 font-bold mx-0.5">»</span>
                <span className="text-white font-bold">Tập {currentEpisode}</span>
            </div>

            {/* Episode Title */}
            <h1 className="text-2xl md:text-[28px] font-bold text-primary my-[50px]">
                {animeTitle} - Tập {currentEpisode}
            </h1>
        </div>
    );
}
