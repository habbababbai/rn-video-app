import { VideoDetails } from "@/components/VideoDetails";
import { VideoPlayer, VideoPlayerRef } from "@/components/VideoPlayer";
import { colors } from "@/constants/colors";
import { useYouTubeVideoDetails } from "@/hooks/useYouTubeApi";
import { isIOS } from "@/utils/platform";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    Keyboard,
    StyleSheet,
    Text,
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

export default function VideoDetailsScreen() {
    const { videoId } = useLocalSearchParams<{ videoId: string }>();
    const router = useRouter();

    const {
        data: videoDetails,
        isLoading,
        error,
    } = useYouTubeVideoDetails(videoId || "");

    const videoPlayerRef = useRef<VideoPlayerRef>(null);
    const insets = useSafeAreaInsets();

    const [currentTime, setCurrentTime] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const keyboardHeight = useSharedValue(0);

    const videoSource = { uri: require("@/assets/videos/broadchurch.mp4") };
    const shouldShowRealData =
        videoId !== "placeholder-local-tab" && !error && !!videoDetails;

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: -keyboardHeight.value }],
        };
    });

    useEffect(() => {
        const showEvent = isIOS ? "keyboardWillShow" : "keyboardDidShow";
        const hideEvent = isIOS ? "keyboardWillHide" : "keyboardDidHide";

        const keyboardShow = Keyboard.addListener(showEvent, (event) => {
            keyboardHeight.value = withTiming(event.endCoordinates.height, {
                duration: isIOS ? event.duration || 250 : 250,
            });
        });

        const keyboardHide = Keyboard.addListener(hideEvent, (event) => {
            keyboardHeight.value = withTiming(0, {
                duration: isIOS ? event.duration || 250 : 250,
            });
        });

        return () => {
            keyboardShow.remove();
            keyboardHide.remove();
        };
    }, [keyboardHeight]);

    const dismissKeyboard = useCallback(() => {
        Keyboard.dismiss();
    }, []);

    const handleCurrentTimeChange = useCallback((time: number) => {
        setCurrentTime(time);
    }, []);

    const handleBeginInputFocus = useCallback(() => {
        videoPlayerRef.current?.handleBeginInputFocus();
    }, []);

    const handleBack = useCallback(() => {
        router.back();
    }, [router]);

    useEffect(() => {
        return () => {
            if (videoPlayerRef.current) {
                videoPlayerRef.current = null;
            }
        };
    }, []);

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
                        <VideoPlayer
                            ref={videoPlayerRef}
                            videoSource={videoSource}
                            isFullscreen={isFullscreen}
                            onFullscreenChange={setIsFullscreen}
                            onBack={handleBack}
                            onCurrentTimeChange={handleCurrentTimeChange}
                        />
                    ) : (
                        <View style={styles.placeholderContainer}>
                            <Text style={styles.placeholderText}>
                                Video not available for ID: {videoId}
                            </Text>
                        </View>
                    )}

                    {videoDetails && (
                        <VideoDetails
                            videoDetails={videoDetails}
                            shouldShowRealData={shouldShowRealData}
                            videoId={videoId}
                            isLoading={isLoading}
                            error={error}
                            currentTime={currentTime}
                            onBeginInputFocus={handleBeginInputFocus}
                            isFullscreen={isFullscreen}
                        />
                    )}
                </GestureHandlerRootView>
            </TouchableWithoutFeedback>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.black,
    },
    placeholderContainer: {
        width: "100%",
        aspectRatio: 16 / 9,
        backgroundColor: colors.gray.light,
        justifyContent: "center",
        alignItems: "center",
    },
    placeholderText: {
        fontSize: 16,
        color: colors.gray.medium,
        textAlign: "center",
    },
});
