import React from 'react';
import { fetchExternalApi } from '@/lib/external-api';
import RandomAnimeButton from './RandomAnimeButton';
import AnimeHotListClient from './AnimeHotListClient';

interface SectionProps {
    title: string;
    limit?: number;
}

export default async function AnimeHotList({ title, limit = 10 }: SectionProps) {
    const apiUrl = process.env.API_URL || 'https://anime.datatruyen.online/';

    const res = await fetchExternalApi(`/api/public/movies?limit=${limit}&sort=views`, {
        next: { revalidate: 3600 }
    });

    let hotAnimeData: any[] = [];
    if (res.ok) {
        const result = await res.json();
        const stories = result.data || [];

        hotAnimeData = stories.map((story: any) => {
            let episodes = '??';
            if (story.status === 'completed' || story.status === 'Hoàn thành') {
                episodes = 'Full';
            } else if (story.latestChapter) {
                episodes = story.totalEpisodes > 0
                    ? `${story.latestChapter.index}/${story.totalEpisodes}`
                    : `${story.latestChapter.index}`;
            }

            return {
                id: story.id,
                title: story.title,
                slug: story.slug,
                coverImage: story.coverImage || undefined,
                rating: story.averageRating || 0,
                episodes,
                year: story.releaseYear || undefined,
                genres: story.genres?.map((g: any) => g.name || g) || undefined,
                director: story.director || undefined,
                cast: story.cast || undefined,
                duration: story.duration || undefined,
            };
        });
    }

    return (
        <div>
            <AnimeHotListClient hotAnimeData={hotAnimeData} apiUrl={apiUrl} title={title} />
            <RandomAnimeButton />
        </div>
    );
}
