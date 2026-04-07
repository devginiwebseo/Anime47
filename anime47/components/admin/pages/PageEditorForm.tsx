"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

import QuillEditor from "./QuillEditor";

export default function PageEditorForm({ pageData }: { pageData?: any }) {
    const router = useRouter();
    const isEdit = !!pageData;

    const [form, setForm] = useState({
        title: pageData?.title || "",
        slug: pageData?.slug || "",
        content: pageData?.content || "",
        metaTitle: pageData?.metaTitle || "",
        metaDescription: pageData?.metaDescription || "",
        isPublished: pageData?.isPublished ?? true,
    });
    
    // Auto generate slug from title if empty
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        setForm(prev => {
            const next = { ...prev, title };
            if (!isEdit && !prev.slug) { 
                next.slug = title.toLowerCase()
                  .normalize('NFD').replace(/[\u0300-\u036f]/g, "")
                  .replace(/đ/g, "d").replace(/Đ/g, "D")
                  .trim()
                  .replace(/[^a-z0-9 ]/g, "")
                  .replace(/\s+/g, "-");
            }
            return next;
        });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = isEdit ? `/api/admin/pages/${pageData.id}` : `/api/admin/pages`;
        const method = isEdit ? "PUT" : "POST";
        
        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            });
            const data = await res.json();
            if (data.success) {
                alert("Đã lưu thành công!");
                router.push("/admin/pages");
                router.refresh();
            } else {
                alert("Lỗi: " + data.message);
            }
        } catch (err) {
            alert("Có lỗi xảy ra khi lưu.");
        }
    };

    const handleDelete = async () => {
        if (!confirm("Bạn có chắc muốn xoá trang này?")) return;
        try {
            const res = await fetch(`/api/admin/pages/${pageData.id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                router.push("/admin/pages");
                router.refresh();
            }
        } catch (e) {
            alert("Lỗi khi xoá");
        }
    };

    return (
        <form onSubmit={handleSave} className="space-y-6 max-w-5xl mx-auto pb-10 text-black">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h1 className="text-2xl font-bold text-gray-800">{isEdit ? "Cập Nhật Trang" : "Tạo Trang Mới"}</h1>
                <div className="flex gap-2">
                    {isEdit && (
                        <button type="button" onClick={handleDelete} className="px-5 py-2.5 bg-red-100 text-red-600 rounded-xl font-bold hover:bg-red-200 transition">
                            Xoá Trang
                        </button>
                    )}
                    <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition">
                        Lưu Thay Đổi
                    </button>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Tiêu Đề Trang</label>
                        <input required value={form.title} onChange={handleTitleChange} className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ví dụ: Chính Sách Bảo Mật" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Đường Dẫn (Slug)</label>
                        <input required value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="chinh-sach-bao-mat" />
                        <p className="text-xs text-gray-400 mt-1">Link sẽ là: domain.com/<b>{form.slug || "..."}</b></p>
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-bold text-gray-700">Nội Dung</label>
                    </div>
                    <QuillEditor 
                        value={form.content}
                        onChange={(val) => setForm({...form, content: val})}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Meta Title (SEO)</label>
                        <input value={form.metaTitle} onChange={e => setForm({...form, metaTitle: e.target.value})} className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Mặc định lấy tiêu đề" />
                    </div>
                    <div className="flex flex-col justify-center pt-6">
                        <label className="flex items-center gap-2 cursor-pointer p-3 bg-gray-50 rounded-lg w-fit">
                            <input type="checkbox" checked={form.isPublished} onChange={e => setForm({...form, isPublished: e.target.checked})} className="w-5 h-5 text-blue-600 rounded" />
                            <span className="font-bold text-gray-700">Đăng công khai (Publish)</span>
                        </label>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-1">Meta Description (SEO)</label>
                        <textarea value={form.metaDescription} onChange={e => setForm({...form, metaDescription: e.target.value})} className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" rows={2} />
                    </div>
                </div>
            </div>
        </form>
    );
}
