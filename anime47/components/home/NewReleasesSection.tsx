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

export default async function NewReleasesSection({ title, limit = 20, numColumns = 5 }: SectionProps) {
    // Lấy 20 stories mới nhất từ database
    const stories = await storyService.getLatestStories(limit);

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
                isNew: true, // Stories mới nhất
                views: story.views || 0,
            };
        })
    );

    return (
        <section className="mb-12">
            <SectionHeader title={title} icon="🆕" />

            {animeData.length > 0 ? (
                <div className="space-y-6">
                    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-${Math.min(numColumns, 12)} gap-x-4 gap-y-8`}>
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
