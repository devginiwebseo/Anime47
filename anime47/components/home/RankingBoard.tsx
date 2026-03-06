'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

type TabType = 'HOT NGÀY' | 'THÁNG' | 'NĂM';

interface RankingAnime {
    id: string;
    title: string;
    slug: string;
    coverImage?: string;
    rating: number;
    episodes?: string;
    year?: number;
}

interface RankingBoardProps {
    rankingData?: Record<TabType, RankingAnime[]>;
    title?: string;
}

export default function RankingBoard({ rankingData, title = 'Bảng Xếp Hạng' }: RankingBoardProps) {
    const [activeTab, setActiveTab] = useState<TabType>('HOT NGÀY');

    // Dữ liệu mặc định nếu không có data từ props
    const defaultData: Record<TabType, RankingAnime[]> = {
        'HOT NGÀY': [],
        'THÁNG': [],
        'NĂM': [],
    };

    const data = rankingData || defaultData;

    return (
        <div className="space-y-6">
            {/* Header style - Modern & Clean */}
            <div className="border-b border-primary/30 pb-3 mb-6">
                <h2 className="text-xl md:text-2xl font-black tracking-tight text-white uppercase flex items-center gap-3">
                    <span className="text-primary tracking-widest">{title}</span>
                </h2>
            </div>

            {/* Tabs Style - Compact & Elegant */}
            <div className="flex bg-[#111216]/50 p-1 rounded-lg w-fit border border-gray-800/50 mb-6">
                {(['HOT NGÀY', 'THÁNG', 'NĂM'] as TabType[]).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-1.5 rounded-md text-[10px] font-black transition-all duration-300 tracking-wider ${activeTab === tab
                            ? 'bg-primary text-white shadow-lg'
                            : 'text-gray-500 hover:text-gray-300'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Ranking List - Smaller, more compact cards */}
            {data[activeTab].length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                    {data[activeTab].map((anime, index) => (
                        <Link
                            key={anime.id}
                            href={`/anime/${anime.slug}`}
                            className="group flex gap-4 p-3 bg-[#111216] hover:bg-[#1a1b21] rounded-lg border border-gray-800/30 transition-all duration-200"
                        >
                            {/* Smaller Thumbnail */}
                            <div className="relative w-[70px] h-[95px] flex-shrink-0 rounded-md overflow-hidden ring-1 ring-white/5 shadow-lg">
                                {anime.coverImage ? (
                                    <Image
                                        src={anime.coverImage}
                                        alt={anime.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        sizes="70px"
                                    />
                                ) : (
                                    <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                                        <span className="text-gray-700 text-xs">🎬</span>
                                    </div>
                                )}
                                {/* Minimalist Rank Badge */}
                                <div className={`absolute top-0.5 left-0.5 w-7 h-5 flex items-center justify-center rounded-[4px] text-[10px] font-black z-10 shadow-md ${index < 3 ? 'bg-[#d32f2f] text-white' : 'bg-gray-900/90 text-gray-400'}`}>
                                    #{index + 1}
                                </div>
                            </div>

                            {/* Info - Single Row Metadata */}
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <h4 className="text-white font-bold text-sm mb-1.5 line-clamp-1 group-hover:text-primary transition-colors pr-2">
                                    {anime.title}
                                </h4>
                                <div className="flex items-center gap-2">
                                    {/* Compact Rating Pill */}
                                    <div className="flex items-center gap-1 bg-[#d32f2f]/10 text-yellow-500 px-2 py-0.5 rounded-md text-[10px] font-black border border-yellow-500/20">
                                        <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
                                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                        </svg>
                                        {anime.rating.toFixed(1)}
                                    </div>

                                    {/* Compact Episode Pill */}
                                    <div className="bg-gray-800/60 text-gray-300 px-2.5 py-0.5 rounded-md text-[10px] font-black border border-gray-700/50">
                                        Tập {anime.episodes || '??'}
                                    </div>

                                    {/* Simple Year */}
                                    {anime.year && (
                                        <span className="text-gray-500 text-[10px] font-bold">
                                            {anime.year}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 text-gray-400">
                    <p>Chưa có dữ liệu xếp hạng</p>
                </div>
            )}
        </div>
    );
}
