import LeftArrowIcon from "@/assets/images/svg/left-arrow.svg";
import { colors } from "@/constants/colors";
import { hp, wp } from "@/utils/responsive";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import Animated from "react-native-reanimated";

interface BackButtonProps {
    showControls: boolean;
    controlsAnimatedStyle: any;
    onBack: () => void;
}

export const BackButton: React.FC<BackButtonProps> = ({
    showControls,
    controlsAnimatedStyle,
    onBack,
}) => {
    return (
        <Animated.View
            style={[styles.backButtonContainer, controlsAnimatedStyle]}
            pointerEvents={showControls ? "auto" : "none"}
        >
            <TouchableOpacity
                style={styles.backButton}
                onPress={onBack}
                activeOpacity={0.6}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <LeftArrowIcon width={wp(20)} height={hp(20)} stroke="white" />
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
    backButton: {
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
});
