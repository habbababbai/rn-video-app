import PersonIcon from "@/assets/images/svg/person.svg";
import { DetailsTab } from "@/components/DetailsTab";
import { NotesTab } from "@/components/NotesTab";
import { colors } from "@/constants/colors";
import { fonts } from "@/constants/fonts";
import { isIOS } from "@/utils/platform";
import { fp, hp, spacing, wp } from "@/utils/responsive";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface VideoDetailsProps {
    videoDetails: any;
    shouldShowRealData: boolean;
    videoId: string;
    isLoading: boolean;
    error: any;
    currentTime: number;
    onBeginInputFocus: () => void;
    isFullscreen: boolean;
}

export function VideoDetails({
    videoDetails,
    shouldShowRealData,
    videoId,
    isLoading,
    error,
    currentTime,
    onBeginInputFocus,
    isFullscreen,
}: VideoDetailsProps) {
    const [activeTab, setActiveTab] = useState<"details" | "notes">("details");

    return (
        <View
            style={[
                styles.detailsContainer,
                isFullscreen && styles.fullscreenDetailsContainer,
            ]}
        >
            <Text numberOfLines={1} style={styles.title}>
                {shouldShowRealData
                    ? videoDetails.snippet.title
                    : "Placeholder Video Name"}
            </Text>

            <View style={styles.channelDetailsContainer}>
                <View style={styles.accountIconContainer}>
                    <PersonIcon width={wp(24)} height={hp(24)} fill="white" />
                </View>
                <Text style={styles.channelName}>
                    {shouldShowRealData
                        ? videoDetails.snippet.channelTitle
                        : "ITV Drama"}
                </Text>
            </View>

            <View style={styles.tabBar}>
                <TouchableOpacity
                    style={[
                        styles.tabButton,
                        activeTab === "details" && styles.activeTabButton,
                    ]}
                    onPress={() => setActiveTab("details")}
                >
                    <Text style={[styles.tabText]}>Details</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.tabButton,
                        activeTab === "notes" && styles.activeTabButton,
                    ]}
                    onPress={() => setActiveTab("notes")}
                >
                    <Text style={[styles.tabText]}>Notes</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.tabContent}>
                {activeTab === "details" ? (
                    <DetailsTab
                        videoDetails={videoDetails}
                        shouldShowRealData={shouldShowRealData}
                        videoId={videoId}
                        isLoading={isLoading}
                        error={error}
                    />
                ) : (
                    <NotesTab
                        videoId={videoId}
                        currentTime={currentTime}
                        onBeginInputFocus={onBeginInputFocus}
                    />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    accountIconContainer: {
        backgroundColor: colors.primary,
        height: fp(48),
        width: fp(48),
        borderRadius: fp(24),
        justifyContent: "center",
        alignItems: "center",
        marginHorizontal: wp(10),
    },
    channelDetailsContainer: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        width: "100%",
        paddingTop: spacing.xs,
    },
    channelName: {
        fontFamily: fonts.poppinsBold,
        fontSize: fp(14),
        color: colors.primary,
        letterSpacing: wp(0.5),
        fontWeight: "700",
    },
    tabBar: {
        flexDirection: "row",
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray.light,
        paddingTop: spacing.xs,
    },
    tabButton: {
        flex: 1,
        paddingVertical: spacing.xs,
        alignItems: "center",
        borderBottomWidth: 2,
        borderBottomColor: "transparent",
    },
    activeTabButton: {
        borderBottomColor: colors.primary,
    },
    tabText: {
        fontSize: fp(12),
        fontFamily: fonts.poppinsSemiBold,
        color: colors.primary,
        fontWeight: "600",
        ...(!isIOS ? { fontWeight: "700" } : {}),
    },
    tabContent: {
        flex: 1,
        paddingTop: hp(15),
        width: "100%",
    },
    detailsContainer: {
        flex: 1,
        paddingHorizontal: wp(15),
        paddingVertical: hp(20),
        justifyContent: "flex-start",
        alignItems: "center",
        backgroundColor: colors.white,
    },
    fullscreenDetailsContainer: {
        display: "none",
    },
    title: {
        fontSize: fp(18),
        fontFamily: fonts.poppinsSemiBold,
        fontWeight: "600",
        marginBottom: hp(10),
        color: colors.gray.dark,
        letterSpacing: wp(0.5),
        ...(!isIOS ? { fontWeight: "700" } : {}),
        alignSelf: "flex-start",
        paddingLeft: spacing.xs,
    },
});
