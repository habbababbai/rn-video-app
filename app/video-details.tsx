// Custom SVG icons imported
import AirplayIcon from "@/assets/images/svg/airplay.svg";
import BackwardIcon from "@/assets/images/svg/backward.svg";
import ForwardIcon from "@/assets/images/svg/forward.svg";
import FullscreenIcon from "@/assets/images/svg/fullscreen.svg";
import LeftArrowIcon from "@/assets/images/svg/left-arrow.svg";
import LikesIcon from "@/assets/images/svg/likes.svg";
import MuteIcon from "@/assets/images/svg/mute.svg";
import PauseIcon from "@/assets/images/svg/pause.svg";
import PersonIcon from "@/assets/images/svg/person.svg";
import PlayIcon from "@/assets/images/svg/play.svg";
import ViewsIcon from "@/assets/images/svg/views.svg";
import VideoNotes from "@/components/VideoNotes";
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
import {
    GestureHandlerRootView,
    ScrollView,
} from "react-native-gesture-handler";
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

    const [isPlaying, setIsPlaying] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [showControls, setShowControls] = useState(true);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [activeTab, setActiveTab] = useState<"details" | "notes">("details");
    const keyboardHeight = useSharedValue(0);
    const lastProgressUpdateRef = useRef(0);


    const videoSource = { uri: require("@/assets/videos/broadchurch.mp4") };

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

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: -keyboardHeight.value }],
        };
    });

    const dismissKeyboard = useCallback(() => {
        Keyboard.dismiss();
    }, []);

    const DetailsTab = () => {
        if (isLoading) {
            return (
                <View style={styles.descriptionContainer}>
                    <Text style={styles.descriptionText}>
                        Loading video details...
                    </Text>
                </View>
            );
        }

        if (error || !videoDetails) {
            return (
                <View style={styles.descriptionContainer}>
                    <Text style={styles.descriptionTitle}>Description</Text>
                    <Text style={styles.descriptionText} selectable={true}>
                        {videoId === "placeholder-local-tab"
                            ? "This is a placeholder video for testing purposes. Broadchurch is a British crime drama television series created and written by Chris Chibnall."
                            : "Failed to load video details. Please try again."}
                    </Text>
                    <Text style={styles.descriptionTitle}>Statistics</Text>
                    <View style={styles.statisticsContainer}>
                        <View style={styles.statisticsItem}>
                            <ViewsIcon
                                width={wp(20)}
                                height={hp(20)}
                                stroke="white"
                            />
                            <Text style={styles.statisticsText}>
                                {videoId === "placeholder-local-tab"
                                    ? "1.2M views"
                                    : "0 views"}
                            </Text>
                        </View>
                        <View style={styles.statisticsItem}>
                            <LikesIcon
                                width={wp(20)}
                                height={hp(20)}
                                stroke="white"
                            />
                            <Text style={styles.statisticsText}>
                                {videoId === "placeholder-local-tab"
                                    ? "45K likes"
                                    : "0 likes"}
                            </Text>
                        </View>
                    </View>
                </View>
            );
        }

        const formatNumber = (num: string) => {
            const number = parseInt(num);
            if (number >= 1000000) {
                return `${(number / 1000000).toFixed(1)}M`;
            } else if (number >= 1000) {
                return `${(number / 1000).toFixed(1)}K`;
            }
            return number.toString();
        };

        return (
            <ScrollView style={styles.descriptionContainer}>
                <Text style={styles.descriptionTitle}>Description</Text>
                <Text style={styles.descriptionText} selectable={true}>
                    {videoDetails.snippet.description ||
                        "No description available."}
                </Text>
                <Text style={styles.descriptionTitle}>Statistics</Text>
                <View style={styles.statisticsContainer}>
                    <View style={styles.statisticsItem}>
                        <ViewsIcon
                            width={wp(20)}
                            height={hp(20)}
                            stroke="white"
                        />
                        <Text style={styles.statisticsText}>
                            {formatNumber(videoDetails.statistics.viewCount)}{" "}
                            views
                        </Text>
                    </View>
                    <View style={styles.statisticsItem}>
                        <LikesIcon
                            width={wp(20)}
                            height={hp(20)}
                            stroke="white"
                        />
                        <Text style={styles.statisticsText}>
                            {formatNumber(videoDetails.statistics.likeCount)}{" "}
                            likes
                        </Text>
                    </View>
                </View>
            </ScrollView>
        );
    };

    const NotesTab = () => (
        <VideoNotes
            videoId={videoId}
            currentVideoTime={currentTime}
            onBeginInputFocus={() => {
                if (isPlaying) {
                    setIsPlaying(false);
                }
                showControlsAndStartTimer();
            }}
        />
    );

    const hideControlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
        null
    );
    const controlsOpacity = useSharedValue(1);

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
            ScreenOrientation.unlockAsync();
        };
    }, []);

    const getProgressBarWidth = () => {
        const { width, height } = Dimensions.get("window");
        // In fullscreen (landscape), use the larger dimension
        return isFullscreen ? Math.max(width, height) : width;
    };

    const shouldShowRealData =
        videoId !== "placeholder-local-tab" && !error && videoDetails;

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

    // handleVideoLoad is now handled inline in the Video component

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

    useEffect(() => {
        if (isPlaying && showControls) {
            startHideTimer();
        }
    }, [isPlaying, showControls, startHideTimer]);

    const seekTo = (time: number) => {
        videoRef.current?.seek(time);
        setCurrentTime(time);
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

    const getProgress = () => {
        return duration > 0 ? currentTime / duration : 0;
    };

    const getThumbPosition = () => {
        return getProgress() * getProgressBarWidth();
    };

    const controlsAnimatedStyle = useAnimatedStyle(() => ({
        opacity: controlsOpacity.value,
    }));

    const PlayButton = () => (
        <Animated.View
            style={[styles.controlsOverlay, controlsAnimatedStyle]}
            pointerEvents={showControls ? "auto" : "none"}
        >
            <View style={styles.controlsRow}>
                <TouchableOpacity
                    style={styles.seekButton}
                    onPress={seekBackward}
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
                    onPress={handlePlayPause}
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
                    onPress={seekForward}
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

    const ProgressBar = () => (
        <Animated.View
            style={[styles.progressBarContainer, controlsAnimatedStyle]}
            pointerEvents={showControls ? "auto" : "none"}
        >
            <TouchableOpacity
                style={styles.progressBarBackground}
                onPress={handleProgressBarPress}
                activeOpacity={0.8}
                hitSlop={{ top: hp(20), bottom: hp(20), left: 0, right: 0 }}
            >
                <View
                    style={[
                        styles.progressBarFill,
                        { width: getThumbPosition() },
                    ]}
                />
                <View
                    style={[
                        styles.progressBarThumb,
                        { left: getThumbPosition() - wp(6) },
                    ]}
                />
            </TouchableOpacity>
        </Animated.View>
    );

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const TimerDisplay = () => (
        <Animated.View
            style={[styles.timerContainer, controlsAnimatedStyle]}
            pointerEvents={showControls ? "auto" : "none"}
        >
            <Text style={styles.timerText}>
                {formatTime(currentTime)} / {formatTime(duration)}
            </Text>
        </Animated.View>
    );

    const BackButton = () => (
        <Animated.View
            style={[styles.backButtonContainer, controlsAnimatedStyle]}
            pointerEvents={showControls ? "auto" : "none"}
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
                <LeftArrowIcon width={wp(20)} height={hp(20)} stroke="white" />
            </TouchableOpacity>
        </Animated.View>
    );

    const FullscreenButton = () => (
        <Animated.View
            style={[styles.fullscreenButtonContainer, controlsAnimatedStyle]}
            pointerEvents={showControls ? "auto" : "none"}
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
                <FullscreenIcon width={wp(16)} height={hp(16)} stroke="white" />
            </TouchableOpacity>
        </Animated.View>
    );

    const MuteButton = () => (
        <Animated.View
            style={[styles.muteButtonContainer, controlsAnimatedStyle]}
            pointerEvents={showControls ? "auto" : "none"}
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

    const AirplayButton = () => (
        <Animated.View
            style={[styles.airplayButtonContainer, controlsAnimatedStyle]}
            pointerEvents={showControls ? "auto" : "none"}
        >
            <TouchableOpacity
                style={styles.airplayButton}
                onPress={() => {
                    console.log("Airplay pressed");
                    showControlsAndStartTimer();
                }}
                activeOpacity={0.6}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <AirplayIcon width={wp(20)} height={hp(20)} stroke="white" />
            </TouchableOpacity>
        </Animated.View>
    );

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
                            <PlayButton />
                            <ProgressBar />
                            <TimerDisplay />
                            <BackButton />
                            <AirplayButton />
                            <MuteButton />
                            <FullscreenButton />
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
                                <DetailsTab />
                            ) : (
                                <NotesTab />
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
    descriptionContainer: {
        flex: 1,
    },
    descriptionText: {
        fontSize: fp(12),
        fontFamily: fonts.poppins,
        color: colors.gray.dark,
        lineHeight: hp(12),
        fontWeight: "400",
        letterSpacing: wp(0.5),
        paddingBottom: spacing.xs,
    },
    descriptionTitle: {
        fontFamily: fonts.poppinsSemiBold,
        fontSize: fp(10),
        lineHeight: hp(12),
        color: colors.primary,
        fontWeight: "600",
        letterSpacing: wp(0.5),
        paddingVertical: spacing.xs,
    },
    notesContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    notesText: {
        fontSize: fp(14),
        fontFamily: fonts.poppins,
        color: colors.gray.medium,
        textAlign: "center",
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
    progressBarContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: hp(4),
        justifyContent: "center",
        overflow: "visible",
        zIndex: 10,
    },
    progressBarBackground: {
        height: hp(4),
        backgroundColor: colors.overlay.light,
        position: "relative",
        overflow: "visible",
    },
    progressBarFill: {
        height: hp(4),
        backgroundColor: colors.alert,
        position: "absolute",
        left: 0,
        top: 0,
    },
    progressBarThumb: {
        position: "absolute",
        top: hp(-4),
        width: wp(12),
        height: hp(12),
        borderRadius: wp(6),
        backgroundColor: colors.alert,
        zIndex: 9999,
    },
    statisticsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingTop: spacing.xs,
        paddingVertical: 2 * spacing.xxxl,
    },
    statisticsItem: {
        backgroundColor: colors.primary,
        width: wp(136),
        height: hp(32),
        borderRadius: fp(8),
        justifyContent: "flex-start",
        alignItems: "center",
        color: colors.white,
        flexDirection: "row",
        paddingHorizontal: wp(10),
    },
    statisticsText: {
        color: colors.white,
        width: "100%",
        flex: 1,
        textAlign: "center",
        fontFamily: fonts.poppins,
        fontWeight: "600",
        fontSize: fp(10),
        letterSpacing: wp(0.5),
    },
    timerContainer: {
        position: "absolute",
        bottom: hp(8),
        left: wp(12),
        backgroundColor: colors.overlay.timer,
        paddingHorizontal: wp(8),
        paddingVertical: hp(4),
        borderRadius: wp(4),
        zIndex: 10,
    },
    timerText: {
        color: colors.white,
        fontSize: fp(10),
        fontWeight: "500",
        fontFamily: fonts.poppinsMedium,
        letterSpacing: wp(0.5),
    },
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
    fullscreenButtonContainer: {
        position: "absolute",
        bottom: hp(6),
        right: wp(6),
        zIndex: 10,
    },
    fullscreenButton: {
        width: wp(48),
        height: hp(48),
        borderRadius: wp(24),
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
    airplayButtonContainer: {
        position: "absolute",
        top: hp(12),
        right: wp(12),
        zIndex: 10,
    },
    airplayButton: {
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
        top: hp(7),
        left: wp(-2),
        width: wp(20),
        height: hp(2),
        backgroundColor: colors.white,
        transform: [{ rotate: "45deg" }],
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
    subtitle: {
        fontSize: fp(16),
        marginBottom: hp(20),
        color: colors.gray.medium,
    },
    placeholder: {
        fontSize: fp(14),
        textAlign: "center",
        color: colors.gray.placeholder,
        lineHeight: hp(20),
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
