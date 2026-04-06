import React from 'react';
import AnimeCard from './AnimeCard';
import SectionHeader from './SectionHeader';
import SeeMoreButton from './SeeMoreButton';

import { storyService } from '@/modules/story/story.service';
import { chapterService } from '@/modules/chapter/chapter.service';

interface SectionProps {
    title: string;
    limit?: number;
    numColumns?: number;
}

export default async function RecommendedSection({ title, limit = 8, numColumns = 4 }: SectionProps) {
    const apiUrl = process.env.API_URL || 'https://api.animeez.online/';
    // Lấy stories đề cử/hot từ database thông qua API (giả sử có param tag=hot hoặc sort=views)
    const res = await fetch(`${apiUrl}/api/public/movies?limit=${limit}&sort=views`, {
        next: { revalidate: 3600 }
    });

    let animeData: any[] = [];
    if (res.ok) {
        const result = await res.json();
        const stories = result.data || [];

        if (stories.length === 0) {
            return null;
        }

        // Lấy thông tin số tập cho mỗi story
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
            };
        });
    } else {
        return null;
    }

    return (
        <section className="mb-12">
            <SectionHeader title={title} icon="⭐" />

            <div className="space-y-4">
                <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-${Math.min(numColumns, 12)} gap-4`}>
                    {animeData.map((anime) => (
                        <AnimeCard key={anime.id} {...anime} />
                    ))}
                </div>
                <SeeMoreButton href="/de-cu" />
            </div>
        </section>
    );
}
