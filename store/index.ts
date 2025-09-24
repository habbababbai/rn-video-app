import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import authReducer from "./slices/authSlice";
import reminderReducer from "./slices/reminderSlice";
import videoNotesReducer from "./slices/videoNotesSlice";

const persistConfig = {
    key: "root",
    storage: AsyncStorage,
    whitelist: ["auth", "videoNotes", "reminder"], // Persist auth, video notes, reminder
};

const appReducer = combineReducers({
    auth: authReducer,
    videoNotes: videoNotesReducer,
    reminder: reminderReducer,
});

const rootReducer = (state: any, action: any) => {
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

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
