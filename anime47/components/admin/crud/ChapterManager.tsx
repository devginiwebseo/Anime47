'use client'

import { useState } from 'react'
import { createChapter, updateChapter, deleteChapter } from '@/app/admin/chapters/actions'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Chapter = {
    id: string
    title: string
    index: number
    videoUrl: string | null
    createdAt: Date
    stories: { title: string, slug: string }
    storyId: string
}

export default function ChapterManager({ initialChapters, total, page, totalPages, query, storiesList }: {
    initialChapters: Chapter[],
    storiesList: { id: string, title: string, slug: string }[],
    total: number,
    page: number,
    totalPages: number,
    query: string
}) {
    const [chapters, setChapters] = useState<Chapter[]>(initialChapters)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingChapter, setEditingChapter] = useState<Chapter | null>(null)
    const [loading, setLoading] = useState(false)
    const [selectedStoryId, setSelectedStoryId] = useState('')
    const router = useRouter()

    const handleOpenModal = (chapter?: Chapter) => {
        setEditingChapter(chapter || null)
        setSelectedStoryId(chapter?.storyId || '')
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setEditingChapter(null)
        setSelectedStoryId('')
        setIsModalOpen(false)
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)

        // Ensure storyId is appended if we're using controlled selection
        if (!editingChapter) {
            formData.set('storyId', selectedStoryId)
        }

        try {
            if (editingChapter) {
                await updateChapter(editingChapter.id, formData)
            } else {
                await createChapter(formData)
            }
            setIsModalOpen(false)
            router.refresh()
            setTimeout(() => {
                window.location.reload()
            }, 500)
        } catch (error) {
            alert('Có lỗi xảy ra, vui lòng kiểm tra lại thông tin!')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa tập phim này?')) return
        setLoading(true)
        try {
            await deleteChapter(id)
            setChapters(chapters.filter(c => c.id !== id))
            router.refresh()
        } catch (error) {
            alert('Có lỗi xảy ra khi xóa!')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-800">Quản lý Tập Phim</h1>
                    <p className="text-slate-500 text-sm mt-1">Tổng cộng {total} tập phim.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                >
                    + Thêm Tập Mới
                </button>
            </div>

            <form className="flex gap-2" action="/admin/chapters">
                <input name="q" defaultValue={query} placeholder="Tìm kiếm tập phim hoặc tên phim..."
                    className="flex-1 max-w-md px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">Tìm</button>
                {query && <Link href="/admin/chapters" className="px-5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-600 hover:bg-slate-50">Xóa</Link>}
            </form>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 uppercase text-slate-500 font-semibold text-xs border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Tập</th>
                                <th className="px-6 py-4">Phim</th>
                                <th className="px-6 py-4 hidden sm:table-cell">Thứ tự</th>
                                <th className="px-6 py-4 hidden md:table-cell">Video URL</th>
                                <th className="px-6 py-4 hidden md:table-cell">Ngày thêm</th>
                                <th className="px-6 py-4 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {chapters.map((ch) => (
                                <tr key={ch.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4 font-medium text-slate-900">{ch.title}</td>
                                    <td className="px-6 py-4">
                                        <Link href={`/anime/${ch.stories.slug}`} target="_blank" className="text-blue-600 hover:underline text-sm truncate block max-w-[200px]">
                                            {ch.stories.title}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 hidden sm:table-cell">{ch.index}</td>
                                    <td className="px-6 py-4 hidden md:table-cell">
                                        {ch.videoUrl ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800" title={ch.videoUrl}>Có</span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Không</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 text-xs hidden md:table-cell">
                                        {new Date(ch.createdAt).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button onClick={() => handleOpenModal(ch)} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 text-xs font-medium transition-colors">
                                            Sửa
                                        </button>
                                        <button onClick={() => handleDelete(ch.id)} className="px-3 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-xs font-medium transition-colors">
                                            Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {chapters.length === 0 && (
                                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">Không có tập phim nào.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <p className="text-sm text-slate-500">Trang {page} / {totalPages}</p>
                        <div className="flex gap-2">
                            {page > 1 && <Link href={`/admin/chapters?page=${page - 1}${query ? `&q=${query}` : ''}`} className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm hover:bg-slate-50">← Trước</Link>}
                            {page < totalPages && <Link href={`/admin/chapters?page=${page + 1}${query ? `&q=${query}` : ''}`} className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm hover:bg-slate-50">Tiếp →</Link>}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-bold text-lg">{editingChapter ? 'Chỉnh sửa' : 'Thêm mới'} Tập Phim</h3>
                            <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Chọn Phim (Story) *</label>
                                <select
                                    name="storyId"
                                    required
                                    value={selectedStoryId}
                                    onChange={(e) => setSelectedStoryId(e.target.value)}
                                    disabled={!!editingChapter}
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
                                >
                                    <option value="">-- Chọn Phim --</option>
                                    {storiesList.map((story) => (
                                        <option key={story.id} value={story.id}>
                                            {story.title}
                                        </option>
                                    ))}
                                </select>
                                {editingChapter && <p className="text-xs text-slate-400 mt-1 italic">Không thể đổi phim của tập đã có sẵn.</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tiêu đề (VD: Tập 1) *</label>
                                <input
                                    name="title"
                                    defaultValue={editingChapter?.title}
                                    required
                                    autoFocus
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Thứ tự tập (Index)</label>
                                <input
                                    name="index"
                                    type="number"
                                    min="0"
                                    defaultValue={editingChapter?.index || 1}
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Video URL (M3U8 / MP4)</label>
                                <input
                                    name="videoUrl"
                                    defaultValue={editingChapter?.videoUrl || ''}
                                    placeholder="https://..."
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-2 border-t border-slate-100 mt-6">
                                <button type="button" onClick={handleCloseModal} className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Hủy</button>
                                <button type="submit" disabled={loading} className="px-6 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-md shadow-blue-500/20">
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
