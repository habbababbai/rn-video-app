import { ThemedView } from "@/components/themed-view";
import { RootState } from "@/store";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator } from "react-native";
import { useSelector } from "react-redux";

export default function Index() {
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        if (isAuthenticated) {
            router.replace("/(tabs)");
        } else {
            router.replace("/login");
        }
    }, [isAuthenticated]);

    return (
        <ThemedView
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
            <ActivityIndicator size="large" color="#007AFF" />
        </ThemedView>
    );
}
