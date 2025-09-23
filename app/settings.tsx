import LeftArrowIcon from "@/assets/images/svg/arrow-left.svg";
import BellIcon from "@/assets/images/svg/bell.svg";
import ClockIcon from "@/assets/images/svg/clock.svg";
import PersonIcon from "@/assets/images/svg/person.svg";
import { colors } from "@/constants/colors";
import { fonts } from "@/constants/fonts";
import { RootState } from "@/store";
import {
    setEnabled as setReminderEnabledAction,
    setNotificationId as setReminderNotificationId,
    setTime as setReminderTime,
} from "@/store/slices/reminderSlice";
import { fp, hp, wp } from "@/utils/responsive";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    Platform,
    Pressable,
    StyleSheet,
    Switch,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

export default function SettingsScreen() {
    const dispatch = useDispatch();

    const reminderState = useSelector((state: RootState) => state.reminder);

    const [reminderEnabled, setReminderEnabled] = useState(false);
    const [time, setTime] = useState<Date>(new Date());

    React.useEffect(() => {
        setReminderEnabled(reminderState.enabled);
        const initial = new Date();
        initial.setHours(reminderState.hour, reminderState.minute, 0, 0);
        setTime(initial);
    }, [reminderState.enabled, reminderState.hour, reminderState.minute]);

    React.useEffect(() => {
        if (Platform.OS === "android") {
            Notifications.setNotificationChannelAsync("default", {
                name: "Default",
                importance: Notifications.AndroidImportance.DEFAULT,
            }).catch(() => {});
        }
    }, []);

    const scheduleDailyReminder = async (
        hour: number,
        minute: number
    ): Promise<string> => {
        const trigger = {
            type: "calendar" as const,
            repeats: true,
            hour,
            minute,
            ...(Platform.OS === "android" ? { channelId: "default" } : {}),
        } as unknown as Notifications.NotificationTriggerInput;

        const id = await Notifications.scheduleNotificationAsync({
            content: {
                title: "YoutubeLearn",
                body: "Reminder for daily study!",
                sound: true,
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

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <View style={styles.headerRow}>
                <Pressable onPress={() => router.back()} hitSlop={8}>
                    <LeftArrowIcon width={fp(18)} height={fp(18)} />
                </Pressable>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={{ width: fp(18) }} />
            </View>
            <View style={styles.avatarSection}>
                <View style={styles.avatarCircle}>
                    <PersonIcon width={fp(28)} height={fp(28)} />
                </View>
                <Text style={styles.userName}>Your Name</Text>
            </View>

            <View style={styles.divider} />
            <BellIcon width={fp(24)} height={fp(24)} />
            <Text style={styles.sectionTitle}>Learning reminders</Text>

            <View style={styles.reminderRow}>
                <Text style={styles.reminderLabel}>Repeat everyday at:</Text>

                <ClockIcon width={fp(24)} height={fp(24)} />

                <DateTimePicker
                    value={time}
                    mode="time"
                    display="default"
                    onChange={onChangeTime}
                />

                <Switch
                    value={reminderEnabled}
                    onValueChange={handleToggleReminder}
                    thumbColor={reminderEnabled ? colors.white : colors.white}
                    trackColor={{
                        false: colors.gray.light,
                        true: colors.primary,
                    }}
                />
            </View>

            <Text style={styles.helperText}>
                you will receive friendly reminder to remember to study
            </Text>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
        paddingHorizontal: wp(20),
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: hp(16),
    },
    headerTitle: {
        fontFamily: fonts.poppinsSemiBold,
        fontSize: fp(18),
        color: colors.primary,
        letterSpacing: wp(0.5),
    },
    avatarSection: {
        alignItems: "center",
        paddingTop: hp(10),
        paddingBottom: hp(14),
    },
    avatarCircle: {
        width: fp(64),
        height: fp(64),
        borderRadius: fp(32),
        backgroundColor: colors.secondary,
        alignItems: "center",
        justifyContent: "center",
    },
    userName: {
        marginTop: hp(8),
        fontFamily: fonts.poppinsMedium,
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
        fontFamily: fonts.poppinsSemiBold,
        fontSize: fp(16),
        color: colors.primary,
        letterSpacing: wp(0.5),
        marginBottom: hp(12),
    },
    reminderRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: wp(8),
    },
    reminderLabel: {
        fontFamily: fonts.poppins,
        fontSize: fp(12),
        color: colors.primary,
        letterSpacing: wp(0.5),
        flexShrink: 0,
    },
    timeButton: {
        paddingVertical: hp(8),
        paddingHorizontal: wp(12),
        borderRadius: fp(4),
        borderWidth: 1,
        borderColor: colors.primary,
    },
    timeButtonText: {
        fontFamily: fonts.poppins,
        fontSize: fp(12),
        color: colors.primary,
        letterSpacing: wp(0.5),
    },
    helperText: {
        marginTop: hp(12),
        fontFamily: fonts.poppins,
        fontSize: fp(12),
        color: colors.primary,
        letterSpacing: wp(0.5),
    },
});
