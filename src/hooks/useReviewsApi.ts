import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createReview, deleteMyReview, listMyReviews, updateReview,
} from "@/services/reviews";
import { useAuth } from "@/store/auth";
import { useUser } from "@/store/user";

export const myReviewsKey = ["reviews", "mine"] as const;

export function useMyReviews() {
  const token = useAuth((s) => s.token);
  const role = useUser((s) => s.user.role);
  return useQuery({
    queryKey: myReviewsKey,
    queryFn: listMyReviews,
    enabled: !!token && role === "traveler",
  });
}

export function useSubmitReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { tourId: string; rating: number; text: string; isEdit?: boolean }) =>
      v.isEdit
        ? updateReview(v.tourId, { rating: v.rating, text: v.text })
        : createReview(v.tourId, { rating: v.rating, text: v.text }),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: myReviewsKey });
      qc.invalidateQueries({ queryKey: ["tours", "detail", vars.tourId] });
      qc.invalidateQueries({ queryKey: ["tours", "all"] });
    },
  });
}

export function useDeleteReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reviewId: string) => deleteMyReview(reviewId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: myReviewsKey });
      qc.invalidateQueries({ queryKey: ["tours"] });
    },
  });
}
