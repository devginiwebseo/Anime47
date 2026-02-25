'use client'

import { useState } from 'react'
import { createAuthor, updateAuthor, deleteAuthor } from '@/app/admin/authors/actions'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Author = {
    id: string
    name: string
    slug: string
    bio: string | null
    createdAt: Date
    _count: { stories: number }
}

export default function AuthorManager({ initialAuthors, total, page, totalPages, query }: {
    initialAuthors: Author[], total: number, page: number, totalPages: number, query: string
}) {
    const [authors, setAuthors] = useState<Author[]>(initialAuthors)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingAuthor, setEditingAuthor] = useState<Author | null>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleOpenModal = (author?: Author) => {
        setEditingAuthor(author || null)
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setEditingAuthor(null)
        setIsModalOpen(false)
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)

        try {
            if (editingAuthor) {
                await updateAuthor(editingAuthor.id, formData)
            } else {
                await createAuthor(formData)
            }
            setIsModalOpen(false)
            router.refresh()
            setTimeout(() => {
                window.location.reload()
            }, 500)
        } catch (error) {
            alert('Có lỗi xảy ra!')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa tác giả này?')) return
        setLoading(true)
        try {
            await deleteAuthor(id)
            setAuthors(authors.filter(a => a.id !== id))
            router.refresh()
        } catch (error) {
            alert('Có lỗi xảy ra khi xóa!')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-800">Quản lý Tác Giả</h1>
                    <p className="text-slate-500 text-sm mt-1">Tổng cộng {total} tác giả.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                >
                    + Thêm mới
                </button>
            </div>

            <form className="flex gap-2" action="/admin/authors">
                <input name="q" defaultValue={query} placeholder="Tìm kiếm tác giả..."
                    className="flex-1 max-w-md px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">Tìm</button>
                {query && <Link href="/admin/authors" className="px-5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-600 hover:bg-slate-50">Xóa</Link>}
            </form>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 uppercase text-slate-500 font-semibold text-xs border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Tác giả</th>
                                <th className="px-6 py-4 hidden sm:table-cell">Số phim</th>
                                <th className="px-6 py-4 hidden md:table-cell">Tiểu sử</th>
                                <th className="px-6 py-4 hidden md:table-cell">Ngày thêm</th>
                                <th className="px-6 py-4 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {authors.map((author) => (
                                <tr key={author.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                                                {author.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-800">{author.name}</p>
                                                <p className="text-xs text-slate-400">/{author.slug}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 hidden sm:table-cell">
                                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                                            {author._count.stories} phim
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 text-sm hidden md:table-cell">
                                        {author.bio ? <span className="line-clamp-1 max-w-xs">{author.bio}</span> : <span className="text-slate-300">—</span>}
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 text-xs hidden md:table-cell">
                                        {new Date(author.createdAt).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button onClick={() => handleOpenModal(author)} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 text-xs font-medium transition-colors">
                                            Sửa
                                        </button>
                                        <button onClick={() => handleDelete(author.id)} className="px-3 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-xs font-medium transition-colors">
                                            Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {authors.length === 0 && (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">Không tìm thấy tác giả nào.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <p className="text-sm text-slate-500">Trang {page} / {totalPages}</p>
                        <div className="flex gap-2">
                            {page > 1 && <Link href={`/admin/authors?page=${page - 1}${query ? `&q=${query}` : ''}`} className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm hover:bg-slate-50">← Trước</Link>}
                            {page < totalPages && <Link href={`/admin/authors?page=${page + 1}${query ? `&q=${query}` : ''}`} className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm hover:bg-slate-50">Tiếp →</Link>}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-bold text-lg">{editingAuthor ? 'Chỉnh sửa' : 'Thêm mới'} Tác Giả</h3>
                            <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tên tác giả *</label>
                                <input
                                    name="name"
                                    defaultValue={editingAuthor?.name}
                                    required
                                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tiểu sử</label>
                                <textarea
                                    name="bio"
                                    defaultValue={editingAuthor?.bio || ''}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                />
                            </div>
                            <div className="pt-4 flex justify-end gap-2">
                                <button type="button" onClick={handleCloseModal} className="px-5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl">Hủy</button>
                                <button type="submit" disabled={loading} className="px-5 py-2 text-sm font-medium bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50">
                                    {loading ? 'Đang lưu...' : 'Lưu lại'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
