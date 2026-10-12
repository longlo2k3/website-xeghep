# Xe Ghép Liên Tỉnh (xegheplientinh.vn) CMS + Booking + SEO Constitution — Spec-Kit Mode

> **Version**: 1.0
> **Approved**: 2026-10-09
> **Scope**: All specs, plans, tasks, and code in this project must comply.
> **Enforcement**: This constitution is actively verified at gates G1–G4 (including inline self-review). `plan.md` must reference checkpoints.
> **Source of business truth**: `CMS_BACKEND_SEO_SPECIFICATION_v1.1.md` (bản 1.1.0). Nếu mâu thuẫn, spec v1.1 thắng; nếu spec v1.1 mâu thuẫn constitution, phải hỏi người dùng trước khi code.

## 1. Purpose

Constitution này định nghĩa các nguyên tắc bất di bất dịch của dự án Headless CMS + Booking Backend + SEO cho nền tảng đặt xe ghép liên tỉnh. Đây là tài liệu quyền lực cao nhất trong workflow SDD; AI phải tham chiếu khi sinh `spec.md`, `plan.md`, `tasks.md` và khi review code ở từng gate.

## 2. Core Principles

### 2.1 SEO Preservation — Bất biến SEO <!-- G1 + G4 check -->

Chuyển CMS **không được làm mất/thay đổi thứ hạng** hiện có:

- URL cũ và thứ hạng index phải được bảo toàn: đổi slug → tự tạo 301, cấm loop/chuỗi (RD-1…RD-6).
- Bộ metadata chuẩn SEO-1…SEO-6: canonical **tự sinh** (Admin không sửa được), `appendBrand` mặc định bật, tổng title hiển thị ≤ 70 ký tự, description ≤ 160 ký tự.
- `noindex = true` → meta robots noindex **và** loại khỏi sitemap; `/dat-xe/thanh-cong`, `/admin`, `/api/` luôn bị Disallow.
- Schema.org do code sinh từ dữ liệu thật; **không bao giờ** hardcode `priceValidUntil`; giá Offer chỉ lấy từ `priceFrom` số.
- Sitemap `lastmod` phải đúng `updatedAt`; robots.txt đúng mẫu mục 2.6.
- Bất kỳ thay đổi nào ảnh hưởng URL/metadata phải có test xác nhận trước khi merge.

### 2.2 Server Authority & Contract Fidelity <!-- G4 check -->

- Hệ thống có **một nguồn sự thật duy nhất**: server tính giá và validate; **không bao giờ** tin giá/trạng thái do client gửi.
- Giá là **số nguyên VND**; text hiển thị chỉ là phái sinh qua `formatTier`. Không lưu giá dạng chuỗi.
- Mọi API trả đúng envelope `{ success, statusCode, message, data, meta? }` và error code theo bảng mục 5.0 (VALIDATION_ERROR/PICKUP_TIME_TOO_SOON/ROUTE_NOT_FOUND/BOOKING_NOT_FOUND/RATE_LIMITED/INVALID_TRANSITION/INTERNAL_ERROR).
- Vòng đời đơn là **máy trạng thái có kiểm tra**: chuyển sai → 409 `INVALID_TRANSITION`; mọi chuyển ghi `statusHistory`.
- Hợp đồng API là tài sản chung: sửa contract = sửa spec trước, code sau (spec-first).

### 2.3 Security & Privacy <!-- G4 check -->

- Phone bắt buộc normalize (`+84…` → `0…`, bỏ `.` `-` ` `) rồi khớp `^(03|05|07|08|09)\d{8}$`.
- Chống dò mã vé: `GET /bookings/:code` bắt buộc `lookupToken` hoặc `phoneLast4`, trả 404 trùng nhất, rate limit 10 req/phút/IP.
- Rate limit: booking 5 req/phút/IP + 20 đơn/ngày/SĐT; estimate 30 req/phút/IP; GET khác 120 req/phút/IP. Honeypot `website` phải rỗng.
- `lookupToken = HMAC-SHA256(bookingCode, SECRET)` rút gọn 16 ký tự, chỉ trả một lần.
- Webhook revalidate so sánh secret bằng `timingSafeEqual`; không log secret.
- Sanitize HTML bài viết qua allowlist; link ngoài `rel="noopener nofollow"`; `img` bắt buộc `alt/width/height`.
- Không lưu IP thô (chỉ `sourceIpHash`); ẩn danh dữ liệu cá nhân sau 24 tháng.
- Mật khẩu/secret không bao giờ commit; `.env` chỉ chứa `.env.example`.

### 2.4 Testing — TDD là bắt buộc <!-- G4 check -->

- TDD: viết test → chạy fail → mới viết code.
- **Golden cases (Phụ lục A, A1–A20) là bộ test bắt buộc** của Pricing Engine; mọi thay đổi engine phải chạy đủ.
- Test contract API cho từng endpoint (envelope + error code + validation).
- Coverage: đường dẫn quan trọng (pricing, booking validation, redirect rules, SEO metadata) ≥ 90%.
- Test độc lập, lặp lại được, không side-effect; CI fail → không merge.

### 2.5 Performance <!-- G4 check -->

- Core Web Vitals (mobile): LCP ≤ 2.5s · CLS ≤ 0.1 · INP ≤ 200ms · PageSpeed ≥ 90.
- API: `POST /pricing/estimate` p95 ≤ 150ms; `POST /bookings` p95 ≤ 400ms (thông báo chạy nền, không chặn response).
- Mọi fetch dữ liệu CMS phải gắn cache tag + revalidate; lookup vé và trang thành công `no-store`.
- Không N+1 query; luôn có index theo mục 6.4.

### 2.6 User Experience <!-- G3 check -->

- Website tiếng Việt, mobile-first, responsive; giữ nguyên design hiện có của site tham chiếu (TestSEO) làm chuẩn thị giác.
- WCAG 2.1 AA: ARIA, điều hướng bàn phím, tương phản ≥ 4.5:1.
- Không dùng emoji làm icon (dùng Lucide SVG); mọi phần tử bấm được có `cursor-pointer`.
- Trạng thái: loading / lỗi 422 / 429 / quote_required phải hiển thị rõ, không in "null" hay "undefined".
- Không hiển thị dữ liệu nội bộ (driver, dispatcherNote, token) ra trang công khai.

## 3. Architecture Governance <!-- G1 check -->

- Kiến trúc đã được người dùng chốt (2026-10-09):
  - **Backend**: Payload CMS 3.x monolith (admin `/admin`, API public `/api/v1`) tại `cms/backend`.
  - **Frontend**: Next.js 15 App Router mới tại `cms/frontend`, gọi API `/api/v1`; `TestSEO/` chỉ là tham chiếu design + nguồn seed.
  - **Database**: PostgreSQL (Docker cho dev; connection string thay thế khi deploy).
- Mọi quyết định kiến trúc lớn phải ghi vào `plan.md` và tham chiếu checkpoint của constitution này.
- Ưu tiên công nghệ LTS, actively maintained, giấy phép MIT/Apache; không thêm dependency rủi ro cao mà chưa có lý do.
- Bảo mật theo OWASP Top 10; chạy linter + typecheck trước mọi lần commit.
- Các điểm nghiệp vụ `[CẦN CHỐT]` (D1–D12, mục 8 spec v1.1) dùng **mặc định của spec** trừ khi người dùng đổi — phải ghi vào `findings.md`.

## 4. Document Separation <!-- G1 check -->

- `spec.md`: **chỉ góc nhìn sản phẩm** (What & Why) — user stories, acceptance criteria, requirements, success criteria. **Không** framework, thư viện, cấu trúc code.
- `plan.md`: **góc nhìn kỹ thuật** (How) — stack, cấu trúc thư mục, API contract chi tiết, migration, phải tham chiếu checkpoint constitution.
- Vi phạm phân tách = blocker ở G1/G2.

## 5. Quality Assurance <!-- inline review -->

- Inline spec review (checklist tự soát) phải pass trước G1 (~30s/lần).
- Inline plan review phải pass trước G2.
- Bắt buộc lập bản đồ cấu trúc file trước khi phân rã task.
- `/speckit.analyze` chạy sau `tasks`, trước `implement` (Thorough).

## 6. Gate ↔ Constitution Mapping

| Gate | Checks these sections |
|------|-----------------------|
| G1 | §2.1, §2.2 (hợp đồng & SEO ở mức spec), §3 (Architecture), §4 (Doc separation) + inline spec review |
| G2 | `plan.md` reference checkpoint constitution? + inline plan review + mọi task có file path/acceptance/test |
| G3 | §2.6 (UX) + design system consistency |
| G4 | §2.1–§2.5 (SEO, contract, security, testing, performance) + test evidence trong `progress.md` |

## 7. Amendments

- Ghi lịch sử version + lý do mỗi thay đổi.
- Sau khi sửa, tự kiểm `spec.md`/`plan.md` còn tuân thủ không.
- Chỉ người dùng được phê duyệt amendment; AI đề xuất, không tự sửa.

## 8. Quick Self-Check

- [ ] `spec.md` thuần product, không chi tiết kỹ thuật?
- [ ] Inline spec review pass trước G1?
- [ ] `plan.md` tham chiếu checkpoint constitution (§2.1–§2.6, §3)?
- [ ] File structure mapping trước khi phân rã task?
- [ ] `/speckit.analyze` pass (Thorough)?
- [ ] Golden cases A1–A20 + contract tests chạy pass?
- [ ] Lint + typecheck + test xanh trước khi báo hoàn thành?
- [ ] Evidence ghi vào `progress.md` trước G4?
