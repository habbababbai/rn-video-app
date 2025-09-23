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

export interface YouTubeSearchResponse {
    items: YouTubeVideo[];
    nextPageToken?: string;
    pageInfo: {
        totalResults: number;
        resultsPerPage: number;
    };
}

/**
 * Fetch videos using the working API structure
 * @param searchTerm - The term to search for
 * @param maxResults - Maximum number of videos to fetch (default: 5)
 * @returns Promise<YouTubeVideo[]> - Array of videos
 */
export const fetchVideosBySearchTerm = async (
    searchTerm: string,
    maxResults: number = 5
): Promise<YouTubeVideo[]> => {
    try {
        if (!API_KEY || API_KEY === "YOUR_YOUTUBE_API_KEY_HERE") {
            throw new Error(
                "YouTube API key not configured. Please set EXPO_PUBLIC_YOUTUBE_API_KEY in your .env file"
            );
        }

        // Use the same working parameter structure as testApiKey
        const params = {
            part: "snippet",
            q: searchTerm,
            type: "video",
            maxResults: maxResults,
            key: API_KEY,
        };

        const response = await axios.get<YouTubeSearchResponse>(
            `${YOUTUBE_API_BASE_URL}/search`,
            {
                params,
                headers: {
                    Accept: "application/json",
                    "User-Agent": "ReactNative-VideoApp/1.0",
                },
                timeout: 10000, // 10 second timeout
            }
        );

        return response.data.items;
    } catch (error: any) {
        console.error("❌ Error fetching videos:");
        console.error("- Error message:", error.message);
        console.error("- Error response:", error.response?.data);
        console.error("- Error status:", error.response?.status);
        throw error;
    }
};
