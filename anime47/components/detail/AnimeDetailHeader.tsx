'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { slugify } from '@/lib/helpers';
import { useSiteSettings } from '@/hooks/useSiteSettings';

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
    director?: string;
    cast?: string[];
    description?: string;
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
    director,
    cast = [],
    description,
}: AnimeDetailHeaderProps) {
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

    return (
        <div className="bg-[#14151a] rounded-lg overflow-hidden border border-gray-800 p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Left Column: Poster & Watch Button */}
                <div className="w-full md:w-[280px] shrink-0 flex flex-col gap-4">
                    <div className="aspect-[2/3] relative rounded-lg overflow-hidden shadow-2xl border border-gray-700">
                        {coverImage ? (
                            <Image
                                src={coverImage}
                                alt={title}
                                fill
                                className="object-cover"
                                priority
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                                <span className="text-gray-500 text-6xl">🎬</span>
                            </div>
                        )}
                        {/* Quality Badge - Top Left as seen in some designs, or keep top right */}
                        <div className="absolute top-0 right-0">
                            <div className="text-white px-3 py-1 font-bold text-xs rounded-bl-lg" style={{ backgroundColor: primaryColor }}>
                                {quality}
                            </div>
                        </div>
                    </div>
                    {/* Watch Button */}
                    <Link
                        href={`/anime/${slug}/tap-1`}
                        className="w-full hover:brightness-110 text-white font-bold py-3.5 rounded-lg transition-all duration-200 text-center uppercase tracking-wider text-sm shadow-[0_4px_14px_0_rgba(211,47,47,0.39)]"
                        style={{ backgroundColor: primaryColor }}
                    >
                        Xem Phim
                    </Link>
                </div>

                {/* Right Column: Details */}
                <div className="flex-1 text-white">
                    {/* Title & Subtitle */}
                    <div className="mb-6">
                        <h1 className="text-3xl md:text-4xl font-bold mb-2 leading-tight" style={{ color: primaryColor }}>
                            {title}
                        </h1>
                        {originalTitle && (
                            <h2 className="text-gray-300 text-lg font-medium">{originalTitle}</h2>
                        )}
                        <hr className="border-t-2 mt-4 w-[100px]" style={{ borderColor: primaryColor }} />
                    </div>

                    {/* Metadata Box */}
                    <div className="bg-[#1c1d22] border border-gray-800 rounded-lg p-5 mb-6 text-sm">
                        <div className="flex flex-col">
                            {/* Row: Nam phat hanh */}
                            <div className="flex flex-col sm:flex-row py-3 border-b border-gray-800 border-dotted">
                                <div className="w-full sm:w-[140px] font-bold shrink-0 mb-1 sm:mb-0" style={{ color: primaryColor }}>Năm Phát Hành:</div>
                                <div className="text-gray-300 font-medium">{year || 'Đang cập nhật'}</div>
                            </div>

                            {/* Row: So Tap */}
                            {totalEpisodes ? (
                                <div className="flex flex-col sm:flex-row py-3 border-b border-gray-800 border-dotted">
                                    <div className="w-full sm:w-[140px] font-bold shrink-0 mb-1 sm:mb-0" style={{ color: primaryColor }}>Số Tập:</div>
                                    <div className="text-gray-300 font-medium">{totalEpisodes} tập</div>
                                </div>
                            ) : null}

                            {/* Row: The Loai */}
                            {genres.length > 0 && (
                                <div className="flex flex-col sm:flex-row py-3 border-b border-gray-800 border-dotted">
                                    <div className="w-full sm:w-[140px] font-bold shrink-0 mb-2 sm:mb-0" style={{ color: primaryColor }}>Thể Loại:</div>
                                    <div className="flex flex-wrap gap-2">
                                        {genres.map((genre, index) => (
                                            <Link
                                                key={index}
                                                href={`/the-loai/${slugify(genre)}`}
                                                className="bg-[#2b2d35] px-3 py-1 rounded text-xs font-medium text-gray-300 hover:text-white transition-colors hover:brightness-125"
                                                style={{ '&:hover': { backgroundColor: primaryColor } } as any}
                                            >
                                                {genre}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Row: Đạo Diễn */}
                            {director && (
                                <div className="flex flex-col sm:flex-row py-3 border-b border-gray-800 border-dotted">
                                    <div className="w-full sm:w-[140px] font-bold shrink-0 mb-1 sm:mb-0" style={{ color: primaryColor }}>Đạo Diễn:</div>
                                    <div className="text-gray-300 font-medium leading-relaxed max-h-16 overflow-y-auto pr-2 custom-scrollbar">
                                        <Link href={`/dao-dien/${slugify(director)}`} className="hover:brightness-125 transition-colors" style={{ color: 'inherit' }} onMouseOver={(e) => e.currentTarget.style.color = primaryColor} onMouseOut={(e) => e.currentTarget.style.color = 'inherit'}>
                                            {director}
                                        </Link>
                                    </div>
                                </div>
                            )}

                            {/* Row: Diễn Viên */}
                            {cast.length > 0 && (
                                <div className="flex flex-col sm:flex-row py-3">
                                    <div className="w-full sm:w-[140px] font-bold shrink-0 mb-1 sm:mb-0" style={{ color: primaryColor }}>Diễn Viên:</div>
                                    <div className="text-gray-300 font-medium leading-relaxed max-h-24 overflow-y-auto pr-2 custom-scrollbar">
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

                    {/* Stats & Quality Pills */}
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between border-t border-gray-800 pt-6 mb-6">
                        <div className="flex flex-wrap gap-3">
                            <span className="flex items-center text-xs font-semibold px-4 py-2 rounded-full border border-gray-700 bg-[#1c1d22] text-gray-300">
                                ⏱️ 24 Phút
                            </span>
                            <span className="flex items-center text-xs font-semibold px-4 py-2 rounded-full border border-gray-700 bg-[#1c1d22]" style={{ color: primaryColor }}>
                                ▶️ {quality}
                            </span>
                            <span className="flex items-center text-xs font-semibold px-4 py-2 rounded-full border border-gray-700 bg-[#1c1d22] text-gray-300">
                                Vietsub
                            </span>
                        </div>

                        <a href="#comments" className="flex items-center gap-4 bg-[#1c1d22] px-4 py-2.5 rounded-lg border border-gray-800 hover:border-yellow-500/30 hover:bg-[#252630] transition-all duration-300 group cursor-pointer w-fit shadow-md hover:shadow-yellow-500/10">
                            <div className="flex text-gray-600 text-[16px] group-hover:scale-110 transition-transform duration-300 gap-[2px]">
                                {/* Simple stars for visual */}
                                <span className={rating >= 2 ? "text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]" : ""}>★</span>
                                <span className={rating >= 4 ? "text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]" : ""}>★</span>
                                <span className={rating >= 6 ? "text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]" : ""}>★</span>
                                <span className={rating >= 8 ? "text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]" : ""}>★</span>
                                <span className={rating >= 10 ? "text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]" : ""}>★</span>
                            </div>
                            <div className="text-xs font-semibold text-gray-400 border-l border-gray-700 pl-4 group-hover:text-white transition-colors">
                                Lượt xem: {rating * 10 || 11}
                            </div>
                        </a>
                    </div>

                    {/* Description Text */}
                    {description && (
                        <div className="mb-6 border-l-2 pl-4" style={{ borderColor: primaryColor }}>
                            <p className="text-sm text-gray-400 leading-relaxed italic">
                                "{description.substring(0, 250)}..."
                            </p>
                        </div>
                    )}



                </div>
            </div>
        </div>
    );
}
