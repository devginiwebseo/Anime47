import React from 'react';
import { notFound } from 'next/navigation';
import AnimeDetailHeader from '@/components/detail/AnimeDetailHeader';
import EpisodeList from '@/components/detail/EpisodeList';
import AnimeDescription from '@/components/detail/AnimeDescription';
import CommentSection from '@/components/detail/CommentSection';
import RelatedAnime from '@/components/detail/RelatedAnime';
import AnimeHotList from '@/components/home/AnimeHotList';
import RankingBoardWrapper from '@/components/home/RankingBoardWrapper';
import { storyService } from '@/modules/story/story.service';
import { chapterService } from '@/modules/chapter/chapter.service';
import { genreService } from '@/modules/genre/genre.service';
import { commentService } from '@/modules/comment/comment.service';
import { ratingService } from '@/modules/rating/rating.service';

export default async function AnimeDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    // Fetch story data from database
    const story = await storyService.getStoryBySlug(slug);

    if (!story) {
        notFound();
    }

    // Fetch chapters/episodes
    const chapters = await chapterService.getChaptersByStoryId(story.id);

    // Fetch genres
    const storyGenres = await genreService.getGenresByStoryId(story.id);
    const genres = storyGenres.map(g => g.name);

    // Fetch comments
    const comments = await commentService.getStoryComments(story.id, 20);

    // Fetch rating info
    const ratingInfo = await ratingService.getStoryRatingInfo(story.id);

    // Format episodes for list
    const episodeList = chapters.map((ch, idx) => ({
        id: ch.id,
        number: ch.index,
        title: ch.title,
        isWatched: false, // TODO: Implement watch history
    }));

    // Parse cast from string to array
    const castArray = story.cast ? story.cast.split(',').map(c => c.trim()) : [];

    // Fetch related animes (same genre)
    const relatedStoriesRaw = await storyService.getRelatedStories(story.id, 8);
    const relatedAnimes = await Promise.all(
        relatedStoriesRaw.map(async (s) => {
            const totalEps = await chapterService.countChapters(s.id);
            const latestChapter = await chapterService.getLatestChapter(s.id);
            return {
                id: s.id,
                title: s.title,
                slug: s.slug,
                coverImage: s.coverImage || undefined,
                rating: s.rating || undefined,
                quality: s.quality || 'HD',
                totalEpisodes: totalEps > 0 ? totalEps : undefined,
                currentEpisode: latestChapter?.index,
                isNew: false,
            };
        })
    );

    // Format description
    const description = story.description || 'Chưa có mô tả cho anime này.';

    return (
        <div className="space-y-6">
            {/* Header with main info */}
            <AnimeDetailHeader
                title={story.title}
                slug={story.slug}
                originalTitle={story.alternativeName || undefined}
                year={story.releaseYear || undefined}
                coverImage={story.coverImage || undefined}
                rating={ratingInfo.averageRating || story.rating || undefined}
                status={story.status || 'Đang cập nhật'}
                totalEpisodes={chapters.length}
                quality={story.quality || 'HD'}
                genres={genres}
                director={story.director || undefined}
                cast={castArray}
                description={description}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Main Content - 8 columns */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Episode List */}
                    <EpisodeList
                        animeSlug={story.slug}
                        episodes={episodeList}
                        currentEpisode={undefined}
                    />

                    {/* Detailed Description */}
                    <AnimeDescription
                        title={story.title}
                        description={description}
                        plot={undefined}
                    />

                    {/* Comments */}
                    <CommentSection storyId={story.id} comments={comments} />
                </div>

                {/* Sidebar - 4 columns */}
                <aside className="lg:col-span-4 space-y-6">
                    <AnimeHotList />
                    <RankingBoardWrapper />
                </aside>
            </div>

            {/* Related Anime - Full Width */}
            {relatedAnimes.length > 0 && (
                <RelatedAnime animes={relatedAnimes} />
            )}
        </div>
    );
}
