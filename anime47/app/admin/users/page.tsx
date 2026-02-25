import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const metadata = { title: 'Quản lý Tài Khoản - Admin Panel' };

export default async function AdminUsersPage(props: {
    searchParams?: Promise<{ page?: string; q?: string }>;
}) {
    const searchParams = await props.searchParams;
    const page = parseInt(searchParams?.page || '1');
    const query = searchParams?.q?.trim() || '';
    const limit = 20;
    const skip = (page - 1) * limit;

    const where = query
        ? {
            OR: [
                { name: { contains: query, mode: 'insensitive' as const } },
                { email: { contains: query, mode: 'insensitive' as const } },
            ],
        }
        : {};

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                _count: { select: { comments: true, favorites: true } },
            },
        }),
        prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const roleColors: Record<string, string> = {
        ADMIN: 'bg-red-100 text-red-800',
        USER: 'bg-blue-100 text-blue-800',
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-800">Quản lý Tài Khoản</h1>
                <p className="text-slate-500 text-sm mt-1">Tổng cộng {total} tài khoản.</p>
            </div>

            <form className="flex gap-2">
                <input name="q" defaultValue={query} placeholder="Tìm kiếm theo tên hoặc email..."
                    className="flex-1 max-w-md px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">Tìm</button>
                {query && <Link href="/admin/users" className="px-5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-600 hover:bg-slate-50">Xóa</Link>}
            </form>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 uppercase text-slate-500 font-semibold text-xs border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Người dùng</th>
                                <th className="px-6 py-4">Vai trò</th>
                                <th className="px-6 py-4 hidden sm:table-cell">Bình luận</th>
                                <th className="px-6 py-4 hidden sm:table-cell">Yêu thích</th>
                                <th className="px-6 py-4 hidden md:table-cell">Ngày tham gia</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                                                {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-medium text-slate-800 truncate">{user.name || 'Chưa đặt tên'}</p>
                                                <p className="text-xs text-slate-400 truncate">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[user.role] || 'bg-slate-100 text-slate-600'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 hidden sm:table-cell">{user._count.comments}</td>
                                    <td className="px-6 py-4 text-slate-600 hidden sm:table-cell">{user._count.favorites}</td>
                                    <td className="px-6 py-4 text-slate-500 text-xs hidden md:table-cell">
                                        {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">Không tìm thấy tài khoản nào.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <p className="text-sm text-slate-500">Trang {page} / {totalPages}</p>
                        <div className="flex gap-2">
                            {page > 1 && <Link href={`/admin/users?page=${page - 1}${query ? `&q=${query}` : ''}`} className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm hover:bg-slate-50">← Trước</Link>}
                            {page < totalPages && <Link href={`/admin/users?page=${page + 1}${query ? `&q=${query}` : ''}`} className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm hover:bg-slate-50">Tiếp →</Link>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
