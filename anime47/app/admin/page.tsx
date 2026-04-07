import Link from "next/link";

export default async function AdminDashboard() {
  return (
    <div className="space-y-6 pb-10 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Tổng Quan Hệ Thống</h1>

      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
         <h2 className="text-2xl font-bold text-blue-600 mb-2">Chào mừng bạn trở lại!</h2>
         <p className="text-gray-500 mb-6">Bạn có thể quản lý các nội dung tĩnh, cài đặt trang chủ và các thành phần khác tại đây.</p>
         <div className="flex gap-4">
            <Link href="/admin/pages" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow hover:bg-blue-700 transition">
              Quản lý Trang (Pages)
            </Link>
            <Link href="/admin/settings/homepage" className="px-6 py-3 bg-slate-800 text-white rounded-xl font-bold shadow hover:bg-slate-900 transition">
              Cài Đặt Trang Chủ
            </Link>
         </div>
      </div>
    </div>
  );
}