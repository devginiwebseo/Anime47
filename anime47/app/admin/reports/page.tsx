import { prisma } from '@/lib/prisma';

export const metadata = { title: 'Báo Cáo Lỗi - Admin Panel' };

export default async function AdminReportsPage(props: {
    searchParams?: Promise<{ page?: string; status?: string }>;
}) {
    const searchParams = await props.searchParams;
    const page = parseInt(searchParams?.page || '1');
    const statusFilter = searchParams?.status || '';
    const limit = 20;
    const skip = (page - 1) * limit;

    const where = statusFilter ? { status: statusFilter } : {};

    const [reports, total] = await Promise.all([
        prisma.error_reports.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                users: { select: { name: true, email: true } },
            },
        }),
        prisma.error_reports.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const statusColors: Record<string, string> = {
        OPEN: 'bg-red-100 text-red-800',
        IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
        RESOLVED: 'bg-green-100 text-green-800',
        CLOSED: 'bg-slate-100 text-slate-600',
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-800">Báo Cáo Lỗi</h1>
                <p className="text-slate-500 text-sm mt-1">Tổng cộng {total} báo cáo.</p>
            </div>

            {/* Status Filter */}
            <div className="flex flex-wrap gap-2">
                {['', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((s) => (
                    <a
                        key={s}
                        href={`/admin/reports${s ? `?status=${s}` : ''}`}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${statusFilter === s
                                ? 'bg-blue-600 text-white'
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        {s === '' ? 'Tất cả' : s === 'OPEN' ? 'Mở' : s === 'IN_PROGRESS' ? 'Đang xử lý' : s === 'RESOLVED' ? 'Đã xử lý' : 'Đã đóng'}
                    </a>
                ))}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 uppercase text-slate-500 font-semibold text-xs border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Nội dung</th>
                                <th className="px-6 py-4 hidden md:table-cell">URL</th>
                                <th className="px-6 py-4">Trạng thái</th>
                                <th className="px-6 py-4 hidden sm:table-cell">Người báo</th>
                                <th className="px-6 py-4 hidden md:table-cell">Ngày tạo</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {reports.map((report) => (
                                <tr key={report.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-slate-800 line-clamp-2 max-w-xs">{report.message}</p>
                                    </td>
                                    <td className="px-6 py-4 hidden md:table-cell">
                                        {report.url ? (
                                            <a href={report.url} target="_blank" className="text-blue-600 hover:underline text-xs truncate block max-w-[200px]">{report.url}</a>
                                        ) : '—'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[report.status] || 'bg-slate-100 text-slate-600'}`}>
                                            {report.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 text-sm hidden sm:table-cell">
                                        {report.users?.name || report.users?.email || 'Ẩn danh'}
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 text-xs hidden md:table-cell">
                                        {new Date(report.createdAt).toLocaleDateString('vi-VN')}
                                    </td>
                                </tr>
                            ))}
                            {reports.length === 0 && (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">Không có báo cáo nào.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <p className="text-sm text-slate-500">Trang {page} / {totalPages}</p>
                        <div className="flex gap-2">
                            {page > 1 && <a href={`/admin/reports?page=${page - 1}${statusFilter ? `&status=${statusFilter}` : ''}`} className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm hover:bg-slate-50">← Trước</a>}
                            {page < totalPages && <a href={`/admin/reports?page=${page + 1}${statusFilter ? `&status=${statusFilter}` : ''}`} className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm hover:bg-slate-50">Tiếp →</a>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
