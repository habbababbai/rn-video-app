import { useYouTubeVideosBySearch } from "@/hooks/useYouTubeApi";
import { logout } from "@/store/slices/authSlice";
import { router } from "expo-router";
import React from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";

export default function HomeScreen() {
    const dispatch = useDispatch();
    const searchTerm = "react native";

    // React Query hook - automatically fetch "react native" videos
    const searchVideosQuery = useYouTubeVideosBySearch(searchTerm, true);

    const handleLogout = () => {
        dispatch(logout());
        router.replace("/login" as any);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Home</Text>

                {searchVideosQuery.isLoading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#007AFF" />
                        <Text style={styles.loadingText}>
                            Fetching &quot;{searchTerm}&quot; videos...
                        </Text>
                    </View>
                )}

                {searchVideosQuery.isSuccess && searchVideosQuery.data && (
                    <View style={styles.successContainer}>
                        <Text style={styles.successText}>
                            ✅ Fetched {searchVideosQuery.data.length} &quot;
                            {searchTerm}&quot; videos
                        </Text>
                        <Text style={styles.infoText}>
                            Check console for video details
                        </Text>
                    </View>
                )}

                {searchVideosQuery.isError && (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>
                            ❌ Failed to fetch videos
                        </Text>
                        <Text style={styles.infoText}>
                            Check console for error details
                        </Text>
                    </View>
                )}

                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                >
                    <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 40,
        textAlign: "center",
    },
    loadingContainer: {
        alignItems: "center",
        paddingVertical: 20,
        marginBottom: 20,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: "#007AFF",
        fontWeight: "500",
    },
    successContainer: {
        alignItems: "center",
        paddingVertical: 20,
        backgroundColor: "#f0f8f0",
        borderRadius: 8,
        marginVertical: 10,
        paddingHorizontal: 20,
    },
    successText: {
        fontSize: 16,
        color: "#28a745",
        fontWeight: "600",
        textAlign: "center",
    },
    errorContainer: {
        alignItems: "center",
        paddingVertical: 20,
        backgroundColor: "#fff0f0",
        borderRadius: 8,
        marginVertical: 10,
        paddingHorizontal: 20,
    },
    errorText: {
        fontSize: 16,
        color: "#dc3545",
        fontWeight: "600",
        textAlign: "center",
    },
    infoText: {
        fontSize: 14,
        color: "#666",
        marginTop: 5,
        textAlign: "center",
    },
    logoutButton: {
        backgroundColor: "#FF3B30",
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        marginTop: 20,
    },
    logoutButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
});
