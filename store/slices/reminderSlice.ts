import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export type DailyReminderState = {
    enabled: boolean;
    hour: number; 
    minute: number; 
    notificationId?: string | null;
};

const now = new Date();

const initialState: DailyReminderState = {
    enabled: false,
    hour: now.getHours(),
    minute: now.getMinutes(),
    notificationId: null,
};

const reminderSlice = createSlice({
    name: "reminder",
    initialState,
    reducers: {
        setEnabled(state, action: PayloadAction<boolean>) {
            state.enabled = action.payload;
        },
        setTime(
            state,
            action: PayloadAction<{ hour: number; minute: number }>
        ) {
            state.hour = action.payload.hour;
            state.minute = action.payload.minute;
        },
        setNotificationId(state, action: PayloadAction<string | null>) {
            state.notificationId = action.payload;
        },
        hydrateFromDate(state, action: PayloadAction<Date>) {
            state.hour = action.payload.getHours();
            state.minute = action.payload.getMinutes();
        },
    },
});

export const { setEnabled, setTime, setNotificationId, hydrateFromDate } =
    reminderSlice.actions;

export default reminderSlice.reducer;
