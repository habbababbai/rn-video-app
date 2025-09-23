import SearchIcon from "@/assets/images/svg/search-icon.svg";
import { colors } from "@/constants/colors";
import { fonts } from "@/constants/fonts";
import { useYouTubeVideosBySearchInfinite } from "@/hooks/useYouTubeApi";
import { YouTubeVideo } from "@/services/youtubeApi";
import { fp, hp, spacing, wp } from "@/utils/responsive";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SearchScreen() {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchTerm, setSearchTerm] = useState(""); // This will be the actual search term used for API calls
    const [isSearching, setIsSearching] = useState(false);
    const searchInputRef = useRef<TextInput>(null);

    // Auto-focus the search input when the screen is focused
    useFocusEffect(
        useCallback(() => {
            const timer = setTimeout(() => {
                if (searchInputRef.current) {
                    searchInputRef.current.focus();
                }
            }, 500); // Increased delay for iOS
            return () => clearTimeout(timer);
        }, [])
    );

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
        refetch,
    } = useYouTubeVideosBySearchInfinite(searchTerm, 10);

    // Flatten all pages into a single array of videos
    const allVideos = useMemo(() => {
        return data?.pages?.flatMap((page) => page.items) || [];
    }, [data]);

    const handleSearch = useCallback(() => {
        if (searchQuery.trim()) {
            setSearchTerm(searchQuery.trim()); // Only set the search term when user explicitly searches
            setIsSearching(true);
            // The useYouTubeVideosBySearchInfinite hook will automatically refetch when searchTerm changes
            setIsSearching(false);
        }
    }, [searchQuery]);

    const handleLoadMore = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    const renderVideoItem = ({ item }: { item: YouTubeVideo }) => (
        <TouchableWithoutFeedback
            onPress={() =>
                router.push(`/video-details?videoId=${item.id.videoId}`)
            }
        >
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
                    <Text style={styles.channelTitle} numberOfLines={1}>
                        {item.snippet.channelTitle}
                    </Text>
                    <Text style={styles.videoUploadDate} numberOfLines={1}>
                        {new Date(
                            item.snippet.publishedAt
                        ).toLocaleDateString()}
                    </Text>
                </View>
            </View>
        </TouchableWithoutFeedback>
    );

    const renderFooter = () => {
        if (isFetchingNextPage) {
            return (
                <View style={styles.loadingFooter}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={styles.loadingText}>Loading more...</Text>
                </View>
            );
        }
        return null;
    };

    const renderEmptyState = () => {
        if (isLoading || isSearching) {
            return (
                <View style={styles.emptyState}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.emptyStateText}>
                        Searching videos...
                    </Text>
                </View>
            );
        }

        if (isError) {
            return (
                <View style={styles.emptyState}>
                    <Text style={styles.errorText}>Failed to load videos</Text>
                    <TouchableWithoutFeedback onPress={() => refetch()}>
                        <Text style={styles.retryText}>Tap to retry</Text>
                    </TouchableWithoutFeedback>
                </View>
            );
        }

        if (searchTerm && allVideos.length === 0) {
            return (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>No videos found</Text>
                    <Text style={styles.emptyStateSubtext}>
                        Try a different search term
                    </Text>
                </View>
            );
        }

        if (!searchTerm) {
            return (
                <View style={styles.emptyState}>
                    <SearchIcon style={styles.emptyStateIcon} />
                    <Text style={styles.emptyStateText}>Search for videos</Text>
                    <Text style={styles.emptyStateSubtext}>
                        Enter a search term to find videos
                    </Text>
                </View>
            );
        }

        return null;
    };

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <View style={styles.header}>
                <TouchableWithoutFeedback
                    onPress={() => searchInputRef.current?.focus()}
                >
                    <View style={styles.searchContainer}>
                        <SearchIcon style={styles.searchIcon} />
                        <TextInput
                            ref={searchInputRef}
                            style={styles.searchInput}
                            placeholder="Search videos"
                            placeholderTextColor={colors.primary}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onSubmitEditing={handleSearch}
                            returnKeyType="search"
                            autoCapitalize="none"
                            autoCorrect={false}
                            autoFocus={true}
                        />
                    </View>
                </TouchableWithoutFeedback>
            </View>

            {searchTerm && allVideos.length > 0 ? (
                <>
                    <View style={styles.resultsHeader}>
                        <Text style={styles.resultsCount}>
                            {data?.pages?.[0]?.pageInfo?.totalResults
                                ? `${data.pages[0].pageInfo.totalResults.toLocaleString()} videos found for "${searchTerm}"`
                                : `${allVideos.length} videos found for "${searchTerm}"`}
                        </Text>
                    </View>
                    <FlatList
                        data={allVideos}
                        renderItem={renderVideoItem}
                        keyExtractor={(item, index) =>
                            `${item.id.videoId}-${index}`
                        }
                        contentContainerStyle={styles.listContainer}
                        showsVerticalScrollIndicator={false}
                        onEndReached={handleLoadMore}
                        onEndReachedThreshold={0.5}
                        ListFooterComponent={renderFooter}
                    />
                </>
            ) : (
                <View style={styles.emptyContainer}>{renderEmptyState()}</View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    header: {
        paddingHorizontal: wp(20),
        paddingVertical: hp(15),
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    searchContainer: {
        width: "100%",
        height: hp(44),
        flexDirection: "row",
        alignItems: "center",
        borderRadius: fp(8),
        borderWidth: wp(1),
        borderColor: colors.primary,
        backgroundColor: colors.white,
        paddingHorizontal: wp(12),
    },
    searchIcon: {
        marginRight: spacing.xs,
        width: wp(20),
        height: hp(20),
    },
    searchInput: {
        flex: 1,
        fontFamily: fonts.poppins,
        fontSize: fp(16),
        color: colors.primary,
        letterSpacing: wp(0.5),
        lineHeight: hp(24),
    },
    listContainer: {
        paddingHorizontal: wp(20),
        paddingTop: hp(10),
    },
    videoItem: {
        flexDirection: "row",
        backgroundColor: colors.white,
        marginBottom: hp(15),
        padding: wp(12),
        borderRadius: fp(12),
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
        width: wp(120),
        height: hp(90),
        borderRadius: fp(8),
        marginRight: wp(12),
    },
    videoInfo: {
        flex: 1,
        justifyContent: "space-between",
    },
    videoTitle: {
        fontFamily: fonts.poppinsMedium,
        fontSize: fp(14),
        fontWeight: "600",
        color: colors.primary,
        lineHeight: hp(20),
        letterSpacing: wp(0.5),
        marginBottom: hp(4),
    },
    channelTitle: {
        fontFamily: fonts.poppins,
        fontSize: fp(12),
        color: colors.primary,
        letterSpacing: wp(0.5),
        marginBottom: hp(2),
    },
    videoUploadDate: {
        fontFamily: fonts.poppins,
        fontSize: fp(10),
        color: colors.primary,
        letterSpacing: wp(0.5),
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: wp(40),
    },
    emptyState: {
        alignItems: "center",
    },
    emptyStateIcon: {
        width: wp(80),
        height: hp(80),
        marginBottom: hp(20),
        opacity: 0.5,
    },
    emptyStateText: {
        fontFamily: fonts.poppinsSemiBold,
        fontSize: fp(18),
        color: colors.primary,
        textAlign: "center",
        marginBottom: hp(8),
    },
    emptyStateSubtext: {
        fontFamily: fonts.poppins,
        fontSize: fp(14),
        color: colors.primary,
        textAlign: "center",
        opacity: 0.7,
    },
    errorText: {
        fontFamily: fonts.poppinsMedium,
        fontSize: fp(16),
        color: "#dc3545",
        textAlign: "center",
        marginBottom: hp(8),
    },
    retryText: {
        fontFamily: fonts.poppins,
        fontSize: fp(14),
        color: colors.primary,
        textAlign: "center",
        textDecorationLine: "underline",
    },
    loadingFooter: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: hp(20),
    },
    loadingText: {
        fontFamily: fonts.poppins,
        fontSize: fp(14),
        color: colors.primary,
        marginLeft: wp(8),
    },
    resultsHeader: {
        paddingHorizontal: wp(20),
        paddingVertical: hp(12),
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    resultsCount: {
        fontFamily: fonts.poppinsMedium,
        fontSize: fp(14),
        color: colors.primary,
        textAlign: "center",
        letterSpacing: wp(0.5),
    },
});
