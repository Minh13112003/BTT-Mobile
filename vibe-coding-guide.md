# Vibe Coding Guide — `(tabs)/index.tsx` & `search.tsx`

## Mục tiêu tổng quan

Cập nhật màn hình Home (`index.tsx`) với các section tour đa dạng, giao diện section header dạng **brush stroke đỏ**, và màn hình Search (`search.tsx`) với bộ lọc đầy đủ theo API `tour-type-query.md`.

---

## Phần 1 — `(tabs)/index.tsx`

### 1.1 Cấu trúc tổng thể

```
ScrollView (vertical, toàn màn hình)
├── Header / Banner (giữ nguyên nếu đã có)
├── Section: Tour Mới Nhất       ← Carousel tự động 5s
├── Section: Tour Đang Hot
├── Section: Tour Bán Chạy Nhất
├── Section: Tour Trong Nước
└── Section: Tour Quốc Tế
```

---

### 1.2 Component `SectionHeader`

> **Quan trọng:** Giao diện section header phải trông như một nhãn dán brush stroke đỏ loang, chữ in hoa trắng bold nằm giữa — giống ảnh tham khảo đính kèm.

**Cách làm:**
- Dùng `ImageBackground` với một ảnh brush stroke PNG (nền trong suốt, màu đỏ `#CC0000`), hoặc
- Dùng `View` với `borderRadius` không đều + `transform: skewX` để giả lập brush, hoặc
- Dùng SVG `Path` với hình dạng loang bút lông

**Props:**
```ts
interface SectionHeaderProps {
  title: string   // VD: "TOUR ĐANG HOT", "TOUR MỚI NHẤT"
}
```

**Style gợi ý:**
```ts
container: {
  alignSelf: 'flex-start',
  marginHorizontal: 16,
  marginBottom: 12,
  marginTop: 24,
}
brushBackground: {
  // paddingHorizontal: 20, paddingVertical: 10
  // backgroundColor: '#CC0000' nếu không có ảnh brush
  // borderRadius: 4 (hoặc dùng PNG brush)
}
title: {
  color: '#FFFFFF',
  fontWeight: '800',    // ExtraBold
  fontSize: 18,
  letterSpacing: 1,
  textTransform: 'uppercase',
}
```

---

### 1.3 Component `TourCard`

Card hiển thị 1 tour, dùng chung cho tất cả các section.

**Props:**
```ts
interface TourCardProps {
  tour: Tour
  onPress: (tour: Tour) => void
}
```

**Layout card (width ~220, dạng vertical card):**
```
┌──────────────────────┐
│   [Ảnh imageUrl]     │  ← height ~130, borderRadius top
│   [Badge: duration]  │  ← overlay bottom-left
├──────────────────────┤
│  Tên tour (2 dòng)   │
│  ⭐ rating  (reviews) │
│  ✈ transport         │
│  📍 departureFrom     │
│  💰 Từ X.XXX.000 đ   │  ← lấy giá thấp nhất từ departures[]
└──────────────────────┘
```

**Lấy giá thấp nhất:**
```ts
const minPrice = tour.departures?.length
  ? Math.min(...tour.departures.map(d => d.price))
  : null
```

**Format giá VNĐ:**
```ts
const formatPrice = (price: number) =>
  price.toLocaleString('vi-VN') + ' đ'
```

---

### 1.4 Section: TOUR MỚI NHẤT (Carousel tự động)

**API:** `GET /tours/newest?page=1&limit=10`

**Giao diện:** Carousel ngang, **tự động chạy mỗi 5 giây**.

**Cách implement:**
```ts
// Dùng FlatList ngang + useRef + setInterval
const flatListRef = useRef<FlatList>(null)
const [currentIndex, setCurrentIndex] = useState(0)

useEffect(() => {
  const timer = setInterval(() => {
    const nextIndex = (currentIndex + 1) % tours.length
    flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true })
    setCurrentIndex(nextIndex)
  }, 5000)
  return () => clearInterval(timer)
}, [currentIndex, tours.length])
```

**Dot indicator** bên dưới carousel:
```ts
// Row of dots, active dot màu đỏ #CC0000, inactive xám #CCCCCC
// width dot: active=16, inactive=8; height=8; borderRadius=4
```

**Card carousel** rộng hơn: width = screenWidth - 32, style featured hơn.

---

### 1.5 Section: TOUR ĐANG HOT

**API:** `GET /tours/hot?page=1&limit=6`

**Giao diện:** `FlatList` ngang, `showsHorizontalScrollIndicator={false}`, card width ~220.

---

### 1.6 Section: TOUR BÁN CHẠY NHẤT

**API:** `GET /tours/popular?page=1&limit=6`

**Giao diện:** Giống section Hot. Card có thể thêm badge "🔥 X đã đặt" dùng `bookingCount`.

---

### 1.7 Section: TOUR TRONG NƯỚC

**API:** `GET /tours/by-type?country=Trong nước&page=1&limit=6`

**Giao diện:** `FlatList` ngang, card width ~220.

---

### 1.8 Section: TOUR QUỐC TẾ

**API:** `GET /tours/by-type?country=Nước ngoài&page=1&limit=6`

**Giao diện:** Giống section Trong nước.

---

### 1.9 Nút "Xem tất cả"

Mỗi section có nút **"Xem tất cả →"** nằm bên phải tiêu đề (hoặc bên dưới list).

**Khi nhấn:** Navigate sang `search.tsx` và **truyền params** để pre-filter:

```ts
// Định nghĩa mapping
const SECTION_PARAMS: Record<SectionType, SearchParams> = {
  newest:     { mode: 'newest' },
  hot:        { mode: 'hot' },
  popular:    { mode: 'popular' },
  domestic:   { mode: 'by-type', country: 'Trong nước' },
  foreign:    { mode: 'by-type', country: 'Nước ngoài' },
}

// Navigate
router.push({
  pathname: '/search',
  params: SECTION_PARAMS[sectionType],
})
```

**Đặt header row (title + nút xem tất cả) thành 1 component `SectionRow`:**
```
Row
├── SectionHeader (brush stroke)          flex:1
└── TouchableOpacity "Xem tất cả →"       alignSelf:center, paddingRight:16
      color: #CC0000, fontSize: 13
```

---

### 1.10 State & Data Fetching

```ts
// Fetch song song tất cả sections khi mount
useEffect(() => {
  fetchNewest()
  fetchHot()
  fetchPopular()
  fetchDomestic()
  fetchForeign()
}, [])

// Mỗi section có state riêng
const [newest, setNewest] = useState<Tour[]>([])
const [hot, setHot] = useState<Tour[]>([])
const [popular, setPopular] = useState<Tour[]>([])
const [domestic, setDomestic] = useState<Tour[]>([])
const [foreign, setForeign] = useState<Tour[]>([])
const [loading, setLoading] = useState(true)
```

**Loading skeleton:** Khi đang fetch, hiển thị placeholder card màu xám nhạt (`#E0E0E0`) với `opacity` animation (shimmer effect).

---

## Phần 2 — `search.tsx`

### 2.1 Nhận params từ `index.tsx`

```ts
const params = useLocalSearchParams()
// params.mode: 'newest' | 'hot' | 'popular' | 'by-type'
// params.country: 'Trong nước' | 'Nước ngoài' (chỉ khi mode='by-type')
```

Khi có params → **pre-select bộ lọc** tương ứng và fetch ngay khi mount.

---

### 2.2 Layout tổng thể

```
SafeAreaView
├── SearchBar (sticky top)
├── FilterBar (sticky, cuộn ngang)
│   ├── Chip: Mới nhất
│   ├── Chip: Đang hot
│   ├── Chip: Bán chạy
│   ├── Chip: Trong nước  →  mở sub-filter region
│   └── Chip: Quốc tế     →  mở sub-filter region
├── SubFilterBar (hiện khi chọn Trong nước / Quốc tế)
│   └── Chips khu vực (Miền Bắc, Miền Trung, ...)
└── FlatList kết quả (2 cột grid hoặc vertical list)
    └── LoadMore khi scroll tới cuối
```

---

### 2.3 SearchBar

```ts
interface SearchBarState {
  query: string       // text người dùng gõ
  debounced: string   // sau 500ms debounce
}
```

**Debounce 500ms** trước khi trigger search:
```ts
useEffect(() => {
  const timer = setTimeout(() => setDebounced(query), 500)
  return () => clearTimeout(timer)
}, [query])
```

**Khi có `debounced` text:** Gọi API `GET /tours/by-type?city={debounced}` (city là contains, không cần khớp chính xác).

> Lưu ý: Khi đang gõ search text, **ưu tiên search by city** và bỏ qua các filter chip đang active (hoặc giữ country/region nếu muốn filter kết hợp — tùy UX).

---

### 2.4 Filter Chips

**Loại chip chính (mode):**

| Chip label     | mode value | API endpoint          |
|----------------|------------|-----------------------|
| Mới nhất       | `newest`   | `/tours/newest`       |
| Đang hot       | `hot`      | `/tours/hot`          |
| Bán chạy       | `popular`  | `/tours/popular`      |
| Trong nước     | `domestic` | `/tours/by-type?country=Trong nước` |
| Quốc tế        | `foreign`  | `/tours/by-type?country=Nước ngoài` |

**Style chip:**
```ts
chip: {
  paddingHorizontal: 16,
  paddingVertical: 8,
  borderRadius: 20,
  borderWidth: 1,
  borderColor: '#CCCCCC',
  marginRight: 8,
  backgroundColor: '#FFFFFF',
}
chipActive: {
  backgroundColor: '#CC0000',
  borderColor: '#CC0000',
}
chipText: { color: '#333333', fontSize: 13 }
chipTextActive: { color: '#FFFFFF' }
```

---

### 2.5 Sub-filter Region (hiện khi chọn Trong nước / Quốc tế)

**Trong nước** → hiện thêm chips: `Tất cả` | `Miền Bắc` | `Miền Trung` | `Miền Nam`

**Quốc tế** → hiện thêm chips: `Tất cả` | `Châu Á` | `Châu Âu` | `Châu Phi`

**API khi chọn region:**
```
/tours/by-type?country=Trong nước&region=Miền Bắc
```

**Animation:** SubFilterBar trượt xuống bằng `Animated.Value` height từ 0 → 48.

---

### 2.6 Logic build query URL

```ts
const buildUrl = (): string => {
  // Nếu đang search text → ưu tiên city search
  if (searchQuery.trim()) {
    return `/tours/by-type?city=${encodeURIComponent(searchQuery.trim())}&page=${page}&limit=10`
  }

  switch (mode) {
    case 'newest':  return `/tours/newest?page=${page}&limit=10`
    case 'hot':     return `/tours/hot?page=${page}&limit=10`
    case 'popular': return `/tours/popular?page=${page}&limit=10`
    case 'domestic':
      return region
        ? `/tours/by-type?country=Trong nước&region=${encodeURIComponent(region)}&page=${page}&limit=10`
        : `/tours/by-type?country=Trong nước&page=${page}&limit=10`
    case 'foreign':
      return region
        ? `/tours/by-type?country=Nước ngoài&region=${encodeURIComponent(region)}&page=${page}&limit=10`
        : `/tours/by-type?country=Nước ngoài&page=${page}&limit=10`
    default:
      return `/tours/newest?page=${page}&limit=10`
  }
}
```

---

### 2.7 Phân trang (Load More)

```ts
const [page, setPage] = useState(1)
const [hasNext, setHasNext] = useState(false)
const [results, setResults] = useState<Tour[]>([])

// Khi fetch trang đầu (reset): replace results
// Khi fetch trang tiếp: append results

const onEndReached = () => {
  if (hasNext && !loading) {
    setPage(prev => prev + 1)
  }
}
```

**Reset page về 1** mỗi khi mode / region / searchQuery thay đổi.

---

### 2.8 Hiển thị kết quả

**Grid 2 cột** (mặc định) hoặc **List 1 cột** (toggle button góc phải).

```ts
// Grid card: width = (screenWidth - 48) / 2
// List card: width = screenWidth - 32, layout ngang (ảnh trái, info phải)
```

**Empty state** khi không có kết quả:
```
🔍
Không tìm thấy tour
Thử thay đổi từ khoá hoặc bộ lọc
```

---

### 2.9 State tổng hợp của Search

```ts
const [mode, setMode] = useState<'newest'|'hot'|'popular'|'domestic'|'foreign'>('newest')
const [region, setRegion] = useState<string | null>(null)
const [searchQuery, setSearchQuery] = useState('')
const [debouncedQuery, setDebouncedQuery] = useState('')
const [page, setPage] = useState(1)
const [results, setResults] = useState<Tour[]>([])
const [meta, setMeta] = useState<PaginatedMeta | null>(null)
const [loading, setLoading] = useState(false)
const [viewMode, setViewMode] = useState<'grid'|'list'>('grid')
```

---

## Phần 3 — Type Definitions (dùng chung)

```ts
// types/tour.ts

export interface Tour {
  id: string
  name: string
  imageUrl: string
  imagePublicId: string
  duration: string
  rating: number
  reviewsCount: number
  hasVat: boolean
  departureFrom: string
  transport: string
  included: string[]
  notIncluded: string[]
  notes: string | null
  tourCountry: string | null
  tourRegion: string | null
  tourCity: string | null
  bookingCount?: number
  schedules?: Schedule[]
  departures?: Departure[]
}

export interface Schedule {
  id: string
  dayNumber: number
  title: string
  morning: string | null
  noon: string | null
  afternoon: string | null
  evening: string | null
  night: string | null
  meals: string[]
}

export interface Departure {
  tourCode: string
  tourId: string
  departureDate: string
  availableSeats: number
  price: number
}

export interface PaginatedMeta {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface PaginatedResponse<T> {
  items: T[]
  meta: PaginatedMeta
}
```

---

## Phần 4 — Constants

```ts
// constants/tourFilters.ts

export const DOMESTIC_REGIONS = ['Miền Bắc', 'Miền Trung', 'Miền Nam']
export const FOREIGN_REGIONS = ['Châu Á', 'Châu Âu', 'Châu Phi']

export const SECTION_LABELS = {
  newest:   'TOUR MỚI NHẤT',
  hot:      'TOUR ĐANG HOT',
  popular:  'TOUR BÁN CHẠY NHẤT',
  domestic: 'TOUR TRONG NƯỚC',
  foreign:  'TOUR QUỐC TẾ',
}
```

---

## Phần 5 — Màu sắc & Design Tokens

```ts
// constants/colors.ts (hoặc theme)

export const COLORS = {
  primary:     '#CC0000',   // đỏ brush stroke
  primaryDark: '#AA0000',
  white:       '#FFFFFF',
  textMain:    '#1A1A1A',
  textSub:     '#666666',
  textLight:   '#999999',
  border:      '#E0E0E0',
  background:  '#F5F5F5',
  cardBg:      '#FFFFFF',
  star:        '#FFB800',
  skeleton:    '#E8E8E8',
}
```

---

## Phần 6 — Checklist

- [ ] `SectionHeader` component với brush stroke đỏ (dùng PNG brush hoặc SVG)
- [ ] `TourCard` component dùng chung cho tất cả sections
- [ ] Carousel tự động 5s với dot indicator (section Mới nhất)
- [ ] 4 section horizontal FlatList (Hot, Popular, Domestic, Foreign)
- [ ] Nút "Xem tất cả" → navigate sang search với đúng params
- [ ] `search.tsx`: nhận và pre-select params từ home
- [ ] SearchBar với debounce 500ms → search by city
- [ ] Filter chips (5 loại) + sub-filter region (trượt xuống)
- [ ] Build URL logic đúng theo `tour-type-query.md`
- [ ] Load more / phân trang
- [ ] Toggle grid/list view
- [ ] Empty state
- [ ] Loading skeleton
- [ ] Type definitions đầy đủ
