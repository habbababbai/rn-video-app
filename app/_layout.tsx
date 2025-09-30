import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import { persistor, store } from "@/store";

const asyncStoragePersister = createAsyncStoragePersister({
    storage: AsyncStorage,
    key: "react-query-cache",
    throttleTime: 1000,
});

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000,
            gcTime: 30 * 60 * 1000,
            retry: 2,
            retryDelay: (attemptIndex) =>
                Math.min(1000 * 2 ** attemptIndex, 10000),
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            refetchOnMount: false,
        },
        mutations: {
            retry: 1,
            retryDelay: (attemptIndex) =>
                Math.min(1000 * 2 ** attemptIndex, 5000),
        },
    },
});

export const unstable_settings = {
    anchor: "index",
};

export default function RootLayout() {
    return (
        <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{ persister: asyncStoragePersister }}
        >
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
                        <Stack.Screen
                            name="video-details"
                            options={{ headerShown: true }}
                        />
                        <Stack.Screen
                            name="settings"
                            options={{ headerShown: false }}
                        />
                    </Stack>
                    <StatusBar style="dark" />
                </PersistGate>
            </Provider>
        </PersistQueryClientProvider>
    );
}
