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
}

export default function RankingBoard({ rankingData }: RankingBoardProps) {
    const [activeTab, setActiveTab] = useState<TabType>('HOT NGÀY');

    // Dữ liệu mặc định nếu không có data từ props
    const defaultData: Record<TabType, RankingAnime[]> = {
        'HOT NGÀY': [],
        'THÁNG': [],
        'NĂM': [],
    };

    const data = rankingData || defaultData;

    return (
        <div className="bg-gray-800/50 rounded-xl p-4">
            <h3 className="text-xl font-bold text-primary uppercase mb-4 pb-2 border-b border-gray-700">
                Bảng Xếp Hạng
            </h3>

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
                {(['HOT NGÀY', 'THÁNG', 'NĂM'] as TabType[]).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-2 text-sm font-semibold text-center transition-colors rounded ${activeTab === tab
                                ? 'bg-primary text-white'
                                : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Ranking List */}
            {data[activeTab].length > 0 ? (
                <div className="space-y-3">
                    {data[activeTab].map((anime, index) => (
                        <Link
                            key={anime.id}
                            href={`/anime/${anime.slug}`}
                            className="flex gap-3 group hover:bg-gray-700/50 p-2 rounded transition-all duration-200"
                        >
                            {/* Rank Badge */}
                            <div
                                className={`w-8 h-8 flex-shrink-0 rounded flex items-center justify-center font-bold text-sm ${index === 0
                                    ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-black'
                                    : index === 1
                                        ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-black'
                                        : index === 2
                                            ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white'
                                            : 'bg-gray-700 text-gray-300'
                                    }`}
                            >
                                {index + 1}
                            </div>

                            {/* Thumbnail */}
                            <div className="relative w-12 h-16 flex-shrink-0 rounded overflow-hidden">
                                {anime.coverImage ? (
                                    <Image
                                        src={anime.coverImage}
                                        alt={anime.title}
                                        fill
                                        className="object-cover"
                                        sizes="48px"
                                    />
                                ) : (
                                    <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                                        <span className="text-gray-500 text-lg">🎬</span>
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0 py-1">
                                <h4 className="text-white font-medium text-xs line-clamp-2 group-hover:text-primary transition-colors mb-1">
                                    {anime.title}
                                </h4>
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                    <span className="text-yellow-400">⭐ {anime.rating.toFixed(1)}</span>
                                    {anime.episodes && <span>• {anime.episodes}</span>}
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
