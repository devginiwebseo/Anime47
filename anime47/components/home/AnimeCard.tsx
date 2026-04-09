import React from 'react';
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
    views?: number | string | null;
    totalViews?: number | string | null;
    viewCount?: number | string | null;
    total_views?: number | string | null;
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
    views = 0,
    totalViews,
    viewCount,
    total_views,
}: AnimeCardProps) {
    const normalizedViews = Number(views ?? totalViews ?? viewCount ?? total_views ?? 0) || 0;
    const statusText = totalEpisodes && currentEpisode === totalEpisodes ? 'FULL' : (currentEpisode ? `TẬP ${currentEpisode}` : (isNew ? 'MỚI' : ''));

    const resolvedCoverImage = resolveImageUrl(coverImage);
    const bypassOptimization = shouldBypassNextImageOptimization(coverImage);

    return (
        <Link href={`/anime/${slug}/`} className="group block">
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

                    {/* Gradient Overlay for bottom text */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>

                    {/* Badges TOP */}
                    <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
                        {/* Star Rating Top Left */}
                        <div className="bg-black/60 backdrop-blur-md text-white px-1.5 py-0.5 rounded flex items-center gap-1 text-[10px] font-bold border border-white/10">
                            <span className="text-yellow-400">★</span>
                            {(rating || 0).toFixed(1)} / 5
                        </div>

                        {/* Status/Episode Top Right */}
                        {statusText && (
                            <div className="bg-primary text-white px-2 py-0.5 rounded text-[10px] font-bold shadow-lg uppercase">
                                {statusText}
                            </div>
                        )}
                    </div>

                    {/* Badges BOTTOM */}
                    <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end">
                        {/* Quality Bottom Left */}
                        <div className="bg-black/60 backdrop-blur-md text-white px-1.5 py-0.5 rounded text-[10px] font-bold border border-white/10 uppercase">
                            {quality}
                        </div>

                        {/* Views Bottom Right */}
                        <div className="bg-black/60 backdrop-blur-md text-white px-1.5 py-0.5 rounded text-[10px] font-bold border border-white/10 whitespace-nowrap">
                            Lượt xem: {normalizedViews.toLocaleString('vi-VN')}
                        </div>
                    </div>
                </div>
            </div>

            {/* Title below image */}
            <div className="mt-3 px-0.5">
                <h3 className="text-gray-100 font-bold text-[15px] leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                    {title}
                </h3>
            </div>
        </Link>
    );
}
