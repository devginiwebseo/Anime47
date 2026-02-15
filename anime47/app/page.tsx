import NewReleasesSection from '@/components/home/NewReleasesSection';
import ComingSoonSection from '@/components/home/ComingSoonSection';
import RecommendedSection from '@/components/home/RecommendedSection';
import AnimeHotList from '@/components/home/AnimeHotList';
import RankingBoardWrapper from '@/components/home/RankingBoardWrapper';

export default function Home() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main Content - 8 columns on large screens */}
            <div className="lg:col-span-8 space-y-8">
                {/* Mới Cập Nhật */}
                <NewReleasesSection />

                {/* Sắp Chiếu */}
                <ComingSoonSection />

                {/* Đề Cử */}
                <RecommendedSection />
            </div>

            {/* Sidebar - 4 columns on large screens */}
            <aside className="lg:col-span-4 space-y-6">
                {/* Anime Hot */}
                <AnimeHotList />

                {/* Bảng Xếp Hạng */}
                <RankingBoardWrapper />
            </aside>
        </div>
    );
}
