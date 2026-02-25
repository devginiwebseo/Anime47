'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface StoryInfo {
    title: string;
    slug: string;
}

interface Comment {
    id: string;
    author: string;
    email: string | null;
    content: string;
    status: string;
    createdAt: Date;
    stories: StoryInfo | null;
}

export default function CommentManagement({
    initialComments,
    currentPage,
    totalPages,
}: {
    initialComments: any[];
    currentPage: number;
    totalPages: number;
}) {
    const [comments, setComments] = useState<Comment[]>(initialComments);
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const router = useRouter();

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        setLoadingId(id);
        try {
            const res = await fetch(`/api/admin/comments/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!res.ok) throw new Error('Cập nhật thất bại');

            setComments(comments.map(c =>
                c.id === id ? { ...c, status: newStatus } : c
            ));
        } catch (error) {
            alert('Có lỗi xảy ra khi cập nhật trạng thái');
        } finally {
            setLoadingId(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa bình luận này?')) return;

        setLoadingId(id);
        try {
            const res = await fetch(`/api/admin/comments/${id}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error('Xóa thất bại');

            setComments(comments.filter(c => c.id !== id));
        } catch (error) {
            alert('Có lỗi xảy ra khi xóa bình luận');
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-50 uppercase text-slate-500 font-semibold text-xs border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4">Người bình luận</th>
                            <th className="px-6 py-4">Nội dung</th>
                            <th className="px-6 py-4">Phim</th>
                            <th className="px-6 py-4">Trạng thái</th>
                            <th className="px-6 py-4">Ngày tạo</th>
                            <th className="px-6 py-4">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {comments.length > 0 ? (
                            comments.map((comment) => (
                                <tr key={comment.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900">{comment.author}</div>
                                        {comment.email && <div className="text-xs text-slate-500">{comment.email}</div>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-normal min-w-[300px] max-w-md">
                                        <p className="text-slate-600 line-clamp-2">{comment.content}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <a href={`/phim/${comment.stories?.slug}`} target="_blank" className="text-blue-600 hover:underline line-clamp-1 max-w-[200px]">
                                            {comment.stories?.title}
                                        </a>
                                    </td>
                                    <td className="px-6 py-4">
                                        {comment.status === 'PENDING' ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                Chờ duyệt
                                            </span>
                                        ) : comment.status === 'APPROVED' ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                Đã duyệt
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                Đã từ chối
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {new Date(comment.createdAt).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="px-6 py-4 shadow-sm">
                                        <div className="flex items-center gap-2">
                                            {comment.status === 'PENDING' && (
                                                <button
                                                    onClick={() => handleUpdateStatus(comment.id, 'APPROVED')}
                                                    disabled={loadingId === comment.id}
                                                    className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                                                >
                                                    Duyệt
                                                </button>
                                            )}
                                            {comment.status === 'PENDING' && (
                                                <button
                                                    onClick={() => handleUpdateStatus(comment.id, 'REJECTED')}
                                                    disabled={loadingId === comment.id}
                                                    className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                                                >
                                                    Từ chối
                                                </button>
                                            )}

                                            <button
                                                onClick={() => handleDelete(comment.id)}
                                                disabled={loadingId === comment.id}
                                                className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                                            >
                                                Xóa
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                    Không có bình luận nào
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Placeholder */}
            {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                    <p className="text-sm text-slate-500">Trang {currentPage} / {totalPages}</p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => router.push(`/admin/comments?page=${currentPage - 1}`)}
                            disabled={currentPage === 1}
                            className="px-3 py-1 border border-slate-300 rounded text-sm disabled:opacity-50"
                        >
                            Trang trước
                        </button>
                        <button
                            onClick={() => router.push(`/admin/comments?page=${currentPage + 1}`)}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 border border-slate-300 rounded text-sm disabled:opacity-50"
                        >
                            Trang tiếp
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
