# 🏠 Nhà đất giá tốt 24h

Nền tảng đăng tin mua bán & cho thuê bất động sản toàn quốc.  
Xây dựng bằng **Next.js 16 App Router**, **Prisma 6**, và **PostgreSQL**.

🌐 **Domain:** [nhadatgiatot24h.com](https://nhadatgiatot24h.com)

---

## Tech Stack

| Layer | Công nghệ |
|---|---|
| Framework | Next.js 16.2 (App Router, React Server Components) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL 16 (Docker) |
| ORM | Prisma 6 |
| Validation | Zod 3 |
| Runtime | Node.js 20+ |

---

## Tính năng

- **Trang chủ** — Carousel tin nổi bật, danh sách tin mới có phân trang, bảng thống kê, phản hồi khách hàng
- **Danh sách tin** — Tìm kiếm toàn văn, lọc theo loại BĐS / danh mục / khu vực / diện tích / pháp lý, sắp xếp, phân trang
- **Chi tiết tin** — Gallery ảnh, bản đồ Google Maps (hỗ trợ link Google Maps tuỳ chỉnh), thông số kỹ thuật đầy đủ, carousel tin tương tự
- **Admin Portal** (`/portal`) — Quản lý tin đăng, phản hồi khách hàng, cấu hình thống kê trang chủ, bộ lọc giá, thông tin liên hệ footer
- **SEO** — `sitemap.xml` động, `robots.txt`, JSON-LD RealEstateListing, canonical URL, Open Graph / Twitter Card
- **Upload ảnh** — Tải lên `public/uploads`, hỗ trợ JPG / PNG / WEBP / GIF (tối đa 8 MB)
- **Responsive** — Mobile-first; bộ lọc dạng bottom-drawer trên điện thoại, ContactBox hiển thị trên "Tin tương tự" trên mobile

---

## Yêu cầu

- [Node.js](https://nodejs.org/) v20+
- [Docker](https://www.docker.com/) (để chạy PostgreSQL)
- [Git](https://git-scm.com/)

---

## Cài đặt & Chạy

### 1. Clone repo

```bash
git clone https://github.com/yourusername/real-estate-app.git
cd real-estate-app
```

### 2. Cài dependencies

```bash
npm install
```

### 3. Tạo file `.env.local`

Tạo file `.env.local` ở thư mục gốc với nội dung:

```env
DATABASE_URL="postgresql://realestate:realestate_dev_pw@localhost:5433/realestate?schema=public"
```

> ⚠️ `.env.local` đã bị `.gitignore` — không bao giờ commit credentials lên GitHub.

### 4. Khởi động PostgreSQL

```bash
docker-compose up -d
```

PostgreSQL chạy tại `localhost:5433` (port 5433 để không xung đột với Postgres mặc định ở 5432).

### 5. Khởi tạo database

```bash
npm run db:push       # Tạo bảng từ schema
npm run db:generate   # Generate TypeScript types
```

### 6. (Tuỳ chọn) Seed dữ liệu mẫu

```bash
npm run db:seed
```

### 7. Chạy dev server

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) trên trình duyệt.

---

## Cấu trúc thư mục

```
├── app/
│   ├── api/                  # Route Handlers (REST API)
│   │   ├── listings/         # CRUD tin đăng + phân trang
│   │   ├── testimonials/     # CRUD phản hồi khách hàng
│   │   ├── stats/            # Cấu hình thống kê & cài đặt
│   │   ├── price-options/    # Bộ lọc giá tuỳ chỉnh
│   │   ├── upload/           # Upload ảnh
│   │   └── visit/            # Bộ đếm lượt truy cập (cookie)
│   ├── listings/             # Trang danh sách & chi tiết tin
│   ├── portal/               # Admin Portal (yêu cầu đăng nhập)
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Trang chủ
│   ├── sitemap.ts            # Tự động sinh /sitemap.xml
│   └── robots.ts             # Tự động sinh /robots.txt
│
├── components/
│   ├── home/                 # TestimonialsSection, LatestListings, VisitorStat
│   ├── layout/               # Header, Footer (async, đọc DB)
│   ├── listings/             # ListingCard, ListingGrid, FeaturedCarousel, Filter...
│   └── portal/               # ListingForm, ListingTable, StatsPanel, TestimonialsPanel...
│
├── lib/
│   ├── prisma.ts             # Prisma Client singleton
│   ├── auth.ts               # Xác thực admin session (httpOnly cookie)
│   ├── formatters.ts         # Format giá, diện tích, thời gian
│   ├── validations.ts        # Zod schemas cho tất cả entities
│   └── priceOptions.ts       # Helper lấy danh sách bộ lọc giá
│
├── prisma/
│   ├── schema.prisma         # Database schema (Listing, Testimonial, SiteStat...)
│   └── seed.ts               # Dữ liệu mẫu
│
├── public/uploads/           # Ảnh đã upload (không commit)
├── types/listing.ts          # TypeScript types dùng chung
├── docker-compose.yml        # PostgreSQL 16 container
└── .env.local                # Biến môi trường (không commit)
```

---

## Scripts

| Lệnh | Mô tả |
|---|---|
| `npm run dev` | Chạy dev server tại http://localhost:3000 |
| `npm run build` | Build production |
| `npm run start` | Chạy production build |
| `npm run lint` | Kiểm tra ESLint |
| `npm run db:push` | Đồng bộ Prisma schema → database |
| `npm run db:generate` | Regenerate Prisma Client types |
| `npm run db:seed` | Seed dữ liệu mẫu |
| `npm run db:studio` | Mở Prisma Studio (GUI quản lý DB) |

---

## Biến môi trường

| Biến | Mô tả | Bắt buộc |
|---|---|---|
| `DATABASE_URL` | Chuỗi kết nối PostgreSQL | ✅ |

---

## Portal quản trị

Truy cập `/portal` trên trình duyệt. Thông tin đăng nhập được cấu hình trong `lib/auth.ts` (hoặc biến môi trường tùy cài đặt).

Chức năng Portal:
- Quản lý tin đăng (thêm, sửa, ẩn, xoá)
- Quản lý phản hồi khách hàng
- Cấu hình thống kê trang chủ (lượt truy cập, số tin, giao dịch)
- Cấu hình bộ lọc giá
- Cấu hình hotline & email footer

---

## Deploy lên Vercel

1. Push code lên GitHub
2. Import repo tại [vercel.com/new](https://vercel.com/new)
3. Thêm biến môi trường `DATABASE_URL` trỏ đến PostgreSQL production
4. Deploy

**Khuyến nghị PostgreSQL production (miễn phí):**
- [Supabase](https://supabase.com) — PostgreSQL + nhiều tính năng
- [Neon](https://neon.tech) — Serverless PostgreSQL
- [Railway](https://railway.app) — Deploy dễ dàng

---

## License

MIT
