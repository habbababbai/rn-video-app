import MuteIcon from "@/assets/images/svg/mute.svg";
import { colors } from "@/constants/colors";
import { hp, wp } from "@/utils/responsive";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Animated from "react-native-reanimated";

interface MuteButtonProps {
    isMuted: boolean;
    showControls: boolean;
    controlsAnimatedStyle: any;
    onMute: () => void;
}

export const MuteButton: React.FC<MuteButtonProps> = ({
    isMuted,
    showControls,
    controlsAnimatedStyle,
    onMute,
}) => {
    return (
        <Animated.View
            style={[styles.muteButtonContainer, controlsAnimatedStyle]}
            pointerEvents={showControls ? "auto" : "none"}
        >
            <TouchableOpacity
                style={styles.muteButton}
                onPress={onMute}
                activeOpacity={0.6}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                {isMuted ? (
                    <View style={styles.unmuteIconContainer}>
                        <MuteIcon
                            width={wp(16)}
                            height={hp(16)}
                            stroke="white"
                        />
                        <View style={styles.unmuteCrossLine} />
                    </View>
                ) : (
                    <MuteIcon width={wp(16)} height={hp(16)} stroke="white" />
                )}
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    muteButtonContainer: {
        position: "absolute",
        top: hp(12),
        right: wp(60),
        zIndex: 10,
    },
    muteButton: {
        width: wp(40),
        height: hp(40),
        borderRadius: wp(20),
        backgroundColor: colors.overlay.dark,
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
    unmuteIconContainer: {
        position: "relative",
        width: wp(16),
        height: hp(16),
    },
    unmuteCrossLine: {
        position: "absolute",
        top: "50%",
        left: "50%",
        width: wp(20),
        height: hp(2),
        backgroundColor: colors.white,
        transform: [{ rotate: "45deg" }, { translateX: -wp(10) }],
    },
});
