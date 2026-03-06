---
trigger: always_on
glob:
description: "Rules and best practices for developing the Anime47 project"
---

# Anime47 (Next.js 14+) - Development Rules & Guidelines

Khi phát triển hoặc chỉnh sửa dự án Anime47, hãy LUÔN LUÔN tuân thủ các quy tắc sau để đảm bảo tính đồng nhất, hiệu suất và khả năng bảo trì:

## 1. Kiến trúc Next.js App Router (Server & Client Components)

- Mặc định sử dụng **Server Components** để tối ưu hóa SEO và hiệu năng. Fetch dữ liệu trực tiếp trong Component bằng `async/await` với Prisma `prisma.tablename...`
- Chỉ dùng `"use client"` khi component thực sự cần các hook của React (useState, useEffect, useRef) hoặc cần tương tác trực tiếp với DOM (như trình phát Video, nút bấm có trạng thái, tracking views, swiper...).
- Bọc các Server components có fetch dữ liệu vào `<Suspense fallback={<FallbackUI />}>` để tăng tốc độ tải trang (Streaming SSR).
- Khi render các danh sách động, đảm bảo gán `key` đầy đủ.

## 2. Dynamic Settings & Theming (Màu sắc giao diện)

- Website hỗ trợ tính năng thay đổi giao diện/cấu hình thông qua Admin (Lưu tại DB Prisma bảng `Settings`, field `value` dạng JSON).
- **TUYỆT ĐỐI KHÔNG hardcode các class màu sắc tĩnh** cho giao diện chính (như `bg-red-500`, `text-blue-500`...).
- Xuyên suốt ứng dụng, lấy màu chủ đạo thông qua **Tailwind class**: `bg-primary`, `text-primary`, `border-primary`, `ring-primary`. Tailwind đã được cấu hình map với biến `--theme-primary` (`var(--theme-primary)`) được nạp ở `MainLayoutWrapper`.

## 3. Database & Services (Module Pattern)

- Tách biệt logic nghiệp vụ: Code tương tác DB phức tạp cần được đặt trong các modules/services (ví dụ: `storyService`, `chapterService`, `commentService`). Không viết logic quá dài ở trang giao diện `page.tsx`.
- Lấy cấu hình website bằng Prisma `findUnique({ where: { key: 'setting_name' } })`. Khi truy xuất trường JSON (`value`), phải check fallback dữ liệu tĩnh an toàn để tránh lỗi sập web.
- Lượt xem/Rating cần tương tác thực với DB: Không fake hoặc gán cứng số view. Các hành động (tương tác) nên được gọi thông qua `/api/...` bằng fetch từ phía Client.

## 4. Giao diện (UI/UX)

- Giao diện Admin (`/admin`) nên tinh gọn, dễ sử dụng, quản lý linh hoạt từng Khối nội dung.
- Giao diện Người dùng nên "Premium", "Dark mode" chủ đạo (sử dụng các mã màu tối `bg-[#1a1c23]` hoặc `bg-gray-900`, `border-gray-800`).
- Responsive: Phải áp dụng padding, margin cho cả Desktop `lg:`, Tablet `md:` và Mobile. Bắt buộc chú ý `px-4` / `mx-auto` để nội dung không dán sát mép màn hình.
- Sử dụng Image của Next.js (`next/image`) để tối ưu hoá ảnh cover/thumbnail phim, xử lý ảnh lỗi bằng ảnh placeholder có sẵn.

## 5. Quản lý Uploads & Media

- Hệ thống ưu tiên lưu hình ảnh tải lên ở ổ cứng local (ví dụ: `/public/upload/logo/`) thay vì dùng Cloud (theo ý người dùng).
- Khi deploy, cron crawler hay các script tự động phải có quyền ghi/đọc (Read/Write) vào đúng thư mục `public/upload`. Luôn handle các đường dẫn tuyệt đối ổn định.

## 6. Crawler & Scripts

- Logic cào data (crawling) phải tránh bị duplicated. Check tồn tại slug/nội dung qua DB trước khi upsert.
- Các cron command/shell script cần được log lỗi ra file (như `cron.log`, `crawl.log`) thay vì in log đầy ra stdout.

---

_Bám sát những rule này sẽ giúp mã nguồn Anime47 sạch sẽ, logic phân bổ rõ ràng và dễ dàng thay đổi màu sắc/cấu hình động qua Admin._
