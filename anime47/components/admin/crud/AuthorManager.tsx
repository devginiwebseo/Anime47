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
    avatarUrl: string | null
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
    const [avatarUrl, setAvatarUrl] = useState('')
    const router = useRouter()

    const handleOpenModal = (author?: Author) => {
        setEditingAuthor(author || null)
        setAvatarUrl(author?.avatarUrl || '')
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setEditingAuthor(null)
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
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20"
                >
                    + Thêm Tác Giả
                </button>
            </div>

            <form className="flex gap-2" action="/admin/authors">
                <input name="q" defaultValue={query} placeholder="Tìm kiếm tác giả..."
                    className="flex-1 max-w-md px-5 py-3 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                <button type="submit" className="px-6 py-3 bg-slate-800 text-white rounded-2xl text-sm font-bold hover:bg-slate-900 transition-colors">Tìm</button>
                {query && <Link href="/admin/authors" className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">Xóa</Link>}
            </form>

            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 uppercase text-slate-400 font-bold text-[10px] tracking-widest border-b border-slate-100">
                            <tr>
                                <th className="px-8 py-5">Tác giả</th>
                                <th className="px-6 py-5 hidden sm:table-cell">Số phim</th>
                                <th className="px-6 py-5 hidden md:table-cell">Tiểu sử</th>
                                <th className="px-6 py-5 hidden md:table-cell">Cập nhật</th>
                                <th className="px-8 py-5 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {authors.map((author) => (
                                <tr key={author.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            {author.avatarUrl ? (
                                                <img src={author.avatarUrl} alt={author.name} className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-100" />
                                            ) : (
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-inner">
                                                    {author.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-bold text-slate-800 text-base">{author.name}</p>
                                                <p className="text-[10px] text-slate-400 font-mono tracking-tighter">/{author.slug}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 hidden sm:table-cell">
                                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl uppercase tracking-wider">
                                            {author._count.stories} phim
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-slate-500 text-sm hidden md:table-cell">
                                        {author.bio ? <span className="line-clamp-1 max-w-xs">{author.bio}</span> : <span className="text-slate-300 italic text-xs">Chưa có tiểu sử</span>}
                                    </td>
                                    <td className="px-6 py-5 text-slate-400 text-[10px] font-bold uppercase hidden md:table-cell">
                                        {new Date(author.createdAt).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="px-8 py-5 text-right space-x-2">
                                        <button onClick={() => handleOpenModal(author)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors inline-flex">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                        </button>
                                        <button onClick={() => handleDelete(author.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors inline-flex">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {authors.length === 0 && (
                                <tr><td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-medium">Danh sách tác giả hiện đang trống.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="px-8 py-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Trang {page} / {totalPages}</p>
                        <div className="flex gap-2">
                            {page > 1 && <Link href={`/admin/authors?page=${page - 1}${query ? `&q=${query}` : ''}`} className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm">← Trước</Link>}
                            {page < totalPages && <Link href={`/admin/authors?page=${page + 1}${query ? `&q=${query}` : ''}`} className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm">Tiếp →</Link>}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden p-1">
                        <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center">
                            <h3 className="font-extrabold text-2xl text-slate-800 tracking-tight">{editingAuthor ? 'Sửa' : 'Thêm'} Tác Giả</h3>
                            <button onClick={handleCloseModal} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors">✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="px-10 py-10 space-y-6">
                            <div className="flex flex-col items-center mb-4">
                                <label className="relative group cursor-pointer block">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} className="w-28 h-28 rounded-[2rem] object-cover ring-4 ring-blue-50 shadow-lg group-hover:ring-blue-100 transition-all" />
                                    ) : (
                                        <div className="w-28 h-28 rounded-[2rem] bg-slate-50 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 group-hover:border-blue-400 transition-all shadow-inner">
                                            <svg className="w-10 h-10 text-slate-200 group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                        </div>
                                    )}
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-xl border-4 border-white group-hover:scale-110 transition-transform">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    </div>
                                </label>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Tên tác giả *</label>
                                <input
                                    name="name"
                                    defaultValue={editingAuthor?.name}
                                    required
                                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700 placeholder-slate-300"
                                    placeholder="Nhập tên..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Tiểu sử</label>
                                <textarea
                                    name="bio"
                                    defaultValue={editingAuthor?.bio || ''}
                                    rows={4}
                                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none resize-none font-medium text-slate-600 placeholder-slate-300"
                                    placeholder="Thông tin thêm..."
                                />
                            </div>
                            <div className="pt-8 flex justify-end gap-3">
                                <button type="button" onClick={handleCloseModal} className="px-8 py-4 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">Hủy bỏ</button>
                                <button type="submit" disabled={loading} className="px-12 py-4 text-sm font-black bg-slate-900 text-white rounded-2xl hover:bg-blue-600 disabled:opacity-50 transition-all shadow-2xl shadow-slate-900/20 active:scale-95">
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
