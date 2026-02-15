import React from 'react';
import AnimeCard from './AnimeCard';
import SectionHeader from './SectionHeader';

import { storyService } from '@/modules/story/story.service';
import { chapterService } from '@/modules/chapter/chapter.service';

export default async function RecommendedSection() {
    // Lấy stories hot/đề cử từ database
    const stories = await storyService.getHotStories(8);

    if (stories.length === 0) {
        return null;
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
            <SectionHeader title="Đề Cử" href="/de-cu" icon="⭐" />

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {animeData.map((anime) => (
                    <AnimeCard key={anime.id} {...anime} />
                ))}
            </div>
        </section>
    );
}
