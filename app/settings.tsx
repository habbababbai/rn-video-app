import LeftArrowIcon from "@/assets/images/svg/arrow-left.svg";
import BellIcon from "@/assets/images/svg/bell.svg";
import ClockIcon from "@/assets/images/svg/clock.svg";
import PersonIcon from "@/assets/images/svg/person.svg";
import ToggleSwitch from "@/components/ToggleSwitch";
import { colors } from "@/constants/colors";
import { fonts } from "@/constants/fonts";
import { RootState } from "@/store";
import { logout } from "@/store/slices/authSlice";
import {
    setEnabled as setReminderEnabledAction,
    setNotificationId as setReminderNotificationId,
    setTime as setReminderTime,
} from "@/store/slices/reminderSlice";
import { isIOS } from "@/utils/platform";
import { fp, hp, spacing, wp } from "@/utils/responsive";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

export default function SettingsScreen() {
    const dispatch = useDispatch();

    const reminderState = useSelector((state: RootState) => state.reminder);

    const [reminderEnabled, setReminderEnabled] = useState(false);
    const [time, setTime] = useState<Date>(new Date());
    const [showAndroidPicker, setShowAndroidPicker] = useState(false);
    const [longPressActive, setLongPressActive] = useState(false);
    const overlayOpacity = useSharedValue(0);

    useEffect(() => {
        setReminderEnabled(reminderState.enabled);
        const initial = new Date();
        initial.setHours(reminderState.hour, reminderState.minute, 0, 0);
        setTime(initial);
    }, [reminderState.enabled, reminderState.hour, reminderState.minute]);

    useEffect(() => {
        if (!isIOS) {
            Notifications.setNotificationChannelAsync("default", {
                name: "Default",
                importance: Notifications.AndroidImportance.HIGH,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: "#8D99AE",
            }).catch((error) => {
                console.log("Error setting notification channel:", error);
            });
        }
    }, []);

    const scheduleDailyReminder = async (
        hour: number,
        minute: number
    ): Promise<string> => {
        const trigger = isIOS
            ? ({
                  type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
                  repeats: true,
                  hour,
                  minute,
              } as Notifications.CalendarTriggerInput)
            : ({
                  type: Notifications.SchedulableTriggerInputTypes.DAILY,
                  hour,
                  minute,
              } as Notifications.DailyTriggerInput);

        const id = await Notifications.scheduleNotificationAsync({
            content: {
                title: "YoutubeLearn",
                body: "Reminder for daily study!",
                sound: true,
                ...(isIOS
                    ? {}
                    : {
                          channelId: "default",
                          priority:
                              Notifications.AndroidNotificationPriority.HIGH,
                      }),
            },
            trigger,
        });
        return id;
    };

    const cancelScheduledReminder = async (notificationId?: string | null) => {
        if (notificationId) {
            try {
                await Notifications.cancelScheduledNotificationAsync(
                    notificationId
                );
            } catch {}
        }
    };

    const requestPermissionIfNeeded = async (): Promise<boolean> => {
        let perms = await Notifications.getPermissionsAsync();

        if (!perms.granted) {
            perms = await Notifications.requestPermissionsAsync();
        }
        if (!perms.granted) {
            Alert.alert(
                "Notifications disabled",
                "Enable notifications in settings to receive reminders."
            );
            return false;
        }
        return true;
    };

    const handleToggleReminder = async (value: boolean) => {
        if (value) {
            const ok = await requestPermissionIfNeeded();
            if (!ok) {
                setReminderEnabled(false);
                dispatch(setReminderEnabledAction(false));
                return;
            }
            const id = await scheduleDailyReminder(
                time.getHours(),
                time.getMinutes()
            );
            dispatch(setReminderNotificationId(id));
            setReminderEnabled(true);
            dispatch(setReminderEnabledAction(true));
        } else {
            await cancelScheduledReminder(reminderState.notificationId);
            dispatch(setReminderNotificationId(null));
            setReminderEnabled(false);
            dispatch(setReminderEnabledAction(false));
        }
    };

    const onChangeTime = async (_: any, selectedDate?: Date) => {
        const currentDate = selectedDate ?? time;
        setTime(currentDate);
        setShowAndroidPicker(false);
        dispatch(
            setReminderTime({
                hour: currentDate.getHours(),
                minute: currentDate.getMinutes(),
            })
        );
        if (reminderEnabled) {
            await cancelScheduledReminder(reminderState.notificationId);
            const id = await scheduleDailyReminder(
                currentDate.getHours(),
                currentDate.getMinutes()
            );
            dispatch(setReminderNotificationId(id));
        }
    };

    const handleLongPressStart = useCallback(() => {
        setLongPressActive(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        overlayOpacity.value = withTiming(1, {
            duration: 300,
            easing: Easing.out(Easing.quad),
        });
    }, [overlayOpacity]);

    const handleLongPressEnd = useCallback(() => {
        setLongPressActive(false);

        overlayOpacity.value = withTiming(0, {
            duration: 200,
            easing: Easing.in(Easing.quad),
        });
    }, [overlayOpacity]);

    const handleLongPress = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        setLongPressActive(false);

        overlayOpacity.value = 0;

        Alert.alert("Logout", "Are you sure you want to logout?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Logout",
                style: "destructive",
                onPress: () => {
                    dispatch(logout());
                    router.replace("/login");
                },
            },
        ]);
    }, [dispatch, overlayOpacity]);

    const animatedOverlayStyle = useAnimatedStyle(() => {
        return {
            opacity: overlayOpacity.value,
        };
    });

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <View style={styles.headerRow}>
                <Pressable onPress={() => router.back()} hitSlop={8}>
                    <LeftArrowIcon width={fp(32)} height={fp(32)} />
                </Pressable>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={{ width: fp(18) }} />
            </View>
            <Pressable
                style={[
                    styles.avatarSection,
                    longPressActive && styles.avatarSectionLongPress,
                ]}
                onLongPress={handleLongPress}
                onPressIn={handleLongPressStart}
                onPressOut={handleLongPressEnd}
                delayLongPress={1000}
            >
                {longPressActive && (
                    <Animated.View
                        style={[styles.longPressOverlay, animatedOverlayStyle]}
                    >
                        <Text style={styles.longPressText}>Hold to logout</Text>
                    </Animated.View>
                )}
                <View style={styles.avatarCircle}>
                    <PersonIcon width={fp(28)} height={fp(28)} />
                </View>
                <Text style={styles.userName}>Your Name</Text>
            </Pressable>

            <View style={styles.divider} />

            <View style={styles.remainderContainer}>
                <View style={styles.remainderTitleContainer}>
                    <BellIcon width={fp(36)} height={fp(36)} />
                    <Text style={styles.sectionTitle}>Learning reminders</Text>
                </View>
                <View style={styles.reminderRow}>
                    <Text style={styles.reminderLabel}>
                        Repeat everyday at:
                    </Text>

                    <View style={styles.timePickerContainer}>
                        <ClockIcon width={fp(24)} height={fp(24)} />

                        {isIOS ? (
                            <DateTimePicker
                                value={time}
                                mode="time"
                                display="default"
                                onChange={onChangeTime}
                                style={styles.datePicker}
                                themeVariant="light"
                                textColor={colors.primary}
                            />
                        ) : (
                            <Pressable
                                onPress={() => setShowAndroidPicker(true)}
                                style={styles.timeButton}
                            >
                                <Text style={styles.timeButtonText}>
                                    {time.toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </Text>
                            </Pressable>
                        )}

                        {showAndroidPicker && !isIOS && (
                            <DateTimePicker
                                value={time}
                                mode="time"
                                display="default"
                                onChange={onChangeTime}
                            />
                        )}
                    </View>

                    <ToggleSwitch
                        value={reminderEnabled}
                        onValueChange={handleToggleReminder}
                    />
                </View>

                <Text style={styles.helperText}>
                    You will receive friendly reminder to remember to study
                </Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingVertical: hp(16),
        paddingHorizontal: spacing.lg,
    },
    headerTitle: {
        fontFamily: fonts.poppinsBold,
        fontWeight: "700",
        fontSize: fp(16),
        color: colors.primary,
        letterSpacing: wp(0.5),
        paddingLeft: spacing.lg,
    },
    avatarSection: {
        alignItems: "center",
        paddingTop: hp(10),
        paddingBottom: hp(14),
        flexDirection: "row",
        alignSelf: "center",
        gap: spacing.md,
        position: "relative",
        overflow: "hidden",
    },
    avatarSectionLongPress: {
        backgroundColor: "#f8f9fa",
        borderRadius: fp(12),
        paddingHorizontal: spacing.md,
        paddingVertical: hp(8),
        shadowColor: "#6b7280",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    longPressOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(107, 114, 128, 0.15)",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: fp(12),
        zIndex: 1,
    },
    longPressText: {
        color: "#374151",
        fontFamily: fonts.poppinsSemiBold,
        fontSize: fp(12),
        fontWeight: "600",
        textAlign: "center",
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        paddingHorizontal: wp(8),
        paddingVertical: hp(4),
        borderRadius: fp(8),
        overflow: "hidden",
    },
    avatarCircle: {
        width: fp(64),
        height: fp(64),
        borderRadius: fp(32),
        backgroundColor: colors.primary,
        alignItems: "center",
        justifyContent: "center",
    },
    userName: {
        fontFamily: fonts.poppinsBold,
        fontWeight: "700",
        fontSize: fp(14),
        color: colors.primary,
        letterSpacing: wp(0.5),
    },
    divider: {
        height: hp(2),
        backgroundColor: colors.primary,
        width: "100%",
        marginVertical: hp(12),
    },
    sectionTitle: {
        fontFamily: fonts.poppins,
        fontSize: fp(14),
        color: colors.primary,
        letterSpacing: wp(0.5),
    },
    remainderContainer: {
        paddingHorizontal: spacing.lg,
    },
    reminderRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: wp(8),
    },
    timeText: {
        fontFamily: fonts.poppins,
        fontSize: fp(12),
        letterSpacing: wp(0.5),
        fontWeight: "400",
        color: colors.primary,
    },
    datePicker: {
        backgroundColor: colors.white,
    },
    reminderLabel: {
        fontFamily: fonts.poppins,
        fontSize: fp(12),
        color: colors.primary,
        letterSpacing: wp(0.5),
        flexShrink: 0,
        fontWeight: "400",
    },
    remainderTitleContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        paddingBottom: spacing.md,
    },
    timeButton: {
        paddingVertical: hp(8),
        paddingHorizontal: wp(6),
    },
    timeButtonText: {
        fontFamily: fonts.poppins,
        fontSize: fp(12),
        color: colors.primary,
        letterSpacing: wp(0.4),
    },
    timePickerContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    helperText: {
        marginTop: hp(36),
        fontFamily: fonts.poppinsSemiBold,
        fontWeight: "600",
        fontSize: fp(10),
        color: colors.primary,
        letterSpacing: wp(0.25),
    },
    testButton: {
        marginTop: hp(20),
        backgroundColor: colors.primary,
        paddingVertical: hp(12),
        paddingHorizontal: wp(20),
        borderRadius: fp(8),
        alignSelf: "center",
    },
    testButtonText: {
        color: colors.white,
        fontFamily: fonts.poppinsSemiBold,
        fontSize: fp(12),
        fontWeight: "600",
    },
});
