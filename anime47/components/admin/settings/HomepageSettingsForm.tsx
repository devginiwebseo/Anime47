'use client';
import React, { useState, useEffect } from 'react';

const blockTypes = [
    { type: 'INTRODUCTION', label: 'Khối Giới Thiệu', desc: 'Banner giới thiệu với slogan và mô tả', icon: '📝' },
    { type: 'CATEGORY', label: 'Khối Phim Theo Thể Loại', desc: 'Hiển thị phim theo thể loại cụ thể', icon: '🗂️' },
    { type: 'COMPLETED', label: 'Khối Anime Hoàn Thành', desc: 'Hiển thị các bộ anime đã hoàn thành', icon: '✅' },
    { type: 'NEW_RELEASES', label: 'Khối Anime Mới Cập Nhật', desc: 'Hiển thị anime mới cập nhật', icon: '🔄' },
    { type: 'HOT', label: 'Khối Anime Hot', desc: 'Hiển thị anime hot / nhiều người xem', icon: '🔥' },
    { type: 'RANKING', label: 'Khối Bảng Xếp Hạng', desc: 'Hiển thị bảng xếp hạng Ngày / Tháng / Năm', icon: '🏆' },
    { type: 'COMING_SOON', label: 'Khối Sắp Chiếu', desc: 'Hiển thị phim sắp chiếu', icon: '🍿' },
    { type: 'RECOMMENDED', label: 'Khối Đề Cử', desc: 'Hiển thị phim đề cử / admin chọn', icon: '⭐' },
    { type: 'USP', label: 'Khối USP (Điểm Nổi Bật)', desc: 'Hiển thị các điểm đặc biệt của website', icon: '🌟' },
    { type: 'NOTICE', label: 'Khối Thông Báo/Ghi Chú', desc: 'Hiển thị thông báo, ghi chú nổi bật', icon: '📢' },
];

export default function HomepageSettingsForm({ initialBlocks, genres: initialGenres }: any) {
    const [blocks, setBlocks] = useState<any[]>(initialBlocks || []);
    const [genres, setGenres] = useState<any[]>(initialGenres || []);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const res = await fetch(`${process.env.API_URL}/api/public/genres`);
                if (res.ok) {
                    const result = await res.json();
                    if (result.success) {
                        setGenres(result.data || []);
                    }
                }
            } catch (error) {
                console.error('Lỗi fetch genres:', error);
            }
        };
        fetchGenres();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setSuccess('');
        try {
            await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'homepage_blocks', value: blocks }),
            });
            setSuccess('Đã lưu cài đặt trang chủ!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            alert('Lỗi lưu cài đặt');
        } finally {
            setSaving(false);
        }
    };

    const addBlock = (type: string) => {
        const id = 'block_' + Date.now();
        let newBlock: any = { id, type, isHidden: false };

        if (['NEW_RELEASES', 'COMING_SOON', 'RECOMMENDED', 'HOT', 'COMPLETED', 'CATEGORY', 'RANKING'].includes(type)) {
            newBlock = {
                ...newBlock,
                title: blockTypes.find(b => b.type === type)?.label,
                ...(type !== 'RANKING' ? { limit: 10, numColumns: 5 } : {}),
                ...(type === 'CATEGORY' ? { genreSlug: genres[0]?.slug } : {})
            };
        } else if (type === 'INTRODUCTION') {
            newBlock = { ...newBlock, title: 'Slogan', description: 'Mô tả ngắn gọn' };
        } else if (type === 'USP') {
            newBlock = {
                ...newBlock,
                title: 'Đọc truyện mỗi ngày tại Truyện chữ Hip có gì đáng chọn?',
                subtitle: 'Không chỉ là nơi đọc truyện, Truyện chữ HIP dần trở thành điểm hẹn quen thuộc của những ai yêu truyện chữ và muốn tận hưởng cảm giác đọc trọn vẹn, không bị gián đoạn.',
                items: [
                    { icon: '✅', title: 'Đọc truyện không bị làm phiền', description: 'Không quảng cáo chen ngang, không popup bật bất ngờ, không banner che nội dung.' },
                    { icon: '📚', title: 'Kho truyện đa dạng, cập nhật đều chương', description: 'Tổng hợp nhiều thể loại: ngôn tình, tiên hiệp, kiếm hiệp, đô thị, cổ đại... Chương mới được cập nhật thường xuyên.' },
                ]
            };
        } else if (type === 'NOTICE') {
            newBlock = {
                ...newBlock,
                content: 'Chào mừng bạn đến với **Truyện chữ HIP**! Đọc truyện chữ hoàn toàn miễn phí, không quảng cáo. Đăng ký thành viên để lưu truyện yêu thích và cập nhật chương mới sớm nhất.',
                alertType: 'info',
                showIcon: true,
                textLink: 'Đăng ký thành viên',
                urlLink: '/dang-ky'
            };
        }

        setBlocks([...blocks, newBlock]);
        setIsAddModalOpen(false);
    };

    const updateBlock = (index: number, field: string, value: any) => {
        const newBlocks = [...blocks];
        newBlocks[index] = { ...newBlocks[index], [field]: value };
        setBlocks(newBlocks);
    };

    const removeBlock = (index: number) => {
        if (confirm("Bạn có chắc chắn muốn xoá khối này?")) {
            setBlocks(blocks.filter((_, i) => i !== index));
        }
    };

    const duplicateBlock = (index: number) => {
        const block = { ...blocks[index], id: 'block_' + Date.now() };
        const newBlocks = [...blocks];
        newBlocks.splice(index + 1, 0, block);
        setBlocks(newBlocks);
    };

    const toggleHide = (index: number) => {
        updateBlock(index, 'isHidden', !blocks[index].isHidden);
    };

    const moveBlock = (index: number, direction: -1 | 1) => {
        if ((index === 0 && direction === -1) || (index === blocks.length - 1 && direction === 1)) return;
        const newBlocks = [...blocks];
        const temp = newBlocks[index];
        newBlocks[index] = newBlocks[index + direction];
        newBlocks[index + direction] = temp;
        setBlocks(newBlocks);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-end mb-4">
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-5 rounded-lg shadow-md transition"
                >
                    + Thêm Khối
                </button>
            </div>

            <div className="space-y-4">
                {blocks.map((block, index) => {
                    const blockMeta = blockTypes.find(b => b.type === block.type);
                    return (
                        <div key={block.id} className={`border rounded-xl bg-white shadow-sm transition-all duration-300 ${block.isHidden ? 'opacity-50 grayscale border-dashed border-gray-300' : 'border-emerald-200'}`}>
                            {/* Header Khối */}
                            <div className="flex items-center justify-between p-4 bg-gray-50/50 border-b border-gray-100 rounded-t-xl group">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{blockMeta?.icon}</span>
                                    <div>
                                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                            {blockMeta?.label}
                                            {block.isHidden && <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-semibold uppercase">Đã ẩn</span>}
                                        </h3>
                                        <p className="text-xs text-gray-500">{blockMeta?.desc}</p>
                                    </div>
                                </div>

                                {/* Actions dọc */}
                                <div className="flex flex-col gap-1 items-center bg-gray-50 border border-gray-200 rounded-lg p-1">
                                    <button onClick={() => moveBlock(index, -1)} disabled={index === 0} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded disabled:opacity-30 disabled:hover:bg-transparent" title="Lên">
                                        ↑
                                    </button>
                                    <button onClick={() => moveBlock(index, 1)} disabled={index === blocks.length - 1} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded disabled:opacity-30 disabled:hover:bg-transparent" title="Xuống">
                                        ↓
                                    </button>
                                    <div className="h-px bg-gray-200 w-full my-1" />
                                    <button onClick={() => toggleHide(index)} className={`p-1.5 rounded hover:bg-gray-200 ${block.isHidden ? 'text-gray-400 line-through' : 'text-emerald-600'}`} title="Ẩn/Hiện">
                                        👁
                                    </button>
                                    <button onClick={() => duplicateBlock(index)} className="p-1.5 text-orange-500 hover:bg-orange-50 rounded" title="Nhân bản">
                                        📋
                                    </button>
                                    <button onClick={() => removeBlock(index)} className="p-1.5 text-red-500 hover:bg-red-50 rounded" title="Xoá khối">
                                        🗑
                                    </button>
                                </div>
                            </div>

                            {/* Cấu hình chi tiết (Nội dung Block) */}
                            {!block.isHidden && (
                                <div className="p-5 space-y-4">
                                    {['NEW_RELEASES', 'COMING_SOON', 'RECOMMENDED', 'HOT', 'COMPLETED', 'CATEGORY', 'RANKING'].includes(block.type) && (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-600 mb-1">Tiêu đề khối</label>
                                                <input value={block.title} onChange={e => updateBlock(index, 'title', e.target.value)} className="w-full border p-2 text-sm rounded focus:border-emerald-500 outline-none" placeholder="Ví dụ: Phim Mới Cập Nhật..." />
                                            </div>

                                            {block.type !== 'RANKING' && (
                                                <>
                                                    <div>
                                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Số cột (Desktop)</label>
                                                        <select value={block.numColumns} onChange={e => updateBlock(index, 'numColumns', parseInt(e.target.value))} className="w-full border p-2 text-sm rounded focus:border-emerald-500 outline-none">
                                                            <option value={2}>2 Cột</option>
                                                            <option value={3}>3 Cột</option>
                                                            <option value={4}>4 Cột</option>
                                                            <option value={5}>5 Cột</option>
                                                            <option value={6}>6 Cột</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Số lượng phim (Limit)</label>
                                                        <input type="number" value={block.limit} onChange={e => updateBlock(index, 'limit', parseInt(e.target.value))} className="w-full border p-2 text-sm rounded focus:border-emerald-500 outline-none" />
                                                    </div>
                                                </>
                                            )}

                                            {block.type === 'CATEGORY' && (
                                                <div className="md:col-span-3">
                                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Chọn Thể loại</label>
                                                    <select value={block.genreSlug || ''} onChange={e => updateBlock(index, 'genreSlug', e.target.value)} className="w-full border p-2 text-sm rounded focus:border-emerald-500 outline-none">
                                                        {genres?.map((g: any) => <option key={g.slug} value={g.slug}>{g.name}</option>)}
                                                    </select>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {block.type === 'INTRODUCTION' && (
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-600 mb-1">Slogan (Tiêu đề lớn)</label>
                                                <input value={block.title || ''} onChange={e => updateBlock(index, 'title', e.target.value)} className="w-full border p-2 text-sm rounded" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-600 mb-1">Mô tả chi tiết</label>
                                                <textarea value={block.description || ''} onChange={e => updateBlock(index, 'description', e.target.value)} rows={3} className="w-full border p-2 text-sm rounded" />
                                            </div>
                                        </div>
                                    )}

                                    {block.type === 'NOTICE' && (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Kiểu thông báo</label>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {[
                                                            { id: 'info', label: 'Thông tin (Xanh dương)', class: 'bg-blue-50 border-blue-200 text-blue-700' },
                                                            { id: 'warning', label: 'Cảnh báo (Vàng)', class: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
                                                            { id: 'success', label: 'Thành công (Xanh lá)', class: 'bg-green-50 border-green-200 text-green-700' },
                                                            { id: 'danger', label: 'Lỗi/Quan trọng (Đỏ)', class: 'bg-red-50 border-red-200 text-red-700' },
                                                        ].map((type) => (
                                                            <button
                                                                key={type.id}
                                                                onClick={() => updateBlock(index, 'alertType', type.id)}
                                                                className={`p-2 text-[10px] font-bold rounded border transition-all ${block.alertType === type.id ? type.class + ' border-current ring-1 ring-current' : 'bg-white border-gray-200 text-gray-500'}`}
                                                            >
                                                                {type.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col justify-end">
                                                    <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded">
                                                        <input type="checkbox" checked={block.showIcon !== false} onChange={e => updateBlock(index, 'showIcon', e.target.checked)} className="rounded text-emerald-600 focus:ring-emerald-500" />
                                                        <span className="text-sm font-semibold text-gray-700">Hiển thị icon</span>
                                                    </label>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-600 mb-1">Nội dung thông báo (hỗ trợ HTML)</label>
                                                <textarea value={block.content || ''} onChange={e => updateBlock(index, 'content', e.target.value)} rows={3} className="w-full border p-2 text-sm rounded focus:border-emerald-500 outline-none" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Text link (tùy chọn)</label>
                                                    <input value={block.textLink || ''} onChange={e => updateBlock(index, 'textLink', e.target.value)} className="w-full border p-2 text-sm rounded focus:border-emerald-500 outline-none" placeholder="Ví dụ: Đăng ký thành viên" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-600 mb-1">URL link (tùy chọn)</label>
                                                    <input value={block.urlLink || ''} onChange={e => updateBlock(index, 'urlLink', e.target.value)} className="w-full border p-2 text-sm rounded focus:border-emerald-500 outline-none" placeholder="Ví dụ: /dang-ky" />
                                                </div>
                                            </div>
                                            <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 flex gap-2">
                                                <span className="text-blue-500">📢</span>
                                                <p className="text-[10px] text-blue-600">
                                                    <b>Khối Thông Báo:</b> Hiển thị thông báo nổi bật trên trang chủ. Chọn kiểu phù hợp với nội dung: Thông tin cho tin tức, Cảnh báo cho lưu ý, Thành công cho khuyến mãi, Lỗi cho thông báo quan trọng.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {block.type === 'USP' && (
                                        <div className="space-y-4">
                                            <div className="space-y-4 bg-gray-50 border border-gray-200 p-4 rounded-xl">
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Tiêu đề</label>
                                                    <input value={block.title || ''} onChange={e => updateBlock(index, 'title', e.target.value)} className="w-full border border-gray-300 p-3 text-sm font-bold rounded-lg focus:ring-emerald-500 focus:border-emerald-500" placeholder="Đọc truyện mỗi ngày tại Truyện chữ Hip có gì đáng chọn?" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Phụ đề (tùy chọn)</label>
                                                    <input value={block.subtitle || ''} onChange={e => updateBlock(index, 'subtitle', e.target.value)} className="w-full border border-gray-300 p-3 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500" placeholder="Câu mô tả phụ của khối..." />
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex items-center justify-between mb-4">
                                                    <label className="block text-xs font-black text-gray-700 uppercase tracking-widest">Các điểm nổi bật ({block.items?.length || 0})</label>
                                                    <button onClick={() => updateBlock(index, 'items', [...(block.items || []), { icon: '✨', title: 'Tiêu đề mới', description: 'Mô tả chi tiết điểm nổi bật...' }])} className="bg-emerald-800 text-white text-[10px] uppercase font-bold px-4 py-2 rounded-lg hover:bg-emerald-900 transition">+ Thêm mục</button>
                                                </div>
                                                <div className="space-y-3">
                                                    {block.items?.map((item: any, i: number) => (
                                                        <div key={i} className="bg-white border-2 border-slate-100 rounded-xl p-4 shadow-sm relative group/item">
                                                            <div className="flex items-center justify-between mb-3 border-b border-slate-50 pb-2">
                                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Mục #{i + 1}</span>
                                                                <button onClick={() => {
                                                                    updateBlock(index, 'items', block.items.filter((_: any, idx: number) => idx !== i));
                                                                }} className="text-[10px] font-bold text-red-400 hover:text-red-700 uppercase">Xóa</button>
                                                            </div>
                                                            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                                                                <div className="md:col-span-1">
                                                                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Icon</label>
                                                                    <div className="flex items-center justify-center border-2 border-slate-100 rounded-lg p-2 aspect-square">
                                                                        <input value={item.icon || ''} onChange={e => {
                                                                            const newItems = [...block.items];
                                                                            newItems[i] = { ...newItems[i], icon: e.target.value };
                                                                            updateBlock(index, 'items', newItems);
                                                                        }} className="w-full text-center text-xl bg-transparent outline-none focus:scale-110 transition-transform" />
                                                                    </div>
                                                                </div>
                                                                <div className="md:col-span-5 space-y-3">
                                                                    <div>
                                                                        <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase text-left">Tiêu đề</label>
                                                                        <input value={item.title || ''} onChange={e => {
                                                                            const newItems = [...block.items];
                                                                            newItems[i] = { ...newItems[i], title: e.target.value };
                                                                            updateBlock(index, 'items', newItems);
                                                                        }} className="w-full border border-slate-200 p-2 text-sm font-semibold rounded-md outline-none focus:border-emerald-500" placeholder="Tiêu đề mục..." />
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase text-left">Mô tả</label>
                                                                        <textarea value={item.description || ''} onChange={e => {
                                                                            const newItems = [...block.items];
                                                                            newItems[i] = { ...newItems[i], description: e.target.value };
                                                                            updateBlock(index, 'items', newItems);
                                                                        }} rows={2} className="w-full border border-slate-200 p-2 text-xs rounded-md outline-none focus:border-emerald-500" placeholder="Mô tả chi tiết mục này..." />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="p-3 bg-yellow-50/50 rounded-lg border border-yellow-100 flex gap-2 mt-4 text-left">
                                                <span className="text-yellow-600">⭐</span>
                                                <p className="text-[10px] text-yellow-700 leading-relaxed">
                                                    <b>Khối USP:</b> Hiển thị các điểm đặc biệt của website giúp trả lời các câu hỏi: Site này là gì? Khác gì các site khác? Lợi ích cho người đọc là gì? Khuyến nghị 4 mục để có layout đẹp nhất.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}

                {blocks.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                        <p className="text-gray-500">Chưa có khối nào. Hãy thêm khối để bắt đầu.</p>
                    </div>
                )}
            </div>

            {/* Float Save Actions */}
            <div className="fixed bottom-6 right-6 flex items-center gap-4 bg-white p-4 rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.1)] border border-gray-100 z-40">
                {success && <span className="text-sm text-green-600 font-bold bg-green-50 px-3 py-1.5 rounded-full">{success}</span>}
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 disabled:opacity-50 transition"
                >
                    {saving ? 'Đang lưu...' : '💾 Lưu Cấu Hình'}
                </button>
            </div>

            {/* Nút Thêm Khối Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl flex flex-col max-h-[90vh]">
                        <div className="p-5 border-b flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
                            <h2 className="text-lg font-bold">Chọn Loại Khối</h2>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600">✖</button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {blockTypes.map(b => (
                                    <button
                                        key={b.type}
                                        onClick={() => addBlock(b.type)}
                                        className="text-left border border-gray-200 rounded-xl p-5 hover:border-emerald-500 hover:shadow-lg transition-all group flex gap-4"
                                    >
                                        <span className="text-3xl grayscale group-hover:grayscale-0 transition-all">{b.icon}</span>
                                        <div>
                                            <h3 className="font-bold text-gray-800 text-sm">{b.label}</h3>
                                            <p className="text-xs text-gray-500 mt-1">{b.desc}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
