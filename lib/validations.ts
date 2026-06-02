import { z } from "zod";

export const PropertyTypeEnum = z.enum([
  "NHA_PHO",
  "CAN_HO",
  "BIET_THU",
  "DAT_NEN",
  "MAT_BANG",
  "KHO_XUONG",
  "VAN_PHONG",
  "DAT_CONG_NGHIEP",
  "SHOPHOUSE",
  "OTHER",
]);

export const PropertyCategoryEnum = z.enum(["MUA_BAN", "CHO_THUE"]);
export const ListingStatusEnum = z.enum(["ACTIVE", "SOLD", "HIDDEN", "EXPIRED"]);
export const CurrencyEnum = z.enum(["VND", "USD"]);
export const DirectionEnum = z.enum([
  "DONG",
  "TAY",
  "NAM",
  "BAC",
  "DONG_NAM",
  "DONG_BAC",
  "TAY_NAM",
  "TAY_BAC",
]);
export const LegalStatusEnum = z.enum(["SO_DO", "SO_HONG", "HOP_DONG", "DANG_CHO_SO"]);
export const FurnitureEnum = z.enum([
  "FULL_FURNITURE",
  "BASIC_FURNITURE",
  "NO_FURNITURE",
]);

const nullableNumber = z
  .union([z.number(), z.string(), z.null(), z.undefined()])
  .transform((v) => {
    if (v === null || v === undefined || v === "") return null;
    const n = typeof v === "number" ? v : Number(v);
    return Number.isFinite(n) ? n : null;
  });

const requiredNumber = z
  .union([z.number(), z.string()])
  .transform((v) => (typeof v === "number" ? v : Number(v)))
  .refine((n) => Number.isFinite(n) && n >= 0, { message: "Số không hợp lệ" });

const nullableInt = nullableNumber.transform((n) =>
  n === null ? null : Math.round(n),
);

export const listingCreateSchema = z.object({
  title: z.string().min(5, "Tiêu đề tối thiểu 5 ký tự").max(200),
  description: z.string(),

  price: z.string().min(1, "Giá không được để trống").max(200),
  pricePerM2: nullableNumber,
  currency: CurrencyEnum.default("VND"),
  priceNegotiable: z.boolean().default(false),

  address: z.string().min(2),
  ward: z.string().nullish().transform((v) => v || null),
  district: z.string().min(1, "Quận/Huyện bắt buộc"),
  city: z.string().min(1, "Tỉnh/Thành phố bắt buộc"),
  mapLat: nullableNumber,
  mapLng: nullableNumber,
  mapsUrl: z.string().nullish().transform((v) => v || null),

  area: requiredNumber,
  areaUsable: nullableNumber,
  areaLand: nullableNumber,
  width: nullableNumber,
  length: nullableNumber,
  floors: nullableInt,
  bedrooms: nullableInt,
  bathrooms: nullableInt,
  direction: DirectionEnum.nullish().transform((v) => v || null),

  type: PropertyTypeEnum,
  category: PropertyCategoryEnum,
  status: ListingStatusEnum.default("ACTIVE"),

  legalStatus: LegalStatusEnum.nullish().transform((v) => v || null),
  furniture: FurnitureEnum.nullish().transform((v) => v || null),
  minLotSize: nullableNumber,

  images: z.array(z.string().url().or(z.string().startsWith("/"))).default([]),
  videoUrl: z.string().url().nullish().transform((v) => v || null),

  contactName: z.string().min(2, "Tên người liên hệ bắt buộc"),
  contactPhone: z.string().min(8, "Số điện thoại không hợp lệ"),
  contactPhone2: z.string().nullish().transform((v) => v || null),

  featured: z.boolean().default(false),
  verified: z.boolean().default(false),
  views: nullableInt.transform((n) => (n == null ? 0 : Math.max(0, n))).optional(),
  expiresAt: z
    .union([z.string(), z.date(), z.null(), z.undefined()])
    .transform((v) => {
      if (!v) return null;
      const d = v instanceof Date ? v : new Date(v);
      return Number.isNaN(d.getTime()) ? null : d;
    }),
});

export const listingUpdateSchema = listingCreateSchema.partial();

export type ListingCreateInput = z.infer<typeof listingCreateSchema>;
export type ListingUpdateInput = z.infer<typeof listingUpdateSchema>;

export const testimonialCreateSchema = z.object({
  name: z.string().min(1, "Tên bắt buộc").max(100),
  avatarUrl: z
    .union([z.string().url(), z.string().startsWith("/"), z.literal(""), z.null()])
    .nullish()
    .transform((v) => (v ? v : null)),
  rating: z
    .union([z.number(), z.string()])
    .transform((v) => Math.round(Number(v)))
    .refine((n) => Number.isFinite(n) && n >= 1 && n <= 5, {
      message: "Đánh giá 1-5 sao",
    }),
  comment: z.string().min(2, "Nội dung tối thiểu 2 ký tự").max(2000),
  displayOrder: z
    .union([z.number(), z.string(), z.undefined(), z.null()])
    .transform((v) => {
      if (v == null || v === "") return 0;
      const n = Math.round(Number(v));
      return Number.isFinite(n) ? n : 0;
    })
    .optional(),
  published: z.boolean().default(true),
});

export const testimonialUpdateSchema = testimonialCreateSchema.partial();

export const siteStatUpdateSchema = z.object({
  override: z
    .union([z.number(), z.string(), z.null(), z.undefined()])
    .transform((v) => {
      if (v === null || v === undefined || v === "") return null;
      const n = Math.round(Number(v));
      return Number.isFinite(n) ? n : null;
    }),
  label: z.string().nullish().transform((v) => v || null),
});

export type TestimonialCreateInput = z.infer<typeof testimonialCreateSchema>;
export type TestimonialUpdateInput = z.infer<typeof testimonialUpdateSchema>;
