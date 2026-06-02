"use client";

import { useState } from "react";
import { formatPhone } from "@/lib/formatters";

export default function ContactBox({
  name,
  phone,
  phone2,
}: {
  name: string;
  phone: string;
  phone2?: string | null;
}) {
  const [revealed, setRevealed] = useState(false);
  const masked = phone.slice(0, phone.length - 3) + "***";

  return (
    <div className="bg-white border border-zinc-200 rounded-lg p-4 sticky top-20">
      <div className="text-sm text-zinc-500">Liên hệ chủ tin</div>
      <div className="text-lg font-semibold text-zinc-900 mt-0.5">{name}</div>

      <div className="mt-3 space-y-2">
        <a
          href={`tel:${phone}`}
          onClick={() => setRevealed(true)}
          className="flex items-center justify-center gap-2 w-full bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)] text-white font-semibold py-3 rounded-md"
        >
          📞 {revealed ? formatPhone(phone) : `${formatPhone(masked)} • Bấm để hiện số`}
        </a>
        {phone2 && (
          <a
            href={`tel:${phone2}`}
            className="block text-center text-sm text-zinc-700 hover:text-[var(--color-brand)]"
          >
            SĐT 2: {formatPhone(phone2)}
          </a>
        )}
        <a
          href={`https://zalo.me/${phone.replace(/\D/g, "")}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-[#0068ff] hover:bg-[#0057d6] text-white font-semibold py-2.5 rounded-md text-sm"
        >
          💬 Chat qua Zalo
        </a>
      </div>

      <p className="mt-3 text-xs text-zinc-500 leading-5">
        Bấm số điện thoại để gọi trực tiếp cho chủ tin. Vui lòng kiểm tra kỹ
        thông tin trước khi giao dịch.
      </p>
    </div>
  );
}
