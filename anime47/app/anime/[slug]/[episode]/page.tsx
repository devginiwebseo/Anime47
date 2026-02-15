import React from 'react';
import { notFound } from 'next/navigation';
import VideoPlayer from '@/components/watch/VideoPlayer';
import EpisodeNavigation from '@/components/watch/EpisodeNavigation';
import WatchEpisodeList from '@/components/watch/WatchEpisodeList';
import WatchRelatedAnime from '@/components/watch/WatchRelatedAnime';
import AnimeHotList from '@/components/home/AnimeHotList';
import RankingBoardWrapper from '@/components/home/RankingBoardWrapper';
import { storyService } from '@/modules/story/story.service';
import { chapterService } from '@/modules/chapter/chapter.service';

interface WatchPageProps {
    params: {
        slug: string;
        episode: string;
    };
}

export default async function WatchPage({ params }: WatchPageProps) {
    // Extract episode number from params (e.g., "tap-2" -> 2)
    const episodeNumber = parseInt(params.episode.replace('tap-', ''));

    if (isNaN(episodeNumber) || episodeNumber < 1) {
        notFound();
    }

    // Fetch anime data from database
    const story = await storyService.getStoryBySlug(params.slug);

    if (!story) {
        notFound();
    }

    // Fetch all chapters/episodes for this story
    const chapters = await chapterService.getChaptersByStoryId(story.id);

    if (!chapters || chapters.length === 0) {
        notFound();
    }

    // Find current episode
    const currentChapter = chapters.find(ch => ch.index === episodeNumber);

    if (!currentChapter) {
        notFound();
    }

    const currentEpisode = episodeNumber;
    const totalEpisodes = chapters.length;
    const hasNextEpisode = currentEpisode < totalEpisodes;
    const hasPrevEpisode = currentEpisode > 1;

    // Video URL - use chapter's sourceUrl (primary) or videoUrl (fallback)
    const videoUrl = currentChapter.sourceUrl || currentChapter.videoUrl || '';

    if (!videoUrl) {
        console.error('No video URL found for this episode');
    }

    // Format episodes for list
    const episodeList = chapters.map(ch => ({
        id: ch.id,
        number: ch.index,
        title: ch.title,
    }));

    // Fetch related anime (same genre)
    const relatedStoriesRaw = await storyService.getRelatedStories(story.id, 6);
    const relatedAnimes = await Promise.all(
        relatedStoriesRaw.map(async (s) => {
            const totalEps = await chapterService.countChapters(s.id);
            const latestChapter = await chapterService.getLatestChapter(s.id);
            return {
                id: s.id,
                title: s.title,
                slug: s.slug,
                coverImage: s.coverImage || undefined,
                quality: s.quality || 'HD',
                currentEpisode: latestChapter?.index,
                totalEpisodes: totalEps > 0 ? totalEps : undefined,
            };
        })
    );

    return (
        <div className="space-y-6">
            {/* Video Player Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Main Content - 8 columns */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Navigation Controls */}
                    <EpisodeNavigation
                        animeTitle={story.title}
                        animeSlug={story.slug}
                        currentEpisode={currentEpisode}
                        totalEpisodes={totalEpisodes}
                        hasNextEpisode={hasNextEpisode}
                        hasPrevEpisode={hasPrevEpisode}
                    />

                    {/* Video Player */}
                    {videoUrl ? (
                        <VideoPlayer
                            videoUrl={videoUrl}
                            title={`${story.title} - Tập ${currentEpisode}`}
                            animeSlug={story.slug}
                            currentEpisode={currentEpisode}
                            totalEpisodes={totalEpisodes}
                        />
                    ) : (
                        <div className="bg-gray-800 rounded-lg p-8 text-center">
                            <p className="text-red-500 text-lg">Không có video</p>
                            <p className="text-gray-400 mt-2">Hiện chưa có link xem cho tập này</p>
                        </div>
                    )}

                    {/* Episode List */}
                    <WatchEpisodeList
                        animeSlug={story.slug}
                        episodes={episodeList}
                        currentEpisode={currentEpisode}
                    />
                </div>

                {/* Sidebar - 4 columns */}
                <aside className="lg:col-span-4 space-y-6">
                    <WatchRelatedAnime animes={relatedAnimes} />
                    <AnimeHotList />
                    <RankingBoardWrapper />
                </aside>
            </div>
        </div>
    );
}
