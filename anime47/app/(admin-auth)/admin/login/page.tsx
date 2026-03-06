import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginForm from "./LoginForm";

export default async function AdminLoginPage() {
  const session = await getServerSession(authOptions);

  // Nếu đã đăng nhập với quyền ADMIN thì redirect về trang quản trị
  if (session?.user && (session.user as any).role === "ADMIN") {
    redirect("/admin");
  }

  return <LoginForm />;
}
