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
    avatarUrl: string | null
    _count: { story_actors: number }
}

export default function ActorManager({ initialActors, total, page, totalPages, query }: {
    initialActors: Actor[], total: number, page: number, totalPages: number, query: string
}) {
    const [actors, setActors] = useState<Actor[]>(initialActors)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingActor, setEditingActor] = useState<Actor | null>(null)
    const [loading, setLoading] = useState(false)
    const [avatarUrl, setAvatarUrl] = useState('')
    const router = useRouter()

    const handleOpenModal = (actor?: Actor) => {
        setEditingActor(actor || null)
        setAvatarUrl(actor?.avatarUrl || '')
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setEditingActor(null)
        setAvatarUrl('')
        setIsModalOpen(false)
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const formData = new FormData()
        formData.append('file', file)

        setLoading(true)
        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            })
            const data = await res.json()
            if (data.url) {
                setAvatarUrl(data.url)
            } else {
                alert('Tải ảnh thất bại: ' + (data.error || 'Lỗi không xác định'))
            }
        } catch (error) {
            alert('Lỗi khi tải ảnh!')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)
        formData.set('avatarUrl', avatarUrl)

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
                            {actor.avatarUrl ? (
                                <img src={actor.avatarUrl} alt={actor.name} className="w-14 h-14 rounded-full object-cover ring-2 ring-slate-100 flex-shrink-0" />
                            ) : (
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-inner">
                                    {actor.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="min-w-0 flex-1">
                                <h3 className="font-bold text-slate-800 truncate text-base">{actor.name}</h3>
                                <p className="text-xs text-slate-400 truncate opacity-70">/{actor.slug}</p>
                            </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-wider">{actor._count.story_actors} phim</span>
                            {actor.bio && (
                                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Tiểu sử ✓</span>
                            )}
                        </div>

                        <div className="absolute top-4 right-4 flex flex-col gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleOpenModal(actor)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            <button onClick={() => handleDelete(actor.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {actors.length === 0 && (
                <div className="bg-white rounded-3xl p-16 text-center border border-dashed border-slate-300">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                    <p className="text-slate-400 font-medium">Chưa có diễn viên nào được thêm.</p>
                </div>
            )}

            {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                    <p className="text-sm font-medium text-slate-500">Trang {page} / {totalPages}</p>
                    <div className="flex gap-2">
                        {page > 1 && <Link href={`/admin/actors?page=${page - 1}${query ? `&q=${query}` : ''}`} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm">← Trước</Link>}
                        {page < totalPages && <Link href={`/admin/actors?page=${page + 1}${query ? `&q=${query}` : ''}`} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm">Tiếp →</Link>}
                    </div>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 p-1">
                        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-extrabold text-xl text-slate-800">{editingActor ? 'Chỉnh sửa' : 'Thêm mới'} Diễn Viên</h3>
                            <button onClick={handleCloseModal} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-5">
                            <div className="flex flex-col items-center mb-6">
                                <label className="relative group cursor-pointer block">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} className="w-24 h-24 rounded-3xl object-cover ring-4 ring-blue-50 transition-all hover:ring-blue-100" />
                                    ) : (
                                        <div className="w-24 h-24 rounded-3xl bg-slate-50 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 group-hover:border-blue-400 transition-all">
                                            <svg className="w-8 h-8 text-slate-300 group-hover:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase mt-1">Ảnh</span>
                                        </div>
                                    )}
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg border-2 border-white">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    </div>
                                </label>
                                <p className="text-[10px] uppercase font-bold text-slate-400 mt-4 tracking-widest">Ảnh đại diện</p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Tên diễn viên *</label>
                                <input
                                    name="name"
                                    defaultValue={editingActor?.name}
                                    required
                                    className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Tiểu sử (Sơ lược)</label>
                                <textarea
                                    name="bio"
                                    defaultValue={editingActor?.bio || ''}
                                    rows={3}
                                    className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none resize-none font-medium text-slate-700"
                                />
                            </div>
                            <div className="pt-6 flex justify-end gap-3">
                                <button type="button" onClick={handleCloseModal} className="px-6 py-3.5 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">Hủy</button>
                                <button type="submit" disabled={loading} className="px-10 py-3.5 text-sm font-bold bg-blue-600 text-white rounded-2xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-xl shadow-blue-500/30">
                                    {loading ? 'Đang xử lý...' : 'Lưu lại'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
