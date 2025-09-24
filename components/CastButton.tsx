import AirplayIcon from "@/assets/images/svg/airplay.svg";
import { colors } from "@/constants/colors";
import { hp, spacing, wp } from "@/utils/responsive";
import React from "react";
import {
    Alert,
    Platform,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import { CastButton as GoogleCastButton } from "react-native-google-cast";
import Animated from "react-native-reanimated";

interface CastButtonProps {
    showControls: boolean;
    controlsAnimatedStyle: any;
    onShowControls: () => void;
}

export const CastButton: React.FC<CastButtonProps> = ({
    showControls,
    controlsAnimatedStyle,
    onShowControls,
}) => {
    const handleCast = () => {
        if (Platform.OS === "ios") {
            // For iOS, show AirPlay instructions since Google Cast might not work properly
            Alert.alert(
                "AirPlay",
                "To cast this video on iOS:\n\n1. Swipe down from top-right corner\n2. Tap the AirPlay button in Control Center\n3. Select your Apple TV or AirPlay device\n\nMake sure your device and TV are on the same Wi-Fi network.",
                [{ text: "Got it!" }]
            );
        }
        onShowControls();
    };

    return (
        <Animated.View
            style={[styles.airplayButtonContainer, controlsAnimatedStyle]}
            pointerEvents={showControls ? "auto" : "none"}
        >
            {Platform.OS === "ios" ? (
                <TouchableOpacity
                    style={styles.airplayButton}
                    onPress={handleCast}
                    activeOpacity={0.6}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <AirplayIcon
                        width={wp(20)}
                        height={hp(20)}
                        stroke="white"
                    />
                </TouchableOpacity>
            ) : (
                <View style={styles.airplayButton}>
                    <AirplayIcon
                        width={wp(20)}
                        height={hp(20)}
                        stroke="white"
                    />
                    <GoogleCastButton style={styles.invisibleCastButton} />
                </View>
            )}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    airplayButtonContainer: {
        position: "absolute",
        top: hp(12),
        right: wp(12),
        zIndex: 10,
    },
    airplayButton: {
        width: wp(40),
        height: wp(40),
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
    invisibleCastButton: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0,
    },
});
