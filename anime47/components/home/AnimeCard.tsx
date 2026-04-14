'use client';

import React, { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { resolveImageUrl, shouldBypassNextImageOptimization } from '@/lib/image-url';

interface AnimeCardProps {
    id: string;
    title: string;
    slug: string;
    coverImage?: string;
    rating?: number;
    quality?: string;
    totalEpisodes?: number;
    currentEpisode?: number;
    isNew?: boolean;
    status?: string;
    views?: number | string | null;
    totalViews?: number | string | null;
    viewCount?: number | string | null;
    total_views?: number | string | null;
    // Hover popup extra info
    genres?: string[];
    year?: number;
    director?: string;
    cast?: string;
    duration?: string;
    language?: string;
    isScheduleCard?: boolean;
}

export default function AnimeCard({
    id,
    title,
    slug,
    coverImage,
    rating,
    quality = 'FHD',
    totalEpisodes,
    currentEpisode,
    isNew = false,
    status,
    views = 0,
    totalViews,
    viewCount,
    total_views,
    genres,
    year,
    director,
    cast,
    duration,
    language,
    isScheduleCard = false,
}: AnimeCardProps) {
    // Có ít nhất 1 tập → đang chiếu; không có tập nào → sắp chiếu
    const hasEpisodes = currentEpisode != null && currentEpisode > 0;
    const normalizedViews = Number(views ?? totalViews ?? viewCount ?? total_views ?? 0) || 0;
    const [hoverPos, setHoverPos] = useState<'left' | 'right'>('right');
    const [isHovered, setIsHovered] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    let statusText = '';
    if (!hasEpisodes) {
        statusText = ''; // Sắp chiếu — không hiện badge tập
    } else if (status === 'completed' || status === 'Hoàn thành' || status === 'Full') {
        statusText = 'FULL';
    } else if (currentEpisode) {
        statusText = `TẬP ${currentEpisode}`;
    } else if (isNew) {
        statusText = 'MỚI';
    }

    const episodeText = totalEpisodes
        ? `${currentEpisode ?? '?'}/${totalEpisodes}`
        : currentEpisode
        ? `${currentEpisode}`
        : '???';

    const resolvedCoverImage = resolveImageUrl(coverImage);
    const bypassOptimization = shouldBypassNextImageOptimization(coverImage);

    // Cast: lấy 2 tên đầu tiên
    const castList = cast
        ? cast.split(',').map((c) => c.trim()).filter(Boolean).slice(0, 2)
        : [];
    // Director: lấy tên đầu tiên
    const directorName = director
        ? director.split(',')[0].trim()
        : null;
    // Genres: lấy 3 cái đầu tiên
    const genreList = genres?.slice(0, 3) || [];

    const handleMouseEnter = useCallback(() => {
        if (cardRef.current) {
            const rect = cardRef.current.getBoundingClientRect();
            const mid = window.innerWidth / 2;
            setHoverPos(rect.left + rect.width / 2 < mid ? 'right' : 'left');
        }
        setIsHovered(true);
    }, []);

    return (
        <div
            ref={cardRef}
            className="group block relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Link href={`/anime/${slug}/`} className="block">
                <div className="relative overflow-hidden rounded-lg shadow-lg transition-transform duration-300 group-hover:scale-105 group-hover:-translate-y-1">
                    {/* Cover Image */}
                    <div className="aspect-[2/3] relative bg-[#1c1d22]">
                        {resolvedCoverImage ? (
                            <Image
                                src={resolvedCoverImage}
                                alt={title}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                                priority
                                unoptimized={bypassOptimization}
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-gray-500 text-4xl">🎬</span>
                            </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>

                        {/* Upcoming Overlay — chỉ hiện trong Lịch Chiếu khi chưa có tập nào */}
                        {isScheduleCard && !hasEpisodes && (
                            <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center p-4 pointer-events-none z-10 transition-all duration-300 group-hover:opacity-0 group-hover:scale-110">
                                <div className="text-4xl md:text-5xl font-[1000] text-white/80 leading-none drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] tracking-tighter italic">
                                    {year || new Date().getFullYear()}
                                </div>
                                <h3 className="mt-4 text-white font-bold text-sm md:text-base leading-tight line-clamp-2 text-center drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
                                    {title}
                                </h3>
                            </div>
                        )}

                        {/* Badges TOP */}
                        <div className="absolute top-2 left-2 right-2 flex justify-between items-start z-30">
                            <div className="bg-black/60 backdrop-blur-md text-white px-2 py-0.5 rounded flex items-center gap-1 text-[10px] font-bold border border-white/10 shadow-lg">
                                <span className="text-yellow-400">★</span>
                                {(rating || 0).toFixed(1)}
                            </div>
                            {statusText && (
                                <div className="bg-primary text-white px-2 py-0.5 rounded text-[10px] font-bold shadow-lg uppercase transition-transform group-hover:scale-110">
                                    {statusText}
                                </div>
                            )}
                        </div>

                        {/* Bottom Status Bar — chỉ hiện trong Lịch Chiếu */}
                        {isScheduleCard && (
                            <div className="absolute bottom-0 left-0 right-0 z-30">
                                <div className="bg-primary text-white text-center py-2 text-[11px] font-black tracking-[0.2em] uppercase shadow-[0_-4px_12px_rgba(0,0,0,0.5)] border-t border-white/10">
                                    {hasEpisodes ? 'ĐANG CHIẾU' : 'SẮP CHIẾU'}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Title below image - only if not upcoming? No, always keep for SEO */}
                <div className="mt-3 px-0.5">
                    <h3 className="text-gray-100 font-bold text-[15px] leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                        {title}
                    </h3>
                </div>
            </Link>

            {/* Hover Info Popup */}
            {isHovered && (
                <div
                    className={`absolute top-0 z-[100] w-[230px] bg-[#16171f] border border-gray-700/60 rounded-xl shadow-2xl overflow-hidden pointer-events-none animate-fadeIn
                        ${hoverPos === 'right' ? 'left-[calc(100%+8px)]' : 'right-[calc(100%+8px)]'}
                    `}
                >
                    {/* Top accent line */}
                    <div className="h-[3px] bg-primary w-full" />

                    <div className="p-3.5 space-y-2.5">
                        {/* Title */}
                        <h4 className="text-white font-black text-[13px] leading-snug line-clamp-2">
                            {title}
                        </h4>

                        {/* Meta pills row */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="bg-primary text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">
                                {quality}
                            </span>
                            <span className="text-yellow-400 text-[11px] font-black">
                                ★ {(rating || 0).toFixed(1)}
                            </span>
                            <span className="text-gray-400 text-[10px]">•</span>
                            <span className="text-gray-300 text-[10px] font-bold">
                                Tập {episodeText}
                            </span>
                            {year && (
                                <>
                                    <span className="text-gray-400 text-[10px]">•</span>
                                    <span className="text-gray-400 text-[10px]">{year}</span>
                                </>
                            )}
                            {duration && (
                                <>
                                    <span className="text-gray-400 text-[10px]">•</span>
                                    <span className="text-gray-400 text-[10px]">{duration}</span>
                                </>
                            )}
                        </div>

                        {/* Genres */}
                        {genreList.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                                {genreList.map((g, i) => (
                                    <span key={i} className="bg-gray-800 text-gray-300 text-[10px] px-2 py-0.5 rounded-full border border-gray-700/50">
                                        {g}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Director */}
                        {directorName && (
                            <div className="flex items-start gap-1.5 text-[11px]">
                                <span className="text-gray-500 shrink-0 pt-[1px]">🎬</span>
                                <span className="text-gray-300 line-clamp-1">{directorName}</span>
                            </div>
                        )}

                        {/* Cast */}
                        {castList.length > 0 && (
                            <div className="flex items-start gap-1.5 text-[11px]">
                                <span className="text-gray-500 shrink-0 pt-[1px]">👤</span>
                                <span className="text-gray-300 line-clamp-1">{castList.join(', ')}</span>
                            </div>
                        )}

                        {/* Language */}
                        {language && (
                            <div className="flex items-center gap-1.5 text-[11px]">
                                <span className="text-gray-500">🔊</span>
                                <span className="text-gray-300">{language}</span>
                            </div>
                        )}

                        {/* CTA */}
                        <div className="pt-1">
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
