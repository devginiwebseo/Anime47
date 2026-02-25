'use client';

import React, { useState } from 'react';

interface SettingsFormProps {
    initialHeaderSettings: HeaderSettings;
    initialFooterSettings: FooterSettings;
}

interface HeaderSettings {
    siteName: string;
    logoUrl: string;
    showSearch: boolean;
    menuItems: { label: string; href: string }[];
    announcement: string;
}

interface FooterSettings {
    copyrightText: string;
    description: string;
    socialLinks: { platform: string; url: string }[];
    footerLinks: { label: string; href: string }[];
    showBackToTop: boolean;
}

export default function SettingsForm({ initialHeaderSettings, initialFooterSettings }: SettingsFormProps) {
    const [activeTab, setActiveTab] = useState<'header' | 'footer'>('header');
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');

    // Header state
    const [header, setHeader] = useState<HeaderSettings>(initialHeaderSettings);
    // Footer state
    const [footer, setFooter] = useState<FooterSettings>(initialFooterSettings);

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
            ]);
            setSuccess('Cài đặt đã được lưu thành công!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            alert('Lỗi khi lưu cài đặt');
        } finally {
            setSaving(false);
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
                            <input value={header.logoUrl} onChange={(e) => setHeader({ ...header, logoUrl: e.target.value })} className={inputClass} placeholder="https://..." />
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
                        <div className="space-y-3">
                            {header.menuItems.map((item, i) => (
                                <div key={i} className="flex gap-2 items-center">
                                    <input value={item.label} onChange={(e) => updateMenuItem(i, 'label', e.target.value)} className={inputClass} placeholder="Tiêu đề" />
                                    <input value={item.href} onChange={(e) => updateMenuItem(i, 'href', e.target.value)} className={inputClass} placeholder="/duong-dan" />
                                    <button onClick={() => removeMenuItem(i)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg flex-shrink-0">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
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
