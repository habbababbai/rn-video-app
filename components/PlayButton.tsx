import BackwardIcon from "@/assets/images/svg/backward.svg";
import ForwardIcon from "@/assets/images/svg/forward.svg";
import PauseIcon from "@/assets/images/svg/pause.svg";
import PlayIcon from "@/assets/images/svg/play.svg";
import { colors } from "@/constants/colors";
import { hp, wp } from "@/utils/responsive";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, { AnimatedStyle } from "react-native-reanimated";

interface PlayButtonProps {
    isPlaying: boolean;
    isFinished: boolean;
    showControls: boolean;
    controlsAnimatedStyle: AnimatedStyle | any;
    onPlayPause: () => void;
    onSeekBackward: () => void;
    onSeekForward: () => void;
}

export const PlayButton: React.FC<PlayButtonProps> = ({
    isPlaying,
    isFinished,
    showControls,
    controlsAnimatedStyle,
    onPlayPause,
    onSeekBackward,
    onSeekForward,
}) => {
    return (
        <Animated.View
            style={[styles.controlsOverlay, controlsAnimatedStyle]}
            pointerEvents={showControls ? "auto" : "none"}
        >
            <View style={styles.controlsRow}>
                <TouchableOpacity
                    style={styles.seekButton}
                    onPress={onSeekBackward}
                    activeOpacity={0.6}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <BackwardIcon
                        width={wp(20)}
                        height={hp(20)}
                        stroke="white"
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.playButton}
                    onPress={onPlayPause}
                    activeOpacity={0.6}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    {isFinished ? (
                        <PlayIcon
                            width={wp(24)}
                            height={hp(24)}
                            stroke="white"
                        />
                    ) : isPlaying ? (
                        <PauseIcon
                            width={wp(24)}
                            height={hp(24)}
                            stroke="white"
                        />
                    ) : (
                        <PlayIcon
                            width={wp(24)}
                            height={hp(24)}
                            stroke="white"
                        />
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.seekButton}
                    onPress={onSeekForward}
                    activeOpacity={0.6}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <ForwardIcon
                        width={wp(20)}
                        height={hp(20)}
                        stroke="white"
                    />
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    controlsOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.1)",
        zIndex: 10,
    },
    controlsRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: wp(30),
    },
    playButton: {
        width: wp(50),
        height: hp(50),
        borderRadius: wp(25),
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
    seekButton: {
        width: wp(36),
        height: hp(36),
        borderRadius: wp(18),
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
