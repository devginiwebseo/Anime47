import NewReleasesSection from '@/components/home/NewReleasesSection';
import ComingSoonSection from '@/components/home/ComingSoonSection';
import RecommendedSection from '@/components/home/RecommendedSection';
import AnimeHotList from '@/components/home/AnimeHotList';
import RankingBoardWrapper from '@/components/home/RankingBoardWrapper';

import { Suspense } from 'react';

export default async function Home() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-8">
                <Suspense fallback={<div className="h-64 animate-pulse bg-gray-800 rounded-xl" />}>
                    <NewReleasesSection />
                </Suspense>

                <Suspense fallback={<div className="h-64 animate-pulse bg-gray-800 rounded-xl" />}>
                    <ComingSoonSection />
                </Suspense>

                <Suspense fallback={<div className="h-64 animate-pulse bg-gray-800 rounded-xl" />}>
                    <RecommendedSection />
                </Suspense>
            </div>

            <aside className="lg:col-span-4 space-y-6">
                <Suspense fallback={<div className="h-64 animate-pulse bg-gray-800 rounded-xl" />}>
                    <AnimeHotList />
                </Suspense>

                <Suspense fallback={<div className="h-64 animate-pulse bg-gray-800 rounded-xl" />}>
                    <RankingBoardWrapper />
                </Suspense>
            </aside>
        </div>
    );
}
