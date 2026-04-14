import React from 'react';
import AnimeCard from './AnimeCard';
import SectionHeader from './SectionHeader';
import SeeMoreButton from './SeeMoreButton';
import { fetchExternalApi } from '@/lib/external-api';
import { prisma } from '@/lib/prisma';
import { chapterService } from '@/modules/chapter/chapter.service';

import { getGridColsClass } from '@/lib/helpers';

interface SectionProps {
    title: string;
    limit?: number;
    numColumns?: number;
    genreSlug: string;
}

export default async function CategorySection({ title, limit = 10, numColumns = 5, genreSlug }: SectionProps) {
    if (!genreSlug) return null;

    const apiUrl = process.env.API_URL || 'https://anime.datatruyen.online/';
    // Lấy stories theo genreSlug từ API
    const res = await fetchExternalApi(`/api/public/movies?limit=${limit}&genre=${genreSlug}`, {
        next: { revalidate: 3600 }
    });

    let animeData: any[] = [];
    if (res.ok) {
        const result = await res.json();
        const stories = result.data || [];

        if (stories.length === 0) return null;

        animeData = stories.map((story: any) => {
            return {
                id: story.id,
                title: story.title,
                slug: story.slug,
                coverImage: story.coverImage || undefined,
                rating: story.averageRating || undefined,
                quality: story.quality || 'HD',
                totalEpisodes: story.totalEpisodes > 0 ? story.totalEpisodes : undefined,
                currentEpisode: story.latestChapter?.index || undefined,
                isNew: false,
                status: story.status,
                year: story.releaseYear || undefined,
                genres: story.genres?.map((g: any) => g.name || g) || undefined,
                director: story.director || undefined,
                cast: story.cast || undefined,
                duration: story.duration || undefined,
            };
        });
    } else {
        return null;
    }

    const gridColsClass = getGridColsClass(numColumns);

    return (
        <section className="mb-12">
            <SectionHeader title={title} icon="🗂️" />

            <div className="space-y-4">
                <div className={`grid grid-cols-2 md:grid-cols-3 ${gridColsClass} gap-4`}>
                    {animeData.map((anime) => (
                        <AnimeCard key={anime.id} {...anime as any} />
                    ))}
                </div>
                <SeeMoreButton href={`/the-loai/${genreSlug}`} />
            </div>
        </section>
    );
}
