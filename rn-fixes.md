# React Native Bug Fixes & UI Updates

## Context
- Backend đã xóa `price` khỏi model `Tour` → giá nằm trong `departures[0].price`
- Data `getTours` trả về array có `departures: Departure[]` trong mỗi tour
- Ảnh từ Cloudinary dùng `{ uri: imageUrl }` — KHÔNG cần để vào assets

---

## 1. Fix lỗi `NaN` giá tiền và `Cannot read property 'toString' of undefined`

### Nguyên nhân
```typescript
// ❌ SAI — Tour không còn field price
tour.price.toString()        // → undefined.toString() → CRASH
Number(tour.price)           // → NaN

// ✅ ĐÚNG — Lấy giá từ departure gần nhất
const nearestDeparture = tour.departures
  ?.filter(d => new Date(d.departureDate) >= new Date())
  .sort((a, b) => new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime())[0];

const displayPrice = nearestDeparture?.price ?? null;
```

### Helper function — thêm vào `utils/tour.ts`
```typescript
// utils/tour.ts

export interface Departure {
  id: string;
  tourCode: string;
  tourId: string;
  departureDate: string;
  availableSeats: number;
  price: number | string;
  createdAt: string;
  updatedAt: string;
}

export interface Tour {
  id: string;
  name: string;
  imageUrl: string;
  duration: string;
  rating: number;
  reviewsCount: number;
  departureFrom: string;
  transport: string;
  included: string[];
  notIncluded: string[];
  notes?: string;
  hasVat: boolean;
  departures: Departure[];
  schedules: any[];
}

// Lấy departure gần nhất (>= hôm nay)
export function getNearestDeparture(departures: Departure[]): Departure | null {
  if (!departures?.length) return null;
  const today = new Date();
  const upcoming = departures
    .filter(d => new Date(d.departureDate) >= today)
    .sort((a, b) => new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime());
  return upcoming[0] ?? null;
}

// Format giá tiền an toàn — không bao giờ crash
export function formatPrice(price: number | string | null | undefined): string {
  if (price === null || price === undefined) return 'Liên hệ';
  const num = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(num)) return 'Liên hệ';
  return num.toLocaleString('vi-VN') + 'đ';
}

// Format ngày khởi hành an toàn
export function formatDepartureDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'Liên hệ';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return 'Liên hệ';
  }
}
```

---

## 2. Fix `(tabs)/index.tsx` — Tour Card hiển thị đúng giá & ngày

### Sửa TourCard component
```typescript
// components/TourCard.tsx (hoặc trong index.tsx)
import { getNearestDeparture, formatPrice, formatDepartureDate } from '@/utils/tour';

function TourCard({ tour }: { tour: Tour }) {
  // ✅ Lấy departure gần nhất an toàn
  const nearest = getNearestDeparture(tour.departures ?? []);

  return (
    <TouchableOpacity onPress={() => router.push(`/tour/${tour.id}`)}>
      <ImageBackground
        source={{ uri: tour.imageUrl }}  // ← Cloudinary URL, không cần assets
        style={styles.cardBackground}
        imageStyle={{ borderRadius: 12, opacity: 0.15 }}
      >
        <Image source={{ uri: tour.imageUrl }} style={styles.tourImage} />

        <Text style={styles.tourName}>{tour.name}</Text>

        {/* ✅ Ngày khởi hành gần nhất */}
        <Text style={styles.info}>
          📅 {nearest ? formatDepartureDate(nearest.departureDate) : 'Liên hệ để biết lịch'}
        </Text>

        {/* ✅ Giá từ departure, không crash */}
        <Text style={styles.price}>
          💰 Từ {nearest ? formatPrice(nearest.price) : 'Liên hệ'}
        </Text>

        <Text style={styles.info}>✈️ {tour.transport} • {tour.duration}</Text>
      </ImageBackground>
    </TouchableOpacity>
  );
}
```

---

## 3. Fix `(tabs)/index.tsx` — Membership Banner (Danh Thiếp)

### Thêm component `MembershipCard` — click vào ra trang mới
```typescript
// Trong index.tsx — thêm banner danh thiếp

import { router } from 'expo-router';

function MembershipBanner({ user }: { user: any }) {
  const tier = getTier(user?.earnedPoints ?? 0);

  return (
    <TouchableOpacity
      onPress={() => router.push({
        pathname: '/membership',
        params: { earnedPoints: user?.earnedPoints ?? 0 }
      })}
      activeOpacity={0.85}
    >
      <LinearGradient
        colors={tier.bg}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.memberCard}
      >
        {/* Hàng trên */}
        <View style={styles.memberTop}>
          <View>
            <Text style={[styles.memberGreet, { color: tier.text }]}>
              Xin chào, {user?.firstName} {user?.lastName} 👋
            </Text>
            <Text style={[styles.memberTier, { color: tier.text }]}>
              {tier.icon} Hạng {tier.name}
            </Text>
          </View>
          <Text style={[styles.memberPoints, { color: tier.text }]}>
            {(user?.rewardPoints ?? 0).toLocaleString('vi-VN')} pts
          </Text>
        </View>

        {/* Progress bar */}
        {getNextMilestone(user?.earnedPoints ?? 0) && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBg}>
              <View style={[
                styles.progressFill,
                {
                  width: `${getProgressPercent(user?.earnedPoints ?? 0)}%`,
                  backgroundColor: tier.text === '#fff' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.4)'
                }
              ]} />
            </View>
            <Text style={[styles.progressText, { color: tier.text }]}>
              {formatPrice(user?.earnedPoints ?? 0)} / {formatPrice(getNextMilestone(user?.earnedPoints ?? 0)!)} → {getNextTierName(user?.earnedPoints ?? 0)}
            </Text>
          </View>
        )}

        {/* Tap hint */}
        <Text style={[styles.tapHint, { color: tier.text }]}>
          Nhấn để xem quyền lợi thành viên →
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

// Tier definitions
const TIERS = [
  { name: 'Ruby',      min: 500_000_000, bg: ['#FF0000','#8B0000'] as [string,string], text: '#fff',    icon: '💎' },
  { name: 'Kim Cương', min: 200_000_000, bg: ['#B9F2FF','#7EC8E3'] as [string,string], text: '#1a1a2e', icon: '🔷' },
  { name: 'Bạch Kim',  min: 100_000_000, bg: ['#E5E4E2','#C8C6C4'] as [string,string], text: '#333',    icon: '⬜' },
  { name: 'Vàng',      min: 50_000_000,  bg: ['#FFD700','#FFA500'] as [string,string], text: '#333',    icon: '🥇' },
  { name: 'Bạc',       min: 10_000_000,  bg: ['#C0C0C0','#A8A8A8'] as [string,string], text: '#333',    icon: '🥈' },
  { name: 'Đồng',      min: 0,           bg: ['#CD7F32','#A0522D'] as [string,string], text: '#fff',    icon: '🥉' },
];
const MILESTONES = [0, 10_000_000, 50_000_000, 100_000_000, 200_000_000, 500_000_000];

function getTier(points: number) {
  return TIERS.find(t => points >= t.min) ?? TIERS[TIERS.length - 1];
}
function getNextMilestone(points: number): number | null {
  return MILESTONES.find(m => m > points) ?? null;
}
function getNextTierName(points: number): string {
  const next = MILESTONES.find(m => m > points);
  if (!next) return 'Hạng cao nhất';
  return TIERS.find(t => t.min === next)?.name ?? '';
}
function getProgressPercent(points: number): number {
  const milestones = MILESTONES;
  const currentIdx = [...milestones].reverse().findIndex(m => points >= m);
  const currentMin = milestones[milestones.length - 1 - currentIdx] ?? 0;
  const nextMin = getNextMilestone(points);
  if (!nextMin) return 100;
  return Math.min(100, ((points - currentMin) / (nextMin - currentMin)) * 100);
}
```

---

## 4. Tạo trang mới `app/membership.tsx` — Danh Thiếp + Quyền Lợi

```typescript
// app/membership.tsx
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';

const TIER_BENEFITS = {
  'Đồng': {
    color: ['#CD7F32', '#A0522D'] as [string, string],
    textColor: '#fff',
    icon: '🥉',
    minPoints: 0,
    benefits: [
      '✅ Tích lũy điểm thưởng từ mỗi chuyến đi',
      '✅ Nhận thông báo ưu đãi sớm nhất',
      '✅ Hỗ trợ đặt tour 24/7 qua app',
      '✅ Xem lịch sử chuyến đi đầy đủ',
      '✅ Nhận quà tặng sinh nhật (voucher 100k)',
    ],
  },
  'Bạc': {
    color: ['#C0C0C0', '#A8A8A8'] as [string, string],
    textColor: '#333',
    icon: '🥈',
    minPoints: 10_000_000,
    benefits: [
      '✅ Tất cả quyền lợi hạng Đồng',
      '✅ Ưu tiên xử lý đặt tour trong 2 giờ',
      '✅ Giảm 3% trên tổng giá tour',
      '✅ Miễn phí đổi ngày khởi hành 1 lần/tour',
      '✅ Quà tặng sinh nhật nâng cao (voucher 300k)',
      '✅ Hỗ trợ HDV riêng khi đoàn ≥ 5 người',
    ],
  },
  'Vàng': {
    color: ['#FFD700', '#FFA500'] as [string, string],
    textColor: '#333',
    icon: '🥇',
    minPoints: 50_000_000,
    benefits: [
      '✅ Tất cả quyền lợi hạng Bạc',
      '✅ Giảm 5% trên tổng giá tour',
      '✅ Ưu tiên check-in sớm tại khách sạn',
      '✅ Miễn phụ thu phòng đơn 1 lần/năm',
      '✅ Tặng hành lý xách tay thêm 5kg (tour quốc tế)',
      '✅ Chuyên viên tư vấn riêng qua Zalo/Hotline',
      '✅ Quà tặng sinh nhật Premium (voucher 500k)',
    ],
  },
  'Bạch Kim': {
    color: ['#E5E4E2', '#C8C6C4'] as [string, string],
    textColor: '#333',
    icon: '⬜',
    minPoints: 100_000_000,
    benefits: [
      '✅ Tất cả quyền lợi hạng Vàng',
      '✅ Giảm 8% trên tổng giá tour',
      '✅ Ưu tiên đặt phòng khách sạn hạng cao hơn (upgrade)',
      '✅ Miễn phí hủy tour trước 7 ngày (1 lần/năm)',
      '✅ Tặng bảo hiểm du lịch cao cấp tự động',
      '✅ Tặng gói Welcome Amenity tại khách sạn',
      '✅ Mời tham dự sự kiện du lịch VIP hàng năm',
      '✅ Quà tặng sinh nhật VIP (voucher 1 triệu)',
    ],
  },
  'Kim Cương': {
    color: ['#B9F2FF', '#7EC8E3'] as [string, string],
    textColor: '#1a1a2e',
    icon: '🔷',
    minPoints: 200_000_000,
    benefits: [
      '✅ Tất cả quyền lợi hạng Bạch Kim',
      '✅ Giảm 12% trên tổng giá tour',
      '✅ Đặt tour ưu tiên số 1 — không bao giờ hết chỗ',
      '✅ Trợ lý du lịch cá nhân riêng 24/7',
      '✅ Tặng tour nội địa 2N1Đ miễn phí (1 lần/năm)',
      '✅ Phòng khách sạn tự động upgrade lên Suite',
      '✅ Được mời trải nghiệm tour mới trước khi ra mắt',
      '✅ Quà tặng sinh nhật đặc biệt (voucher 2 triệu)',
    ],
  },
  'Ruby': {
    color: ['#FF0000', '#8B0000'] as [string, string],
    textColor: '#fff',
    icon: '💎',
    minPoints: 500_000_000,
    benefits: [
      '✅ Tất cả quyền lợi hạng Kim Cương',
      '✅ Giảm 15% trên tổng giá tour — mức tối đa',
      '✅ Concierge du lịch cá nhân — phục vụ 24/7',
      '✅ Tặng 1 tour quốc tế ngắn ngày miễn phí (1 lần/năm)',
      '✅ Ghế hạng Thương gia (Business Class) ưu tiên',
      '✅ Check-in/out khách sạn theo giờ tùy chọn',
      '✅ Tham gia Hội đồng cố vấn khách hàng BenThanh Tourist',
      '✅ Quà tặng sinh nhật Ruby (voucher 5 triệu + quà cao cấp)',
      '✅ Thư cảm ơn và đặc quyền Ruby suốt đời',
    ],
  },
};

export default function MembershipScreen() {
  const { earnedPoints } = useLocalSearchParams<{ earnedPoints: string }>();
  const points = parseInt(earnedPoints ?? '0');
  const currentTier = getTier(points); // dùng lại hàm getTier từ utils

  return (
    <ScrollView style={styles.container}>
      {/* Header danh thiếp */}
      <LinearGradient
        colors={TIER_BENEFITS[currentTier.name as keyof typeof TIER_BENEFITS].color}
        style={styles.card}
      >
        <Text style={[styles.cardIcon, { color: TIER_BENEFITS[currentTier.name as keyof typeof TIER_BENEFITS].textColor }]}>
          {currentTier.icon}
        </Text>
        <Text style={[styles.cardTier, { color: TIER_BENEFITS[currentTier.name as keyof typeof TIER_BENEFITS].textColor }]}>
          HẠNG {currentTier.name.toUpperCase()}
        </Text>
        <Text style={[styles.cardPoints, { color: TIER_BENEFITS[currentTier.name as keyof typeof TIER_BENEFITS].textColor }]}>
          Điểm tích lũy: {points.toLocaleString('vi-VN')} pts
        </Text>
        <Text style={[styles.cardBrand, { color: TIER_BENEFITS[currentTier.name as keyof typeof TIER_BENEFITS].textColor }]}>
          BenThanh Tourist
        </Text>
      </LinearGradient>

      {/* Danh sách tất cả các hạng */}
      {Object.entries(TIER_BENEFITS)
        .reverse() // Hiện từ thấp → cao hoặc đảo lại tùy bạn
        .map(([tierName, tierData]) => (
          <View
            key={tierName}
            style={[
              styles.tierSection,
              tierName === currentTier.name && styles.currentTierSection
            ]}
          >
            <LinearGradient
              colors={tierData.color}
              style={styles.tierHeader}
            >
              <Text style={[styles.tierTitle, { color: tierData.textColor }]}>
                {tierData.icon} Hạng {tierName}
              </Text>
              <Text style={[styles.tierMin, { color: tierData.textColor }]}>
                Từ {tierData.minPoints.toLocaleString('vi-VN')} pts
              </Text>
              {tierName === currentTier.name && (
                <Text style={[styles.currentBadge, { color: tierData.textColor }]}>
                  ← Hạng của bạn
                </Text>
              )}
            </LinearGradient>

            <View style={styles.benefitsList}>
              {tierData.benefits.map((benefit, idx) => (
                <Text key={idx} style={styles.benefitItem}>
                  {benefit}
                </Text>
              ))}
            </View>
          </View>
        ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },

  // Danh thiếp
  card: {
    margin: 16,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    minHeight: 160,
    justifyContent: 'center',
  },
  cardIcon: { fontSize: 40, marginBottom: 8 },
  cardTier: { fontSize: 22, fontWeight: 'bold', letterSpacing: 2 },
  cardPoints: { fontSize: 16, marginTop: 8 },
  cardBrand: { fontSize: 14, marginTop: 12, opacity: 0.8, fontStyle: 'italic' },

  // Tier sections
  tierSection: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 2,
  },
  currentTierSection: {
    borderWidth: 2,
    borderColor: '#FFD700',
    elevation: 6,
  },
  tierHeader: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 4,
  },
  tierTitle: { fontSize: 18, fontWeight: 'bold' },
  tierMin: { fontSize: 14, opacity: 0.9 },
  currentBadge: { fontSize: 13, fontWeight: 'bold', fontStyle: 'italic' },

  benefitsList: { padding: 16, gap: 8 },
  benefitItem: { fontSize: 16, color: '#333', lineHeight: 24 },

  // Banner styles (dùng trong index.tsx)
  memberCard: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 16,
    padding: 16,
    elevation: 4,
  },
  memberTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  memberGreet: { fontSize: 16, fontWeight: '600' },
  memberTier: { fontSize: 18, fontWeight: 'bold', marginTop: 4 },
  memberPoints: { fontSize: 20, fontWeight: 'bold' },
  progressContainer: { marginTop: 12 },
  progressBg: { height: 8, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 4 },
  progressFill: { height: 8, borderRadius: 4 },
  progressText: { fontSize: 13, marginTop: 4, opacity: 0.9 },
  tapHint: { fontSize: 13, marginTop: 8, textAlign: 'right', opacity: 0.8 },
});
```

---

## 5. Fix `history.tsx` — Hiển thị đúng giá & voucher

### Vấn đề trong ảnh 3
Booking hiển thị đúng. Chỉ cần đảm bảo dùng `booking.finalPrice` hoặc `booking.price` thay vì `booking.tour.price`:

```typescript
// history.tsx — trong BookingCard component
const displayPrice = booking.finalPrice ?? booking.price ?? booking.originalPrice;
const originalPrice = booking.originalPrice ?? booking.price;
const hasDiscount = booking.voucherId && originalPrice > displayPrice;

// Hiển thị
<Text style={styles.price}>
  {Number(displayPrice).toLocaleString('vi-VN')}đ
</Text>

{hasDiscount && (
  <Text style={styles.originalPrice}>
    {Number(originalPrice).toLocaleString('vi-VN')}đ
  </Text>
)}

{booking.voucher && (
  <Text style={styles.voucher}>
    Voucher: {booking.voucher.code}
    {booking.voucher.value ? ` (Giảm ${booking.voucher.value}%)` : ''}
  </Text>
)}
```

---

## 6. Về ảnh trong React Native — Tóm tắt

```typescript
// ✅ Ảnh từ Cloudinary (remote) — KHÔNG cần assets
<Image source={{ uri: 'https://res.cloudinary.com/...' }} />

// ✅ Ảnh local — để trong assets/, dùng require
<Image source={require('../../assets/images/logo.png')} />

// ❌ SAI — remote URL không thể dùng require
<Image source={require('https://...')} /> // CRASH

// ✅ Ảnh có thể null/undefined — dùng fallback
<Image
  source={tour.imageUrl ? { uri: tour.imageUrl } : require('../../assets/images/placeholder.png')}
/>
```

**Cloudinary URL của bạn dùng `{ uri: imageUrl }` là đúng hoàn toàn** — không cần copy vào assets.

---

## 7. Checklist sửa lỗi

- [ ] Tạo `utils/tour.ts` với `getNearestDeparture`, `formatPrice`, `formatDepartureDate`
- [ ] Sửa TourCard trong `index.tsx` — lấy giá từ `departures[0]`
- [ ] Thêm `MembershipBanner` vào `index.tsx` — có thể click
- [ ] Tạo `app/membership.tsx` — trang danh thiếp + quyền lợi
- [ ] Đăng ký route `/membership` trong navigation
- [ ] Sửa `history.tsx` — dùng `booking.finalPrice` thay vì `tour.price`
- [ ] Cài `expo-linear-gradient` nếu chưa có: `npx expo install expo-linear-gradient`
