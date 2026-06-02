import { PrismaClient } from "@prisma/client";
import slugify from "slugify";

const prisma = new PrismaClient();

function makeSlug(title: string, id: string) {
  const base = slugify(title, { lower: true, strict: true, locale: "vi" });
  return `${base}-ID${id.slice(-6).toUpperCase()}`;
}

const seeds = [
  {
    title: "Bán đất cụm công nghiệp EZ Park Hà Tĩnh - giá tốt",
    description:
      "Đất khu công nghiệp EZ Park, huyện Đức Thọ, Hà Tĩnh. Diện tích 4500m², mặt tiền 45m, đường nhựa 24m. Pháp lý sổ đỏ. Tách lô tối thiểu 0.45 ha. Phù hợp xây nhà xưởng, kho bãi, văn phòng đại diện. Hỗ trợ thủ tục đầu tư trọn gói.",
    price: "55 USD/m²",
    pricePerM2: 55,
    currency: "USD" as const,
    address: "Cụm công nghiệp EZ Park",
    district: "Huyện Đức Thọ",
    city: "Hà Tĩnh",
    area: 4500,
    width: 45,
    length: 100,
    type: "DAT_CONG_NGHIEP" as const,
    category: "MUA_BAN" as const,
    legalStatus: "SO_DO" as const,
    minLotSize: 0.45,
    direction: "DONG_NAM" as const,
    images: [
      "https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=1200",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200",
    ],
    contactName: "Anh Tuấn (EZ Park)",
    contactPhone: "0901234567",
    featured: true,
    verified: true,
    mapLat: 18.5444,
    mapLng: 105.6253,
  },
  {
    title: "Bán căn hộ Vinhomes Central Park 2PN view sông",
    description:
      "Căn hộ 2 phòng ngủ, 2 wc tại Vinhomes Central Park. Diện tích thông thuỷ 78m². View trực diện sông Sài Gòn. Nội thất đầy đủ cao cấp, sẵn ở. Sổ hồng chính chủ. Tiện ích đẳng cấp 5 sao: hồ bơi, gym, công viên ven sông.",
    price: "5.5 tỉ",
    pricePerM2: 70_500_000,
    currency: "VND" as const,
    address: "208 Nguyễn Hữu Cảnh",
    ward: "Phường 22",
    district: "Bình Thạnh",
    city: "Hồ Chí Minh",
    area: 78,
    areaUsable: 75,
    bedrooms: 2,
    bathrooms: 2,
    floors: 1,
    direction: "DONG" as const,
    type: "CAN_HO" as const,
    category: "MUA_BAN" as const,
    legalStatus: "SO_HONG" as const,
    furniture: "FULL_FURNITURE" as const,
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200",
    ],
    contactName: "Chị Hương",
    contactPhone: "0912345678",
    featured: true,
    verified: true,
  },
  {
    title: "Cho thuê nhà phố mặt tiền Lê Văn Sỹ - kinh doanh sầm uất",
    description:
      "Nhà mặt phố tiền Lê Văn Sỹ, Phú Nhuận. Trệt + 3 lầu, sân thượng. Diện tích 5x18m. Phù hợp kinh doanh nhà hàng, spa, showroom. Khu trung tâm sầm uất, lưu lượng giao thông cao. Có hợp đồng thuê tối thiểu 2 năm.",
    price: "85 triệu",
    currency: "VND" as const,
    priceNegotiable: true,
    address: "412 Lê Văn Sỹ",
    ward: "Phường 14",
    district: "Phú Nhuận",
    city: "Hồ Chí Minh",
    area: 90,
    areaLand: 90,
    width: 5,
    length: 18,
    floors: 4,
    bedrooms: 4,
    bathrooms: 4,
    direction: "BAC" as const,
    type: "NHA_PHO" as const,
    category: "CHO_THUE" as const,
    legalStatus: "SO_HONG" as const,
    furniture: "BASIC_FURNITURE" as const,
    images: [
      "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?w=1200",
      "https://images.unsplash.com/photo-1448630360428-65456885c650?w=1200",
    ],
    contactName: "Anh Minh",
    contactPhone: "0987654321",
    featured: false,
    verified: true,
  },
  {
    title: "Bán biệt thự đơn lập Vinhomes Riverside Long Biên",
    description:
      "Biệt thự đơn lập tại khu Hoa Sữa, Vinhomes Riverside. Diện tích đất 300m², xây dựng 250m². 4 phòng ngủ, 5 wc, sân vườn rộng. Nội thất đầy đủ. Đã có sổ đỏ. View hồ thoáng mát.",
    price: "28 tỉ",
    currency: "VND" as const,
    address: "Khu Hoa Sữa",
    district: "Long Biên",
    city: "Hà Nội",
    area: 250,
    areaLand: 300,
    bedrooms: 4,
    bathrooms: 5,
    floors: 3,
    direction: "NAM" as const,
    type: "BIET_THU" as const,
    category: "MUA_BAN" as const,
    legalStatus: "SO_DO" as const,
    furniture: "FULL_FURNITURE" as const,
    images: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200",
    ],
    contactName: "Mr. Hoàng",
    contactPhone: "0909112233",
    featured: true,
    verified: true,
  },
  {
    title: "Bán đất nền Bảo Lộc giá rẻ - sổ đỏ thổ cư 100%",
    description:
      "Đất nền tại xã Lộc Thanh, Bảo Lộc, Lâm Đồng. Diện tích 1000m², thổ cư 100%. View đồi chè, không khí trong lành. Đường nhựa rộng 8m. Cách trung tâm 4km. Phù hợp xây homestay, nhà vườn nghỉ dưỡng.",
    price: "1.8 tỉ",
    pricePerM2: 1_800_000,
    currency: "VND" as const,
    priceNegotiable: true,
    address: "Xã Lộc Thanh",
    district: "TP. Bảo Lộc",
    city: "Lâm Đồng",
    area: 1000,
    width: 20,
    length: 50,
    direction: "DONG_NAM" as const,
    type: "DAT_NEN" as const,
    category: "MUA_BAN" as const,
    legalStatus: "SO_DO" as const,
    images: [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200",
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200",
    ],
    contactName: "Chị Lan",
    contactPhone: "0975123456",
    featured: false,
    verified: true,
  },
  {
    title: "Cho thuê kho xưởng 2000m² KCN Tân Bình",
    description:
      "Kho xưởng diện tích 2000m², trần cao 9m, có cẩu trục 5 tấn. Đường container vào tận xưởng. Hệ thống PCCC đạt chuẩn. Văn phòng riêng 150m². Phù hợp sản xuất, logistics. Giá thuê tốt, hợp đồng dài hạn.",
    price: "220 triệu",
    pricePerM2: 110_000,
    currency: "VND" as const,
    address: "Lô D, KCN Tân Bình",
    district: "Quận Tân Phú",
    city: "Hồ Chí Minh",
    area: 2000,
    width: 40,
    length: 50,
    floors: 1,
    type: "KHO_XUONG" as const,
    category: "CHO_THUE" as const,
    legalStatus: "HOP_DONG" as const,
    images: [
      "https://images.unsplash.com/photo-1553413077-190dd305871c?w=1200",
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200",
    ],
    contactName: "Anh Phong (KCN Tân Bình)",
    contactPhone: "0903456789",
    featured: false,
    verified: true,
  },
  {
    title: "Bán shophouse mặt tiền Vinhomes Smart City",
    description:
      "Shophouse 5 tầng + 1 hầm tại Vinhomes Smart City. Mặt tiền 6m, dài 18m. Kinh doanh sầm uất, dân cư đông đúc. Phù hợp mọi loại hình kinh doanh: F&B, ngân hàng, văn phòng.",
    price: "18.5 tỉ",
    pricePerM2: 171_000_000,
    currency: "VND" as const,
    address: "Khu shophouse The Sakura",
    district: "Nam Từ Liêm",
    city: "Hà Nội",
    area: 108,
    areaLand: 108,
    width: 6,
    length: 18,
    floors: 6,
    direction: "DONG" as const,
    type: "SHOPHOUSE" as const,
    category: "MUA_BAN" as const,
    legalStatus: "SO_HONG" as const,
    images: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200",
      "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=1200",
    ],
    contactName: "Anh Khánh",
    contactPhone: "0913987654",
    featured: true,
    verified: false,
  },
  {
    title: "Cho thuê căn hộ Studio The Manor 1PN nội thất Châu Âu",
    description:
      "Căn studio 1 phòng ngủ tại tháp B, The Manor, Bình Thạnh. Diện tích 52m², nội thất sang trọng phong cách Châu Âu. Sẵn ở. Tiện ích cao cấp: hồ bơi, gym, siêu thị Annam. Giá thuê đã bao gồm phí quản lý.",
    price: "18 triệu",
    currency: "VND" as const,
    address: "91 Nguyễn Hữu Cảnh",
    ward: "Phường 22",
    district: "Bình Thạnh",
    city: "Hồ Chí Minh",
    area: 52,
    areaUsable: 50,
    bedrooms: 1,
    bathrooms: 1,
    direction: "TAY_NAM" as const,
    type: "CAN_HO" as const,
    category: "CHO_THUE" as const,
    legalStatus: "SO_HONG" as const,
    furniture: "FULL_FURNITURE" as const,
    images: [
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200",
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200",
    ],
    contactName: "Chị Yến",
    contactPhone: "0938221199",
    featured: false,
    verified: true,
  },
];

async function main() {
  console.log(`Seeding ${seeds.length} listings...`);
  await prisma.listing.deleteMany();
  for (const s of seeds) {
    const created = await prisma.listing.create({
      data: { ...s, slug: "_pending_" },
    });
    await prisma.listing.update({
      where: { id: created.id },
      data: { slug: makeSlug(s.title, created.id) },
    });
    console.log(`  ✓ ${s.title.slice(0, 60)}`);
  }
  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
