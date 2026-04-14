'use client';

import React, { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface HotAnime {
    id: string;
    title: string;
    slug: string;
    coverImage?: string;
    rating: number;
    episodes: string;
    year?: number;
    genres?: string[];
    director?: string;
    cast?: string;
    duration?: string;
}

function HotAnimeItem({ anime, apiUrl }: { anime: HotAnime; apiUrl: string }) {
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

    const resolvedImage = anime.coverImage
        ? anime.coverImage.includes('/upload/')
            ? `/proxy-images${anime.coverImage.substring(anime.coverImage.indexOf('/upload/') + 7)}`
            : anime.coverImage
        : null;

    const genreList = anime.genres?.slice(0, 3) || [];
    const directorName = anime.director?.split(',')[0]?.trim();
    const castList = anime.cast?.split(',').map((c) => c.trim()).slice(0, 2) || [];

    return (
        <div className="relative">
            <Link
                ref={itemRef}
                href={`/anime/${anime.slug}`}
                className="flex gap-4 p-3 bg-[#111216] hover:bg-[#1a1b21] border border-gray-800/30 rounded-lg group transition-all duration-300"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Thumbnail */}
                <div className="relative w-[70px] h-[95px] flex-shrink-0 rounded-md overflow-hidden ring-1 ring-white/5 shadow-lg">
                    {resolvedImage ? (
                        <Image
                            src={resolvedImage}
                            alt={anime.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                            sizes="80px"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                            <span className="text-gray-700 text-xs">🎬</span>
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h4 className="text-white font-bold text-sm mb-1.5 line-clamp-1 group-hover:text-primary transition-colors pr-2 leading-snug">
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
                            Tập {anime.episodes}
                        </div>
                        {anime.year && (
                            <span className="text-gray-500 text-[10px] font-bold">{anime.year}</span>
                        )}
                    </div>
                    {/* Genre pills */}
                    {genreList.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                            {genreList.map((g, i) => (
                                <span key={i} className="bg-gray-800 text-gray-400 text-[9px] px-1.5 py-0.5 rounded-full border border-gray-700/40">
                                    {g}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </Link>

            {/* Hover Info Popup */}
            {isHovered && (
                <div
                    className={`absolute top-0 z-[100] w-[230px] bg-[#16171f] border border-gray-700/60 rounded-xl shadow-2xl overflow-hidden pointer-events-none animate-fadeIn
                        ${hoverPos === 'right' ? 'left-[calc(100%+6px)]' : 'right-[calc(100%+6px)]'}
                    `}
                >
                    <div className="h-[3px] bg-primary w-full" />
                    <div className="p-3.5 space-y-2">
                        <h4 className="text-white font-black text-[13px] leading-snug line-clamp-2">
                            {anime.title}
                        </h4>
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-yellow-400 text-[11px] font-black">★ {anime.rating.toFixed(1)}</span>
                            <span className="text-gray-400 text-[10px]">•</span>
                            <span className="text-gray-300 text-[10px] font-bold">Tập {anime.episodes}</span>
                            {anime.year && (
                                <>
                                    <span className="text-gray-400 text-[10px]">•</span>
                                    <span className="text-gray-400 text-[10px]">{anime.year}</span>
                                </>
                            )}
                            {anime.duration && (
                                <>
                                    <span className="text-gray-400 text-[10px]">•</span>
                                    <span className="text-gray-400 text-[10px]">{anime.duration}</span>
                                </>
                            )}
                        </div>

                        {genreList.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                                {genreList.map((g, i) => (
                                    <span key={i} className="bg-gray-800 text-gray-300 text-[10px] px-2 py-0.5 rounded-full border border-gray-700/50">
                                        {g}
                                    </span>
                                ))}
                            </div>
                        )}

                        {directorName && (
                            <div className="flex items-start gap-1.5 text-[11px]">
                                <span className="text-gray-500 shrink-0">🎬</span>
                                <span className="text-gray-300 line-clamp-1">{directorName}</span>
                            </div>
                        )}

                        {castList.length > 0 && (
                            <div className="flex items-start gap-1.5 text-[11px]">
                                <span className="text-gray-500 shrink-0">👤</span>
                                <span className="text-gray-300 line-clamp-1">{castList.join(', ')}</span>
                            </div>
                        )}

                        <div className="pt-0.5">
                            <div className="w-full bg-primary/10 border border-primary/30 text-primary text-[11px] font-black text-center py-1.5 rounded-lg">
                                XEM PHIM →
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

interface AnimeHotListClientProps {
    hotAnimeData: HotAnime[];
    apiUrl: string;
    title: string;
}

export default function AnimeHotListClient({ hotAnimeData, apiUrl, title }: AnimeHotListClientProps) {
    return (
        <div className="rounded-xl">
            <div className="relative mb-6 pb-2">
                <h3 className="text-lg w-full md:text-2xl font-bold text-primary uppercase tracking-wider inline-block relative">
                    {title}
                    <div className="absolute -bottom-[9px] left-0 w-full h-[2px] bg-primary"></div>
                </h3>
            </div>

            {hotAnimeData.length > 0 ? (
                <div className="anime-hot-grid grid grid-cols-1 gap-4">
                    {hotAnimeData.map((anime) => (
                        <HotAnimeItem key={anime.id} anime={anime} apiUrl={apiUrl} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">Chưa có dữ liệu hot</p>
                </div>
            )}
        </div>
    );
}
