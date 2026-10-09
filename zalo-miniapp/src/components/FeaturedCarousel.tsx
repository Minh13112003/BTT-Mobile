import React, { useEffect, useRef, useState } from "react";
import type { TourItem } from "@/services/tour";
import TourCard from "@/components/TourCard";
import { BRAND } from "@/constants/theme";

/**
 * Port từ components/tour/FeaturedCarousel.tsx bên app React Native — carousel
 * tự chạy mỗi 5s, dùng chung TourCard (giống hero card với "Tour sắp khởi
 * hành" bên dưới, theo đúng yêu cầu đồng bộ của user ở bản RN).
 */
export default function FeaturedCarousel({ tours }: { tours: TourItem[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (tours.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => {
        const next = (prev + 1) % tours.length;
        const el = scrollerRef.current;
        if (el) {
          const card = el.children[next] as HTMLElement | undefined;
          // scrollIntoView có thể kéo cả trang cuộn lên theo (ảnh hưởng ancestor
          // scroll, không chỉ riêng carousel) — dùng scrollTo trực tiếp trên
          // chính scroller để chỉ cuộn ngang, không đụng tới scroll dọc của trang.
          if (card) el.scrollTo({ left: card.offsetLeft - el.offsetLeft, behavior: "smooth" });
        }
        return next;
      });
    }, 5000);
    return () => clearInterval(timer);
  }, [tours.length]);

  if (!tours.length) return null;

  const handleScroll = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const cardWidth = (el.children[0] as HTMLElement)?.offsetWidth ?? 1;
    const gap = 12;
    setIndex(Math.round(el.scrollLeft / (cardWidth + gap)));
  };

  return (
    <div>
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto"
        style={{
          scrollSnapType: "x mandatory",
          paddingLeft: 16,
          paddingRight: 16,
          gap: 12,
          scrollbarWidth: "none",
        }}
      >
        {tours.map((tour) => (
          <div
            key={tour.id}
            style={{
              scrollSnapAlign: "start",
              flex: "0 0 calc(100vw - 32px)",
              maxWidth: 480,
              // TourCard tự có mb-5 (20px) cho layout list dọc — triệt tiêu ở
              // đây để không cộng dồn với khoảng cách tới dot indicator bên dưới.
              marginBottom: -20,
            }}
          >
            <TourCard tour={tour} />
          </div>
        ))}
      </div>

      <div className="flex justify-center items-center" style={{ marginTop: 12 }}>
        {tours.map((_, i) => (
          <div
            key={i}
            style={{
              height: 8,
              borderRadius: 4,
              marginLeft: 3,
              marginRight: 3,
              width: i === index ? 18 : 8,
              background: i === index ? BRAND.red : "#CBD5E1",
              transition: "width 0.2s",
            }}
          />
        ))}
      </div>
    </div>
  );
}
