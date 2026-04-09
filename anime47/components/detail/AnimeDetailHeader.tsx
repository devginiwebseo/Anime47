'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { slugify } from '@/lib/helpers';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useEffect } from 'react';
import { resolveImageUrl, shouldBypassNextImageOptimization } from '@/lib/image-url';

interface AnimeDetailHeaderProps {
    title: string;
    slug: string;
    originalTitle?: string;
    year?: number;
    coverImage?: string;
    rating?: number;
    status?: string;
    totalEpisodes?: number;
    quality?: string;
    genres?: string[];
    directors?: { name: string, slug: string }[];
    cast?: string[];
    description?: string;
    duration?: string;
    language?: string;
    views?: number;
    storyId?: string;
}

export default function AnimeDetailHeader({
    title,
    slug,
    originalTitle,
    year,
    coverImage,
    rating = 0,
    status = 'Đang Phát Sóng',
    totalEpisodes,
    quality = 'HD',
    genres = [],
    directors = [],
    cast = [],
    description,
    duration,
    language,
    views = 0,
    storyId,
}: AnimeDetailHeaderProps) {
    const resolvedCoverImage = resolveImageUrl(coverImage);
    const bypassOptimization = shouldBypassNextImageOptimization(coverImage);

    const handleShare = () => {
        if (typeof window !== 'undefined') {
            navigator.clipboard.writeText(window.location.href);
            alert('Đã copy link để chia sẻ!');
        }
    };

    const handleSave = () => {
        alert('Tính năng lưu phim đang được phát triển!');
    };

    const { settings } = useSiteSettings();
    const primaryColor = settings.theme.primaryColor || '#d32f2f';

    useEffect(() => {
        if (storyId) {
            fetch('/api/anime/view', {
                method: 'POST',
                cache: 'no-cache',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ storyId }),
            }).catch(err => console.error('Failed to increment view:', err));
        }
    }, [storyId]);

    return (
        <div className="">
            <div className="flex flex-col md:flex-row gap-5 md:gap-6 lg:gap-8">
                {/* Left Column: Poster & Watch Button */}
                <div className="w-full max-w-[220px] sm:max-w-[260px] md:w-[240px] lg:w-[280px] shrink-0 flex flex-col gap-3 md:gap-4 mx-auto md:mx-0">
                    <div className="aspect-[2/3] relative rounded-lg overflow-hidden shadow-2xl border border-gray-700">
                        {resolvedCoverImage ? (
                            <Image
                                src={resolvedCoverImage}
                                alt={title}
                                fill
                                className="object-cover"
                                priority
                                unoptimized={bypassOptimization}
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                                <span className="text-gray-500 text-6xl">🎬</span>
                            </div>
                        )}
                        {/* Quality Badge - Top Left as seen in some designs, or keep top right */}
                        <div className="absolute top-0 right-0">
                            <div className="text-white px-2.5 py-1 md:px-3 font-bold text-[11px] md:text-xs rounded-bl-lg" style={{ backgroundColor: primaryColor }}>
                                {quality}
                            </div>
                        </div>
                    </div>
                    {/* Watch Button */}
                    <Link
                        href={`/anime/${slug}/tap-1`}
                        className="w-full mt-auto mb-2 md:mb-[12px] hover:brightness-110 text-white font-bold py-3 md:py-3.5 rounded-lg transition-all duration-200 text-center uppercase tracking-wider text-xs sm:text-sm shadow-[0_4px_14px_0_rgba(211,47,47,0.39)]"
                        style={{ backgroundColor: primaryColor }}
                    >
                        Xem Phim
                    </Link>
                </div>

                {/* Right Column: Details */}
                <div className="flex-1 text-white flex flex-col justify-between">
                    <div className="w-full">
                        {/* Title & Subtitle */}
                        <div className="mb-3 md:mb-4">
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 leading-tight" style={{ color: primaryColor }}>
                                {title}
                            </h1>
                            {originalTitle && (
                                <h2 className="text-gray-300 text-sm sm:text-base lg:text-lg font-medium leading-relaxed">{originalTitle}</h2>
                            )}
                            <hr className="border-t-2 mt-3 md:mt-4 mb-2 w-20 sm:w-[100px]" style={{ borderColor: primaryColor }} />
                        </div>

                        {/* Metadata Box */}
                        <div className="bg-[#1c1d22] border border-gray-800 rounded-lg p-3.5 sm:p-4 lg:p-5 mb-4 text-xs sm:text-sm max-h-[240px] md:max-h-[260px] overflow-y-auto custom-scrollbar">
                            <div className="flex flex-col">
                                {/* Row: Nam phat hanh */}
                                <div className="flex flex-col sm:flex-row py-2.5 sm:py-3 border-b border-gray-800 border-dotted">
                                    <div className="w-full sm:w-[140px] font-bold shrink-0 mb-1 sm:mb-0" style={{ color: primaryColor }}>Năm Phát Hành:</div>
                                    <div className="text-gray-300 font-medium">{year || 'Đang cập nhật'}</div>
                                </div>

                                {/* Row: So Tap */}
                                {totalEpisodes ? (
                                    <div className="flex flex-col sm:flex-row py-2.5 sm:py-3 border-b border-gray-800 border-dotted">
                                        <div className="w-full sm:w-[140px] font-bold shrink-0 mb-1 sm:mb-0" style={{ color: primaryColor }}>Số Tập:</div>
                                        <div className="text-gray-300 font-medium">{totalEpisodes} tập</div>
                                    </div>
                                ) : null}

                                {/* Row: The Loai */}
                                {genres.length > 0 && (
                                    <div className="flex flex-col sm:flex-row py-2.5 sm:py-3 border-b border-gray-800 border-dotted">
                                        <div className="w-full sm:w-[140px] font-bold shrink-0 mb-2 sm:mb-0" style={{ color: primaryColor }}>Thể Loại:</div>
                                        <div className="flex flex-wrap gap-2">
                                            {genres.map((genre, index) => (
                                                <Link
                                                    key={index}
                                                    href={`/the-loai/${slugify(genre)}`}
                                                    className="bg-[#2b2d35] px-2.5 py-1 rounded text-[11px] sm:text-xs font-medium text-gray-300 hover:text-white transition-colors hover:brightness-125"
                                                    style={{ '&:hover': { backgroundColor: primaryColor } } as any}
                                                >
                                                    {genre}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Row: Đạo Diễn */}
                                {directors && directors.length > 0 && (
                                    <div className="flex flex-col sm:flex-row py-2.5 sm:py-3 border-b border-gray-800 border-dotted">
                                        <div className="w-full sm:w-[140px] font-bold shrink-0 mb-1 sm:mb-0" style={{ color: primaryColor }}>Đạo Diễn:</div>
                                        <div className="text-gray-300 font-medium leading-relaxed pr-2 text-xs sm:text-sm">
                                            {directors.map((dir, idx) => (
                                                <React.Fragment key={idx}>
                                                    <Link href={`/dao-dien/${dir.slug}`} className="hover:brightness-125 transition-colors" style={{ color: 'inherit' }} onMouseOver={(e) => e.currentTarget.style.color = primaryColor} onMouseOut={(e) => e.currentTarget.style.color = 'inherit'}>
                                                        {dir.name}
                                                    </Link>
                                                    {idx < directors.length - 1 && ', '}
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Row: Diễn Viên */}
                                {cast.length > 0 && (
                                    <div className="flex flex-col sm:flex-row py-2.5 sm:py-3">
                                        <div className="w-full sm:w-[140px] font-bold shrink-0 mb-1 sm:mb-0" style={{ color: primaryColor }}>Diễn Viên:</div>
                                        <div className="text-gray-300 font-medium leading-relaxed pr-2 text-xs sm:text-sm">
                                            {cast.map((actor, idx) => (
                                                <React.Fragment key={idx}>
                                                    <Link href={`/dien-vien/${slugify(actor)}`} className="hover:brightness-125 transition-colors" style={{ color: 'inherit' }} onMouseOver={(e) => e.currentTarget.style.color = primaryColor} onMouseOut={(e) => e.currentTarget.style.color = 'inherit'}>
                                                        {actor}
                                                    </Link>
                                                    {idx < cast.length - 1 && ', '}
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto w-full">
                        {/* Stats & Quality Pills */}
                        <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 mt-2">
                            <span className="flex items-center text-[11px] sm:text-xs font-semibold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-gray-700 bg-[#1c1d22] text-white shadow-sm shadow-black/20">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" style={{ color: primaryColor }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                {duration ? duration.replace(/phút/i, 'phút/tập').replace(/\/tập\/tập/g, '/tập') : 'Đang cập nhật'}
                            </span>
                            <span className="flex items-center text-[11px] sm:text-xs font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-gray-700 bg-[#1c1d22] text-white shadow-sm shadow-black/20 tracking-wider">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 mr-1.5" style={{ color: primaryColor }} viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                                {quality || 'HD'}
                            </span>
                            <span className="flex items-center text-[11px] sm:text-xs font-semibold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-gray-700 bg-[#1c1d22] text-white shadow-sm shadow-black/20">
                                {language || 'Vietsub'}
                            </span>
                        </div>

                        <hr className="border-t border-gray-700 w-full mb-4 mt-4" />

                        <a href="#comments" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full bg-[#1c1d22] px-3.5 sm:px-4 py-3 rounded-xl border border-gray-800 hover:border-yellow-500/30 hover:bg-[#252630] transition-all duration-300 group cursor-pointer shadow-md mb-2">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="flex text-gray-500 text-[16px] sm:text-[18px] lg:text-[20px] group-hover:scale-105 transition-transform duration-300 gap-1">
                                    {[1, 2, 3, 4, 5].map((starValue) => (
                                        <span 
                                            key={starValue} 
                                            className={rating >= starValue ? "text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]" : ""}
                                        >
                                            ★
                                        </span>
                                    ))}
                                </div>
                                <div className="text-yellow-500 font-bold text-base sm:text-lg">
                                    {(rating || 0).toFixed(1)}/5
                                </div>
                            </div>
                            <div className="text-[11px] sm:text-[13px] font-bold text-gray-300 bg-[#2b2d35] px-3 sm:px-4 py-1.5 rounded-full group-hover:text-white transition-colors border border-gray-700/50 tracking-wide self-start sm:self-auto">
                                Lượt xem: {views.toLocaleString('vi-VN')}
                            </div>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
