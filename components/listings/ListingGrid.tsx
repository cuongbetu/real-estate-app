import type { ListingSummary } from "@/types/listing";
import ListingCard from "./ListingCard";

type Props = {
  listings: (ListingSummary & { legalStatus?: string | null })[];
  variant?: "grid" | "row";
  empty?: React.ReactNode;
};

export default function ListingGrid({ listings, variant = "row", empty }: Props) {
  if (!listings.length) {
    return (
      <div className="bg-white border border-zinc-200 rounded-lg p-8 text-center text-zinc-500">
        {empty ?? "Không tìm thấy tin đăng nào phù hợp."}
      </div>
    );
  }
  if (variant === "grid") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {listings.map((l) => (
          <ListingCard key={l.id} listing={l} variant="grid" />
        ))}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      {listings.map((l) => (
        <ListingCard key={l.id} listing={l} variant="row" />
      ))}
    </div>
  );
}
