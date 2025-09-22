import { Stack, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import Video from "react-native-video";

export default function VideoDetailsScreen() {
    const { videoId } = useLocalSearchParams<{ videoId: string }>();

    // Use placeholder video for testing, or you can implement logic to get actual video URL
    const videoSource =
        videoId === "placeholder-local-tab"
            ? require("@/assets/videos/broadchurch.mp4")
            : null;

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: "Video Details",
                    headerShown: true,
                }}
            />

            {videoSource ? (
                <View style={styles.videoContainer}>
                    <Video
                        source={videoSource}
                        style={styles.video}
                        controls={true}
                        resizeMode="contain"
                        onError={(error) => console.log("Video Error:", error)}
                        onLoad={(data) => console.log("Video Loaded:", data)}
                    />
                </View>
            ) : (
                <View style={styles.placeholderContainer}>
                    <Text style={styles.placeholderText}>
                        Video not available for ID: {videoId}
                    </Text>
                </View>
            )}

            <View style={styles.detailsContainer}>
                <Text style={styles.title}>Video Details</Text>
                <Text style={styles.subtitle}>
                    Video ID: {videoId || "No ID provided"}
                </Text>
                <Text style={styles.placeholder}>
                    This screen will contain video details, player, and related
                    content.
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    videoContainer: {
        width: "100%",
        aspectRatio: 16 / 9,
        backgroundColor: "#000",
    },
    video: {
        width: "100%",
        height: "100%",
    },
    placeholderContainer: {
        width: "100%",
        aspectRatio: 16 / 9,
        backgroundColor: "#f0f0f0",
        justifyContent: "center",
        alignItems: "center",
    },
    placeholderText: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
    },
    detailsContainer: {
        flex: 1,
        padding: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 10,
        color: "#333",
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 20,
        color: "#666",
    },
    placeholder: {
        fontSize: 14,
        textAlign: "center",
        color: "#999",
        lineHeight: 20,
    },
});
