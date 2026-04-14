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
    year?: number;
    genres?: string[];
    director?: string;
    cast?: string;
    duration?: string;
}

interface RelatedAnimeProps {
    animes: Anime[];
}

export default function RelatedAnime({ animes }: RelatedAnimeProps) {
    return (
        <div className="rounded-lg p-4 sm:p-5 lg:p-6">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-primary sm:mb-6 sm:text-2xl border-b pb-2">
                 PHIM LIÊN QUAN
            </h2>

            {animes.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4">
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
                            year={anime.year}
                            genres={anime.genres}
                            director={anime.director}
                            cast={anime.cast}
                            duration={anime.duration}
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
