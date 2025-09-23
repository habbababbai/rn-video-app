import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface VideoNote {
    id: string;
    text: string;
    timestamp: number; // Unix timestamp when note was created
    videoId: string;
    videoTime: number; // Video playback time in seconds when note was created
}

export interface VideoNotesState {
    // Key: videoId, Value: array of notes for that video
    notesByVideo: Record<string, VideoNote[]>;
}

const initialState: VideoNotesState = {
    notesByVideo: {},
};

const videoNotesSlice = createSlice({
    name: "videoNotes",
    initialState,
    reducers: {
        addNote: (
            state,
            action: PayloadAction<{
                videoId: string;
                text: string;
                videoTime: number;
            }>
        ) => {
            const { videoId, text, videoTime } = action.payload;
            const note: VideoNote = {
                id: `${videoId}_${Date.now()}_${Math.random()
                    .toString(36)
                    .substr(2, 9)}`,
                text: text.trim(),
                timestamp: Date.now(),
                videoId,
                videoTime: Math.round(videoTime), // Round to nearest second
            };

            if (!state.notesByVideo[videoId]) {
                state.notesByVideo[videoId] = [];
            }

            state.notesByVideo[videoId].push(note);
        },

        deleteNote: (
            state,
            action: PayloadAction<{ videoId: string; noteId: string }>
        ) => {
            const { videoId, noteId } = action.payload;

            if (state.notesByVideo[videoId]) {
                state.notesByVideo[videoId] = state.notesByVideo[
                    videoId
                ].filter((note) => note.id !== noteId);

                // Remove the video entry if no notes remain
                if (state.notesByVideo[videoId].length === 0) {
                    delete state.notesByVideo[videoId];
                }
            }
        },

        editNote: (
            state,
            action: PayloadAction<{
                videoId: string;
                noteId: string;
                newText: string;
            }>
        ) => {
            const { videoId, noteId, newText } = action.payload;

            if (state.notesByVideo[videoId]) {
                const noteIndex = state.notesByVideo[videoId].findIndex(
                    (note) => note.id === noteId
                );
                if (noteIndex !== -1) {
                    state.notesByVideo[videoId][noteIndex].text =
                        newText.trim();
                }
            }
        },

        clearAllNotesForVideo: (state, action: PayloadAction<string>) => {
            const videoId = action.payload;
            delete state.notesByVideo[videoId];
        },
    },
});

export const { addNote, deleteNote, editNote, clearAllNotesForVideo } =
    videoNotesSlice.actions;

// Selectors
export const selectNotesForVideo = (
    state: { videoNotes: VideoNotesState },
    videoId: string
) => state.videoNotes.notesByVideo[videoId] || [];

export const selectAllVideoNotes = (state: { videoNotes: VideoNotesState }) =>
    state.videoNotes.notesByVideo;

export const selectHasNotesForVideo = (
    state: { videoNotes: VideoNotesState },
    videoId: string
) => Boolean(state.videoNotes.notesByVideo[videoId]?.length);

export default videoNotesSlice.reducer;
