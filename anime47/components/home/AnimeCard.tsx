import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

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
}

export default function AnimeCard({
    id,
    title,
    slug,
    coverImage,
    rating = 5.0,
    quality = 'FHD',
    totalEpisodes,
    currentEpisode,
    isNew = false,
}: AnimeCardProps) {
    return (
        <Link href={`/anime/${slug}`}>
            <div className="group relative bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-primary/50 transition-all duration-300 hover:scale-105 cursor-pointer">
                {/* Cover Image */}
                <div className="aspect-[2/3] relative bg-gradient-to-br from-gray-700 to-gray-900">
                    {coverImage ? (
                        <Image
                            src={coverImage}
                            alt={title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-gray-500 text-4xl">🎬</span>
                        </div>
                    )}

                    {/* Overlay badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {rating && (
                            <div className="bg-black/80 backdrop-blur-sm text-yellow-400 px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                                ⭐ {rating}
                            </div>
                        )}
                        {isNew && (
                            <div className="bg-primary text-white px-2 py-1 rounded text-xs font-bold animate-pulse">
                                MỚI
                            </div>
                        )}
                    </div>

                    <div className="absolute top-2 right-2">
                        <div className="bg-primary text-white px-2 py-1 rounded text-xs font-bold">
                            {quality}
                        </div>
                    </div>

                    {/* Episode info */}
                    {currentEpisode && (
                        <div className="absolute bottom-2 left-2 right-2">
                            <div className="bg-black/80 backdrop-blur-sm text-white px-2 py-1 rounded text-xs">
                                {totalEpisodes
                                    ? `Tập ${currentEpisode}/${totalEpisodes}`
                                    : `Lượt xem: ${currentEpisode}k`
                                }
                            </div>
                        </div>
                    )}


                </div>

                {/* Title */}
                <div className="p-3">
                    <h3 className="text-white font-bold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                        {title}
                    </h3>
                </div>
            </div>
        </Link>
    );
}
