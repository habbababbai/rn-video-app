import { YOUTUBE_API_KEY } from "@env";
import axios from "axios";

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
 * Test if the API key is valid by making a simple request
 * @returns Promise<boolean> - True if API key is valid
 */
export const testApiKey = async (): Promise<boolean> => {
    try {
        if (!YOUTUBE_API_KEY) {
            throw new Error("API key not configured");
        }

        console.log("🔑 Testing API key...");

        // Use minimal working parameters
        const testParams = {
            part: "snippet",
            q: "test",
            type: "video",
            maxResults: 1,
            key: YOUTUBE_API_KEY,
        };

        const response = await axios.get(`${YOUTUBE_API_BASE_URL}/search`, {
            params: testParams,
            headers: {
                Accept: "application/json",
                "User-Agent": "ReactNative-VideoApp/1.0",
            },
            timeout: 10000, // 10 second timeout
        });

        console.log("✅ API key is valid!");
        return true;
    } catch (error: any) {
        console.error("❌ API key test failed:");
        console.error("- Status:", error.response?.status);
        console.error("- Message:", error.response?.data?.error?.message);
        return false;
    }
};

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

        console.log(`🔍 Fetching '${searchTerm}' videos...`);

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

        console.log("✅ Success! Response status:", response.status);
        console.log(
            "✅ Number of videos found:",
            response.data.items?.length || 0
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

/**
 * Simple function to fetch react native videos
 * @returns Promise<YouTubeVideo[]> - Array of 10 videos
 */
export const fetchSampleVideos = async (): Promise<YouTubeVideo[]> => {
    return fetchVideosBySearchTerm("react native");
};

/**
 * Test with minimal parameters as per YouTube API documentation
 * This is the most basic request to verify API access
 */
export const testMinimalApiCall = async (): Promise<boolean> => {
    try {
        console.log("🧪 Testing minimal API call...");

        const response = await axios.get(`${YOUTUBE_API_BASE_URL}/search`, {
            params: {
                part: "snippet",
                q: "test",
                key: YOUTUBE_API_KEY,
            },
            headers: {
                Accept: "application/json",
            },
            timeout: 10000,
        });

        console.log("✅ Minimal API call successful!");
        console.log("- Response status:", response.status);
        console.log("- Items found:", response.data.items?.length || 0);

        return true;
    } catch (error: any) {
        console.error("❌ Minimal API call failed:");
        console.error("- Status:", error.response?.status);
        console.error("- Message:", error.response?.data?.error?.message);
        console.error("- Full error:", error.response?.data);
        return false;
    }
};
