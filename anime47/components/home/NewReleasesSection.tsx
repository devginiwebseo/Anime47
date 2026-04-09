import React from 'react';
import AnimeCard from './AnimeCard';
import SectionHeader from './SectionHeader';
import SeeMoreButton from './SeeMoreButton';
import { fetchExternalApi } from '@/lib/external-api';
import { storyService } from '@/modules/story/story.service';
import { chapterService } from '@/modules/chapter/chapter.service';

import { getGridColsClass } from '@/lib/helpers';

interface SectionProps {
    title: string;
    limit?: number;
    numColumns?: number;
}

export default async function NewReleasesSection({ title, limit = 20, numColumns = 5 }: SectionProps) {
    const apiUrl = process.env.API_URL || 'https://anime.datatruyen.online/';
    // Lấy stories mới nhất từ API
    const res = await fetchExternalApi(`/api/public/movies?limit=${limit}`, {
        next: { revalidate: 3600 }
    });

    let animeData: any[] = [];
    if (res.ok) {
        const result = await res.json();
        const stories = result.data || [];

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
                isNew: true, // Stories mới nhất
                views: story.views || 0,
            };
        });
    }

    const gridColsClass = getGridColsClass(numColumns);

    return (
        <section className="mb-12">
            <SectionHeader title={title} icon="🆕" />

            {animeData.length > 0 ? (
                <div className="space-y-6">
                    <div className={`grid grid-cols-2 md:grid-cols-3 ${gridColsClass} gap-x-4 gap-y-8`}>
                        {animeData.map((anime) => (
                            <AnimeCard key={anime.id} {...anime} />
                        ))}
                    </div>
                    <SeeMoreButton href="/anime-bo" />
                </div>
            ) : (
                <div className="text-center py-12 text-gray-400">
                    <p className="text-lg">Chưa có anime nào</p>
                    <p className="text-sm mt-2">Hãy crawl dữ liệu để bắt đầu</p>
                </div>
            )}
        </section>
    );
}
