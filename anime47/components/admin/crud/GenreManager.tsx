'use client'

import { useState } from 'react'
import { createGenre, updateGenre, deleteGenre } from '@/app/admin/genres/actions'
import { useRouter } from 'next/navigation'

type Genre = {
    id: string
    name: string
    slug: string
    description: string | null
    _count: { story_genres: number }
}

export default function GenreManager({ initialGenres }: { initialGenres: Genre[] }) {
    const [genres, setGenres] = useState<Genre[]>(initialGenres)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingGenre, setEditingGenre] = useState<Genre | null>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleOpenModal = (genre?: Genre) => {
        setEditingGenre(genre || null)
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setEditingGenre(null)
        setIsModalOpen(false)
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)

        try {
            if (editingGenre) {
                await updateGenre(editingGenre.id, formData)
            } else {
                await createGenre(formData)
            }
            setIsModalOpen(false)
            router.refresh()
            // We can optimistic update here but simpler to wait for refresh
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
        if (!confirm('Bạn có chắc chắn muốn xóa thể loại này?')) return
        setLoading(true)
        try {
            await deleteGenre(id)
            setGenres(genres.filter(g => g.id !== id))
            router.refresh()
        } catch (error) {
            alert('Có lỗi xảy ra khi xóa!')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-800">Quản lý Thể Loại</h1>
                    <p className="text-slate-500 text-sm mt-1">Tổng cộng {genres.length} thể loại.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                >
                    + Thêm mới
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {genres.map((genre) => (
                    <div key={genre.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow group relative">
                        <div className="flex items-center justify-between mb-3 pr-8">
                            <h3 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">{genre.name}</h3>
                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full whitespace-nowrap">
                                {genre._count.story_genres} phim
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 mb-2 truncate">/{genre.slug}</p>
                        {genre.description && (
                            <p className="text-sm text-slate-500 line-clamp-2">{genre.description}</p>
                        )}

                        <div className="absolute top-4 right-4 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleOpenModal(genre)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                                ✎
                            </button>
                            <button onClick={() => handleDelete(genre.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                🗑
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {genres.length === 0 && (
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                    <p className="text-slate-400">Chưa có thể loại nào.</p>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-bold text-lg">{editingGenre ? 'Chỉnh sửa' : 'Thêm mới'} Thể Loại</h3>
                            <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tên thể loại *</label>
                                <input
                                    name="name"
                                    defaultValue={editingGenre?.name}
                                    required
                                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mô tả</label>
                                <textarea
                                    name="description"
                                    defaultValue={editingGenre?.description || ''}
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
