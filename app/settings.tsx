import LeftArrowIcon from "@/assets/images/svg/left-arrow.svg";
import PersonIcon from "@/assets/images/svg/person.svg";
import { colors } from "@/constants/colors";
import { fonts } from "@/constants/fonts";
import { fp, hp, wp } from "@/utils/responsive";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
    const [reminderEnabled, setReminderEnabled] = useState(false);
    const [time, setTime] = useState<Date>(new Date());
    const [showPicker, setShowPicker] = useState(false);

    const onChangeTime = (_: any, selectedDate?: Date) => {
        const currentDate = selectedDate ?? time;
        setTime(currentDate);
        setShowPicker(false);
    };

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            {/* Header with back arrow and title */}
            <View style={styles.headerRow}>
                <Pressable onPress={() => router.back()} hitSlop={8}>
                    <LeftArrowIcon width={fp(18)} height={fp(18)} />
                </Pressable>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={{ width: fp(18) }} />
            </View>

            {/* Avatar and name */}
            <View style={styles.avatarSection}>
                <View style={styles.avatarCircle}>
                    <PersonIcon width={fp(28)} height={fp(28)} />
                </View>
                <Text style={styles.userName}>Your Name</Text>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Learning reminders */}
            <Text style={styles.sectionTitle}>Learning reminders</Text>

            {/* Row: Repeat everyday at: [time picker] [toggle] */}
            <View style={styles.reminderRow}>
                <Text style={styles.reminderLabel}>Repeat everyday at:</Text>

                {showPicker ? (
                    <DateTimePicker
                        value={time}
                        mode="time"
                        display="default"
                        onChange={onChangeTime}
                    />
                ) : (
                    <Pressable
                        onPress={() => setShowPicker(true)}
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

                <Switch
                    value={reminderEnabled}
                    onValueChange={setReminderEnabled}
                    thumbColor={reminderEnabled ? colors.white : colors.white}
                    trackColor={{
                        false: colors.gray.light,
                        true: colors.primary,
                    }}
                />
            </View>

            {/* Picker rendered inline above when showPicker is true */}

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
