import AdminSidebar from "@/components/admin/AdminSidebar";
import { Toaster } from "react-hot-toast";

export const dynamic = 'force-dynamic';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Toaster position="top-right" />
      <div className="flex flex-col md:flex-row bg-[#F8FAFC] h-screen overflow-hidden">
        {/* Sidebar fixed width */}
        <AdminSidebar />

        {/* Main Content Areas - Full width minus sidebar */}
        <main className="flex-1 min-w-0 p-4 md:p-8 lg:p-12 overflow-y-auto w-full">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
