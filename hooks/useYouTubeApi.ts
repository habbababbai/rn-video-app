import { fetchVideosBySearchTerm, fetchVideoDetails, YouTubeVideo, YouTubeVideoDetails, YouTubeSearchResponse } from "@/services/youtubeApi";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";

// Query keys for caching
export const youtubeQueryKeys = {
    all: ["youtube"] as const,
    videos: () => [...youtubeQueryKeys.all, "videos"] as const,
    videosBySearch: (searchTerm: string, maxResults: number) =>
        [
            ...youtubeQueryKeys.videos(),
            "search",
            searchTerm,
            maxResults,
        ] as const,
    videoDetails: (videoId: string) =>
        [...youtubeQueryKeys.videos(), "details", videoId] as const,
};

export const useYouTubeVideosBySearch = (
    searchTerm: string,
    maxResults: number = 5
) => {
    return useQuery<YouTubeVideo[], Error>({
        queryKey: youtubeQueryKeys.videosBySearch(searchTerm, maxResults),
        queryFn: async () => {
            const response = await fetchVideosBySearchTerm(searchTerm, maxResults);
            return response.items;
        },
        enabled: !!searchTerm,
        // Use global defaults for extended caching
        retry: 1, // Reduce retries to save quota
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000), // Faster retry
    });
};

export const useYouTubeVideosBySearchInfinite = (
    searchTerm: string,
    maxResults: number = 10
) => {
    return useInfiniteQuery<YouTubeSearchResponse, Error>({
        queryKey: [...youtubeQueryKeys.videosBySearch(searchTerm, maxResults), "infinite"],
        queryFn: ({ pageParam }) => fetchVideosBySearchTerm(searchTerm, maxResults, pageParam),
        enabled: !!searchTerm,
        getNextPageParam: (lastPage) => lastPage.nextPageToken,
        retry: 1,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
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
