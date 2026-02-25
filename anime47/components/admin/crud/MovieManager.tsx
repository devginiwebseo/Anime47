'use client'

import { useState } from 'react'
import { createMovie, updateMovie, deleteMovie } from '@/app/admin/movies/actions'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Movie = {
    id: string
    title: string
    slug: string
    description: string | null
    status: string | null
    coverImage: string | null
    director: string | null
    cast: string | null
    views: number
    rating: number | null
    createdAt: Date
    authors: { name: string } | null
    _count: { chapters: number, comments: number }
}

export default function MovieManager({ initialMovies, total, page, totalPages, query }: {
    initialMovies: Movie[], total: number, page: number, totalPages: number, query: string
}) {
    const [movies, setMovies] = useState<Movie[]>(initialMovies)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingMovie, setEditingMovie] = useState<Movie | null>(null)
    const [loading, setLoading] = useState(false)
    const [uploadingImage, setUploadingImage] = useState(false)
    const [coverImageUrl, setCoverImageUrl] = useState('')
    const [pendingUploadedUrl, setPendingUploadedUrl] = useState<string | null>(null)
    const router = useRouter()

    const handleOpenModal = (movie?: Movie) => {
        setEditingMovie(movie || null)
        setCoverImageUrl(movie?.coverImage || '')
        setPendingUploadedUrl(null)
        setIsModalOpen(true)
    }

    const deletePendingImage = async () => {
        if (pendingUploadedUrl) {
            try {
                await fetch(`/api/upload?url=${encodeURIComponent(pendingUploadedUrl)}`, {
                    method: 'DELETE'
                });
            } catch (error) {
                console.error("Failed to delete pending image", error);
            }
        }
    }

    const handleCloseModal = async () => {
        await deletePendingImage();
        setEditingMovie(null)
        setCoverImageUrl('')
        setPendingUploadedUrl(null)
        setIsModalOpen(false)
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingImage(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (res.ok) {
                // If there's already a pending image that's unused, delete it
                await deletePendingImage();

                setCoverImageUrl(data.url);
                setPendingUploadedUrl(data.url); // Track this new upload to delete if cancelled
            } else {
                alert(data.error || 'Upload failed');
            }
        } catch (error) {
            console.error(error);
            alert('Lỗi tải ảnh');
        } finally {
            setUploadingImage(false);
            // clear the value so the same file could be selected again
            e.target.value = '';
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)

        try {
            if (editingMovie) {
                await updateMovie(editingMovie.id, formData)
            } else {
                await createMovie(formData)
            }

            // Image is officially saved, stop tracking it as pending
            setPendingUploadedUrl(null);

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
        if (!confirm('Bạn có chắc chắn muốn xóa phim này? Các tập phim và bình luận liên quan cũng sẽ bị xóa.')) return
        setLoading(true)
        try {
            await deleteMovie(id)
            setMovies(movies.filter(m => m.id !== id))
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
                    <h1 className="text-2xl font-bold tracking-tight text-slate-800">Quản lý Phim</h1>
                    <p className="text-slate-500 text-sm mt-1">Tổng cộng {total} phim trong hệ thống.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                >
                    + Thêm Phim Mới
                </button>
            </div>

            <form className="flex gap-2" action="/admin/movies">
                <input
                    name="q"
                    defaultValue={query}
                    placeholder="Tìm kiếm theo tên phim..."
                    className="flex-1 max-w-md px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
                    Tìm kiếm
                </button>
                {query && (
                    <Link href="/admin/movies" className="px-5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                        Xóa
                    </Link>
                )}
            </form>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 uppercase text-slate-500 font-semibold text-xs border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Phim</th>
                                <th className="px-6 py-4 hidden md:table-cell">Tác giả</th>
                                <th className="px-6 py-4">Trạng thái</th>
                                <th className="px-6 py-4 hidden sm:table-cell">Tập</th>
                                <th className="px-6 py-4 hidden lg:table-cell">Lượt xem</th>
                                <th className="px-6 py-4 hidden lg:table-cell">Rating</th>
                                <th className="px-6 py-4 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {movies.map((movie) => (
                                <tr key={movie.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {movie.coverImage ? (
                                                <img src={movie.coverImage} alt={movie.title} className="w-10 h-14 object-cover rounded-lg hidden sm:block" />
                                            ) : (
                                                <div className="w-10 h-14 bg-slate-200 rounded-lg hidden sm:block flex-shrink-0" />
                                            )}
                                            <div className="min-w-0">
                                                <p className="font-medium text-slate-900 truncate max-w-[200px] md:max-w-[300px]">{movie.title}</p>
                                                <p className="text-xs text-slate-400 truncate">{movie.slug}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 hidden md:table-cell">{movie.authors?.name || '—'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${movie.status === 'Hoàn thành' || movie.status === 'Hoàn tất' ? 'bg-green-100 text-green-800' :
                                            movie.status === 'Đang cập nhật' ? 'bg-blue-100 text-blue-800' :
                                                'bg-slate-100 text-slate-600'
                                            }`}>{movie.status || 'N/A'}</span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 hidden sm:table-cell">{movie._count.chapters}</td>
                                    <td className="px-6 py-4 text-slate-600 hidden lg:table-cell">{movie.views?.toLocaleString()}</td>
                                    <td className="px-6 py-4 hidden lg:table-cell">
                                        {movie.rating ? <span className="text-yellow-600 font-medium">⭐ {movie.rating.toFixed(1)}</span> : '—'}
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button onClick={() => handleOpenModal(movie)} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 text-xs font-medium transition-colors">
                                            Sửa
                                        </button>
                                        <button onClick={() => handleDelete(movie.id)} className="px-3 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-xs font-medium transition-colors">
                                            Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {movies.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                                        {query ? `Không tìm thấy phim nào với từ khóa "${query}"` : 'Chưa có phim nào trong hệ thống.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <p className="text-sm text-slate-500">Trang {page} / {totalPages}</p>
                        <div className="flex gap-2">
                            {page > 1 && <Link href={`/admin/movies?page=${page - 1}${query ? `&q=${query}` : ''}`} className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm hover:bg-slate-50">← Trước</Link>}
                            {page < totalPages && <Link href={`/admin/movies?page=${page + 1}${query ? `&q=${query}` : ''}`} className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm hover:bg-slate-50">Tiếp →</Link>}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
                            <h3 className="font-bold text-lg">{editingMovie ? 'Chỉnh sửa' : 'Thêm mới'} Phim</h3>
                            <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tên phim *</label>
                                    <input name="title" defaultValue={editingMovie?.title} required className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Ảnh bìa</label>
                                    <div className="flex gap-2 items-center">
                                        <input type="hidden" name="coverImage" value={coverImageUrl} />
                                        <div className="flex-1 relative">
                                            <input
                                                type="url"
                                                placeholder="Link ảnh hoặc tải lên..."
                                                value={coverImageUrl}
                                                onChange={(e) => setCoverImageUrl(e.target.value)}
                                                className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </div>
                                        <div className="flex-shrink-0 relative">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                title="Tải ảnh lên"
                                            />
                                            <div className="px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-xl border border-slate-300 hover:bg-slate-200 transition-colors cursor-pointer flex items-center justify-center min-w-[90px]">
                                                {uploadingImage ? (
                                                    <span className="animate-spin text-sm block w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full border-solid"></span>
                                                ) : (
                                                    <span className="text-sm">Tải lên</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {coverImageUrl && (
                                        <div className="mt-2 text-center flex justify-center">
                                            <img src={coverImageUrl} alt="Preview" className="h-40 w-28 object-cover rounded-lg border border-slate-200 shadow-sm" />
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Trạng thái</label>
                                    <select name="status" defaultValue={editingMovie?.status || 'Đang cập nhật'} className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                                        <option value="Đang cập nhật">Đang cập nhật</option>
                                        <option value="Hoàn thành">Hoàn thành</option>
                                        <option value="Sắp chiếu">Sắp chiếu</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Đạo diễn</label>
                                    <input name="director" defaultValue={editingMovie?.director || ''} className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Diễn viên (cách nhau dấu phẩy)</label>
                                    <input name="cast" defaultValue={editingMovie?.cast || ''} className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mô tả phim</label>
                                    <textarea name="description" defaultValue={editingMovie?.description || ''} rows={4} className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end gap-2 shrink-0 border-t border-slate-100 mt-6">
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
