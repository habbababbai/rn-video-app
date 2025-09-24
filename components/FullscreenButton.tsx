import FullscreenIcon from "@/assets/images/svg/fullscreen.svg";
import { colors } from "@/constants/colors";
import { hp, wp } from "@/utils/responsive";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import Animated from "react-native-reanimated";

interface FullscreenButtonProps {
    showControls: boolean;
    controlsAnimatedStyle: any;
    onFullscreen: () => void;
}

export const FullscreenButton: React.FC<FullscreenButtonProps> = ({
    showControls,
    controlsAnimatedStyle,
    onFullscreen,
}) => {
    return (
        <Animated.View
            style={[styles.fullscreenButtonContainer, controlsAnimatedStyle]}
            pointerEvents={showControls ? "auto" : "none"}
        >
            <TouchableOpacity
                style={styles.fullscreenButton}
                onPress={onFullscreen}
                activeOpacity={0.6}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <FullscreenIcon width={wp(16)} height={hp(16)} stroke="white" />
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    fullscreenButtonContainer: {
        position: "absolute",
        bottom: hp(6),
        right: wp(6),
        zIndex: 10,
    },
    fullscreenButton: {
        width: wp(48),
        height: hp(48),
        borderRadius: wp(24),
        backgroundColor: "transparent",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: colors.black,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
});
