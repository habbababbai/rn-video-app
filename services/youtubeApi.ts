import axios from "axios";

// Use Expo's built-in environment variable support
const API_KEY =
    process.env.EXPO_PUBLIC_YOUTUBE_API_KEY || "YOUR_YOUTUBE_API_KEY_HERE";

// YouTube Data API configuration
const YOUTUBE_API_BASE_URL = "https://www.googleapis.com/youtube/v3";

// Types for YouTube API responses
export interface YouTubeVideo {
    id: {
        videoId: string;
    };
    snippet: {
        title: string;
        description: string;
        thumbnails: {
            default: {
                url: string;
                width: number;
                height: number;
            };
            medium: {
                url: string;
                width: number;
                height: number;
            };
            high: {
                url: string;
                width: number;
                height: number;
            };
        };
        channelTitle: string;
        publishedAt: string;
    };
}

export interface YouTubeVideoDetails {
    id: string;
    snippet: {
        title: string;
        description: string;
        channelTitle: string;
        publishedAt: string;
        thumbnails: {
            default: {
                url: string;
                width: number;
                height: number;
            };
            medium: {
                url: string;
                width: number;
                height: number;
            };
            high: {
                url: string;
                width: number;
                height: number;
            };
        };
    };
    statistics: {
        viewCount: string;
        likeCount: string;
        commentCount: string;
    };
}

export interface YouTubeSearchResponse {
    items: YouTubeVideo[];
    nextPageToken?: string;
    pageInfo: {
        totalResults: number;
        resultsPerPage: number;
    };
}

export interface YouTubeVideoDetailsResponse {
    items: YouTubeVideoDetails[];
}

export type SortOrder = "relevance" | "date" | "rating" | "viewCount" | "title";
export type CustomSortOrder = "latest" | "oldest" | "popular";

export const convertCustomSortToAPI = (
    customSort: CustomSortOrder
): SortOrder => {
    switch (customSort) {
        case "latest":
            return "date";
        case "oldest":
            return "date";
        case "popular":
            return "relevance";
        default:
            return "relevance";
    }
};

export const getPublishedBeforeParam = (
    customSort: CustomSortOrder
): string | undefined => {
    switch (customSort) {
        case "oldest":
            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
            return oneYearAgo.toISOString();
        default:
            return undefined;
    }
};

export const getMaxResultsForSort = (
    customSort: CustomSortOrder,
    requestedMax: number
): number => {
    switch (customSort) {
        case "oldest":
            return Math.min(requestedMax * 3, 50);
        default:
            return requestedMax;
    }
};

/**
 * Fetch videos using the working API structure with pagination support
 * @param searchTerm - The term to search for
 * @param maxResults - Maximum number of videos to fetch (default: 10)
 * @param pageToken - Token for pagination (optional)
 * @param order - Sort order for results (default: 'relevance')
 * @returns Promise<YouTubeSearchResponse> - Full response with items and pagination info
 */
export const fetchVideosBySearchTerm = async (
    searchTerm: string,
    maxResults: number = 10,
    pageToken?: string,
    customSortOrder: CustomSortOrder = "popular"
): Promise<YouTubeSearchResponse> => {
    try {
        if (!API_KEY || API_KEY === "YOUR_YOUTUBE_API_KEY_HERE") {
            throw new Error(
                "YouTube API key not configured. Please set EXPO_PUBLIC_YOUTUBE_API_KEY in your .env file"
            );
        }
        const apiSortOrder = convertCustomSortToAPI(customSortOrder);
        const actualMaxResults = getMaxResultsForSort(
            customSortOrder,
            maxResults
        );
        const publishedBefore = getPublishedBeforeParam(customSortOrder);

        const params: any = {
            part: "snippet",
            q: searchTerm,
            type: "video",
            maxResults: actualMaxResults,
            order: apiSortOrder,
            key: API_KEY,
        };

        if (publishedBefore) {
            params.publishedBefore = publishedBefore;
        }

        if (pageToken) {
            params.pageToken = pageToken;
        }

        const response = await axios.get<YouTubeSearchResponse>(
            `${YOUTUBE_API_BASE_URL}/search`,
            {
                params,
                headers: {
                    Accept: "application/json",
                    "User-Agent": "ReactNative-VideoApp/1.0",
                },
                timeout: 10000,
            }
        );

        let data = response.data;

        if (customSortOrder === "oldest") {
            const sortedItems = [...data.items]
                .sort((a, b) => {
                    const dateA = new Date(a.snippet.publishedAt);
                    const dateB = new Date(b.snippet.publishedAt);
                    return dateA.getTime() - dateB.getTime();
                })
                .slice(0, maxResults);

            data = {
                ...data,
                items: sortedItems,
            };
        }

        return data;
    } catch (error: any) {
        console.error("❌ Error fetching videos:");
        console.error("- Error message:", error.message);
        console.error("- Error response:", error.response?.data);
        console.error("- Error status:", error.response?.status);
        throw error;
    }
};

/**
 * Fetch detailed video information including statistics
 * @param videoId - The YouTube video ID
 * @returns Promise<YouTubeVideoDetails> - Detailed video information
 */
export const fetchVideoDetails = async (
    videoId: string
): Promise<YouTubeVideoDetails> => {
    try {
        if (!API_KEY || API_KEY === "YOUR_YOUTUBE_API_KEY_HERE") {
            throw new Error(
                "YouTube API key not configured. Please set EXPO_PUBLIC_YOUTUBE_API_KEY in your .env file"
            );
        }

        const params = {
            part: "snippet,statistics",
            id: videoId,
            key: API_KEY,
        };

        const response = await axios.get<YouTubeVideoDetailsResponse>(
            `${YOUTUBE_API_BASE_URL}/videos`,
            {
                params,
                headers: {
                    Accept: "application/json",
                    "User-Agent": "ReactNative-VideoApp/1.0",
                },
                timeout: 10000,
            }
        );

        if (!response.data.items || response.data.items.length === 0) {
            throw new Error("Video not found");
        }

        return response.data.items[0];
    } catch (error: any) {
        console.error("❌ Error fetching video details:");
        console.error("- Error message:", error.message);
        console.error("- Error response:", error.response?.data);
        console.error("- Error status:", error.response?.status);
        throw error;
    }
};

/**
 * Get YouTube embed URL for WebView
 * @param videoId - The YouTube video ID
 * @returns string - YouTube embed URL
 */
export const getYouTubeEmbedUrl = (videoId: string): string => {
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&showinfo=0&rel=0&modestbranding=1`;
};
