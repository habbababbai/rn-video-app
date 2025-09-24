import PersonIcon from "@/assets/images/svg/person.svg";
import { BackButton } from "@/components/BackButton";
import { CastButton } from "@/components/CastButton";
import { DetailsTab } from "@/components/DetailsTab";
import { FullscreenButton } from "@/components/FullscreenButton";
import { MuteButton } from "@/components/MuteButton";
import { NotesTab } from "@/components/NotesTab";
import { PlayButton } from "@/components/PlayButton";
import { ProgressBar } from "@/components/ProgressBar";
import { TimerDisplay } from "@/components/TimerDisplay";
import { colors } from "@/constants/colors";
import { fonts } from "@/constants/fonts";
import { useYouTubeVideoDetails } from "@/hooks/useYouTubeApi";
import { fp, hp, spacing, wp } from "@/utils/responsive";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    Dimensions,
    Keyboard,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
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

    const {
        data: videoDetails,
        isLoading,
        error,
    } = useYouTubeVideoDetails(videoId || "");

    const videoRef = useRef<VideoRef>(null);
    const insets = useSafeAreaInsets();
    const hideControlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
        null
    );
    const lastProgressUpdateRef = useRef(0);

    const [isPlaying, setIsPlaying] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [showControls, setShowControls] = useState(true);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [activeTab, setActiveTab] = useState<"details" | "notes">("details");

    const keyboardHeight = useSharedValue(0);
    const controlsOpacity = useSharedValue(1);

    const videoSource = { uri: require("@/assets/videos/broadchurch.mp4") };
    const shouldShowRealData =
        videoId !== "placeholder-local-tab" && !error && !!videoDetails;

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: -keyboardHeight.value }],
        };
    });

    const controlsAnimatedStyle = useAnimatedStyle(() => ({
        opacity: controlsOpacity.value,
    }));

    useEffect(() => {
        const showEvent =
            Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
        const hideEvent =
            Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

        const keyboardShow = Keyboard.addListener(showEvent, (event) => {
            keyboardHeight.value = withTiming(event.endCoordinates.height, {
                duration: Platform.OS === "ios" ? event.duration || 250 : 250,
            });
        });

        const keyboardHide = Keyboard.addListener(hideEvent, (event) => {
            keyboardHeight.value = withTiming(0, {
                duration: Platform.OS === "ios" ? event.duration || 250 : 250,
            });
        });

        return () => {
            keyboardShow.remove();
            keyboardHide.remove();
        };
    }, [keyboardHeight]);

    useEffect(() => {
        return () => {
            if (hideControlsTimeoutRef.current) {
                clearTimeout(hideControlsTimeoutRef.current);
            }
            ScreenOrientation.unlockAsync();
        };
    }, []);

    const dismissKeyboard = useCallback(() => {
        Keyboard.dismiss();
    }, []);

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

    const getProgressBarWidth = () => {
        const { width, height } = Dimensions.get("window");
        // In fullscreen (landscape), use the larger dimension
        return isFullscreen ? Math.max(width, height) : width;
    };

    const getProgress = () => {
        return duration > 0 ? currentTime / duration : 0;
    };

    const getThumbPosition = () => {
        return getProgress() * getProgressBarWidth();
    };

    const seekTo = (time: number) => {
        videoRef.current?.seek(time);
        setCurrentTime(time);
    };

    const handleBeginInputFocus = () => {
        if (isPlaying) {
            setIsPlaying(false);
        }
        showControlsAndStartTimer();
    };

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
        const current = data.currentTime as number;
        if (
            current - lastProgressUpdateRef.current >= 0.25 ||
            current < lastProgressUpdateRef.current
        ) {
            lastProgressUpdateRef.current = current;
            setCurrentTime(current);
        }
    };

    const seekBackward = () => {
        const newTime = Math.max(0, currentTime - 5);
        seekTo(newTime);
        showControlsAndStartTimer();
    };

    const seekForward = () => {
        const newTime = Math.min(duration, currentTime + 5);
        seekTo(newTime);
        showControlsAndStartTimer();
    };

    const handleProgressBarPress = (event: any) => {
        const { locationX } = event.nativeEvent;
        const progress = Math.max(
            0,
            Math.min(locationX / getProgressBarWidth(), 1)
        );
        const newTime = progress * duration;
        seekTo(newTime);
        showControlsAndStartTimer();
    };

    return (
        <Animated.View
            style={[
                styles.container,
                { paddingTop: insets.top },
                animatedStyle,
            ]}
        >
            <TouchableWithoutFeedback onPress={dismissKeyboard}>
                <GestureHandlerRootView style={{ flex: 1 }}>
                    <Stack.Screen
                        options={{
                            headerShown: false,
                        }}
                    />
                    <StatusBar style="light" />

                    {videoSource ? (
                        <View
                            style={[
                                styles.videoContainer,
                                isFullscreen && styles.fullscreenVideoContainer,
                            ]}
                        >
                            <Video
                                ref={videoRef}
                                source={videoSource}
                                style={styles.video}
                                controls={false}
                                resizeMode="contain"
                                paused={!isPlaying}
                                muted={isMuted}
                                progressUpdateInterval={500}
                                allowsExternalPlayback={true}
                                {...(Platform.OS === "android"
                                    ? {
                                          useTextureView: false,
                                      }
                                    : {})}
                                onError={handleVideoError}
                                onLoad={(data) => {
                                    console.log("Video Loaded:", data);
                                    setIsFinished(false);
                                    setDuration(data.duration);
                                    setCurrentTime(0);
                                }}
                                onEnd={handleVideoEnd}
                                onProgress={handleVideoProgress}
                            />

                            <TouchableWithoutFeedback
                                onPress={showControlsAndStartTimer}
                            >
                                <View style={styles.videoTouchOverlay} />
                            </TouchableWithoutFeedback>
                            <PlayButton
                                isPlaying={isPlaying}
                                isFinished={isFinished}
                                showControls={showControls}
                                controlsAnimatedStyle={controlsAnimatedStyle}
                                onPlayPause={handlePlayPause}
                                onSeekBackward={seekBackward}
                                onSeekForward={seekForward}
                            />
                            <ProgressBar
                                showControls={showControls}
                                controlsAnimatedStyle={controlsAnimatedStyle}
                                thumbPosition={getThumbPosition()}
                                onProgressBarPress={handleProgressBarPress}
                            />
                            <TimerDisplay
                                currentTime={currentTime}
                                duration={duration}
                                showControls={showControls}
                                controlsAnimatedStyle={controlsAnimatedStyle}
                            />
                            <BackButton
                                showControls={showControls}
                                controlsAnimatedStyle={controlsAnimatedStyle}
                                onBack={async () => {
                                    if (isFullscreen) {
                                        await ScreenOrientation.unlockAsync();
                                        await new Promise((resolve) =>
                                            setTimeout(resolve, 100)
                                        );
                                    }
                                    router.back();
                                }}
                            />
                            <CastButton
                                showControls={showControls}
                                controlsAnimatedStyle={controlsAnimatedStyle}
                                onShowControls={showControlsAndStartTimer}
                            />
                            <MuteButton
                                isMuted={isMuted}
                                showControls={showControls}
                                controlsAnimatedStyle={controlsAnimatedStyle}
                                onMute={() => {
                                    setIsMuted(!isMuted);
                                    showControlsAndStartTimer();
                                }}
                            />
                            <FullscreenButton
                                showControls={showControls}
                                controlsAnimatedStyle={controlsAnimatedStyle}
                                onFullscreen={async () => {
                                    const newFullscreenState = !isFullscreen;
                                    setIsFullscreen(newFullscreenState);

                                    if (newFullscreenState) {
                                        await ScreenOrientation.lockAsync(
                                            ScreenOrientation.OrientationLock
                                                .LANDSCAPE
                                        );
                                    } else {
                                        await ScreenOrientation.unlockAsync();
                                    }

                                    showControlsAndStartTimer();
                                }}
                            />
                        </View>
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
                        <Text numberOfLines={1} style={styles.title}>
                            {shouldShowRealData
                                ? videoDetails.snippet.title
                                : "Placeholder Video Name"}
                        </Text>
                        <View style={styles.channelDetailsContainer}>
                            <View style={styles.accountIconContainer}>
                                <PersonIcon
                                    width={wp(24)}
                                    height={hp(24)}
                                    fill="white"
                                />
                            </View>
                            <Text style={styles.channelName}>
                                {shouldShowRealData
                                    ? videoDetails.snippet.channelTitle
                                    : "ITV Drama"}
                            </Text>
                        </View>

                        <View style={styles.tabBar}>
                            <TouchableOpacity
                                style={[
                                    styles.tabButton,
                                    activeTab === "details" &&
                                        styles.activeTabButton,
                                ]}
                                onPress={() => setActiveTab("details")}
                            >
                                <Text style={[styles.tabText]}>Details</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.tabButton,
                                    activeTab === "notes" &&
                                        styles.activeTabButton,
                                ]}
                                onPress={() => setActiveTab("notes")}
                            >
                                <Text style={[styles.tabText]}>Notes</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.tabContent}>
                            {activeTab === "details" ? (
                                <DetailsTab
                                    videoDetails={videoDetails}
                                    shouldShowRealData={shouldShowRealData}
                                    videoId={videoId}
                                    isLoading={isLoading}
                                    error={error}
                                />
                            ) : (
                                <NotesTab
                                    videoId={videoId}
                                    currentTime={currentTime}
                                    onBeginInputFocus={handleBeginInputFocus}
                                />
                            )}
                        </View>
                    </View>
                </GestureHandlerRootView>
            </TouchableWithoutFeedback>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    accountIconContainer: {
        backgroundColor: colors.primary,
        height: fp(48),
        width: fp(48),
        borderRadius: fp(24),
        justifyContent: "center",
        alignItems: "center",
        marginHorizontal: wp(10),
    },
    channelDetailsContainer: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        width: "100%",
        paddingTop: spacing.xs,
    },
    channelName: {
        fontFamily: fonts.poppinsBold,
        fontSize: fp(14),
        color: colors.primary,
        letterSpacing: wp(0.5),
        fontWeight: "700",
    },
    tabBar: {
        flexDirection: "row",
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray.light,
        paddingTop: spacing.xs,
    },
    tabButton: {
        flex: 1,
        paddingVertical: spacing.xs,
        alignItems: "center",
        borderBottomWidth: 2,
        borderBottomColor: "transparent",
    },
    activeTabButton: {
        borderBottomColor: colors.primary,
    },
    tabText: {
        fontSize: fp(12),
        fontFamily: fonts.poppinsSemiBold,
        color: colors.primary,
        fontWeight: "600",
    },

    tabContent: {
        flex: 1,
        paddingTop: hp(15),
        width: "100%",
    },
    container: {
        flex: 1,
        backgroundColor: colors.black,
    },
    videoContainer: {
        width: "100%",
        height: hp(280),
        backgroundColor: colors.black,
        position: "relative",
        overflow: "visible",
        zIndex: 1000,
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
    placeholderContainer: {
        width: "100%",
        aspectRatio: 16 / 9,
        backgroundColor: colors.gray.light,
        justifyContent: "center",
        alignItems: "center",
    },
    placeholderText: {
        fontSize: fp(16),
        color: colors.gray.medium,
        textAlign: "center",
    },
    detailsContainer: {
        flex: 1,
        paddingHorizontal: wp(15),
        paddingVertical: hp(20),
        justifyContent: "flex-start",
        alignItems: "center",
        backgroundColor: colors.white,
    },
    fullscreenDetailsContainer: {
        display: "none",
    },
    title: {
        fontSize: fp(18),
        fontFamily: fonts.poppinsSemiBold,
        fontWeight: "600",
        marginBottom: hp(10),
        color: colors.gray.dark,
        letterSpacing: wp(0.5),
    },
    videoTouchOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "transparent",
        zIndex: 1,
    },
});
