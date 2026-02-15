import React from 'react';
import AnimeCard from '@/components/home/AnimeCard';

interface Anime {
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

interface RelatedAnimeProps {
    animes: Anime[];
}

export default function RelatedAnime({ animes }: RelatedAnimeProps) {
    return (
        <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-white text-2xl font-bold mb-6 flex items-center gap-2">
                🎬 PHIM LIÊN QUAN
            </h2>

            {animes.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {animes.map((anime) => (
                        <AnimeCard
                            key={anime.id}
                            id={anime.id}
                            title={anime.title}
                            slug={anime.slug}
                            coverImage={anime.coverImage}
                            rating={anime.rating}
                            quality={anime.quality}
                            totalEpisodes={anime.totalEpisodes}
                            currentEpisode={anime.currentEpisode}
                            isNew={anime.isNew}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-gray-400 text-center py-8">
                    Không có phim liên quan
                </div>
            )}
        </div>
    );
}
