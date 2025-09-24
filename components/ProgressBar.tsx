import { colors } from "@/constants/colors";
import { hp, wp } from "@/utils/responsive";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Animated from "react-native-reanimated";

interface ProgressBarProps {
    showControls: boolean;
    controlsAnimatedStyle: any;
    thumbPosition: number;
    onProgressBarPress: (event: any) => void;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
    showControls,
    controlsAnimatedStyle,
    thumbPosition,
    onProgressBarPress,
}) => {
    return (
        <Animated.View
            style={[styles.progressBarContainer, controlsAnimatedStyle]}
            pointerEvents={showControls ? "auto" : "none"}
        >
            <TouchableOpacity
                style={styles.progressBarBackground}
                onPress={onProgressBarPress}
                activeOpacity={0.8}
                hitSlop={{ top: hp(20), bottom: hp(20), left: 0, right: 0 }}
            >
                <View
                    style={[styles.progressBarFill, { width: thumbPosition }]}
                />
                <View
                    style={[
                        styles.progressBarThumb,
                        { left: thumbPosition - wp(6) },
                    ]}
                />
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    progressBarContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: hp(4),
        justifyContent: "center",
        overflow: "visible",
        zIndex: 10,
    },
    progressBarBackground: {
        height: hp(4),
        backgroundColor: colors.overlay.light,
        position: "relative",
        overflow: "visible",
    },
    progressBarFill: {
        height: hp(4),
        backgroundColor: colors.alert,
        position: "absolute",
        left: 0,
        top: 0,
    },
    progressBarThumb: {
        position: "absolute",
        top: hp(-4),
        width: wp(12),
        height: hp(12),
        borderRadius: wp(6),
        backgroundColor: colors.alert,
        zIndex: 9999,
    },
});
