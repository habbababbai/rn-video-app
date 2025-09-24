import { CastButton } from "@/components/CastButton";
import { ControlButton } from "@/components/ControlButton";
import { PlayButton } from "@/components/PlayButton";
import { ProgressBar } from "@/components/ProgressBar";
import { TimerDisplay } from "@/components/TimerDisplay";
import { colors } from "@/constants/colors";
import { hp } from "@/utils/responsive";
import * as ScreenOrientation from "expo-screen-orientation";
import React, {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from "react";
import {
    Dimensions,
    Keyboard,
    StyleSheet,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import Video, { VideoRef } from "react-native-video";

interface VideoPlayerProps {
    videoSource: { uri: any };
    isFullscreen: boolean;
    onFullscreenChange: (isFullscreen: boolean) => void;
    onBack: () => void;
    onCurrentTimeChange: (currentTime: number) => void;
}

export interface VideoPlayerRef {
    handleBeginInputFocus: () => void;
}

const VideoPlayerComponent = (
    {
        videoSource,
        isFullscreen,
        onFullscreenChange,
        onBack,
        onCurrentTimeChange,
    }: VideoPlayerProps,
    ref: React.Ref<VideoPlayerRef>
) => {
    const videoRef = useRef<VideoRef>(null);
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

    const controlsOpacity = useSharedValue(1);

    useEffect(() => {
        setIsMuted(false);

        return () => {
            if (hideControlsTimeoutRef.current) {
                clearTimeout(hideControlsTimeoutRef.current);
            }
            ScreenOrientation.unlockAsync();
        };
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
        setIsMuted(false);
    };

    const handleVideoProgress = (data: any) => {
        const current = data.currentTime as number;
        if (
            current - lastProgressUpdateRef.current >= 0.25 ||
            current < lastProgressUpdateRef.current
        ) {
            lastProgressUpdateRef.current = current;
            setCurrentTime(current);
            onCurrentTimeChange(current);
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

    const handleFullscreenToggle = async () => {
        const newFullscreenState = !isFullscreen;

        // Dismiss keyboard when entering fullscreen
        if (newFullscreenState) {
            Keyboard.dismiss();
        }

        onFullscreenChange(newFullscreenState);

        if (newFullscreenState) {
            await ScreenOrientation.lockAsync(
                ScreenOrientation.OrientationLock.LANDSCAPE
            );
        } else {
            await ScreenOrientation.unlockAsync();
            await new Promise((resolve) => setTimeout(resolve, 100));
            await ScreenOrientation.lockAsync(
                ScreenOrientation.OrientationLock.PORTRAIT_UP
            );
            await new Promise((resolve) => setTimeout(resolve, 200));
            await ScreenOrientation.unlockAsync();
        }

        showControlsAndStartTimer();
    };

    const handleBackPress = async () => {
        if (isFullscreen) {
            // Force portrait orientation before unlocking for both platforms
            await ScreenOrientation.lockAsync(
                ScreenOrientation.OrientationLock.PORTRAIT_UP
            );
            await new Promise((resolve) => setTimeout(resolve, 200));
        }
        onBack();
    };

    const handleBeginInputFocus = () => {
        if (isPlaying) {
            setIsPlaying(false);
        }
        showControlsAndStartTimer();
    };

    useImperativeHandle(ref, () => ({
        handleBeginInputFocus,
    }));

    const controlsAnimatedStyle = useAnimatedStyle(() => ({
        opacity: controlsOpacity.value,
    }));

    return (
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

            <TouchableWithoutFeedback onPress={showControlsAndStartTimer}>
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
                isFullscreen={isFullscreen}
            />

            <TimerDisplay
                currentTime={currentTime}
                duration={duration}
                showControls={showControls}
                controlsAnimatedStyle={controlsAnimatedStyle}
                isFullscreen={isFullscreen}
            />

            <ControlButton
                type="back"
                showControls={showControls}
                controlsAnimatedStyle={controlsAnimatedStyle}
                onPress={handleBackPress}
            />

            <CastButton
                showControls={showControls}
                controlsAnimatedStyle={controlsAnimatedStyle}
                onShowControls={showControlsAndStartTimer}
            />

            <ControlButton
                type="mute"
                isMuted={isMuted}
                showControls={showControls}
                controlsAnimatedStyle={controlsAnimatedStyle}
                onPress={() => {
                    const newMutedState = !isMuted;
                    setIsMuted(newMutedState);
                    showControlsAndStartTimer();
                }}
            />

            <ControlButton
                type="fullscreen"
                showControls={showControls}
                controlsAnimatedStyle={controlsAnimatedStyle}
                onPress={handleFullscreenToggle}
            />
        </View>
    );
};

export const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(
    VideoPlayerComponent
);

const styles = StyleSheet.create({
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
