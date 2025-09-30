import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import authReducer from "./slices/authSlice";
import reminderReducer from "./slices/reminderSlice";
import videoNotesReducer from "./slices/videoNotesSlice";

const persistConfig = {
    key: "root",
    storage: AsyncStorage,
    whitelist: ["auth", "videoNotes", "reminder"],
};

const appReducer = combineReducers({
    auth: authReducer,
    videoNotes: videoNotesReducer,
    reminder: reminderReducer,
});

type RootState = ReturnType<typeof appReducer>;

const rootReducer = (
    state: RootState | undefined,
    action: { type: string }
) => {
    if (action.type === "auth/logout") {
        state = undefined;
    }
    return appReducer(state, action);
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
            },
        }),
});

export const persistor = persistStore(store);

export type { RootState };
export type AppDispatch = typeof store.dispatch;
