import type { Listing } from "@prisma/client";

export type ListingDTO = Listing;

export type ListingSummary = Pick<
  Listing,
  | "id"
  | "title"
  | "slug"
  | "price"
  | "pricePerM2"
  | "currency"
  | "area"
  | "bedrooms"
  | "city"
  | "district"
  | "ward"
  | "type"
  | "category"
  | "legalStatus"
  | "verified"
  | "featured"
  | "images"
  | "views"
  | "createdAt"
>;
