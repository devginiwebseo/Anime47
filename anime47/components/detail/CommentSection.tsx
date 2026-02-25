'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Comment {
    id: string;
    author: string;
    avatar?: string;
    content: string;
    createdAt: string;
    rating?: number;
    status?: string;
}

interface CommentSectionProps {
    storyId: string;
    comments?: Comment[];
}

export default function CommentSection({ storyId, comments = [] }: CommentSectionProps) {
    const [authorName, setAuthorName] = useState('');
    const [email, setEmail] = useState('');
    const [newComment, setNewComment] = useState('');
    const [rating, setRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [pendingIds, setPendingIds] = useState<string[]>([]);
    const [displayComments, setDisplayComments] = useState<Comment[]>(comments);
    const router = useRouter();

    // Fetch comments including pending ones
    const fetchComments = async (ids: string[]) => {
        try {
            const res = await fetch(`/api/comment?storyId=${storyId}&pendingIds=${ids.join(',')}`);
            if (res.ok) {
                const data = await res.json();
                setDisplayComments(data);
            }
        } catch (err) {
            console.error('Failed to fetch comments', err);
        }
    };

    // Initialize pending IDs and fetch
    React.useEffect(() => {
        const saved = localStorage.getItem(`pending_comments_${storyId}`);
        let ids: string[] = [];
        if (saved) {
            try {
                ids = JSON.parse(saved);
                setPendingIds(ids);
            } catch (e) {
                console.error('Failed to parse pending comments', e);
            }
        }
        fetchComments(ids);
    }, [storyId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!authorName.trim()) {
            setError('Vui lòng nhập tên của bạn');
            return;
        }
        if (!newComment.trim()) {
            setError('Vui lòng nhập nội dung bình luận');
            return;
        }

        setIsSubmitting(true);

        try {
            const res = await fetch('/api/comment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    storyId,
                    author: authorName.trim(),
                    email: email.trim() || undefined,
                    content: newComment.trim(),
                    rating: rating > 0 ? rating : undefined,
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Có lỗi xảy ra');
            }

            // Save new pending comment ID to local storage
            let updatedPending = pendingIds;
            if (data.comment?.id) {
                updatedPending = [...pendingIds, data.comment.id];
                setPendingIds(updatedPending);
                localStorage.setItem(`pending_comments_${storyId}`, JSON.stringify(updatedPending));
            }

            setSuccess('Bình luận đã được gửi và đang chờ phê duyệt!');
            setNewComment('');
            setEmail('');
            setRating(0);

            // Re-fetch comments to show the new one immediately
            await fetchComments(updatedPending);

            // Still refresh parent just in case other things updated
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'Có lỗi xảy ra khi gửi bình luận');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-white text-xl font-bold mb-4">
                💬 Bình luận ({comments.length})
            </h2>

            {/* Comment Form */}
            <form onSubmit={handleSubmit} className="mb-6">
                <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        {/* Author Name */}
                        <div>
                            <input
                                type="text"
                                value={authorName}
                                onChange={(e) => setAuthorName(e.target.value)}
                                placeholder="Tên của bạn *"
                                className="w-full bg-gray-800 text-white rounded p-3 border border-gray-700 focus:border-red-500 focus:outline-none"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email của bạn (Không bắt buộc)"
                                className="w-full bg-gray-800 text-white rounded p-3 border border-gray-700 focus:border-red-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Star Rating */}
                    <div className="mb-3">
                        <label className="text-gray-400 text-sm mb-2 block">Đánh giá của bạn:</label>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className="text-2xl transition-transform hover:scale-110"
                                >
                                    {star <= rating ? '⭐' : '☆'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Comment Textarea */}
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Nội dung bình luận của bạn..."
                        className="w-full bg-gray-800 text-white rounded p-3 border border-gray-700 focus:border-red-500 focus:outline-none resize-none"
                        rows={4}
                    />

                    {/* Error/Success Messages */}
                    {error && (
                        <div className="mt-3 text-red-500 text-sm">{error}</div>
                    )}
                    {success && (
                        <div className="mt-3 text-green-500 text-sm">{success}</div>
                    )}

                    {/* Guidelines */}
                    <div className="mt-3 text-xs text-gray-500">
                        <p>Vui lòng bình luận lịch sự, không spam, không đăng link độc hại.</p>
                    </div>

                    {/* Submit Button */}
                    <div className="mt-4 flex items-center gap-3">
                        <button
                            type="submit"
                            disabled={isSubmitting || !newComment.trim() || !authorName.trim()}
                            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-6 py-2 rounded font-semibold transition-colors"
                        >
                            {isSubmitting ? 'Đang gửi...' : 'Gửi bình luận'}
                        </button>
                    </div>
                </div>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
                {displayComments.length > 0 ? (
                    displayComments.map((comment) => (
                        <div key={comment.id} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                            <div className="flex items-start gap-3">
                                {/* Avatar */}
                                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                                    {comment.avatar ? (
                                        <img src={comment.avatar} alt={comment.author} className="w-full h-full rounded-full" />
                                    ) : (
                                        <span className="text-gray-400">👤</span>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <span className="text-white font-semibold">{comment.author}</span>
                                        {comment.rating && (
                                            <span className="text-yellow-400 text-sm">
                                                {'⭐'.repeat(comment.rating)}
                                            </span>
                                        )}
                                        <span className="text-gray-500 text-xs">• {comment.createdAt}</span>

                                        {comment.status === 'PENDING' && (
                                            <span className="text-yellow-500 text-xs flex items-center bg-yellow-500/10 px-2 py-0.5 rounded-full border border-yellow-500/20">
                                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                                Đang chờ phê duyệt
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-300 text-sm leading-relaxed">{comment.content}</p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
                    </div>
                )}
            </div>
        </div>
    );
}
