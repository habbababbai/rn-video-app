import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { loginAsGuest } from "@/store/slices/authSlice";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";

export default function LoginScreen() {
    const dispatch = useDispatch();

    const handleGuestLogin = () => {
        dispatch(loginAsGuest());
        router.replace("/(tabs)");
    };

    return (
        <SafeAreaView style={styles.container}>
            <ThemedView style={styles.content}>
                <View style={styles.header}>
                    <ThemedText type="title" style={styles.title}>
                        Welcome to Video App
                    </ThemedText>
                    <ThemedText type="default" style={styles.subtitle}>
                        Get started by logging in as a guest
                    </ThemedText>
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.guestButton}
                        onPress={handleGuestLogin}
                    >
                        <Text style={styles.guestButtonText}>
                            Login as Guest
                        </Text>
                    </TouchableOpacity>
                </View>
            </ThemedView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },
    content: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    header: {
        alignItems: "center",
        marginBottom: 60,
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 16,
    },
    subtitle: {
        fontSize: 16,
        textAlign: "center",
        opacity: 0.7,
    },
    buttonContainer: {
        width: "100%",
        maxWidth: 300,
    },
    guestButton: {
        backgroundColor: "#007AFF",
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        alignItems: "center",
        shadowColor: "#007AFF",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    guestButtonText: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "600",
    },
});
