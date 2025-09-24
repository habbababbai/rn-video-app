import { colors } from "@/constants/colors";
import { fp, hp, wp } from "@/utils/responsive";
import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, Pressable, StyleSheet } from "react-native";

type ToggleSwitchProps = {
    value: boolean;
    onValueChange: (value: boolean) => void;
    disabled?: boolean;
};

const TRACK_WIDTH = wp(66);
const TRACK_HEIGHT = hp(36);
const TRACK_RADIUS = TRACK_HEIGHT / 2;
const PADDING = 2;
const THUMB_SIZE = fp(28);
const TRAVEL_DISTANCE = TRACK_WIDTH - THUMB_SIZE - PADDING * 2;

export default function ToggleSwitch({
    value,
    onValueChange,
    disabled = false,
}: ToggleSwitchProps) {
    const progress = useRef(new Animated.Value(value ? 1 : 0)).current;

    useEffect(() => {
        Animated.timing(progress, {
            toValue: value ? 1 : 0,
            duration: 160,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
        }).start();
    }, [value, progress]);

    const thumbTranslateX = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, TRAVEL_DISTANCE],
    });

    const trackBackground = useMemo(
        () => (value ? colors.primary : colors.gray.light),
        [value]
    );

    const handlePress = () => {
        if (disabled) return;
        onValueChange(!value);
    };

    return (
        <Pressable
            onPress={handlePress}
            accessibilityRole="switch"
            accessibilityState={{ checked: value, disabled }}
            style={[
                styles.track,
                {
                    backgroundColor: trackBackground,
                    opacity: disabled ? 0.6 : 1,
                },
            ]}
        >
            <Animated.View
                style={[
                    styles.thumb,
                    {
                        transform: [{ translateX: thumbTranslateX }],
                    },
                ]}
            />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    track: {
        width: TRACK_WIDTH,
        height: TRACK_HEIGHT,
        borderRadius: TRACK_RADIUS,
        padding: PADDING,
        justifyContent: "center",
    },
    thumb: {
        width: THUMB_SIZE,
        height: THUMB_SIZE,
        borderRadius: THUMB_SIZE / 2,
        backgroundColor: colors.white,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 1.5,
        elevation: 2,
    },
});
