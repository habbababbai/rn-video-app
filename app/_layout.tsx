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
            staleTime: 24 * 60 * 60 * 1000, 
            gcTime: 7 * 24 * 60 * 60 * 1000, 
            retry: 1, 
            refetchOnWindowFocus: false, 
            refetchOnReconnect: false, 
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
