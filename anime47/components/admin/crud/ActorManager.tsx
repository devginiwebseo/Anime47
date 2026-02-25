'use client'

import { useState } from 'react'
import { createActor, updateActor, deleteActor } from '@/app/admin/actors/actions'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Actor = {
    id: string
    name: string
    slug: string
    bio: string | null
    _count: { story_actors: number }
}

export default function ActorManager({ initialActors, total, page, totalPages, query }: {
    initialActors: Actor[], total: number, page: number, totalPages: number, query: string
}) {
    const [actors, setActors] = useState<Actor[]>(initialActors)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingActor, setEditingActor] = useState<Actor | null>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleOpenModal = (actor?: Actor) => {
        setEditingActor(actor || null)
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setEditingActor(null)
        setIsModalOpen(false)
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)

        try {
            if (editingActor) {
                await updateActor(editingActor.id, formData)
            } else {
                await createActor(formData)
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
        if (!confirm('Bạn có chắc chắn muốn xóa diễn viên này?')) return
        setLoading(true)
        try {
            await deleteActor(id)
            setActors(actors.filter(a => a.id !== id))
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
                    <h1 className="text-2xl font-bold tracking-tight text-slate-800">Quản lý Diễn Viên</h1>
                    <p className="text-slate-500 text-sm mt-1">Tổng cộng {total} diễn viên.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                >
                    + Thêm mới
                </button>
            </div>

            <form className="flex gap-2" action="/admin/actors">
                <input name="q" defaultValue={query} placeholder="Tìm kiếm diễn viên..."
                    className="flex-1 max-w-md px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">Tìm</button>
                {query && <Link href="/admin/actors" className="px-5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-600 hover:bg-slate-50">Xóa</Link>}
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {actors.map((actor) => (
                    <div key={actor.id} className="relative bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow group">
                        <div className="flex items-center gap-3 pr-8">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                {actor.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="font-semibold text-slate-800 truncate">{actor.name}</h3>
                                <p className="text-xs text-slate-400 truncate">/{actor.slug}</p>
                            </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                            <span className="text-xs text-slate-500">{actor._count.story_actors} phim</span>
                            {actor.bio && (
                                <span className="text-xs text-blue-500">Có tiểu sử</span>
                            )}
                        </div>

                        <div className="absolute top-4 right-4 flex flex-col gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleOpenModal(actor)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                                ✎
                            </button>
                            <button onClick={() => handleDelete(actor.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                🗑
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {actors.length === 0 && (
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                    <p className="text-slate-400">Không tìm thấy diễn viên nào.</p>
                </div>
            )}

            {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-sm text-slate-500">Trang {page} / {totalPages}</p>
                    <div className="flex gap-2">
                        {page > 1 && <Link href={`/admin/actors?page=${page - 1}${query ? `&q=${query}` : ''}`} className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm hover:bg-slate-50">← Trước</Link>}
                        {page < totalPages && <Link href={`/admin/actors?page=${page + 1}${query ? `&q=${query}` : ''}`} className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm hover:bg-slate-50">Tiếp →</Link>}
                    </div>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-bold text-lg">{editingActor ? 'Chỉnh sửa' : 'Thêm mới'} Diễn Viên</h3>
                            <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tên diễn viên *</label>
                                <input
                                    name="name"
                                    defaultValue={editingActor?.name}
                                    required
                                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tiểu sử</label>
                                <textarea
                                    name="bio"
                                    defaultValue={editingActor?.bio || ''}
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
