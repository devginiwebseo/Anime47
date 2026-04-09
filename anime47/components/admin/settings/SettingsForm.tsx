'use client';

import React, { useState } from 'react';

interface SettingsFormProps {
    initialHeaderSettings: HeaderSettings;
    initialFooterSettings: FooterSettings;
    initialThemeSettings: ThemeSettings;
}

interface ThemeSettings {
    primaryColor: string;
    backgroundColor: string;
    isIndexed?: boolean;
    siteTitle?: string;
    faviconUrl?: string;
}

interface HeaderSettings {
    siteName: string;
    logoUrl: string;
    showSearch: boolean;
    menuItems: {
        label: string;
        href: string;
        submenu?: { label: string; href: string }[]
    }[];
    announcement: string;
}

interface FooterSettings {
    copyrightText: string;
    description: string;
    socialLinks: { platform: string; url: string }[];
    footerLinks: { label: string; href: string }[];
    showBackToTop: boolean;
}

export default function SettingsForm({ initialHeaderSettings, initialFooterSettings, initialThemeSettings }: SettingsFormProps) {
    const [activeTab, setActiveTab] = useState<'header' | 'footer' | 'theme'>('header');
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');

    // Header state
    const [header, setHeader] = useState<HeaderSettings>(initialHeaderSettings);
    // Footer state
    const [footer, setFooter] = useState<FooterSettings>(initialFooterSettings);
    // Theme state
    const [theme, setTheme] = useState<ThemeSettings>(initialThemeSettings);

    const handleSave = async () => {
        setSaving(true);
        setSuccess('');
        try {
            await Promise.all([
                fetch('/api/admin/settings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key: 'header', value: header }),
                }),
                fetch('/api/admin/settings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key: 'footer', value: footer }),
                }),
                fetch('/api/admin/settings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key: 'theme', value: theme }),
                }),
            ]);
            setSuccess('Cài đặt đã được lưu thành công!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            alert('Lỗi khi lưu cài đặt');
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'favicon') => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (data.url) {
                if (type === 'logo') {
                    setHeader({ ...header, logoUrl: data.url });
                } else {
                    setTheme({ ...theme, faviconUrl: data.url });
                }
            } else {
                alert('Tải ảnh thất bại: ' + (data.error || 'Lỗi không xác định'));
            }
        } catch (error) {
            alert('Lỗi tải ảnh');
        }
    };

    // Menu items helpers
    const addMenuItem = () => setHeader({ ...header, menuItems: [...header.menuItems, { label: '', href: '' }] });
    const removeMenuItem = (i: number) => setHeader({ ...header, menuItems: header.menuItems.filter((_, idx) => idx !== i) });
    const updateMenuItem = (i: number, field: 'label' | 'href', val: string) => {
        const items = [...header.menuItems];
        items[i] = { ...items[i], [field]: val };
        setHeader({ ...header, menuItems: items });
    };

    const addSubMenuItem = (i: number) => {
        const items = [...header.menuItems];
        if (!items[i].submenu) items[i].submenu = [];
        items[i].submenu!.push({ label: '', href: '' });
        setHeader({ ...header, menuItems: items });
    };
    const removeSubMenuItem = (i: number, subI: number) => {
        const items = [...header.menuItems];
        if (items[i].submenu) {
            items[i].submenu = items[i].submenu!.filter((_, idx) => idx !== subI);
        }
        setHeader({ ...header, menuItems: items });
    };
    const updateSubMenuItem = (i: number, subI: number, field: 'label' | 'href', val: string) => {
        const items = [...header.menuItems];
        if (items[i].submenu) {
            items[i].submenu![subI] = { ...items[i].submenu![subI], [field]: val };
        }
        setHeader({ ...header, menuItems: items });
    };

    // Social links helpers
    const addSocialLink = () => setFooter({ ...footer, socialLinks: [...footer.socialLinks, { platform: '', url: '' }] });
    const removeSocialLink = (i: number) => setFooter({ ...footer, socialLinks: footer.socialLinks.filter((_, idx) => idx !== i) });
    const updateSocialLink = (i: number, field: 'platform' | 'url', val: string) => {
        const links = [...footer.socialLinks];
        links[i] = { ...links[i], [field]: val };
        setFooter({ ...footer, socialLinks: links });
    };

    // Footer links helpers
    const addFooterLink = () => setFooter({ ...footer, footerLinks: [...footer.footerLinks, { label: '', href: '' }] });
    const removeFooterLink = (i: number) => setFooter({ ...footer, footerLinks: footer.footerLinks.filter((_, idx) => idx !== i) });
    const updateFooterLink = (i: number, field: 'label' | 'href', val: string) => {
        const links = [...footer.footerLinks];
        links[i] = { ...links[i], [field]: val };
        setFooter({ ...footer, footerLinks: links });
    };

    const inputClass = "w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white";
    const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab('header')}
                    className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'header' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    🎯 Header
                </button>
                <button
                    onClick={() => setActiveTab('footer')}
                    className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'footer' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    📌 Footer
                </button>
                <button
                    onClick={() => setActiveTab('theme')}
                    className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'theme' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Cài đặt trang web
                </button>
            </div>

            {/* Header Settings */}
            {activeTab === 'header' && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-6">
                    <h2 className="text-lg font-bold text-slate-800">Cài đặt Header</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className={labelClass}>Tên Website</label>
                            <input value={header.siteName} onChange={(e) => setHeader({ ...header, siteName: e.target.value })} className={inputClass} placeholder="Anime47" />
                        </div>
                        <div>
                            <label className={labelClass}>Logo URL</label>
                            <div className="flex gap-2 items-center">
                                <input value={header.logoUrl} onChange={(e) => setHeader({ ...header, logoUrl: e.target.value })} className={inputClass} placeholder="https://..." />
                                <label className="cursor-pointer bg-slate-200 hover:bg-slate-300 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition">
                                    Tải Ảnh
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'logo')} />
                                </label>
                            </div>
                            {header.logoUrl && (
                                <div className="mt-2 bg-slate-100 border p-2 rounded w-fit">
                                    <img src={header.logoUrl} alt="Logo" className="h-10 object-contain" />
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className={labelClass}>Thông báo</label>
                        <input value={header.announcement} onChange={(e) => setHeader({ ...header, announcement: e.target.value })} className={inputClass} placeholder="Thông báo hiển thị trên Header..." />
                    </div>

                    <div className="flex items-center gap-3">
                        <input type="checkbox" id="showSearch" checked={header.showSearch} onChange={(e) => setHeader({ ...header, showSearch: e.target.checked })} className="w-4 h-4 text-blue-600 rounded" />
                        <label htmlFor="showSearch" className="text-sm text-slate-700 font-medium">Hiển thị thanh tìm kiếm</label>
                    </div>

                    {/* Menu Items */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className={labelClass}>Menu điều hướng</label>
                            <button onClick={addMenuItem} className="text-xs text-blue-600 hover:text-blue-800 font-semibold">+ Thêm mục</button>
                        </div>
                        <div className="space-y-4">
                            {header.menuItems.map((item, i) => (
                                <div key={i} className="border border-slate-200 rounded-xl p-3 bg-slate-50 relative">
                                    <div className="flex gap-2 items-center">
                                        <input value={item.label} onChange={(e) => updateMenuItem(i, 'label', e.target.value)} className={inputClass} placeholder="Tiêu đề (VD: Thể Loại)" />
                                        <input value={item.href} onChange={(e) => updateMenuItem(i, 'href', e.target.value)} className={inputClass} placeholder="/duong-dan" />
                                        <button onClick={() => addSubMenuItem(i)} className="text-xs font-semibold text-blue-600 bg-blue-100 hover:bg-blue-200 px-3 py-2.5 rounded-xl whitespace-nowrap transition">+ Menu Con</button>
                                        <button onClick={() => removeMenuItem(i)} className="p-2.5 text-red-500 hover:bg-red-200 bg-red-100 rounded-xl flex-shrink-0 transition">
                                            XOÁ
                                        </button>
                                    </div>

                                    {/* Submenu rendering */}
                                    {item.submenu && item.submenu.length > 0 && (
                                        <div className="mt-3 pl-6 border-l-2 border-slate-300 space-y-2">
                                            {item.submenu.map((sub, subI) => (
                                                <div key={subI} className="flex gap-2 items-center">
                                                    <input value={sub.label} onChange={(e) => updateSubMenuItem(i, subI, 'label', e.target.value)} className={`${inputClass} !py-1.5 !text-xs bg-white`} placeholder="Tiêu đề Menu Con" />
                                                    <input value={sub.href} onChange={(e) => updateSubMenuItem(i, subI, 'href', e.target.value)} className={`${inputClass} !py-1.5 !text-xs bg-white`} placeholder="/duong-dan" />
                                                    <button onClick={() => removeSubMenuItem(i, subI)} className="p-1.5 text-red-500 hover:bg-red-200 bg-red-100 rounded-lg flex-shrink-0 transition text-xs font-bold px-3">
                                                        XOÁ
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Footer Settings */}
            {activeTab === 'footer' && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-6">
                    <h2 className="text-lg font-bold text-slate-800">Cài đặt Footer</h2>

                    <div>
                        <label className={labelClass}>Mô tả website</label>
                        <textarea value={footer.description} onChange={(e) => setFooter({ ...footer, description: e.target.value })} className={`${inputClass} resize-none`} rows={3} placeholder="Mô tả ngắn về website..." />
                    </div>

                    <div>
                        <label className={labelClass}>Bản quyền</label>
                        <input value={footer.copyrightText} onChange={(e) => setFooter({ ...footer, copyrightText: e.target.value })} className={inputClass} placeholder="© 2026 Anime47. All rights reserved." />
                    </div>

                    <div className="flex items-center gap-3">
                        <input type="checkbox" id="showBackToTop" checked={footer.showBackToTop} onChange={(e) => setFooter({ ...footer, showBackToTop: e.target.checked })} className="w-4 h-4 text-blue-600 rounded" />
                        <label htmlFor="showBackToTop" className="text-sm text-slate-700 font-medium">Hiển thị nút "Về đầu trang"</label>
                    </div>

                    {/* Social Links */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className={labelClass}>Mạng xã hội</label>
                            <button onClick={addSocialLink} className="text-xs text-blue-600 hover:text-blue-800 font-semibold">+ Thêm</button>
                        </div>
                        <div className="space-y-3">
                            {footer.socialLinks.map((link, i) => (
                                <div key={i} className="flex gap-2 items-center">
                                    <select value={link.platform} onChange={(e) => updateSocialLink(i, 'platform', e.target.value)} className={`${inputClass} max-w-[150px]`}>
                                        <option value="">Chọn...</option>
                                        <option value="facebook">Facebook</option>
                                        <option value="youtube">YouTube</option>
                                        <option value="twitter">Twitter / X</option>
                                        <option value="tiktok">TikTok</option>
                                        <option value="instagram">Instagram</option>
                                        <option value="telegram">Telegram</option>
                                        <option value="discord">Discord</option>
                                    </select>
                                    <input value={link.url} onChange={(e) => updateSocialLink(i, 'url', e.target.value)} className={inputClass} placeholder="https://..." />
                                    <button onClick={() => removeSocialLink(i)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg flex-shrink-0">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer Links */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className={labelClass}>Liên kết Footer</label>
                            <button onClick={addFooterLink} className="text-xs text-blue-600 hover:text-blue-800 font-semibold">+ Thêm</button>
                        </div>
                        <div className="space-y-3">
                            {footer.footerLinks.map((link, i) => (
                                <div key={i} className="flex gap-2 items-center">
                                    <input value={link.label} onChange={(e) => updateFooterLink(i, 'label', e.target.value)} className={inputClass} placeholder="Tiêu đề" />
                                    <input value={link.href} onChange={(e) => updateFooterLink(i, 'href', e.target.value)} className={inputClass} placeholder="/duong-dan" />
                                    <button onClick={() => removeFooterLink(i)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg flex-shrink-0">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Theme Settings */}
            {activeTab === 'theme' && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-6">
                    <h2 className="text-lg font-bold text-slate-800">Cài đặt Trang web & Giao diện</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className={labelClass}>Tiêu đề Website (SEO Title)</label>
                            <input value={theme.siteTitle || ''} onChange={(e) => setTheme({ ...theme, siteTitle: e.target.value })} className={inputClass} placeholder="Anime47 - Xem Phim Online Miễn Phí" />
                            <p className="text-xs text-slate-500 mt-2">Hiển thị trên tab trình duyệt và kết quả tìm kiếm Google.</p>
                        </div>
                        <div>
                            <label className={labelClass}>Favicon URL (Biểu tượng web)</label>
                            <div className="flex gap-2 items-center">
                                <input value={theme.faviconUrl || ''} onChange={(e) => setTheme({ ...theme, faviconUrl: e.target.value })} className={inputClass} placeholder="https://.../favicon.ico" />
                                <label className="cursor-pointer bg-slate-200 hover:bg-slate-300 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition">
                                    Tải Ảnh
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'favicon')} />
                                </label>
                            </div>
                            {theme.faviconUrl && (
                                <div className="mt-2 bg-slate-50 border border-dashed p-2 rounded w-fit">
                                    <img src={theme.faviconUrl} alt="Favicon" className="h-8 w-8 object-contain" />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
                        <div>
                            <label className={labelClass}>Màu Chủ Đạo (Primary Color)</label>
                            <div className="flex items-center gap-3">
                                <input type="color" value={theme.primaryColor} onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })} className="w-12 h-12 rounded cursor-pointer border-0 p-0" />
                                <input value={theme.primaryColor} onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })} className={inputClass} placeholder="#d32f2f" />
                            </div>
                            <p className="text-xs text-slate-500 mt-2">Dùng cho tiêu đề nổi bật, nút bấm, liên kết hover.</p>
                        </div>
                        <div>
                            <label className={labelClass}>Màu Nền Header & Footer (Background Color)</label>
                            <div className="flex items-center gap-3">
                                <input type="color" value={theme.backgroundColor} onChange={(e) => setTheme({ ...theme, backgroundColor: e.target.value })} className="w-12 h-12 rounded cursor-pointer border-0 p-0" />
                                <input value={theme.backgroundColor} onChange={(e) => setTheme({ ...theme, backgroundColor: e.target.value })} className={inputClass} placeholder="#111827" />
                            </div>
                            <p className="text-xs text-slate-500 mt-2">Dùng làm màu nền cho thanh Header và khu vực Footer.</p>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200">
                        <label className={labelClass}>Cho phép Bot Index Website (SEO)</label>
                        <div className="flex items-center gap-3 mt-2">
                            <input
                                type="checkbox"
                                id="isIndexed"
                                checked={theme.isIndexed ?? false}
                                onChange={(e) => setTheme({ ...theme, isIndexed: e.target.checked })}
                                className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                            />
                            <label htmlFor="isIndexed" className="text-sm text-slate-700 font-medium cursor-pointer">Cho phép các công cụ tìm kiếm (Google, Bing...) index website của bạn (bật/tắt thẻ robots index, follow)</label>
                        </div>
                    </div>
                </div>
            )}

            {/* Save Button */}
            <div className="flex items-center gap-4">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
                >
                    {saving ? (
                        <span className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Đang lưu...
                        </span>
                    ) : '💾 Lưu cài đặt'}
                </button>
                {success && (
                    <span className="text-sm text-green-600 font-medium animate-pulse">{success}</span>
                )}
            </div>
        </div>
    );
}
