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
import {
    GestureHandlerRootView,
    PanGestureHandler,
} from "react-native-gesture-handler";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import Video, { VideoRef } from "react-native-video";

export default function VideoDetailsScreen() {
    const { videoId } = useLocalSearchParams<{ videoId: string }>();
    const videoRef = useRef<VideoRef>(null);

    // Video state management
    const [isPlaying, setIsPlaying] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isSeeking, setIsSeeking] = useState(false);
    const [dragStartTime, setDragStartTime] = useState(0);
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
            if (isPlaying && !isSeeking) {
                controlsOpacity.value = withTiming(0, { duration: 300 });
                setShowControls(false);
            }
        }, 3000);
    }, [isPlaying, isSeeking, controlsOpacity]);

    // Show controls and restart timer
    const showControlsAndStartTimer = useCallback(() => {
        controlsOpacity.value = withTiming(1, { duration: 300 });
        setShowControls(true);
        startHideTimer();
    }, [controlsOpacity, startHideTimer]);

    // Clear timer on unmount
    useEffect(() => {
        return () => {
            if (hideControlsTimeoutRef.current) {
                clearTimeout(hideControlsTimeoutRef.current);
            }
        };
    }, []);

    // Progress bar animation values
    const screenWidth = Dimensions.get("window").width;
    const progressBarWidth = screenWidth; // Full screen width

    // Use placeholder video for testing, or you can implement logic to get actual video URL
    const videoSource =
        videoId === "placeholder-local-tab"
            ? require("@/assets/videos/broadchurch.mp4")
            : null;

    // Handle play/pause/replay functionality
    const handlePlayPause = () => {
        if (isFinished) {
            // Replay video from beginning
            videoRef.current?.seek(0);
            setIsFinished(false);
            setIsPlaying(true);
        } else {
            setIsPlaying(!isPlaying);
        }
        showControlsAndStartTimer();
    };

    // Handle video events
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
        if (!isSeeking) {
            setCurrentTime(data.currentTime);
        }
    };

    // Start auto-hide timer when video starts playing
    useEffect(() => {
        if (isPlaying && showControls) {
            startHideTimer();
        }
    }, [isPlaying, showControls, startHideTimer]);

    // Seek to specific time
    const seekTo = (time: number) => {
        videoRef.current?.seek(time);
        setCurrentTime(time);
    };

    // Calculate progress percentage
    const getProgress = () => {
        return duration > 0 ? currentTime / duration : 0;
    };

    // Calculate thumb position
    const getThumbPosition = () => {
        return getProgress() * progressBarWidth;
    };

    // Animated styles
    const controlsAnimatedStyle = useAnimatedStyle(() => ({
        opacity: controlsOpacity.value,
    }));

    // Extracted components
    const PlayButton = () => (
        <Animated.View style={[styles.controlsOverlay, controlsAnimatedStyle]}>
            <TouchableOpacity
                style={styles.playButton}
                onPress={handlePlayPause}
                activeOpacity={0.8}
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
            <PanGestureHandler
                onGestureEvent={handleThumbDrag}
                onHandlerStateChange={(event) => {
                    const { state } = event.nativeEvent;
                    if (state === 2) {
                        // BEGAN
                        handleThumbDragStart();
                    } else if (state === 5) {
                        // END
                        handleThumbDragEnd();
                    }
                }}
            >
                <View
                    style={[
                        styles.progressThumb,
                        {
                            transform: [
                                {
                                    translateX: getThumbPosition(),
                                },
                            ],
                        },
                    ]}
                />
            </PanGestureHandler>
        </Animated.View>
    );

    // Handle progress bar tap
    const handleProgressBarPress = (event: any) => {
        const { locationX } = event.nativeEvent;
        const progress = Math.max(0, Math.min(locationX / progressBarWidth, 1));
        const newTime = progress * duration;
        seekTo(newTime);
        showControlsAndStartTimer();
    };

    // Handle thumb drag start
    const handleThumbDragStart = () => {
        setIsSeeking(true);
        setDragStartTime(currentTime);
        showControlsAndStartTimer();
    };

    // Handle thumb drag
    const handleThumbDrag = (event: any) => {
        const { translationX } = event.nativeEvent;
        // Convert translation to time change (more natural feeling)
        const timeChange = (translationX / progressBarWidth) * duration;
        const newTime = Math.max(
            0,
            Math.min(dragStartTime + timeChange, duration)
        );
        setCurrentTime(newTime);
    };

    // Handle thumb drag end
    const handleThumbDragEnd = () => {
        seekTo(currentTime);
        setIsSeeking(false);
        setDragStartTime(0);
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
    progressThumb: {
        position: "absolute",
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: "#FF0000",
        borderWidth: 1,
        borderColor: "white",
        top: -4,
        left: -6,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.3,
        shadowRadius: 1,
        elevation: 2,
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
