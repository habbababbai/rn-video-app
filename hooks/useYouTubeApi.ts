import {
    CustomSortOrder,
    fetchVideoDetails,
    fetchVideosBySearchTerm,
    YouTubeSearchResponse,
    YouTubeVideo,
    YouTubeVideoDetails,
} from "@/services/youtubeApi";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

export const youtubeQueryKeys = {
    all: ["youtube"] as const,
    videos: () => [...youtubeQueryKeys.all, "videos"] as const,
    videosBySearch: (
        searchTerm: string,
        maxResults: number,
        order?: CustomSortOrder
    ) =>
        [
            ...youtubeQueryKeys.videos(),
            "search",
            searchTerm,
            maxResults,
            order || "popular",
        ] as const,
    videoDetails: (videoId: string) =>
        [...youtubeQueryKeys.videos(), "details", videoId] as const,
};

export const useYouTubeVideosBySearch = (
    searchTerm: string,
    maxResults: number = 5,
    order: CustomSortOrder = "popular"
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
        retry: 1,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });
};

export const useYouTubeVideosBySearchInfinite = (
    searchTerm: string,
    maxResults: number = 10,
    order: CustomSortOrder = "popular"
) => {
    return useInfiniteQuery<YouTubeSearchResponse, Error>({
        queryKey: [
            ...youtubeQueryKeys.videosBySearch(searchTerm, maxResults, order),
            "infinite",
        ],
        queryFn: ({ pageParam }) =>
            fetchVideosBySearchTerm(
                searchTerm,
                maxResults,
                pageParam as string | undefined,
                order
            ),
        enabled: !!searchTerm,
        initialPageParam: undefined,
        getNextPageParam: (lastPage) => lastPage.nextPageToken,
        retry: 1,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
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
