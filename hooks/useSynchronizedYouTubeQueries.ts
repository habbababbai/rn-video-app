import { YouTubeVideo } from "@/services/youtubeApi";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { useYouTubeVideosBySearch } from "./useYouTubeApi";

export interface SynchronizedQueryResult {
    data: YouTubeVideo[];
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => void;
}

export interface SynchronizedQueriesResult {
    queries: SynchronizedQueryResult[];
    isLoading: boolean;
    isError: boolean;
    hasAnyData: boolean;
    hasAllData: boolean;
    refetchAll: () => Promise<void>;
    invalidateAll: () => Promise<void>;
    isRefreshing: boolean;
    errorCount: number;
    successCount: number;
}

export interface QueryConfig {
    searchTerm: string;
    maxResults: number;
    order?: "popular" | "latest" | "oldest";
}

/**
 * Custom hook for synchronizing multiple YouTube API queries
 * This version works with a fixed number of queries to avoid hook rule violations
 */
export const useSynchronizedYouTubeQueries = (
    searchTerms: string[],
    maxResults: number = 5,
    order: "popular" | "latest" | "oldest" = "popular"
): SynchronizedQueriesResult => {
    const queryClient = useQueryClient();

    const query1 = useYouTubeVideosBySearch(
        searchTerms[0] || "",
        maxResults,
        order
    );
    const query2 = useYouTubeVideosBySearch(
        searchTerms[1] || "",
        maxResults,
        order
    );
    const query3 = useYouTubeVideosBySearch(
        searchTerms[2] || "",
        maxResults,
        order
    );
    const query4 = useYouTubeVideosBySearch(
        searchTerms[3] || "",
        maxResults,
        order
    );
    const query5 = useYouTubeVideosBySearch(
        searchTerms[4] || "",
        maxResults,
        order
    );

    const activeQueries = [query1, query2, query3, query4, query5].slice(
        0,
        searchTerms.length
    );

    const queries: SynchronizedQueryResult[] = useMemo(
        () =>
            activeQueries.map((query) => ({
                data: query.data || [],
                isLoading: query.isLoading,
                isError: query.isError,
                error: query.error,
                refetch: query.refetch,
            })),
        [activeQueries]
    );

    const isLoading = useMemo(
        () => queries.some((query) => query.isLoading),
        [queries]
    );

    const isError = useMemo(
        () => queries.some((query) => query.isError),
        [queries]
    );

    const hasAnyData = useMemo(
        () => queries.some((query) => query.data.length > 0),
        [queries]
    );

    const hasAllData = useMemo(
        () => queries.every((query) => query.data.length > 0),
        [queries]
    );

    const isRefreshing = useMemo(
        () => queries.some((query) => query.isLoading),
        [queries]
    );

    const errorCount = useMemo(
        () => queries.filter((query) => query.isError).length,
        [queries]
    );

    const successCount = useMemo(
        () =>
            queries.filter((query) => !query.isError && query.data.length > 0)
                .length,
        [queries]
    );

    const refetchAll = useCallback(async () => {
        const refetchPromises = queries.map((query) => query.refetch());
        await Promise.allSettled(refetchPromises);
    }, [queries]);

    const invalidateAll = useCallback(async () => {
        await queryClient.invalidateQueries({
            queryKey: ["youtube", "videos"],
        });
    }, [queryClient]);

    return {
        queries,
        isLoading,
        isError,
        hasAnyData,
        hasAllData,
        refetchAll,
        invalidateAll,
        isRefreshing,
        errorCount,
        successCount,
    };
};

