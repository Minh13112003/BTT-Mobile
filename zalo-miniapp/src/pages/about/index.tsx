import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Page } from "zmp-ui";

import Icon from "@/components/Icon";
import { COMPANY, OFFICES_OVERSEAS, OFFICES_VN, Office } from "@/constants/companyInfo";
import { useTheme } from "@/context/ThemeContext";
import { getPalette } from "@/constants/theme";
import { FONT_SIZE } from "@/constants/typography";
import { callPhone, openLink, openMail } from "@/utils/links";
import logoWatermark from "@/static/Logo_BTT-2018-02.png";

const openMap = (address: string) =>
  openLink(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`);

/** Port từ app/(root)/(profile)/about.tsx — giới thiệu công ty, thông tin doanh nghiệp, liên hệ, văn phòng, đại lý nước ngoài, hiệp hội. */
export default function AboutPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const palette = getPalette(isDark);
  const [pickOffice, setPickOffice] = useState<Office | null>(null);

  const textMain = isDark ? "#F1F5F9" : "#1A1A2E";
  const textBody = isDark ? "#CBD5E1" : "#475569";
  const textMuted = isDark ? "#94A3B8" : "#64748B";
  const groupBg = isDark ? "#1A1F2B" : "#FFFFFF";
  const groupBorder = isDark ? "#272D3C" : "#F1F5F9";
  const divider = isDark ? "rgba(51,65,85,0.6)" : "#F1F5F9";
  const iconBg = isDark ? "#334155" : "#FDECEE";
  const iconColor = isDark ? "#FCA5A5" : "#C00119";

  const group: React.CSSProperties = { borderRadius: 20, overflow: "hidden", background: groupBg, border: `1px solid ${groupBorder}` };

  const SectionLabel = ({ children }: { children: string }) => (
    <div className="font-bold uppercase" style={{ marginBottom: 8, paddingLeft: 4, letterSpacing: 1, fontSize: FONT_SIZE.xxs, color: textMuted }}>
      {children}
    </div>
  );

  const InfoRow = ({ label, value, last }: { label: string; value: string; last?: boolean }) => (
    <div style={{ padding: "12px 16px", borderBottom: last ? "none" : `1px solid ${divider}` }}>
      <div style={{ fontSize: FONT_SIZE.xxs, color: textMuted }}>{label}</div>
      <div className="font-semibold" style={{ marginTop: 2, fontSize: FONT_SIZE.xxs, color: textMain }}>
        {value}
      </div>
    </div>
  );

  const LinkRow = ({ icon, label, value, onClick, last }: { icon: string; label: string; value: string; onClick: () => void; last?: boolean }) => (
    <button
      onClick={onClick}
      className="flex items-center w-full text-left"
      style={{ padding: "0 16px", minHeight: 58, borderBottom: last ? "none" : `1px solid ${divider}` }}
    >
      <div className="flex items-center justify-center flex-shrink-0" style={{ width: 36, height: 36, borderRadius: 12, marginRight: 14, background: iconBg }}>
        <Icon name={icon} size={18} color={iconColor} />
      </div>
      <div className="flex-1 min-w-0" style={{ padding: "8px 0" }}>
        <div style={{ fontSize: FONT_SIZE.xxs, color: textMuted }}>{label}</div>
        <div className="font-bold" style={{ fontSize: FONT_SIZE.xxs, color: textMain }}>
          {value}
        </div>
      </div>
      <Icon name="chevron-forward" size={18} color={isDark ? "#6B7280" : "#A3A8B5"} />
    </button>
  );

  const OfficeRow = ({ office, last }: { office: Office; last?: boolean }) => (
    <div className="flex items-center" style={{ padding: "12px 16px", borderBottom: last ? "none" : `1px solid ${divider}` }}>
      <div className="flex-1 min-w-0" style={{ paddingRight: 8 }}>
        <div className="font-bold" style={{ fontSize: FONT_SIZE.xxs, color: textMain }}>
          {office.name}
        </div>
        <div style={{ marginTop: 2, lineHeight: "22px", fontSize: FONT_SIZE.xxs, color: textBody }}>{office.address}</div>
        {office.phones.map((p) => (
          <div key={p.label + p.number} className="font-semibold" style={{ marginTop: 2, fontSize: FONT_SIZE.xxs, color: "#B30118" }}>
            <span className="font-medium" style={{ color: textMuted }}>
              {p.label}{" "}
            </span>
            {p.number}
          </div>
        ))}
      </div>
      {office.phones.length > 0 && (
        <button
          aria-label={`Gọi ${office.name}`}
          onClick={() => (office.phones.length === 1 ? callPhone(office.phones[0].number) : setPickOffice(office))}
          className="flex items-center justify-center flex-shrink-0"
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            marginRight: 8,
            background: isDark ? "#1E293B" : "#FFFFFF",
            border: `1.5px solid ${isDark ? "#475569" : "#F3C4CA"}`,
          }}
        >
          <Icon name="call-outline" size={18} color={isDark ? "#FCA5A5" : "#B30118"} />
        </button>
      )}
      <button
        aria-label={`Chỉ đường đến ${office.name}`}
        onClick={() => openMap(office.address)}
        className="flex items-center justify-center flex-shrink-0"
        style={{ width: 44, height: 44, borderRadius: 22, background: "#D0021B", border: "1px solid rgba(255,255,255,0.4)" }}
      >
        <Icon name="location-outline" size={18} color="#FFFFFF" />
      </button>
    </div>
  );

  return (
    <Page style={{ background: palette.screenBg, minHeight: "100vh", paddingBottom: 40 }}>
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          padding: "calc(env(safe-area-inset-top) + 8px) 16px 28px",
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
          background: isDark
            ? "linear-gradient(165deg, #2A2E38, #1E222B 50%, #14161C)"
            : "linear-gradient(165deg, #B30014 0%, #8A0010 50%, #5C000B 100%)",
        }}
      >
        <div className="flex items-center" style={{ marginBottom: 16 }}>
          <button
            onClick={() => navigate(-1)}
            aria-label="Quay lại"
            className="flex items-center justify-center"
            style={{ width: 44, height: 44, borderRadius: 22, border: "1px solid rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.15)" }}
          >
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
          <div className="text-white font-bold" style={{ marginLeft: 12, fontSize: FONT_SIZE.md }}>
            Về BenThanh Tourist
          </div>
        </div>
        <div className="flex justify-center">
          <img src={logoWatermark} alt="BenThanh Tourist" style={{ width: 250, height: 125, objectFit: "contain" }} />
        </div>
        <div className="flex" style={{ marginTop: 12, borderRadius: 16, padding: "12px 0", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.15)" }}>
          {COMPANY.stats.map((s, i) => (
            <div
              key={s.label}
              className="flex-1 flex flex-col items-center"
              style={{ borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.2)" : "none" }}
            >
              <span className="text-white font-black" style={{ fontSize: FONT_SIZE.lg }}>
                {s.value}
              </span>
              <span style={{ color: "rgba(255,255,255,0.8)", fontSize: FONT_SIZE.xxs }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "24px 16px 0", display: "flex", flexDirection: "column", gap: 24 }}>
        <div>
          <SectionLabel>Giới thiệu</SectionLabel>
          <div style={{ ...group, padding: 16 }}>
            {COMPANY.intro.map((t, i) => (
              <div key={i} style={{ marginTop: i > 0 ? 12 : 0, lineHeight: "24px", fontSize: FONT_SIZE.xxs, color: textBody }}>
                {t}
              </div>
            ))}
            <div className="font-bold" style={{ margin: "16px 0 8px", fontSize: FONT_SIZE.xxs, color: textMain }}>
              Lĩnh vực hoạt động
            </div>
            <div className="flex flex-wrap" style={{ gap: 8 }}>
              {COMPANY.businessLines.map((b) => (
                <span
                  key={b}
                  className="font-semibold"
                  style={{
                    padding: "6px 12px",
                    borderRadius: 999,
                    fontSize: FONT_SIZE.xxs,
                    background: isDark ? "#334155" : "#FFF1F3",
                    border: `1px solid ${isDark ? "#475569" : "#F7CDD2"}`,
                    color: isDark ? "#FCA5A5" : "#9A0012",
                  }}
                >
                  {b}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div>
          <SectionLabel>Thông tin doanh nghiệp</SectionLabel>
          <div style={group}>
            <InfoRow label="Tên doanh nghiệp" value={COMPANY.name} />
            <InfoRow label="Tên thương hiệu" value={COMPANY.brand} />
            <InfoRow label="Tổng Giám đốc" value={COMPANY.ceo} />
            <InfoRow label="Mã số thuế" value={COMPANY.taxCode} />
            <InfoRow label="Giấy phép kinh doanh" value={COMPANY.license} />
            <InfoRow label="Giấy phép kinh doanh lữ hành quốc tế" value={COMPANY.travelLicense} />
            <InfoRow label="Trụ sở chính" value={COMPANY.hq} last />
          </div>
        </div>

        <div>
          <SectionLabel>Liên hệ</SectionLabel>
          <div style={group}>
            <LinkRow icon="call-outline" label="Tổng đài" value={COMPANY.hotline} onClick={() => callPhone(COMPANY.hotline)} />
            <LinkRow icon="call-outline" label="Điện thoại" value={COMPANY.tel} onClick={() => callPhone(COMPANY.tel)} />
            <LinkRow icon="mail-outline" label="Email" value={COMPANY.email} onClick={() => openMail(COMPANY.email)} />
            <LinkRow icon="globe-outline" label="Website" value={COMPANY.website} onClick={() => openLink(`https://${COMPANY.website}`)} last />
          </div>
        </div>

        <div>
          <SectionLabel>Đường dây theo dịch vụ</SectionLabel>
          <div style={group}>
            {COMPANY.serviceLines.map((l, i) => (
              <button
                key={l.label}
                onClick={() => callPhone(l.number)}
                className="flex items-center w-full text-left"
                style={{ padding: "0 16px", minHeight: 54, borderBottom: i === COMPANY.serviceLines.length - 1 ? "none" : `1px solid ${divider}` }}
              >
                <span className="flex-1 font-semibold" style={{ fontSize: FONT_SIZE.xxs, color: textMain }}>
                  {l.label}
                </span>
                <span className="font-bold" style={{ fontSize: FONT_SIZE.xxs, color: "#B30118" }}>
                  {l.number}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <SectionLabel>Văn phòng & chi nhánh</SectionLabel>
          <div style={group}>
            {OFFICES_VN.map((o, i) => (
              <OfficeRow key={o.name} office={o} last={i === OFFICES_VN.length - 1} />
            ))}
          </div>
        </div>

        <div>
          <SectionLabel>Đại lý du lịch ở nước ngoài</SectionLabel>
          <div style={group}>
            {OFFICES_OVERSEAS.map((o, i) => (
              <OfficeRow key={o.name} office={o} last={i === OFFICES_OVERSEAS.length - 1} />
            ))}
          </div>
        </div>

        <div>
          <SectionLabel>Thành viên các hiệp hội</SectionLabel>
          <div style={{ ...group, padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            {COMPANY.associations.map((a) => (
              <div key={a.code} className="flex items-center">
                <span
                  className="flex items-center justify-center font-extrabold flex-shrink-0"
                  style={{ minWidth: 52, height: 28, padding: "0 8px", borderRadius: 8, marginRight: 12, fontSize: FONT_SIZE.xxs, background: isDark ? "#334155" : "#F1F5F9", color: textBody }}
                >
                  {a.code}
                </span>
                <span className="flex-1" style={{ fontSize: FONT_SIZE.xxs, color: textMain }}>
                  {a.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <SectionLabel>Pháp lý</SectionLabel>
          <div style={group}>
            <LinkRow icon="document-text-outline" label="Văn bản" value="Điều khoản & chính sách" onClick={() => navigate("/terms")} last />
          </div>
        </div>

        <div className="flex flex-col items-center" style={{ paddingTop: 8 }}>
          <span className="font-semibold" style={{ fontSize: FONT_SIZE.xxs, color: textBody }}>
            Phiên bản 1.0.0
          </span>
          <span style={{ fontSize: FONT_SIZE.xxs, color: textMuted }}>© 2026 BenThanh Tourist Service Corporation</span>
        </div>
      </div>

      {/* Chọn số khi chi nhánh có nhiều số */}
      {pickOffice && (
        <div
          className="fixed inset-0 flex items-end"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 2000 }}
          onClick={() => setPickOffice(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              padding: "20px 20px calc(env(safe-area-inset-bottom) + 20px)",
              background: isDark ? "#1A1F2B" : "#FFFFFF",
            }}
          >
            <div className="font-black" style={{ marginBottom: 4, fontSize: FONT_SIZE.xs, color: textMain }}>
              Gọi {pickOffice.name}
            </div>
            <div style={{ marginBottom: 12, fontSize: FONT_SIZE.xxs, color: textMuted }}>Chọn số muốn gọi</div>
            {pickOffice.phones.map((p) => (
              <button
                key={p.label + p.number}
                onClick={() => {
                  callPhone(p.number);
                  setPickOffice(null);
                }}
                className="flex items-center w-full"
                style={{ height: 56, borderRadius: 16, padding: "0 16px", marginBottom: 8, background: isDark ? "#1E293B" : "#FFF1F2" }}
              >
                <Icon name="call-outline" size={18} color={iconColor} />
                <span className="flex-1 text-left" style={{ marginLeft: 12, fontSize: FONT_SIZE.xxs, color: textMuted }}>
                  {p.label}
                </span>
                <span className="font-bold" style={{ fontSize: FONT_SIZE.xs, color: "#B30118" }}>
                  {p.number}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </Page>
  );
}
