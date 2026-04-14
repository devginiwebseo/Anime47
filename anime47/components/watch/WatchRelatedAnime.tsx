import React from 'react';
import AnimeCard from '@/components/home/AnimeCard';

interface RelatedAnime {
    id: string;
    title: string;
    slug: string;
    coverImage?: string;
    rating?: number;
    quality?: string;
    currentEpisode?: number;
    totalEpisodes?: number;
    year?: number;
    genres?: string[];
    director?: string;
    cast?: string;
    duration?: string;
}

interface WatchRelatedAnimeProps {
    animes: RelatedAnime[];
}

export default function WatchRelatedAnime({ animes }: WatchRelatedAnimeProps) {
    if (animes.length === 0) {
        return null;
    }

    return (
        <div className="rounded-xl">
            <div className="relative mb-6 pb-2">
                <h3 className="text-lg md:text-2xl font-bold text-primary uppercase tracking-wider inline-block relative">
                    Phim Liên Quan
                    <div className="absolute -bottom-[9px] left-0 w-full h-[2px] bg-primary"></div>
                </h3>
            </div>

            <div className="anime-related-grid grid grid-cols-2 gap-4 gap-y-6">
                {animes.map((anime) => (
                    <AnimeCard
                        key={anime.id}
                        id={anime.id}
                        title={anime.title}
                        slug={anime.slug}
                        coverImage={anime.coverImage}
                        rating={anime.rating}
                        quality={anime.quality}
                        currentEpisode={anime.currentEpisode}
                        totalEpisodes={anime.totalEpisodes}
                        year={anime.year}
                        genres={anime.genres}
                        director={anime.director}
                        cast={anime.cast}
                        duration={anime.duration}
                    />
                ))}
            </div>
        </div>
    );
}
