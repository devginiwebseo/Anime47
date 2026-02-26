import React from 'react';
import AnimeCard from './AnimeCard';
import SectionHeader from './SectionHeader';
import { storyService } from '@/modules/story/story.service';
import { chapterService } from '@/modules/chapter/chapter.service';

export default async function NewReleasesSection() {
    // Lấy 20 stories mới nhất từ database
    const stories = await storyService.getLatestStories(20);

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
            };
        })
    );

    return (
        <section className="mb-12">
            <SectionHeader title="Mới Cập Nhật" href="/anime-bo" icon="🆕" />

            {animeData.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    {animeData.map((anime) => (
                        <AnimeCard key={anime.id} {...anime} />
                    ))}
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
