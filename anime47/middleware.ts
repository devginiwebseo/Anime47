import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isLoginPage = req.nextUrl.pathname === "/admin/login";

    // Nếu đã login và cố gắng truy cập trang login thì redirect về dashboard
    if (isLoginPage && token?.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const isLoginPage = req.nextUrl.pathname === "/admin/login";

        // Cho phép truy cập trang login mà không cần token
        if (isLoginPage) {
          return true;
        }

        // Các trang khác trong /admin/:path* bắt buộc phải là ADMIN
        return token?.role === "ADMIN";
      },
    },
    pages: {
      signIn: "/admin/login",
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

