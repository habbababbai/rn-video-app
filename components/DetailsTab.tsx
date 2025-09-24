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
    isLoading: boolean;
    error: Error | null;
}

export const DetailsTab: React.FC<DetailsTabProps> = ({
    videoDetails,
    shouldShowRealData,
    videoId,
    isLoading,
    error,
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

    if (isLoading) {
        return (
            <View style={styles.descriptionContainer}>
                <Text style={styles.descriptionText}>
                    Loading video details...
                </Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.descriptionContainer}>
                <Text style={styles.descriptionText}>
                    Error loading video details: {error.message}
                </Text>
            </View>
        );
    }

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
        <ScrollView style={styles.descriptionContainer}>
            <Text style={styles.descriptionTitle}>Description</Text>
            <Text style={styles.descriptionText} selectable={true}>
                {videoDetails.snippet.description ||
                    "No description available."}
            </Text>
            <Text style={styles.descriptionTitle}>Statistics</Text>
            <View style={styles.statisticsContainer}>
                <View style={styles.statisticsItem}>
                    <ViewsIcon width={wp(20)} height={hp(20)} stroke="white" />
                    <Text style={styles.statisticsText}>
                        {formatNumber(videoDetails.statistics.viewCount)} views
                    </Text>
                </View>
                <View style={styles.statisticsItem}>
                    <LikesIcon width={wp(20)} height={hp(20)} stroke="white" />
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
        flex: 1,
    },
    descriptionText: {
        fontSize: fp(12),
        fontFamily: fonts.poppins,
        color: colors.gray.dark,
        lineHeight: hp(12),
        fontWeight: "400",
        letterSpacing: wp(0.5),
        paddingBottom: spacing.xs,
    },
    descriptionTitle: {
        fontFamily: fonts.poppinsSemiBold,
        fontSize: fp(10),
        lineHeight: hp(12),
        color: colors.primary,
        fontWeight: "600",
        letterSpacing: wp(0.5),
        paddingVertical: spacing.xs,
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
    },
    statisticsText: {
        color: colors.white,
        width: "100%",
        flex: 1,
        textAlign: "center",
        fontFamily: fonts.poppins,
        fontWeight: "600",
        fontSize: fp(10),
        letterSpacing: wp(0.5),
    },
});
