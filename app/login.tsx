import YTIcon from "@/assets/images/svg/yt-learn.svg";
import { colors } from "@/constants/colors";
import { loginAsGuest } from "@/store/slices/authSlice";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";

export default function LoginScreen() {
    const dispatch = useDispatch();

    const handleGuestLogin = () => {
        dispatch(loginAsGuest());
        router.replace("/(tabs)");
    };

    return (
        <View style={styles.content}>
            <SafeAreaView>
                <YTIcon />
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {},
    content: { backgroundColor: colors.bg, flex: 1 },
});
