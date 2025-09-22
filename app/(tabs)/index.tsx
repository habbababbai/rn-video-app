import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { logout } from "@/store/slices/authSlice";
import { router } from "expo-router";
import { SafeAreaView, StyleSheet, Text, TouchableOpacity } from "react-native";
import { useDispatch} from "react-redux";

export default function HomeScreen() {
    const dispatch = useDispatch();

    const handleLogout = () => {
        dispatch(logout());
        router.replace("/login" as any);
    };

    return (
        <SafeAreaView style={styles.container}>
            <ThemedView style={styles.content}>
                <ThemedText type="title" style={styles.title}>
                    Welcome!
                </ThemedText>
                <ThemedText type="default" style={styles.subtitle}>
                    You are logged in.
                </ThemedText>

                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                >
                    <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>
            </ThemedView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 16,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 40,
        textAlign: "center",
        opacity: 0.7,
    },
    logoutButton: {
        backgroundColor: "#FF3B30",
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    logoutButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
});
