import { useYouTubeVideosBySearch } from "@/hooks/useYouTubeApi";
import { YouTubeVideo } from "@/services/youtubeApi";
import { logout } from "@/store/slices/authSlice";
import { router } from "expo-router";
import React from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";

export default function HomeScreen() {
    const dispatch = useDispatch();

    // Keywords for different sections
    const keywords = ["React Native", "React", "TypeScript", "Javascript"];

    // React Query hooks for each keyword
    const reactNativeQuery = useYouTubeVideosBySearch("React Native", true);
    const reactQuery = useYouTubeVideosBySearch("React", true);
    const typescriptQuery = useYouTubeVideosBySearch("TypeScript", true);
    const javascriptQuery = useYouTubeVideosBySearch("Javascript", true);

    // Array of queries for easy iteration
    const queries = [
        reactNativeQuery,
        reactQuery,
        typescriptQuery,
        javascriptQuery,
    ];

    const handleLogout = () => {
        dispatch(logout());
        router.replace("/login" as any);
    };

    // Render video item component
    const renderVideoItem = ({ item }: { item: YouTubeVideo }) => (
        <View style={styles.videoItem}>
            <Text style={styles.videoTitle} numberOfLines={2}>
                {item.snippet.title}
            </Text>
            <Text style={styles.videoChannel}>{item.snippet.channelTitle}</Text>
        </View>
    );

    // Render section component
    const renderSection = ({ item, index }: { item: any; index: number }) => {
        const query = queries[index];
        const keyword = keywords[index];

        return (
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{keyword}</Text>
                {query.isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color="#007AFF" />
                        <Text style={styles.loadingText}>Loading...</Text>
                    </View>
                ) : query.isError ? (
                    <Text style={styles.errorText}>Failed to load</Text>
                ) : query.data ? (
                    <FlatList
                        data={query.data.slice(0, 5)} // Show only 5 items
                        renderItem={renderVideoItem}
                        keyExtractor={(video) => video.id.videoId}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.horizontalList}
                    />
                ) : null}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Home</Text>
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                >
                    <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={keywords}
                renderItem={renderSection}
                keyExtractor={(keyword) => keyword}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
    },
    listContainer: {
        paddingBottom: 20,
    },
    section: {
        marginVertical: 15,
        backgroundColor: "#fff",
        paddingVertical: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
        marginBottom: 10,
        paddingHorizontal: 20,
    },
    horizontalList: {
        paddingHorizontal: 20,
    },
    videoItem: {
        width: 200,
        backgroundColor: "#f8f9fa",
        borderRadius: 8,
        padding: 12,
        marginRight: 12,
        borderWidth: 1,
        borderColor: "#e9ecef",
    },
    videoTitle: {
        fontSize: 14,
        fontWeight: "500",
        color: "#333",
        marginBottom: 6,
        lineHeight: 18,
    },
    videoChannel: {
        fontSize: 12,
        color: "#666",
        fontStyle: "italic",
    },
    loadingContainer: {
        alignItems: "center",
        paddingVertical: 20,
        paddingHorizontal: 20,
    },
    loadingText: {
        marginTop: 8,
        fontSize: 14,
        color: "#007AFF",
        fontWeight: "500",
    },
    errorText: {
        fontSize: 14,
        color: "#dc3545",
        fontWeight: "500",
        textAlign: "center",
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    logoutButton: {
        backgroundColor: "#FF3B30",
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 6,
    },
    logoutButtonText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "600",
    },
});
