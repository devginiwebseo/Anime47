import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface RelatedAnime {
    id: string;
    title: string;
    slug: string;
    coverImage?: string;
    quality?: string;
    currentEpisode?: number;
    totalEpisodes?: number;
}

interface WatchRelatedAnimeProps {
    animes: RelatedAnime[];
}

export default function WatchRelatedAnime({ animes }: WatchRelatedAnimeProps) {
    if (animes.length === 0) {
        return null;
    }

    return (
        <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                🎬 Phim Liên Quan
            </h3>

            <div className="space-y-3">
                {animes.slice(0, 6).map((anime) => (
                    <Link
                        key={anime.id}
                        href={`/anime/${anime.slug}`}
                        className="flex gap-3 group hover:bg-gray-700/50 p-2 rounded transition-all duration-200"
                    >
                        {/* Thumbnail */}
                        <div className="relative w-16 h-20 flex-shrink-0 rounded overflow-hidden">
                            {anime.coverImage ? (
                                <Image
                                    src={anime.coverImage}
                                    alt={anime.title}
                                    fill
                                    className="object-cover"
                                    sizes="64px"
                                />
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                                    <span className="text-gray-500 text-lg">🎬</span>
                                </div>
                            )}

                            {/* Quality Badge */}
                            {anime.quality && (
                                <div className="absolute top-1 left-1 bg-red-600 text-white text-[10px] px-1 rounded">
                                    {anime.quality}
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <h4 className="text-white font-medium text-sm line-clamp-2 group-hover:text-red-500 transition-colors">
                                {anime.title}
                            </h4>
                            {anime.currentEpisode && (
                                <p className="text-gray-400 text-xs mt-1">
                                    {anime.totalEpisodes
                                        ? `Tập ${anime.currentEpisode}/${anime.totalEpisodes}`
                                        : `Tập ${anime.currentEpisode}`}
                                </p>
                            )}
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
