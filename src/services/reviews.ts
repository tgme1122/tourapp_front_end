import { api, mediaUrl } from "./api";
import { asList, num, str } from "./mappers";
import { formatDate } from "@/utils/format";

export type MyReviewItem = {
  id: string;
  tourId: string;
  tourTitle: string;
  city: string;
  image: string;
  rating: number;
  text: string;
  date: string;
};

const formatReviewDate = (raw: string) => {
  if (!raw) return "";
  const d = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? new Date(`${raw}T00:00:00`) : new Date(raw);
  return Number.isNaN(d.getTime()) ? raw : formatDate(d);
};

export const toMyReview = (raw: any): MyReviewItem => ({
  id: str(raw.id),
  tourId: str(raw.tour_id),
  tourTitle: str(raw.tour_title),
  city: str(raw.city),
  image: mediaUrl(raw.image ?? null) ?? "",
  rating: num(raw.rating),
  text: str(raw.text),
  date: formatReviewDate(str(raw.date)),
});

export const listMyReviews = async (): Promise<MyReviewItem[]> =>
  asList(await api("/users/me/reviews")).map(toMyReview);

export const createReview = (tourId: string, input: { rating: number; text: string }) =>
  api(`/tours/${tourId}/reviews`, {
    method: "POST",
    body: { rating: input.rating, text: input.text },
  });

export const updateReview = (tourId: string, input: { rating: number; text: string }) =>
  api(`/tours/${tourId}/reviews`, {
    method: "PUT",
    body: { rating: input.rating, text: input.text },
  });

export const deleteMyReview = (reviewId: string) =>
  api<void>(`/users/me/reviews/${reviewId}`, { method: "DELETE" });
