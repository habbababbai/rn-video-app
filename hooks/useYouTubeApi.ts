import {
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
