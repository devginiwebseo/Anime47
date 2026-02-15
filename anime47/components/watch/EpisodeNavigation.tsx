'use client';

import React from 'react';
import Link from 'next/link';

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
    return (
        <div className="space-y-4">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-400">
                <Link href="/" className="hover:text-red-500 transition-colors">
                    🏠 Anime47
                </Link>
                <span>▶</span>
                <Link href="/anime" className="hover:text-red-500 transition-colors">
                    Anime Bộ
                </Link>
                <span>▶</span>
                <Link 
                    href={`/anime/${animeSlug}`} 
                    className="hover:text-red-500 transition-colors line-clamp-1"
                >
                    {animeTitle}
                </Link>
                <span>▶</span>
                <span className="text-red-500 font-semibold">Tập {currentEpisode}</span>
            </div>

            {/* Episode Title */}
            <h1 className="text-2xl md:text-3xl font-bold text-red-500">
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
                <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-semibold transition-colors">
                    SERVER 1
                </button>

                {/* Additional Controls */}
                <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm font-semibold transition-colors flex items-center gap-2">
                    🌙 Tắt đèn
                </button>

                <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm font-semibold transition-colors flex items-center gap-2">
                    📥 Tải xuống
                </button>

                <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm font-semibold transition-colors flex items-center gap-2">
                    🐛 Báo lỗi
                </button>
            </div>
        </div>
    );
}
