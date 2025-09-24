import FullscreenIcon from "@/assets/images/svg/fullscreen.svg";
import LeftArrowIcon from "@/assets/images/svg/left-arrow.svg";
import MuteIcon from "@/assets/images/svg/mute.svg";
import { colors } from "@/constants/colors";
import { hp, wp } from "@/utils/responsive";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Animated from "react-native-reanimated";

export type ControlButtonType = "back" | "mute" | "fullscreen";

interface ControlButtonProps {
    type: ControlButtonType;
    showControls: boolean;
    controlsAnimatedStyle: any;
    onPress: () => void;
    isMuted?: boolean;
}

export const ControlButton: React.FC<ControlButtonProps> = ({
    type,
    showControls,
    controlsAnimatedStyle,
    onPress,
    isMuted = false,
}) => {
    const renderIcon = () => {
        switch (type) {
            case "back":
                return (
                    <LeftArrowIcon
                        width={wp(20)}
                        height={hp(20)}
                        stroke="white"
                    />
                );
            case "mute":
                return isMuted ? (
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
                );
            case "fullscreen":
                return (
                    <FullscreenIcon
                        width={wp(16)}
                        height={hp(16)}
                        stroke="white"
                    />
                );
            default:
                return null;
        }
    };

    const getContainerStyle = () => {
        switch (type) {
            case "back":
                return styles.backButtonContainer;
            case "mute":
                return styles.muteButtonContainer;
            case "fullscreen":
                return styles.fullscreenButtonContainer;
            default:
                return {};
        }
    };

    const getButtonStyle = () => {
        switch (type) {
            case "back":
            case "mute":
                return styles.standardButton;
            case "fullscreen":
                return styles.fullscreenButton;
            default:
                return {};
        }
    };

    const getButtonSize = () => {
        switch (type) {
            case "fullscreen":
                return { width: wp(48), height: hp(48), borderRadius: wp(24) };
            default:
                return { width: wp(40), height: hp(40), borderRadius: wp(20) };
        }
    };

    return (
        <Animated.View
            style={[getContainerStyle(), controlsAnimatedStyle]}
            pointerEvents={showControls ? "auto" : "none"}
        >
            <TouchableOpacity
                style={[getButtonStyle(), getButtonSize()]}
                onPress={onPress}
                activeOpacity={0.6}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                {renderIcon()}
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    backButtonContainer: {
        position: "absolute",
        top: hp(12),
        left: wp(12),
        zIndex: 10,
    },
    muteButtonContainer: {
        position: "absolute",
        top: hp(12),
        right: wp(60),
        zIndex: 10,
    },
    fullscreenButtonContainer: {
        position: "absolute",
        bottom: hp(6),
        right: wp(6),
        zIndex: 10,
    },
    standardButton: {
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
    fullscreenButton: {
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
