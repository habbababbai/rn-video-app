import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import { persistor, store } from "@/store";

// Create a client with extended caching
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 24 * 60 * 60 * 1000, // 24 hours - data stays fresh for a day
            gcTime: 7 * 24 * 60 * 60 * 1000, // 7 days - keep in cache for a week
            retry: 1, // Reduce retries to save quota
            refetchOnWindowFocus: false, // Don't refetch on app focus
            refetchOnReconnect: false, // Don't refetch on reconnect
        },
    },
});

export const unstable_settings = {
    anchor: "index",
};

export default function RootLayout() {
    return (
        <QueryClientProvider client={queryClient}>
            <Provider store={store}>
                <PersistGate loading={null} persistor={persistor}>
                    <Stack>
                        <Stack.Screen
                            name="index"
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="login"
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="(tabs)"
                            options={{ headerShown: false }}
                        />
                    </Stack>
                    <StatusBar style="auto" />
                </PersistGate>
            </Provider>
        </QueryClientProvider>
    );
}
