import type {
  Currency,
  Direction,
  FurnitureStatus,
  LegalStatus,
  PropertyCategory,
  PropertyType,
} from "@prisma/client";

export function formatPrice(price: string, currency: Currency): string {
  if (!price || price.trim() === "") return "Liên hệ";
  if (currency === "USD") {
    // If it looks like a plain number, format it with Intl
    const n = parseFloat(price.replace(/,/g, ""));
    if (Number.isFinite(n)) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(n);
    }
    return `${price} USD`;
  }
  // VND: return the stored string as-is (e.g. "1.5 tỉ", "Thoả thuận", "1x tỉ")
  return price;
}

export function formatPricePerM2(
  pricePerM2: number | null | undefined,
  currency: Currency,
): string | null {
  if (pricePerM2 == null) return null;
  if (currency === "USD") return `${pricePerM2.toLocaleString("en-US")} USD/m²`;
  if (pricePerM2 >= 1_000_000) {
    return `${(pricePerM2 / 1_000_000).toFixed(1).replace(".", ",")} triệu/m²`;
  }
  return `${pricePerM2.toLocaleString("vi-VN")} VND/m²`;
}

export function formatArea(area: number): string {
  return `${area.toLocaleString("vi-VN")} m²`;
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const diffMs = Date.now() - d.getTime();
  const sec = Math.floor(diffMs / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  const month = Math.floor(day / 30);
  if (sec < 60) return "vừa đăng";
  if (min < 60) return `${min} phút trước`;
  if (hr < 24) return `${hr} giờ trước`;
  if (day < 30) return `${day} ngày trước`;
  if (month < 12) return `${month} tháng trước`;
  return d.toLocaleDateString("vi-VN");
}

export const PROPERTY_TYPE_LABEL: Record<PropertyType, string> = {
  NHA_PHO: "Nhà đất",
  CAN_HO: "Căn hộ",
  BIET_THU: "Biệt thự",
  DAT_NEN: "Đất nền",
  MAT_BANG: "Mặt bằng",
  KHO_XUONG: "Kho xưởng",
  VAN_PHONG: "Văn phòng",
  DAT_CONG_NGHIEP: "Đất khu công nghiệp",
  SHOPHOUSE: "Shophouse",
  OTHER: "Khác",
};

export const PROPERTY_CATEGORY_LABEL: Record<PropertyCategory, string> = {
  MUA_BAN: "Mua bán",
  CHO_THUE: "Cho thuê",
};

export const DIRECTION_LABEL: Record<Direction, string> = {
  DONG: "Đông",
  TAY: "Tây",
  NAM: "Nam",
  BAC: "Bắc",
  DONG_NAM: "Đông Nam",
  DONG_BAC: "Đông Bắc",
  TAY_NAM: "Tây Nam",
  TAY_BAC: "Tây Bắc",
};

export const LEGAL_STATUS_LABEL: Record<LegalStatus, string> = {
  SO_DO: "Sổ đỏ",
  SO_HONG: "Sổ hồng",
  HOP_DONG: "Hợp đồng mua bán",
  DANG_CHO_SO: "Đang chờ sổ",
};

export const FURNITURE_LABEL: Record<FurnitureStatus, string> = {
  FULL_FURNITURE: "Nội thất đầy đủ",
  BASIC_FURNITURE: "Nội thất cơ bản",
  NO_FURNITURE: "Không nội thất",
};

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }
  if (digits.length === 11) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }
  return phone;
}
