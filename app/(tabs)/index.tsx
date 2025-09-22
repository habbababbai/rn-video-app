import { colors } from "@/constants/colors";
import { fonts } from "@/constants/fonts";
import { useYouTubeVideosBySearch } from "@/hooks/useYouTubeApi";
import { YouTubeVideo } from "@/services/youtubeApi";
import { logout } from "@/store/slices/authSlice";
import { fp, hp, wp } from "@/utils/responsive";
import { router } from "expo-router";
import React from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";

export default function HomeScreen() {
    const dispatch = useDispatch();

    const keywords = ["React Native", "React", "TypeScript", "Javascript"];

    const reactNativeQuery = useYouTubeVideosBySearch("React Native", 5);
    const reactQuery = useYouTubeVideosBySearch("React", 5);
    const typescriptQuery = useYouTubeVideosBySearch("TypeScript", 5);
    const javascriptQuery = useYouTubeVideosBySearch("Javascript", 5);

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

    const handleRefresh = () => {
        queries.forEach((query) => {
            if (query.refetch) {
                query.refetch();
            }
        });
    };

    const isRefreshing = queries.some((query) => query.isFetching);

    const renderVideoItem = ({ item }: { item: YouTubeVideo }) => (
        <View style={styles.videoItem}>
            <Image
                source={{ uri: item.snippet.thumbnails.medium.url }}
                style={styles.thumbnail}
                resizeMode="cover"
            />
            <View style={styles.videoInfo}>
                <Text style={styles.videoTitle} numberOfLines={2}>
                    {item.snippet.title}
                </Text>
                <Text style={styles.videoUploadDate} numberOfLines={1}>
                    {new Date(item.snippet.publishedAt).toLocaleDateString()}
                </Text>
            </View>
        </View>
    );

    const LoadingComponent = () => (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.loadingText}>Loading...</Text>
        </View>
    );

    const renderSection = ({ item, index }: { item: any; index: number }) => {
        const query = queries[index];
        const keyword = keywords[index];

        return (
            <View>
                {index > 0 && <View style={styles.separator} />}
                <View style={styles.section}>
                    <View style={styles.sectionTitleContainer}>
                        <Text style={styles.sectionTitle}>{keyword}</Text>
                        <Text style={styles.showMoreText}>Show more</Text>
                    </View>
                    {query.isLoading ? (
                        <LoadingComponent />
                    ) : query.isError ? (
                        <Text style={styles.errorText}>Failed to load</Text>
                    ) : query.data ? (
                        <FlatList
                            data={query.data.slice(0, 5)}
                            renderItem={renderVideoItem}
                            keyExtractor={(video) => video.id.videoId}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.horizontalList}
                        />
                    ) : null}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
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
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        tintColor={colors.white}
                        colors={[colors.white]}
                    />
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
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
        fontSize: fp(18),
        fontFamily: fonts.poppinsSemiBold,
        fontWeight: "bold",
        letterSpacing: wp(2),
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
        fontSize: fp(18),
        fontFamily: fonts.poppinsSemiBold,
        fontWeight: "bold",
        letterSpacing: wp(0.5),
        color: colors.primary,
    },
    separator: {
        height: hp(2),
        backgroundColor: colors.primary,
        width: "100%",
    },
    sectionTitleContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: wp(20),
        marginBottom: hp(10),
    },
    showMoreText: {
        fontFamily: fonts.poppins,
        fontSize: fp(12),
        letterSpacing: wp(0.5),
        textDecorationLine: "underline",
    },
    horizontalList: {
        paddingHorizontal: 20,
    },
    videoItem: {
        width: 200,
        backgroundColor: "#fff",
        marginRight: 12,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    thumbnail: {
        width: "100%",
        height: hp(112),
        borderRadius: fp(16),
    },
    videoInfo: {
        padding: 12,
    },
    videoTitle: {
        fontFamily: fonts.poppinsMedium,
        fontSize: fp(12),
        fontWeight: "500",
        color: colors.primary,
        lineHeight: hp(12),
        letterSpacing: wp(0.5),
    },
    videoUploadDate: {
        fontFamily: fonts.poppins,
        fontSize: fp(10),
        color: colors.primary,
        textAlign: "right",
        letterSpacing: wp(0.5),
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
