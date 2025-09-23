import { colors } from "@/constants/colors";
import { fonts } from "@/constants/fonts";
import { RootState } from "@/store";
import {
    addNote,
    deleteNote,
    selectNotesForVideo,
    VideoNote,
} from "@/store/slices/videoNotesSlice";
import { fp, hp, spacing, wp } from "@/utils/responsive";
import React, { useCallback, useState } from "react";
import {
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

interface VideoNotesProps {
    videoId: string;
    currentVideoTime?: number; // Current video playback time in seconds
}

export default function VideoNotes({
    videoId,
    currentVideoTime = 0,
}: VideoNotesProps) {
    const dispatch = useDispatch();
    const notes = useSelector((state: RootState) =>
        selectNotesForVideo(state, videoId)
    );
    const [newNoteText, setNewNoteText] = useState("");

    const handleAddNote = useCallback(() => {
        const trimmedText = newNoteText.trim();
        if (trimmedText.length === 0) {
            Alert.alert("Error", "Please enter a note before adding.");
            return;
        }

        if (trimmedText.length > 500) {
            Alert.alert(
                "Error",
                "Note is too long. Please keep it under 500 characters."
            );
            return;
        }

        dispatch(
            addNote({ videoId, text: trimmedText, videoTime: currentVideoTime })
        );
        setNewNoteText("");
    }, [newNoteText, dispatch, videoId, currentVideoTime]);

    const handleDeleteNote = useCallback(
        (noteId: string) => {
            Alert.alert(
                "Delete Note",
                "Are you sure you want to delete this note?",
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Delete",
                        style: "destructive",
                        onPress: () =>
                            dispatch(deleteNote({ videoId, noteId })),
                    },
                ]
            );
        },
        [dispatch, videoId]
    );

    const formatVideoTime = (videoTime: number) => {
        const minutes = Math.floor(videoTime / 60);
        const seconds = videoTime % 60;
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    const renderNoteItem = ({ item }: { item: VideoNote }) => (
        <TouchableOpacity
            style={styles.noteItem}
            onLongPress={() => handleDeleteNote(item.id)}
            delayLongPress={1000}
            activeOpacity={0.7}
        >
            <Text style={styles.noteText}>{item.text}</Text>
            <View style={styles.timestampContainer}>
                <Text style={styles.noteTimestamp}>
                    {formatVideoTime(item.videoTime)}
                </Text>
            </View>
        </TouchableOpacity>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
                No notes yet. Add your first note below!
            </Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={notes}
                renderItem={renderNoteItem}
                keyExtractor={(item) => item.id}
                style={styles.notesList}
                contentContainerStyle={styles.notesListContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={renderEmptyState}
            />

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.textInput}
                    placeholder="Enter notes..."
                    placeholderTextColor={colors.primary + "80"}
                    value={newNoteText}
                    onChangeText={setNewNoteText}
                    multiline
                    textAlignVertical="top"
                    maxLength={500}
                />
                <View style={styles.inputFooter}>
                    <TouchableOpacity
                        style={[
                            styles.addButton,
                            newNoteText.trim().length === 0 &&
                                styles.addButtonDisabled,
                        ]}
                        onPress={handleAddNote}
                        disabled={newNoteText.trim().length === 0}
                    >
                        <Text
                            style={[
                                styles.addButtonText,
                                newNoteText.trim().length === 0 &&
                                    styles.addButtonTextDisabled,
                            ]}
                        >
                            Add Note
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    notesList: {
        flex: 1,
    },
    notesListContent: {
        paddingHorizontal: wp(16),
        paddingBottom: hp(10),
        alignItems: "center",
    },
    noteItem: {
        backgroundColor: colors.white,
        borderRadius: fp(12),
        marginBottom: hp(12),
        borderWidth: wp(1),
        borderColor: colors.primary + "20",
        width: wp(361),
        alignSelf: "center",
    },
    timestampContainer: {
        alignItems: "flex-end",
        marginTop: hp(8),
    },
    noteTimestamp: {
        fontFamily: fonts.poppinsSemiBold,
        fontSize: fp(10),
        fontWeight: "600",
        letterSpacing: wp(0.5),

        color: colors.primary,
        paddingRight: spacing.xs,
        paddingBottom: spacing.xs,
    },
    noteText: {
        paddingHorizontal: spacing.sm,
        paddingTop: spacing.sm,
        fontFamily: fonts.poppins,
        fontSize: fp(12),
        fontWeight: "400",
        letterSpacing: wp(0.75),
        lineHeight: hp(12),
        color: colors.primary,
    },
    emptyState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: hp(40),
    },
    emptyStateText: {
        fontFamily: fonts.poppins,
        fontSize: fp(12),
        color: colors.primary,
        textAlign: "center",
    },
    inputContainer: {
        backgroundColor: colors.white,
        padding: wp(16),
        alignSelf: "center",
    },
    textInput: {
        fontFamily: fonts.poppins,
        fontSize: fp(12),
        color: colors.primary,
        backgroundColor: colors.white,
        borderWidth: wp(1),
        borderColor: colors.primary + "30",
        borderRadius: fp(12),
        padding: spacing.xs,
        height: hp(60),
        textAlignVertical: "top",
        letterSpacing: wp(0.3),
        width: wp(361),
    },
    inputFooter: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: hp(12),
    },
    characterCount: {
        fontFamily: fonts.poppins,
        fontSize: fp(12),
        color: colors.primary,
        opacity: 0.6,
    },
    addButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: wp(24),
        paddingVertical: hp(12),
        borderRadius: fp(8),
        width: wp(256),
    },
    addButtonDisabled: {
        backgroundColor: colors.primary + "40",
    },
    addButtonText: {
        fontFamily: fonts.poppinsSemiBold,
        fontSize: fp(14),
        color: colors.white,
        fontWeight: "600",
        textAlign: "center",
        letterSpacing: wp(0.5),
    },
    addButtonTextDisabled: {
        color: colors.white + "80",
    },
});
