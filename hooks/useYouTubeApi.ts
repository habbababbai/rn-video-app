import {
    fetchSampleVideos,
    fetchVideosBySearchTerm,
    YouTubeVideo,
} from "@/services/youtubeApi";
import { useQuery } from "@tanstack/react-query";

// Query keys for caching
export const youtubeQueryKeys = {
    all: ["youtube"] as const,
    videos: () => [...youtubeQueryKeys.all, "videos"] as const,
    videosBySearch: (searchTerm: string) =>
        [...youtubeQueryKeys.videos(), "search", searchTerm] as const,
    sampleVideos: () => [...youtubeQueryKeys.videos(), "sample"] as const,
};

/**
 * Hook to fetch YouTube videos by search term using React Query
 * @param searchTerm - The term to search for
 * @param enabled - Whether the query should be enabled (default: true)
 * @returns Query result with loading, error, and data states
 */
export const useYouTubeVideosBySearch = (
    searchTerm: string,
    enabled: boolean = true
) => {
    return useQuery<YouTubeVideo[], Error>({
        queryKey: youtubeQueryKeys.videosBySearch(searchTerm),
        queryFn: () => fetchVideosBySearchTerm(searchTerm),
        enabled: enabled && !!searchTerm,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
};

/**
 * Hook to fetch sample YouTube videos using React Query
 * @param enabled - Whether the query should be enabled (default: true)
 * @returns Query result with loading, error, and data states
 */
export const useSampleYouTubeVideos = (enabled: boolean = true) => {
    return useQuery<YouTubeVideo[], Error>({
        queryKey: youtubeQueryKeys.sampleVideos(),
        queryFn: fetchSampleVideos,
        enabled,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
};

/**
 * Hook to fetch YouTube videos with manual trigger
 * @param searchTerm - The term to search for
 * @returns Object with query result and refetch function
 */
export const useYouTubeVideosWithRefetch = (searchTerm: string) => {
    const query = useYouTubeVideosBySearch(searchTerm, false);

    return {
        ...query,
        fetchVideos: () => query.refetch(),
    };
};
