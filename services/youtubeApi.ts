import axios from "axios";

// Import environment variable
const YOUTUBE_API_KEY =
    process.env.YOUTUBE_API_KEY || "YOUR_YOUTUBE_API_KEY_HERE";

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
 * Fetch 10 videos using the working API structure
 * @param searchTerm - The term to search for
 * @returns Promise<YouTubeVideo[]> - Array of 10 videos
 */
export const fetchVideosBySearchTerm = async (
    searchTerm: string
): Promise<YouTubeVideo[]> => {
    try {
        if (!YOUTUBE_API_KEY) {
            throw new Error("API key not configured");
        }

        // Use the same working parameter structure as testApiKey
        const params = {
            part: "snippet",
            q: searchTerm,
            type: "video",
            maxResults: 10,
            key: YOUTUBE_API_KEY,
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

