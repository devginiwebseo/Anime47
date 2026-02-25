import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";

export default async function AdminDashboard() {
  const [
    totalStories,
    totalChapters,
    completedStories,
    recentStories,
    recentChapters,
    topViewedStories
  ] = await Promise.all([
    prisma.stories.count(),
    prisma.chapters.count(),
    prisma.stories.count({
      where: {
        status: { in: ['completed', 'hoàn thành', 'Hoàn thành', 'Full', 'full'] }
      }
    }),
    prisma.stories.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        coverImage: true,
        status: true,
        _count: { select: { chapters: true } },
        createdAt: true
      }
    }),
    prisma.chapters.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        stories: {
          select: { title: true, slug: true }
        }
      }
    }),
    prisma.stories.findMany({
      take: 10,
      orderBy: { views: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        coverImage: true,
        views: true,
        status: true,
        _count: { select: { chapters: true } }
      }
    })
  ]);

  const ongoingStories = totalStories - completedStories;

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatDate = (date: Date) => {
    return format(new Date(date), "MM/dd/yyyy");
  };

  return (
    <div className="space-y-6 pb-10 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Tổng Quan Hệ Thống</h1>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Stories */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center">
          <p className="text-gray-500 text-[11px] font-bold mb-2 p-0 tracking-[0.05em] uppercase">Tổng Số Phim</p>
          <h3 className="text-2xl font-bold text-green-600 flex items-center gap-2">
            <svg className="w-5 h-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            {formatNumber(totalStories)}
          </h3>
        </div>

        {/* Total Chapters */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center">
          <p className="text-gray-500 text-[11px] font-bold mb-2 p-0 tracking-[0.05em] uppercase">Tổng Số Tập</p>
          <h3 className="text-2xl font-bold text-blue-500 flex items-center gap-2">
            <svg className="w-5 h-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
            {formatNumber(totalChapters)}
          </h3>
        </div>

        {/* Completed Stories */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center">
          <p className="text-gray-500 text-[11px] font-bold mb-2 p-0 tracking-[0.05em] uppercase">Phim Hoàn Thành</p>
          <h3 className="text-2xl font-bold text-green-500 flex items-center gap-2">
            <svg className="w-5 h-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {formatNumber(completedStories)}
          </h3>
        </div>

        {/* Ongoing Stories */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center">
          <p className="text-gray-500 text-[11px] font-bold mb-2 p-0 tracking-[0.05em] uppercase">Phim Đang Chiếu</p>
          <h3 className="text-2xl font-bold text-orange-400 flex items-center gap-2">
            <svg className="w-5 h-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {formatNumber(ongoingStories)}
          </h3>
        </div>
      </div>

      {/* Recent Movies & Episodes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Movies */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-transparent">
            <h2 className="font-bold text-gray-800 text-sm">Phim Mới Bổ Sung</h2>
            <Link href="/admin/movies" className="text-xs font-semibold text-blue-600 hover:text-blue-800">Xem Tất Cả</Link>
          </div>
          <div className="flex flex-col divide-y divide-gray-50">
            {recentStories.map((story) => (
              <div key={story.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors group">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-14 relative rounded overflow-hidden flex-shrink-0 bg-gray-100 border border-slate-100/10">
                    {story.coverImage ? (
                      <Image src={story.coverImage} alt={story.title} fill className="object-cover" sizes="40px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px] shadow-inner font-medium">N/A</div>
                    )}
                  </div>
                  <div className="min-w-0 flex flex-col justify-center">
                    <p className="text-[13px] font-bold text-gray-800 truncate" title={story.title}>{story.title}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-black tracking-widest bg-green-50 text-green-600 border border-green-100 uppercase leading-none">
                        {story.status === 'completed' || story.status === 'Hoàn thành' || story.status === 'Full' ? 'COMPLETE' : 'PUBLISH'}
                      </span>
                      <span className="text-[11px] font-medium text-gray-500">{story._count.chapters} tập</span>
                    </div>
                  </div>
                </div>
                <div className="text-[11px] font-medium text-gray-400 whitespace-nowrap ml-4 tabular-nums">
                  {formatDate(story.createdAt)}
                </div>
              </div>
            ))}
            {recentStories.length === 0 && (
              <div className="p-8 text-center text-sm font-medium text-gray-500">Không có phim mới</div>
            )}
          </div>
        </div>

        {/* Recent Episodes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-transparent">
            <h2 className="font-bold text-gray-800 text-sm">Tập Phim Mới</h2>
            <Link href="/admin/chapters" className="text-xs font-semibold text-blue-600 hover:text-blue-800">Xem Tất Cả</Link>
          </div>
          <div className="flex flex-col divide-y divide-gray-50">
            {recentChapters.map((chapter) => (
              <div key={chapter.id} className="p-4 flex flex-col justify-center hover:bg-gray-50/50 transition-colors h-[89px]">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1 pr-4">
                    <p className="text-[13px] font-bold text-gray-800 truncate mb-1.5" title={chapter.title}>{chapter.title}</p>
                    <p className="text-[12px] text-blue-600 truncate hover:underline cursor-pointer" title={chapter.stories?.title}>
                      <Link href={`/admin/movies/${chapter.stories?.slug}`}>
                        {chapter.stories?.title || 'Phim không xác định'}
                      </Link>
                    </p>
                  </div>
                  <div className="text-[11px] font-medium text-gray-400 whitespace-nowrap tabular-nums mt-0.5">
                    {formatDate(chapter.createdAt)}
                  </div>
                </div>
              </div>
            ))}
            {recentChapters.length === 0 && (
              <div className="p-8 text-center text-sm font-medium text-gray-500 flex-1">Không có tập mới</div>
            )}
          </div>
        </div>
      </div>

      {/* Top 10 Most Viewed Movies */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-transparent">
          <h2 className="font-bold text-gray-800 text-[15px]">Top 10 Phim Xem Nhiều Nhất</h2>
        </div>
        <div className="p-5 overflow-hidden">
          <div
            className="flex overflow-x-auto pb-4 gap-5 snap-x"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {topViewedStories.map((story) => (
              <div key={story.id} className="w-[200px] flex-shrink-0 snap-start bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-md hover:border-blue-100 transition-all cursor-pointer group flex flex-col">
                <div className="w-full h-[120px] relative bg-gray-50 overflow-hidden border-b border-gray-50">
                  {story.coverImage ? (
                    <Image src={story.coverImage} alt={story.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="200px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-semibold tracking-wide">NO COVER</div>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <p className="text-[13px] font-bold text-blue-600 truncate mb-2 leading-tight group-hover:text-blue-700 transition-colors" title={story.title}>{story.title}</p>
                  <div className="flex items-center text-gray-500 text-[11px] mb-3 font-medium">
                    <svg className="w-3.5 h-3.5 mr-1.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    {formatNumber(story.views)}
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap mt-auto">
                    <span className="px-2 py-0.5 bg-gray-50 border border-gray-100/80 rounded text-[10px] font-semibold text-gray-500">
                      {story._count.chapters} tập
                    </span>
                    {(story.status === 'completed' || story.status === 'Hoàn thành' || story.status === 'Full') && (
                      <span className="px-2 py-0.5 bg-green-50 border border-green-100/50 rounded text-[10px] font-semibold text-green-600">
                        Complete
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {topViewedStories.length === 0 && (
              <div className="w-full text-center py-10 font-medium text-sm text-gray-400">Không có dữ liệu</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}