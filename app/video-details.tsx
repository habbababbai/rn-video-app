import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    Dimensions,
    StatusBar,
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Video, { VideoRef } from "react-native-video";

export default function VideoDetailsScreen() {
    const { videoId } = useLocalSearchParams<{ videoId: string }>();
    const router = useRouter();
    const videoRef = useRef<VideoRef>(null);
    const insets = useSafeAreaInsets();

    const [isPlaying, setIsPlaying] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [showControls, setShowControls] = useState(true);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

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
            // Restore orientation when component unmounts
            ScreenOrientation.unlockAsync();
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

    const BackButton = () => (
        <Animated.View
            style={[styles.backButtonContainer, controlsAnimatedStyle]}
        >
            <TouchableOpacity
                style={styles.backButton}
                onPress={async () => {
                    // Restore orientation first, then navigate back
                    if (isFullscreen) {
                        await ScreenOrientation.unlockAsync();
                        // Wait a moment for orientation change to complete
                        await new Promise((resolve) =>
                            setTimeout(resolve, 100)
                        );
                    }
                    router.back();
                }}
                activeOpacity={0.6}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <MaterialIcons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
        </Animated.View>
    );

    const FullscreenButton = () => (
        <Animated.View
            style={[styles.fullscreenButtonContainer, controlsAnimatedStyle]}
        >
            <TouchableOpacity
                style={styles.fullscreenButton}
                onPress={async () => {
                    const newFullscreenState = !isFullscreen;
                    setIsFullscreen(newFullscreenState);

                    if (newFullscreenState) {
                        // Enter fullscreen - lock to landscape
                        await ScreenOrientation.lockAsync(
                            ScreenOrientation.OrientationLock.LANDSCAPE
                        );
                    } else {
                        // Exit fullscreen - unlock to portrait
                        await ScreenOrientation.unlockAsync();
                    }

                    showControlsAndStartTimer();
                }}
                activeOpacity={0.6}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <MaterialIcons
                    name={isFullscreen ? "fullscreen-exit" : "fullscreen"}
                    size={24}
                    color="white"
                />
            </TouchableOpacity>
        </Animated.View>
    );

    const MuteButton = () => (
        <Animated.View
            style={[styles.muteButtonContainer, controlsAnimatedStyle]}
        >
            <TouchableOpacity
                style={styles.muteButton}
                onPress={() => {
                    setIsMuted(!isMuted);
                    showControlsAndStartTimer();
                }}
                activeOpacity={0.6}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <MaterialIcons
                    name={isMuted ? "volume-off" : "volume-up"}
                    size={24}
                    color="white"
                />
            </TouchableOpacity>
        </Animated.View>
    );

    const AirplayButton = () => (
        <Animated.View
            style={[styles.airplayButtonContainer, controlsAnimatedStyle]}
        >
            <TouchableOpacity
                style={styles.airplayButton}
                onPress={() => {
                    // Airplay functionality
                    console.log("Airplay pressed");
                    showControlsAndStartTimer();
                }}
                activeOpacity={0.6}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <MaterialIcons name="airplay" size={24} color="white" />
            </TouchableOpacity>
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
        <GestureHandlerRootView
            style={[styles.container, { paddingTop: insets.top }]}
        >
            <Stack.Screen
                options={{
                    headerShown: false,
                }}
            />
            <StatusBar barStyle="light-content" backgroundColor="black" />

            {videoSource ? (
                <TouchableOpacity
                    style={[
                        styles.videoContainer,
                        isFullscreen && styles.fullscreenVideoContainer,
                    ]}
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
                        muted={isMuted}
                        onError={handleVideoError}
                        onLoad={handleVideoLoad}
                        onEnd={handleVideoEnd}
                        onProgress={handleVideoProgress}
                    />

                    <PlayButton />
                    <ProgressBar />
                    <TimerDisplay />
                    <BackButton />
                    <AirplayButton />
                    <MuteButton />
                    <FullscreenButton />
                </TouchableOpacity>
            ) : (
                <View style={styles.placeholderContainer}>
                    <Text style={styles.placeholderText}>
                        Video not available for ID: {videoId}
                    </Text>
                </View>
            )}

            <View
                style={[
                    styles.detailsContainer,
                    isFullscreen && styles.fullscreenDetailsContainer,
                ]}
            >
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
        backgroundColor: "#000",
    },
    videoContainer: {
        width: "100%",
        aspectRatio: 16 / 9,
        backgroundColor: "#000",
        position: "relative",
    },
    fullscreenVideoContainer: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100%",
        height: "100%",
        zIndex: 1000,
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
    backButtonContainer: {
        position: "absolute",
        top: 12,
        left: 12,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
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
    fullscreenButtonContainer: {
        position: "absolute",
        bottom: 12,
        right: 12,
    },
    fullscreenButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
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
    muteButtonContainer: {
        position: "absolute",
        top: 12,
        right: 12,
    },
    muteButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
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
    airplayButtonContainer: {
        position: "absolute",
        top: 12,
        right: 60,
    },
    airplayButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
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
        backgroundColor: "#fff",
    },
    fullscreenDetailsContainer: {
        display: "none",
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
