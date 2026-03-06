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

export default async function ComingSoonSection({ title, limit = 8, numColumns = 4 }: SectionProps) {
    // Lấy stories sắp chiếu từ database
    const stories = await storyService.getUpcomingStories(limit);

    if (stories.length === 0) {
        return null; // Ẩn section nếu không có data
    }

    // Lấy thông tin số tập cho mỗi story
    const animeData = await Promise.all(
        stories.map(async (story) => {
            const totalEpisodes = await chapterService.countChapters(story.id);
            const latestChapter = await chapterService.getLatestChapter(story.id);

            return {
                id: story.id,
                title: story.title,
                slug: story.slug,
                coverImage: story.coverImage || undefined,
                rating: story.rating || undefined,
                quality: story.quality || 'HD',
                totalEpisodes: totalEpisodes > 0 ? totalEpisodes : undefined,
                currentEpisode: latestChapter?.index || undefined,
                isNew: false,
            };
        })
    );

    return (
        <section className="mb-12">
            <SectionHeader title={title} icon="🎬" />

            <div className="space-y-4">
                <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-${Math.min(numColumns, 12)} gap-4`}>
                    {animeData.map((anime) => (
                        <AnimeCard key={anime.id} {...anime} />
                    ))}
                </div>
                <SeeMoreButton href="/sap-chieu" />
            </div>
        </section>
    );
}
