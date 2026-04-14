import React from 'react';
import AnimeCard from './AnimeCard';
import SectionHeader from './SectionHeader';
import SeeMoreButton from './SeeMoreButton';
import { fetchExternalApi } from '@/lib/external-api';
import { getGridColsClass } from '@/lib/helpers';

interface SectionProps {
    title: string;
    limit?: number;
    numColumns?: number;
}

export default async function ComingSoonSection({ title, limit = 8, numColumns = 4 }: SectionProps) {
    const res = await fetchExternalApi(`/api/public/genres?slug=anime-sap-chieu&limit=${limit}&page=1`, {
        next: { revalidate: 3600 }
    });

    let animeData: any[] = [];
    if (res.ok) {
        const result = await res.json();
        const stories = result.data || [];

        if (stories.length === 0) return null;

        animeData = stories.map((story: any) => ({
            id: story.id,
            title: story.title,
            slug: story.slug,
            coverImage: story.coverImage || undefined,
            rating: story.averageRating || undefined,
            quality: story.quality || 'HD',
            totalEpisodes: story.totalEpisodes > 0 ? story.totalEpisodes : undefined,
            currentEpisode: story.latestChapter?.index || undefined,
            isNew: false,
            year: story.releaseYear || undefined,
            genres: story.genres?.map((g: any) => g.name || g) || undefined,
            director: story.director || undefined,
            cast: story.cast || undefined,
            duration: story.duration || undefined,
        }));
    } else {
        return null;
    }

    const gridColsClass = getGridColsClass(numColumns);

    return (
        <section className="mb-12">
            <SectionHeader title={title} icon="🎬" />

            <div className="space-y-4">
                <div className={`grid grid-cols-2 md:grid-cols-3 ${gridColsClass} gap-4`}>
                    {animeData.map((anime) => (
                        <AnimeCard key={anime.id} {...anime} />
                    ))}
                </div>
                <SeeMoreButton href="the-loai/anime-sap-chieu" />
            </div>
        </section>
    );
}
