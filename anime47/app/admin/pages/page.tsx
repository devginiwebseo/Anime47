import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { format } from "date-fns";

export const dynamic = 'force-dynamic';

export default async function AdminPagesList() {
    const pagesList = await prisma.pages.findMany({
        orderBy: { createdAt: "desc" }
    });

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-10">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Quản Lý Trang (Pages)</h1>
                    <p className="text-gray-500 text-sm mt-1">Quản lý các trang nội dung tĩnh (Giới thiệu, Chính sách...)</p>
                </div>
                <Link href="/admin/pages/new" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition">
                    + Thêm Trang Mới
                </Link>
            </div>

            <div className="bg-white border text-black border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm">
                            <th className="p-4 font-semibold">Tên Trang</th>
                            <th className="p-4 font-semibold">Đường dẫn (Slug)</th>
                            <th className="p-4 font-semibold text-center">Trạng Thái</th>
                            <th className="p-4 font-semibold text-right">Ngày Tạo</th>
                            <th className="p-4 font-semibold text-right">Thao Tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {pagesList.map(page => (
                            <tr key={page.id} className="hover:bg-gray-50/50 transition">
                                <td className="p-4 font-bold text-gray-800">{page.title}</td>
                                <td className="p-4 text-blue-600"><Link href={`/${page.slug}`} target="_blank" className="hover:underline">/{page.slug}</Link></td>
                                <td className="p-4 text-center">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${page.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {page.isPublished ? 'Hiển thị' : 'Đang ẩn'}
                                    </span>
                                </td>
                                <td className="p-4 text-right text-gray-500 text-sm">{format(new Date(page.createdAt), "dd/MM/yyyy")}</td>
                                <td className="p-4 text-right">
                                    <Link href={`/admin/pages/${page.id}`} className="text-blue-500 font-bold hover:text-blue-700 underline text-sm">
                                        Chỉnh sửa
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {pagesList.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-500">Chưa có trang nào.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
