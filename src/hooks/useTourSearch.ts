import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { searchToursPage } from "@/services/tours";
import { useAuth } from "@/store/auth";
import { SearchFilters, SortKey } from "@/types/search";

const PAGE = 20;

export function useTourSearch(query: string, filters: SearchFilters, sort: SortKey) {
  const token = useAuth((s) => s.token);
  const q = useInfiniteQuery({
    queryKey: ["tours", "search", query, filters, sort],
    enabled: !!token,
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      searchToursPage({ query, filters, sort, limit: PAGE, offset: pageParam }),
    getNextPageParam: (last, all) => (last.length < PAGE ? undefined : all.length * PAGE),
    staleTime: 30000,
  });

  const results = useMemo(() => q.data?.pages.flat() ?? [], [q.data]);
  return {
    results,
    loading: q.isPending,
    isError: q.isError,
    error: q.error,
    refetch: q.refetch,
    isRefetching: q.isRefetching,
    fetchNextPage: q.fetchNextPage,
    hasNextPage: q.hasNextPage,
    isFetchingNextPage: q.isFetchingNextPage,
  };
}
