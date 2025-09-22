import { colors } from "@/constants/colors";
import { loginAsGuest } from "@/store/slices/authSlice";
import { router } from "expo-router";
import React from "react";
import {
    Linking,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";

import AppIcon from "@/assets/images/svg/app-logo.svg";
import YTIcon from "@/assets/images/svg/yt-learn.svg";
import { fonts } from "@/constants/fonts";
import { fp, hp, spacing, wp } from "@/utils/responsive";

export default function LoginScreen() {
    const dispatch = useDispatch();

    const handleGuestLogin = () => {
        dispatch(loginAsGuest());
        router.replace("/(tabs)");
    };

    const handleTermsPress = () => {
        Linking.openURL("https://google.com");
    };

    const handlePrivacyPress = () => {
        Linking.openURL("https://google.com");
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.content}>
                <YTIcon style={{ marginTop: hp(45) }} />
                <AppIcon />
                <View>
                    <View style={styles.welcomeTextContainer}>
                        <Text style={styles.welcomeText}>
                            Welcome to the best YouTube-based learning
                            application.
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleGuestLogin}
                    >
                        <Text style={styles.buttonText}>Log in as Guest</Text>
                    </TouchableOpacity>
                    <View style={styles.termsTextContainer}>
                        <Text style={styles.termsText}>
                            By continuing you agree to our
                        </Text>
                        <View style={styles.linksContainer}>
                            <Text
                                style={styles.linkText}
                                onPress={handleTermsPress}
                            >
                                Terms of Service
                            </Text>
                            <Text style={styles.termsText}> and </Text>
                            <Text
                                style={styles.linkText}
                                onPress={handlePrivacyPress}
                            >
                                Privacy Policy
                            </Text>
                        </View>
                    </View>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.secondary,
        flex: 1,
    },
    content: { flex: 1, alignItems: "center", justifyContent: "space-between" },
    header: {
        flex: 1,
        alignItems: "center",
        justifyContent: "space-between",
        height: hp(150),
        backgroundColor: "red",
    },

    welcomeText: {
        fontSize: fp(22),
        fontFamily: fonts.poppinsSemiBold,
        fontWeight: "600",
        color: colors.white,
        lineHeight: hp(24),
        letterSpacing: wp(1),
        marginVertical: spacing.md,
    },
    welcomeTextContainer: {
        width: wp(327),
    },
    button: {
        backgroundColor: colors.primary,
        width: wp(327),
        height: hp(48),
        borderRadius: fp(12),
        justifyContent: "center",
        alignItems: "center",
        marginVertical: spacing.md,
    },
    buttonText: {
        fontFamily: fonts.poppinsSemiBold,
        color: colors.white,
        fontSize: fp(16),
        lineHeight: hp(24),
        letterSpacing: wp(1),
        fontWeight: "600",
    },
    termsTextContainer: {
        marginVertical: spacing.md,
        alignItems: "center",
    },
    linksContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    termsText: {
        fontFamily: fonts.poppins,
        color: colors.white,
        fontSize: fp(13),
        lineHeight: hp(16),
        textAlign: "center",
    },
    linkText: {
        fontFamily: fonts.poppins,
        color: colors.secondary,
        fontSize: fp(13),
        lineHeight: hp(16),
        textDecorationLine: "underline",
    },
});
