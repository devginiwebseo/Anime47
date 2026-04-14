'use client';

import React, { useState, useRef, useCallback } from 'react';
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

function RankingItem({ anime, index }: { anime: RankingAnime; index: number }) {
    const [isHovered, setIsHovered] = useState(false);
    const [hoverPos, setHoverPos] = useState<'left' | 'right'>('right');
    const itemRef = useRef<HTMLAnchorElement>(null);

    const handleMouseEnter = useCallback(() => {
        if (itemRef.current) {
            const rect = itemRef.current.getBoundingClientRect();
            setHoverPos(rect.left + rect.width / 2 < window.innerWidth / 2 ? 'right' : 'left');
        }
        setIsHovered(true);
    }, []);

    return (
        <div className="relative">
            <Link
                ref={itemRef}
                href={`/anime/${anime.slug}`}
                className="group flex gap-4 p-3 bg-[#111216] hover:bg-[#1a1b21] rounded-lg border border-gray-800/30 transition-all duration-200"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Thumbnail */}
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
                    {/* Rank Badge */}
                    <div className={`absolute top-0.5 left-0.5 w-7 h-5 flex items-center justify-center rounded-[4px] text-[10px] font-black z-10 shadow-md ${index < 3 ? 'bg-[#d32f2f] text-white' : 'bg-gray-900/90 text-gray-400'}`}>
                        #{index + 1}
                    </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h4 className="text-white font-bold text-sm mb-1.5 line-clamp-1 group-hover:text-primary transition-colors pr-2">
                        {anime.title}
                    </h4>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-[#d32f2f]/10 text-yellow-500 px-2 py-0.5 rounded-md text-[10px] font-black border border-yellow-500/20">
                            <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                            </svg>
                            {anime.rating.toFixed(1)}
                        </div>
                        <div className="bg-gray-800/60 text-gray-300 px-2.5 py-0.5 rounded-md text-[10px] font-black border border-gray-700/50">
                            {anime.episodes || '??'}
                        </div>
                        {anime.year && (
                            <span className="text-gray-500 text-[10px] font-bold">{anime.year}</span>
                        )}
                    </div>
                </div>
            </Link>

            {/* Hover Info Popup */}
            {isHovered && (
                <div
                    className={`absolute top-0 z-[100] w-[230px] bg-[#1a1b23] border border-gray-700/80 rounded-xl shadow-2xl p-4 pointer-events-none animate-fadeIn
                        ${hoverPos === 'right' ? 'left-[calc(100%+6px)]' : 'right-[calc(100%+6px)]'}
                    `}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded ${index < 3 ? 'bg-primary text-white' : 'bg-gray-700 text-gray-300'}`}>
                            #{index + 1}
                        </span>
                        <span className="flex items-center gap-1 text-yellow-400 text-[11px] font-black">
                            ★ {anime.rating.toFixed(1)}
                        </span>
                    </div>
                    <h4 className="text-white font-black text-[13px] leading-snug mb-2 line-clamp-2">
                        {anime.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-gray-400">
                        <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            {anime.episodes || '???'}
                        </span>
                        {anime.year && <span>{anime.year}</span>}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function RankingBoard({ rankingData, title = 'Bảng Xếp Hạng' }: RankingBoardProps) {
    const [activeTab, setActiveTab] = useState<TabType>('HOT NGÀY');

    const defaultData: Record<TabType, RankingAnime[]> = {
        'HOT NGÀY': [],
        'THÁNG': [],
        'NĂM': [],
    };

    const data = rankingData || defaultData;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="relative mb-6 pb-2">
                <h2 className="text-lg md:text-2xl font-bold text-primary uppercase tracking-wider inline-block relative">
                    {title}
                    <div className="absolute -bottom-[9px] left-0 w-full h-[2px] bg-primary"></div>
                </h2>
            </div>

            {/* Tabs */}
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

            {/* Ranking List */}
            {data[activeTab].length > 0 ? (
                <div className="anime-ranking-grid grid grid-cols-1 gap-3">
                    {data[activeTab].map((anime, index) => (
                        <RankingItem key={anime.id} anime={anime} index={index} />
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
