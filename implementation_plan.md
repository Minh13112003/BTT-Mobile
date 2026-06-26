Thêm Loại Tour (TourType) và Cập nhật Giao diện
Tài liệu này mô tả kế hoạch cập nhật Backend và Frontend nhằm bổ sung thuộc tính TourType cho Tour, đồng thời cập nhật giao diện để hiển thị 5 loại tour mới trên ứng dụng di động.

Tóm tắt Yêu cầu

1. Backend
   Bổ sung thuộc tính tourType (String, nullable) vào bảng Tour trong Database (Prisma Schema).
   Chạy Prisma migration và generate để cập nhật Client DB.
   Cập nhật các DTO (CreateTourDTO, TourResponseDto) để hỗ trợ trường mới.
   Cập nhật ToursService (các hàm mapToDto, createBulkTours, updateTour) để lưu trữ và trả về tourType.
   Mở rộng API tìm kiếm getToursByType để hỗ trợ lọc theo tham số tourType.
2. Frontend
   Cập nhật các kiểu dữ liệu (TourItem, TourTypeQuery) để khai báo trường tourType.
   Tạo 5 hình ảnh icon cho các loại tour và lưu vào assets/images/:
   TOUR OF THE YEAR 2026
   TOUR CAO CẤP
   TOUR MICE
   TOUR HÈ
   DU LỊCH XANH
   Trang chủ (HomeScreen): Xóa icon "Du lịch" khỏi Quick Access Grid; thêm dải 5 icon loại tour nằm ngang ngay bên dưới ô chọn ngày, mỗi icon dẫn đến màn hình Tìm kiếm với bộ lọc tương ứng.
   Trang Tìm kiếm (SearchScreen): Bổ sung 5 loại tour vào thanh lọc; chuyển từ scroll ngang sang bố cục nhiều dòng (flex wrap) để người dùng không cần cuộn ngang.
   Chi tiết Các Thay đổi
3. Backend — D:\E-Commerce\Backend\e-commerce
   [MODIFY] schema.prisma
   Thêm trường tourType String? vào model Tour.
   Thêm index @@index([tourType]) để tối ưu hóa truy vấn lọc.

model Tour {
id String @id @default(uuid())
name String
// ... các trường hiện tại ...
tourType String? // Loại tour (nullable)

@@index([tourType])
// ... các index hiện tại ...
}
[MODIFY] create-tour.dto.ts
Thêm trường tourType vào CreateTourDTO:

@IsString()
@IsOptional()
tourType?: string;
[MODIFY] tour-response.dto.ts
Bổ sung tourType vào kiểu trả về TourResponseDto:

tourType?: string;
[MODIFY] query-tour-type.dto.ts
Thêm tham số tourType vào QueryTourTypeDto để hỗ trợ lọc qua endpoint /tours/by-type:

@ApiPropertyOptional({
description: 'Lọc theo loại tour (ví dụ: "TOUR HÈ", "TOUR CAO CẤP")',
example: 'TOUR HÈ',
})
@IsString()
@IsOptional()
tourType?: string;
[MODIFY] tours.service.ts
Cập nhật createBulkTours để lưu tourType khi tạo tour.
Cập nhật updateTour để cập nhật tourType khi chỉnh sửa.
Cập nhật getToursByType để lọc theo tourType nếu tham số được truyền vào.
Cập nhật mapToDto để trả về tourType trong phản hồi API.

// createBulkTours
tourType: dto.tourType ?? null,

// updateTour
tourType: dto.tourType !== undefined ? dto.tourType : existing.tourType,

// getToursByType
if (tourType) where.tourType = tourType;

// mapToDto
tourType: tour.tourType ?? null, 2. Frontend — D:\App Mobile\MyFirstApp
[NEW] Hình ảnh Icon Loại Tour
Tạo 5 file PNG tròn (128×128px) lưu vào assets/images/:

File Mô tả
tour_year_2026.png Chữ cách điệu "TOUR of the YEAR 2026" trong vòng tròn đỏ
tour_cao_cap.png Tượng Nữ Thần Tự Do và cờ Mỹ — biểu trưng dịch vụ cao cấp
tour_mice.png Chữ MICE phối màu cầu vồng trong vòng tròn đỏ
tour_he.png Kính râm, mũ rộng vành, ô che nắng và hoa sứ — không khí biển hè
tour_du_lich_xanh.png Quả địa cầu kết hợp lá cây và vali — du lịch sinh thái
[MODIFY] services/tour.ts
Bổ sung trường tourType vào TourItem và TourTypeQuery:

// TourItem
tourType?: string | null;

// TourTypeQuery
tourType?: string;
[MODIFY] constants/tourFilters.ts
Mở rộng SearchMode với 5 giá trị loại tour mới.
Bổ sung nhãn hiển thị vào MODE_CHIP_LABELS và thứ tự vào SECTION_ORDER.
Thêm hằng số MODE_TOUR_TYPE để ánh xạ SearchMode sang chuỗi lưu trong database.

export type SearchMode =
| "newest" | "hot" | "popular" | "domestic" | "foreign"
| "tour_of_the_year_2026" | "tour_cao_cap" | "tour_mice"
| "tour_he" | "tour_du_lich_xanh";

export const MODE_TOUR_TYPE: Partial<Record<SearchMode, string>> = {
tour_of_the_year_2026: "TOUR OF THE YEAR 2026",
tour_cao_cap: "TOUR CAO CẤP",
tour_mice: "TOUR MICE",
tour_he: "TOUR HÈ",
tour_du_lich_xanh: "DU LỊCH XANH",
};
[MODIFY] hooks/useTourSearch.ts
Cập nhật fetchPage để gọi API với tham số tourType khi người dùng chọn loại tour.
Cập nhật logic lọc phía client để lọc đúng kết quả khi kết hợp loại tour và bộ lọc ngày khởi hành.

// fetchPage — gọi API theo loại tour
} else if (MODE_TOUR_TYPE[mode]) {
res = await getToursByType({ tourType: MODE_TOUR_TYPE[mode], page: pageNum, limit: LIMIT });
}

// Client-side filtering — lọc kết hợp loại tour + ngày
if (MODE_TOUR_TYPE[mode]) {
filtered = filtered.filter((item) => item.tourType === MODE_TOUR_TYPE[mode]);
} else if (MODE_COUNTRY[mode]) {
filtered = filtered.filter((item) => item.tourCountry === MODE_COUNTRY[mode]);
if (region) filtered = filtered.filter((item) => item.tourRegion === region);
}
[MODIFY] app/(root)/(tabs)/index.tsx
Xóa icon "Du lịch" khỏi Quick Access Grid, giữ lại 3 mục: Tin tức, Mẹo hay, Ưu đãi.
Thêm dải 5 icon loại tour nằm ngang (ScrollView) ngay dưới Date Picker Widget.

const TOUR_TYPES_DATA = [
{ mode: "tour_of_the_year_2026", label: "TOUR OF THE YEAR 2026", image: require("@/assets/images/tour_year_2026.png") },
{ mode: "tour_cao_cap", label: "TOUR CAO CẤP", image: require("@/assets/images/tour_cao_cap.png") },
{ mode: "tour_mice", label: "TOUR MICE", image: require("@/assets/images/tour_mice.png") },
{ mode: "tour_he", label: "TOUR HÈ", image: require("@/assets/images/tour_he.png") },
{ mode: "tour_du_lich_xanh", label: "DU LỊCH XANH", image: require("@/assets/images/tour_du_lich_xanh.png") },
] as const;
[MODIFY] app/(root)/(tabs)/search.tsx
Thay ScrollView ngang của các chip lọc bằng View với flexWrap: "wrap" để chip tự xuống dòng, tối đa 5 chip mỗi hàng.
Cập nhật style của Chip để dùng margin linh động thay vì class Tailwind cố định mr-2.

<View style={{ flexDirection: "row", flexWrap: "wrap", rowGap: 8, columnGap: 4, marginTop: 12 }}>
{SECTION_ORDER.map((m) => (
<Chip key={m} label={MODE_CHIP_LABELS[m]} active={mode === m && !query.trim()} onPress={() => setMode(m)} isDark={isDark} />
))}
</View>
Kế hoạch Kiểm thử & Xác thực
Kiểm thử Database: Chạy Prisma migration để thêm cột tourType. Gán thủ công giá trị loại tour cho một số bản ghi mẫu trong DB để phục vụ kiểm thử.

Kiểm thử API: Gửi request GET /tours/by-type?tourType=TOUR HÈ và xác nhận API trả về đúng danh sách tour được gán nhãn "TOUR HÈ".

Kiểm thử Giao diện:

Mở trang chủ trên thiết bị/máy ảo, xác nhận 5 icon loại tour hiển thị chuẩn bên dưới ô chọn ngày và có thể cuộn ngang nếu cần.
Nhấn vào icon "TOUR CAO CẤP", xác nhận màn hình Tìm kiếm mở ra và tự động lọc đúng loại tour.
Kiểm tra trang Tìm kiếm: các chip lọc xuống dòng tự nhiên, hàng đầu 5 chip cũ, hàng tiếp theo 5 chip loại tour mới.
3 thay đổi quan trọng nhất:

Chuẩn hóa cấu trúc "Tóm tắt Yêu cầu" — phần này được tách thành 2 subsection rõ ràng (Backend / Frontend) thay vì liệt kê lẫn lộn, giúp người đọc nắm bức tranh tổng thể trước khi đọc chi tiết.
Thay thế bảng mô tả icon bằng Markdown table — thay vì liệt kê 5 dòng bullet rời rạc, nội dung được trình bày trong bảng 2 cột (File | Mô tả) gọn và dễ đối chiếu hơn.
Loại bỏ ngôn ngữ thừa, rườm rà — các cụm từ như "Chúng ta sẽ tạo", "Mở rộng kiểu dữ liệu", "Đưa các loại tour mới vào" được viết lại thành hành động trực tiếp, ngắn gọn, phù hợp văn phong tài liệu kỹ thuật.
