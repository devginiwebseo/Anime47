'use client';
import React, { useState, useEffect } from 'react';
import AnimeCard from './AnimeCard';
import SectionHeader from './SectionHeader';
import SeeMoreButton from './SeeMoreButton';

import { getGridColsClass } from '@/lib/helpers';

interface SectionProps {
    title: string;
    limit?: number;
    numColumns?: number;
}

const TABS = [
    { label: 'ANIME BỘ', slug: 'anime-bo' },
    { label: 'ANIME LẺ', slug: 'anime-le' },
    { label: 'HOÀN THÀNH', slug: 'anime-hoan-thanh' },
];

export default function RecommendedSection({ title, limit = 8, numColumns = 4 }: SectionProps) {
    const [activeTab, setActiveTab] = useState(TABS[0].slug);
    const [animeData, setAnimeData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const gridColsClass = getGridColsClass(numColumns);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://anime.datatruyen.online';
                const res = await fetch(`${apiUrl}/api/public/genres?slug=${activeTab}&limit=${limit}&page=1`);
                if (res.ok) {
                    const result = await res.json();
                    const stories = result.data || [];

                    const formattedData = stories.map((story: any) => ({
                        id: story.id,
                        title: story.title,
                        slug: story.slug,
                        coverImage: story.coverImage || undefined,
                        rating: story.averageRating || undefined,
                        quality: story.quality || 'HD',
                        totalEpisodes: story.totalEpisodes > 0 ? story.totalEpisodes : undefined,
                        currentEpisode: story.latestChapter?.index || undefined,
                        isNew: false,
                    }));
                    setAnimeData(formattedData);
                }
            } catch (error) {
                console.error("Error fetching recommended anime:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [activeTab, limit]);

    return (
        <section className="mb-12">
            <SectionHeader title={title} />

            {/* Tabs */}
            <div className="flex justify-center items-center space-x-2 md:space-x-6 mb-6 mt-2 text-sm font-medium border-b border-gray-800 pb-2">
                {TABS.map((tab) => (
                    <button
                        key={tab.slug}
                        onClick={() => setActiveTab(tab.slug)}
                        className={`px-4 py-1.5 transition-all duration-300 rounded-full ${activeTab === tab.slug
                                ? 'text-primary border border-primary shadow-[0_0_10px_rgba(var(--theme-primary-rgb),0.3)]'
                                : 'text-gray-500 hover:text-gray-300 uppercase border border-transparent'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                {loading ? (
                    <div className={`grid grid-cols-2 md:grid-cols-3 ${gridColsClass} gap-4 opacity-50`}>
                        {/* Placeholder vắn tắt trong lúc load */}
                        {Array.from({ length: limit }).map((_, i) => (
                            <div key={i} className="animate-pulse bg-gray-800 rounded-lg aspect-[2/3] w-full"></div>
                        ))}
                    </div>
                ) : animeData.length > 0 ? (
                    <div className={`grid grid-cols-2 md:grid-cols-3 ${gridColsClass} gap-4`}>
                        {animeData.map((anime) => (
                            <AnimeCard key={anime.id} {...anime} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 py-8">Không có dữ liệu.</div>
                )}

                <SeeMoreButton href={`the-loai/${activeTab}`} />
            </div>
        </section>
    );
}
