"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Listing } from "@prisma/client";
import {
  DIRECTION_LABEL,
  FURNITURE_LABEL,
  LEGAL_STATUS_LABEL,
  PROPERTY_CATEGORY_LABEL,
  PROPERTY_TYPE_LABEL,
} from "@/lib/formatters";

type Mode = { kind: "create" } | { kind: "edit"; id: string };

type Props = {
  initial?: Partial<Listing>;
  mode: Mode;
};

const TYPES = Object.keys(PROPERTY_TYPE_LABEL);
const DIRS = Object.keys(DIRECTION_LABEL);
const LEGALS = Object.keys(LEGAL_STATUS_LABEL);
const FURNS = Object.keys(FURNITURE_LABEL);

export default function ListingForm({ initial, mode }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagesText, setImagesText] = useState((initial?.images ?? []).join("\n"));
  const [uploading, setUploading] = useState(false);

  async function uploadFiles(files: FileList) {
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      for (const f of Array.from(files)) fd.append("file", f);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      const urls: string[] = data.urls ?? [];
      setImagesText((prev) =>
        [prev, ...urls].filter(Boolean).join("\n").trim(),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi tải ảnh");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const form = e.currentTarget;
    const fd = new FormData(form);

    const num = (k: string) => {
      const v = fd.get(k);
      if (v === null || v === "") return null;
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };
    const str = (k: string) => {
      const v = fd.get(k);
      return v == null ? "" : String(v);
    };
    const optStr = (k: string) => {
      const v = str(k);
      return v === "" ? null : v;
    };

    const images = imagesText
      .split(/\n+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      title: str("title"),
      description: str("description"),
      price: str("price"),
      pricePerM2: num("pricePerM2"),
      currency: str("currency") || "VND",
      priceNegotiable: fd.get("priceNegotiable") === "on",
      address: str("address"),
      ward: optStr("ward"),
      district: str("district"),
      city: str("city"),
      mapLat: num("mapLat"),
      mapLng: num("mapLng"),
      mapsUrl: optStr("mapsUrl"),
      area: num("area") ?? 0,
      areaUsable: num("areaUsable"),
      areaLand: num("areaLand"),
      width: num("width"),
      length: num("length"),
      floors: num("floors"),
      bedrooms: num("bedrooms"),
      bathrooms: num("bathrooms"),
      direction: optStr("direction"),
      type: str("type"),
      category: str("category"),
      status: str("status") || "ACTIVE",
      legalStatus: optStr("legalStatus"),
      furniture: optStr("furniture"),
      minLotSize: num("minLotSize"),
      images,
      videoUrl: optStr("videoUrl"),
      contactName: str("contactName"),
      contactPhone: str("contactPhone"),
      contactPhone2: optStr("contactPhone2"),
      featured: fd.get("featured") === "on",
      verified: fd.get("verified") === "on",
      views: num("views") ?? 0,
      expiresAt: optStr("expiresAt"),
    };

    try {
      const url =
        mode.kind === "create" ? "/api/listings" : `/api/listings/${mode.id}`;
      const res = await fetch(url, {
        method: mode.kind === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          data.error
            ? typeof data.details === "object"
              ? `${data.error}: ${JSON.stringify(data.details.fieldErrors ?? data.details)}`
              : data.error
            : `HTTP ${res.status}`,
        );
      }
      router.push("/portal");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  }

  const v = initial ?? {};

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded">
          {error}
        </div>
      )}

      <Section title="1. Thông tin cơ bản">
        <Field label="Tiêu đề" required>
          <input name="title" defaultValue={v.title ?? ""} required className={inputCls} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Danh mục" required>
            <select name="category" defaultValue={v.category ?? "MUA_BAN"} className={inputCls}>
              {Object.entries(PROPERTY_CATEGORY_LABEL).map(([k, l]) => (
                <option key={k} value={k}>{l}</option>
              ))}
            </select>
          </Field>
          <Field label="Loại BĐS" required>
            <select name="type" defaultValue={v.type ?? "NHA_PHO"} className={inputCls}>
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {PROPERTY_TYPE_LABEL[t as keyof typeof PROPERTY_TYPE_LABEL]}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Mô tả" required>
          <textarea
            name="description"
            defaultValue={v.description ?? ""}
            required
            rows={6}
            className={inputCls}
          />
        </Field>
      </Section>

      <Section title="2. Địa chỉ">
        <Field label="Địa chỉ" required>
          <input name="address" defaultValue={v.address ?? ""} required className={inputCls} />
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Phường / Xã">
            <input name="ward" defaultValue={v.ward ?? ""} className={inputCls} />
          </Field>
          <Field label="Quận / Huyện" required>
            <input name="district" defaultValue={v.district ?? ""} required className={inputCls} />
          </Field>
          <Field label="Tỉnh / Thành phố" required>
            <input name="city" defaultValue={v.city ?? ""} required className={inputCls} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Vĩ độ (lat)">
            <input name="mapLat" defaultValue={v.mapLat ?? ""} type="number" step="any" className={inputCls} />
          </Field>
          <Field label="Kinh độ (lng)">
            <input name="mapLng" defaultValue={v.mapLng ?? ""} type="number" step="any" className={inputCls} />
          </Field>
        </div>
        <Field label="Link Google Maps (tuỳ chọn)">
          <input
            name="mapsUrl"
            defaultValue={v.mapsUrl ?? ""}
            placeholder="https://maps.google.com/... hoặc https://maps.app.goo.gl/..."
            className={inputCls}
          />
          <p className="text-xs text-zinc-500 mt-1">
            Nếu có, bản đồ sẽ hiển thị theo link này. Chấp nhận mọi định dạng link Google Maps.
            Nếu để trống, bản đồ dùng toạ độ lat/lng hoặc địa chỉ.
          </p>
        </Field>
      </Section>

      <Section title="3. Thông tin BĐS">
        <div className="grid grid-cols-3 gap-3">
          <Field label="Diện tích (m²)" required>
            <input name="area" type="number" step="any" defaultValue={v.area ?? ""} required className={inputCls} />
          </Field>
          <Field label="DT sử dụng">
            <input name="areaUsable" type="number" step="any" defaultValue={v.areaUsable ?? ""} className={inputCls} />
          </Field>
          <Field label="DT đất">
            <input name="areaLand" type="number" step="any" defaultValue={v.areaLand ?? ""} className={inputCls} />
          </Field>
          <Field label="Chiều ngang (m)">
            <input name="width" type="number" step="any" defaultValue={v.width ?? ""} className={inputCls} />
          </Field>
          <Field label="Chiều dài (m)">
            <input name="length" type="number" step="any" defaultValue={v.length ?? ""} className={inputCls} />
          </Field>
          <Field label="Số tầng">
            <input name="floors" type="number" defaultValue={v.floors ?? ""} className={inputCls} />
          </Field>
          <Field label="Phòng ngủ">
            <input name="bedrooms" type="number" defaultValue={v.bedrooms ?? ""} className={inputCls} />
          </Field>
          <Field label="Phòng tắm">
            <input name="bathrooms" type="number" defaultValue={v.bathrooms ?? ""} className={inputCls} />
          </Field>
          <Field label="Hướng">
            <select name="direction" defaultValue={v.direction ?? ""} className={inputCls}>
              <option value="">--</option>
              {DIRS.map((d) => (
                <option key={d} value={d}>
                  {DIRECTION_LABEL[d as keyof typeof DIRECTION_LABEL]}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Section>

      <Section title="4. Giá">
        <div className="grid grid-cols-3 gap-3">
          <Field label="Giá" required>
            <input
              name="price"
              type="text"
              defaultValue={v.price ?? ""}
              required
              placeholder="VD: 2.5 tỉ, 500 triệu, Thoả thuận"
              className={inputCls}
            />
          </Field>
          <Field label="Đơn vị tiền">
            <select name="currency" defaultValue={v.currency ?? "VND"} className={inputCls}>
              <option value="VND">VND</option>
              <option value="USD">USD</option>
            </select>
          </Field>
          <Field label="Giá / m²">
            <input name="pricePerM2" type="number" step="any" defaultValue={v.pricePerM2 ?? ""} className={inputCls} />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="priceNegotiable" defaultChecked={v.priceNegotiable ?? false} />
          Có thương lượng
        </label>
      </Section>

      <Section title="5. Pháp lý & Nội thất">
        <div className="grid grid-cols-3 gap-3">
          <Field label="Pháp lý">
            <select name="legalStatus" defaultValue={v.legalStatus ?? ""} className={inputCls}>
              <option value="">--</option>
              {LEGALS.map((l) => (
                <option key={l} value={l}>
                  {LEGAL_STATUS_LABEL[l as keyof typeof LEGAL_STATUS_LABEL]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Nội thất">
            <select name="furniture" defaultValue={v.furniture ?? ""} className={inputCls}>
              <option value="">--</option>
              {FURNS.map((f) => (
                <option key={f} value={f}>
                  {FURNITURE_LABEL[f as keyof typeof FURNITURE_LABEL]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Tách lô tối thiểu (ha)">
            <input name="minLotSize" type="number" step="any" defaultValue={v.minLotSize ?? ""} className={inputCls} />
          </Field>
        </div>
      </Section>

      <Section title="6. Hình ảnh & video">
        <Field label="Tải ảnh từ máy">
          <div className="flex items-center gap-3">
            <label className="px-3 py-2 border border-zinc-300 rounded text-sm cursor-pointer hover:bg-zinc-100 inline-block">
              {uploading ? "Đang tải…" : "📁 Chọn ảnh"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.length) uploadFiles(e.target.files);
                  e.target.value = "";
                }}
              />
            </label>
            <span className="text-xs text-zinc-500">
              JPG / PNG / WEBP / GIF, tối đa 8MB mỗi ảnh.
            </span>
          </div>
        </Field>
        <Field label="URL ảnh (mỗi dòng một URL)">
          <textarea
            value={imagesText}
            onChange={(e) => setImagesText(e.target.value)}
            rows={4}
            placeholder="https://images.unsplash.com/... hoặc /uploads/..."
            className={inputCls}
          />
          <p className="text-xs text-zinc-500 mt-1">
            Có thể trộn URL bên ngoài và ảnh đã tải lên. Ảnh tải lên sẽ tự thêm vào đây.
          </p>
        </Field>
        <Field label="URL video (YouTube)">
          <input name="videoUrl" defaultValue={v.videoUrl ?? ""} className={inputCls} />
        </Field>
      </Section>

      <Section title="7. Liên hệ">
        <div className="grid grid-cols-3 gap-3">
          <Field label="Tên người liên hệ" required>
            <input name="contactName" defaultValue={v.contactName ?? ""} required className={inputCls} />
          </Field>
          <Field label="SĐT" required>
            <input name="contactPhone" defaultValue={v.contactPhone ?? ""} required className={inputCls} />
          </Field>
          <Field label="SĐT 2">
            <input name="contactPhone2" defaultValue={v.contactPhone2 ?? ""} className={inputCls} />
          </Field>
        </div>
      </Section>

      <Section title="8. Cài đặt">
        <div className="grid grid-cols-3 gap-3">
          <Field label="Trạng thái">
            <select name="status" defaultValue={v.status ?? "ACTIVE"} className={inputCls}>
              <option value="ACTIVE">Đang hiển thị</option>
              <option value="SOLD">Đã bán / cho thuê</option>
              <option value="HIDDEN">Ẩn</option>
              <option value="EXPIRED">Hết hạn</option>
            </select>
          </Field>
          <Field label="Ngày hết hạn">
            <input
              name="expiresAt"
              type="date"
              defaultValue={
                v.expiresAt ? new Date(v.expiresAt).toISOString().slice(0, 10) : ""
              }
              className={inputCls}
            />
          </Field>
        </div>
        <div className="flex gap-6 mt-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="featured" defaultChecked={v.featured ?? false} />
            Hiển thị nổi bật
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="verified" defaultChecked={v.verified ?? false} />
            Đã xác thực
          </label>
        </div>
        <div className="grid grid-cols-3 gap-3 pt-1">
          <Field label="Số khách hàng đã xem">
            <input
              name="views"
              type="number"
              min={0}
              defaultValue={mode.kind === "create" ? 10 : (v.views ?? 0)}
              className={inputCls}
            />
          </Field>
        </div>
        <p className="text-xs text-zinc-500">
          Lượt xem tự động cộng mỗi khi có khách mở tin. Có thể chỉnh tay tại đây.
        </p>
      </Section>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2.5 bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)] text-white font-semibold rounded disabled:opacity-50"
        >
          {submitting ? "Đang lưu…" : mode.kind === "create" ? "Tạo tin" : "Lưu thay đổi"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 border border-zinc-300 rounded hover:bg-zinc-50"
        >
          Huỷ
        </button>
      </div>
    </form>
  );
}

const inputCls =
  "w-full px-3 py-2 border border-zinc-300 rounded text-sm focus:outline-none focus:border-[var(--color-brand)]";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-zinc-700 mb-1">
        {label}
        {required && <span className="text-[var(--color-brand)]"> *</span>}
      </label>
      {children}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-zinc-200 rounded-lg p-4 space-y-3">
      <h3 className="font-semibold text-zinc-900">{title}</h3>
      {children}
    </div>
  );
}
