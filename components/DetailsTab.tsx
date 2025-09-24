import LikesIcon from "@/assets/images/svg/likes.svg";
import ViewsIcon from "@/assets/images/svg/views.svg";
import { colors } from "@/constants/colors";
import { fonts } from "@/constants/fonts";
import { fp, hp, spacing, wp } from "@/utils/responsive";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

interface DetailsTabProps {
    videoDetails: any;
    shouldShowRealData: boolean;
    videoId: string;
}

export const DetailsTab: React.FC<DetailsTabProps> = ({
    videoDetails,
    shouldShowRealData,
    videoId,
}) => {
    const formatNumber = (num: string) => {
        const number = parseInt(num);
        if (number >= 1000000) {
            return (number / 1000000).toFixed(1) + "M";
        } else if (number >= 1000) {
            return (number / 1000).toFixed(1) + "K";
        }
        return number.toString();
    };

    if (!shouldShowRealData) {
        return (
            <View style={styles.descriptionContainer}>
                <Text style={styles.descriptionTitle}>Description</Text>
                <Text style={styles.descriptionText} selectable={true}>
                    {videoId === "placeholder-local-tab"
                        ? "This is a placeholder video for testing purposes. Broadchurch is a British crime drama television series created and written by Chris Chibnall."
                        : "Failed to load video details. Please try again."}
                </Text>
                <Text style={styles.descriptionTitle}>Statistics</Text>
                <View style={styles.statisticsContainer}>
                    <View style={styles.statisticsItem}>
                        <ViewsIcon
                            width={wp(16)}
                            height={hp(16)}
                            stroke={colors.white}
                        />
                        <Text style={styles.statisticsText}>
                            {videoId === "placeholder-local-tab"
                                ? "1.2M views"
                                : "0 views"}
                        </Text>
                    </View>
                    <View style={styles.statisticsItem}>
                        <LikesIcon
                            width={wp(16)}
                            height={hp(16)}
                            stroke={colors.white}
                        />
                        <Text style={styles.statisticsText}>
                            {videoId === "placeholder-local-tab"
                                ? "45K likes"
                                : "0 likes"}
                        </Text>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
        >
            <Text style={styles.descriptionTitle}>Description</Text>
            <Text style={styles.descriptionText} selectable={true}>
                {videoDetails.snippet.description ||
                    "No description available."}
            </Text>
            <Text style={styles.descriptionTitle}>Statistics</Text>
            <View style={styles.statisticsContainer}>
                <View style={styles.statisticsItem}>
                    <ViewsIcon
                        width={wp(16)}
                        height={hp(16)}
                        stroke={colors.white}
                    />
                    <Text style={styles.statisticsText}>
                        {formatNumber(videoDetails.statistics.viewCount)} views
                    </Text>
                </View>
                <View style={styles.statisticsItem}>
                    <LikesIcon
                        width={wp(16)}
                        height={hp(16)}
                        stroke={colors.white}
                    />
                    <Text style={styles.statisticsText}>
                        {formatNumber(videoDetails.statistics.likeCount)} likes
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    descriptionContainer: {
        padding: spacing.lg,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.lg,
    },
    descriptionTitle: {
        fontSize: fp(16),
        fontWeight: "600",
        color: colors.white,
        marginBottom: spacing.sm,
        fontFamily: fonts.poppinsSemiBold,
    },
    descriptionText: {
        fontSize: fp(14),
        lineHeight: hp(20),
        color: colors.gray.light,
        marginBottom: spacing.lg,
        fontFamily: fonts.poppins,
    },
    statisticsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingTop: spacing.xs,
        paddingVertical: 2 * spacing.xxxl,
    },
    statisticsItem: {
        backgroundColor: colors.primary,
        width: wp(136),
        height: hp(32),
        borderRadius: fp(8),
        justifyContent: "flex-start",
        alignItems: "center",
        color: colors.white,
        flexDirection: "row",
        paddingHorizontal: wp(10),
        gap: wp(8),
    },
    statisticsText: {
        fontSize: fp(12),
        fontWeight: "500",
        color: colors.white,
        fontFamily: fonts.poppinsMedium,
    },
});
