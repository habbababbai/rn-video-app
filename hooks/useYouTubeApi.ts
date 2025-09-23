import {
    fetchVideoDetails,
    fetchVideosBySearchTerm,
    SortOrder,
    YouTubeSearchResponse,
    YouTubeVideo,
    YouTubeVideoDetails,
} from "@/services/youtubeApi";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

// Query keys for caching
export const youtubeQueryKeys = {
    all: ["youtube"] as const,
    videos: () => [...youtubeQueryKeys.all, "videos"] as const,
    videosBySearch: (
        searchTerm: string,
        maxResults: number,
        order?: SortOrder
    ) =>
        [
            ...youtubeQueryKeys.videos(),
            "search",
            searchTerm,
            maxResults,
            order || "relevance",
        ] as const,
    videoDetails: (videoId: string) =>
        [...youtubeQueryKeys.videos(), "details", videoId] as const,
};

export const useYouTubeVideosBySearch = (
    searchTerm: string,
    maxResults: number = 5,
    order: SortOrder = "relevance"
) => {
    return useQuery<YouTubeVideo[], Error>({
        queryKey: youtubeQueryKeys.videosBySearch(
            searchTerm,
            maxResults,
            order
        ),
        queryFn: async () => {
            const response = await fetchVideosBySearchTerm(
                searchTerm,
                maxResults,
                undefined,
                order
            );
            return response.items;
        },
        enabled: !!searchTerm,
        // Use global defaults for extended caching
        retry: 1, // Reduce retries to save quota
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000), // Faster retry
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });
};

export const useYouTubeVideosBySearchInfinite = (
    searchTerm: string,
    maxResults: number = 10,
    order: SortOrder = "relevance"
) => {
    return useInfiniteQuery<YouTubeSearchResponse, Error>({
        queryKey: [
            ...youtubeQueryKeys.videosBySearch(searchTerm, maxResults, order),
            "infinite",
        ],
        queryFn: ({ pageParam }) =>
            fetchVideosBySearchTerm(searchTerm, maxResults, pageParam, order),
        enabled: !!searchTerm,
        getNextPageParam: (lastPage) => lastPage.nextPageToken,
        retry: 1,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
        // Add caching configuration similar to home page
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });
};

export const useYouTubeVideoDetails = (videoId: string) => {
    return useQuery<YouTubeVideoDetails, Error>({
        queryKey: youtubeQueryKeys.videoDetails(videoId),
        queryFn: () => fetchVideoDetails(videoId),
        enabled: !!videoId && videoId !== "placeholder-local-tab",
        retry: 1,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    });
};
