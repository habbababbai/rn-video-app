import { colors } from "@/constants/colors";
import { fonts } from "@/constants/fonts";
import { fp, hp, wp } from "@/utils/responsive";
import React from "react";
import { StyleSheet, Text } from "react-native";
import Animated from "react-native-reanimated";

interface TimerDisplayProps {
    currentTime: number;
    duration: number;
    showControls: boolean;
    controlsAnimatedStyle: any;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
    currentTime,
    duration,
    showControls,
    controlsAnimatedStyle,
}) => {
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <Animated.View
            style={[styles.timerContainer, controlsAnimatedStyle]}
            pointerEvents={showControls ? "auto" : "none"}
        >
            <Text style={styles.timerText}>
                {formatTime(currentTime)} / {formatTime(duration)}
            </Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    timerContainer: {
        position: "absolute",
        bottom: hp(8),
        left: wp(12),
        backgroundColor: colors.overlay.timer,
        paddingHorizontal: wp(8),
        paddingVertical: hp(4),
        borderRadius: wp(4),
        zIndex: 2,
    },
    timerText: {
        color: colors.white,
        fontSize: fp(10),
        fontWeight: "500",
        fontFamily: fonts.poppinsMedium,
        letterSpacing: wp(0.5),
    },
});
