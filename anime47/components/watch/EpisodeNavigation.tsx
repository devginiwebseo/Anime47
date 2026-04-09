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
        <div className="space-y-5 p-6">
            {/* Breadcrumb */}
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400">
                <Link href="/" className="hover:text-primary transition-colors">
                    {siteDisplayName}
                </Link>
                <span>▶</span>
                <Link href="/anime" className="hover:text-primary transition-colors">
                    Anime Bộ
                </Link>
                <span>▶</span>
                <Link
                    href={`/anime/${animeSlug}`}
                    className="hover:text-primary transition-colors line-clamp-1"
                >
                    {animeTitle}
                </Link>
                <span>▶</span>
                <span className="text-primary font-semibold">Tập {currentEpisode}</span>
            </div>

            {/* Episode Title */}
            <h1 className="text-2xl md:text-3xl font-bold text-primary">
                {animeTitle} - Tập {currentEpisode}
            </h1>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3">
                {/* Previous Episode */}
                {hasPrevEpisode ? (
                    <Link
                        href={`/anime/${animeSlug}/tap-${currentEpisode - 1}`}
                        className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm font-semibold transition-colors flex items-center gap-2"
                    >
                        « Tập trước
                    </Link>
                ) : (
                    <button
                        disabled
                        className="bg-gray-800 text-gray-600 px-4 py-2 rounded text-sm font-semibold cursor-not-allowed"
                    >
                        « Tập trước
                    </button>
                )}

                {/* Next Episode */}
                {hasNextEpisode ? (
                    <Link
                        href={`/anime/${animeSlug}/tap-${currentEpisode + 1}`}
                        className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm font-semibold transition-colors flex items-center gap-2"
                    >
                        Tập tiếp »
                    </Link>
                ) : (
                    <button
                        disabled
                        className="bg-gray-800 text-gray-600 px-4 py-2 rounded text-sm font-semibold cursor-not-allowed"
                    >
                        Tập tiếp »
                    </button>
                )}

                {/* Server Selection */}
                <button className="text-white px-4 py-2 rounded text-sm font-semibold transition-colors shadow-[0_4px_14px_0_rgba(211,47,47,0.39)]" style={{ backgroundColor: 'var(--theme-primary, #d32f2f)' }}>
                    SERVER 1
                </button>
            </div>
        </div>
    );
}
