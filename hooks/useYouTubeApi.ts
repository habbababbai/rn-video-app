import { fetchVideosBySearchTerm, fetchVideoDetails, YouTubeVideo, YouTubeVideoDetails } from "@/services/youtubeApi";
import { useQuery } from "@tanstack/react-query";

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
        queryFn: () => fetchVideosBySearchTerm(searchTerm, maxResults),
        enabled: !!searchTerm,
        // Use global defaults for extended caching
        retry: 1, // Reduce retries to save quota
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000), // Faster retry
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
