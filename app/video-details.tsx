import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import Video, { VideoRef } from "react-native-video";

export default function VideoDetailsScreen() {
    const { videoId } = useLocalSearchParams<{ videoId: string }>();
    const videoRef = useRef<VideoRef>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [showControls, setShowControls] = useState(true);

    // Auto-hide controls
    const hideControlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
        null
    );
    const controlsOpacity = useSharedValue(1);

    // Auto-hide timer
    const startHideTimer = useCallback(() => {
        if (hideControlsTimeoutRef.current) {
            clearTimeout(hideControlsTimeoutRef.current);
        }
        hideControlsTimeoutRef.current = setTimeout(() => {
            if (isPlaying) {
                controlsOpacity.value = withTiming(0, { duration: 300 });
                setShowControls(false);
            }
        }, 3000);
    }, [isPlaying, controlsOpacity]);

    const showControlsAndStartTimer = useCallback(() => {
        controlsOpacity.value = withTiming(1, { duration: 300 });
        setShowControls(true);
        startHideTimer();
    }, [controlsOpacity, startHideTimer]);

    useEffect(() => {
        return () => {
            if (hideControlsTimeoutRef.current) {
                clearTimeout(hideControlsTimeoutRef.current);
            }
        };
    }, []);

    const screenWidth = Dimensions.get("window").width;
    const progressBarWidth = screenWidth; // Full screen width

    const videoSource = require("@/assets/videos/broadchurch.mp4");

    const handlePlayPause = () => {
        if (isFinished) {
            videoRef.current?.seek(0);
            setIsFinished(false);
            setIsPlaying(true);
        } else {
            setIsPlaying(!isPlaying);
        }
        showControlsAndStartTimer();
    };

    const handleVideoLoad = (data: any) => {
        console.log("Video Loaded:", data);
        setIsFinished(false);
        setDuration(data.duration);
    };

    const handleVideoEnd = () => {
        setIsPlaying(false);
        setIsFinished(true);
        setCurrentTime(duration);
        console.log("Video finished");
    };

    const handleVideoError = (error: any) => {
        console.log("Video Error:", error);
    };

    const handleVideoProgress = (data: any) => {
        setCurrentTime(data.currentTime);
    };

    useEffect(() => {
        if (isPlaying && showControls) {
            startHideTimer();
        }
    }, [isPlaying, showControls, startHideTimer]);

    const seekTo = (time: number) => {
        videoRef.current?.seek(time);
        setCurrentTime(time);
    };

    // Seek backward by 5 seconds
    const seekBackward = () => {
        const newTime = Math.max(0, currentTime - 5);
        seekTo(newTime);
        showControlsAndStartTimer();
    };

    // Seek forward by 5 seconds
    const seekForward = () => {
        const newTime = Math.min(duration, currentTime + 5);
        seekTo(newTime);
        showControlsAndStartTimer();
    };

    const getProgress = () => {
        return duration > 0 ? currentTime / duration : 0;
    };

    const getThumbPosition = () => {
        return getProgress() * progressBarWidth;
    };

    const controlsAnimatedStyle = useAnimatedStyle(() => ({
        opacity: controlsOpacity.value,
    }));

    const PlayButton = () => (
        <Animated.View style={[styles.controlsOverlay, controlsAnimatedStyle]}>
            <View style={styles.controlsRow}>
                {/* Backward Button */}
                <TouchableOpacity
                    style={styles.seekButton}
                    onPress={seekBackward}
                    activeOpacity={0.6}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <MaterialIcons name="replay-5" size={36} color="white" />
                </TouchableOpacity>

                {/* Play/Pause Button */}
                <TouchableOpacity
                    style={styles.playButton}
                    onPress={handlePlayPause}
                    activeOpacity={0.6}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <MaterialIcons
                        name={
                            isFinished
                                ? "replay"
                                : isPlaying
                                ? "pause"
                                : "play-arrow"
                        }
                        size={64}
                        color="white"
                    />
                </TouchableOpacity>

                {/* Forward Button */}
                <TouchableOpacity
                    style={styles.seekButton}
                    onPress={seekForward}
                    activeOpacity={0.6}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <MaterialIcons name="forward-5" size={36} color="white" />
                </TouchableOpacity>
            </View>
        </Animated.View>
    );

    const ProgressBar = () => (
        <Animated.View
            style={[styles.progressBarContainer, controlsAnimatedStyle]}
        >
            <TouchableOpacity
                style={styles.progressBarBackground}
                onPress={handleProgressBarPress}
                activeOpacity={0.8}
            >
                <View
                    style={[
                        styles.progressBarFill,
                        { width: getThumbPosition() },
                    ]}
                />
            </TouchableOpacity>
        </Animated.View>
    );

    // Format time helper function
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const TimerDisplay = () => (
        <Animated.View style={[styles.timerContainer, controlsAnimatedStyle]}>
            <Text style={styles.timerText}>
                {formatTime(currentTime)} / {formatTime(duration)}
            </Text>
        </Animated.View>
    );

    const handleProgressBarPress = (event: any) => {
        const { locationX } = event.nativeEvent;
        const progress = Math.max(0, Math.min(locationX / progressBarWidth, 1));
        const newTime = progress * duration;
        seekTo(newTime);
        showControlsAndStartTimer();
    };

    return (
        <GestureHandlerRootView style={styles.container}>
            <Stack.Screen
                options={{
                    title: "Video Details",
                    headerShown: true,
                }}
            />

            {videoSource ? (
                <TouchableOpacity
                    style={styles.videoContainer}
                    onPress={showControlsAndStartTimer}
                    activeOpacity={1}
                >
                    <Video
                        ref={videoRef}
                        source={videoSource}
                        style={styles.video}
                        controls={false}
                        resizeMode="contain"
                        paused={!isPlaying}
                        onError={handleVideoError}
                        onLoad={handleVideoLoad}
                        onEnd={handleVideoEnd}
                        onProgress={handleVideoProgress}
                    />

                    <PlayButton />
                    <ProgressBar />
                    <TimerDisplay />
                </TouchableOpacity>
            ) : (
                <View style={styles.placeholderContainer}>
                    <Text style={styles.placeholderText}>
                        Video not available for ID: {videoId}
                    </Text>
                </View>
            )}

            <View style={styles.detailsContainer}>
                <Text style={styles.title}>Video Details</Text>
                <Text style={styles.subtitle}>
                    Video ID: {videoId || "No ID provided"}
                </Text>
                <Text style={styles.placeholder}>
                    This screen will contain video details, player, and related
                    content.
                </Text>
            </View>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    videoContainer: {
        width: "100%",
        aspectRatio: 16 / 9,
        backgroundColor: "#000",
        position: "relative",
    },
    video: {
        width: "100%",
        height: "100%",
    },
    controlsOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.1)",
    },
    controlsRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 30,
    },
    playButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    seekButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        // Increase touch area
        minWidth: 60,
        minHeight: 60,
    },
    progressBarContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 4,
        justifyContent: "center",
    },
    progressBarBackground: {
        height: 4,
        backgroundColor: "rgba(255, 255, 255, 0.3)",
        position: "relative",
    },
    progressBarFill: {
        height: 4,
        backgroundColor: "#FF0000",
        position: "absolute",
        left: 0,
        top: 0,
    },
    timerContainer: {
        position: "absolute",
        bottom: 8,
        left: 12,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    timerText: {
        color: "white",
        fontSize: 12,
        fontWeight: "500",
        fontFamily: "monospace",
    },
    placeholderContainer: {
        width: "100%",
        aspectRatio: 16 / 9,
        backgroundColor: "#f0f0f0",
        justifyContent: "center",
        alignItems: "center",
    },
    placeholderText: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
    },
    detailsContainer: {
        flex: 1,
        padding: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 10,
        color: "#333",
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 20,
        color: "#666",
    },
    placeholder: {
        fontSize: 14,
        textAlign: "center",
        color: "#999",
        lineHeight: 20,
    },
});
