import { colors } from "@/constants/colors";
import { fonts } from "@/constants/fonts";
import { RootState } from "@/store";
import {
    addNote,
    deleteNote,
    selectNotesForVideo,
    VideoNote,
} from "@/store/slices/videoNotesSlice";
import { fp, hp, wp } from "@/utils/responsive";
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
    }, [dispatch, videoId, newNoteText]);

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

    const formatTimestamp = (timestamp: number) => {
        const date = new Date(timestamp);
        return (
            date.toLocaleDateString() +
            " " +
            date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            })
        );
    };

    const formatVideoTime = (videoTime: number) => {
        const minutes = Math.floor(videoTime / 60);
        const seconds = videoTime % 60;
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    const renderNoteItem = ({ item }: { item: VideoNote }) => (
        <View style={styles.noteItem}>
            <View style={styles.noteHeader}>
                <View style={styles.noteTimeInfo}>
                    <Text style={styles.noteVideoTime}>
                        {formatVideoTime(item.videoTime)}
                    </Text>
                    <Text style={styles.noteTimestamp}>
                        {formatTimestamp(item.timestamp)}
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteNote(item.id)}
                >
                    <Text style={styles.deleteButtonText}>×</Text>
                </TouchableOpacity>
            </View>
            <Text style={styles.noteText}>{item.text}</Text>
        </View>
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
                    placeholder="Add a note about this video..."
                    placeholderTextColor={colors.primary + "80"}
                    value={newNoteText}
                    onChangeText={setNewNoteText}
                    multiline
                    textAlignVertical="top"
                    maxLength={500}
                />
                <View style={styles.inputFooter}>
                    <Text style={styles.characterCount}>
                        {newNoteText.length}/500
                    </Text>
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
        padding: wp(16),
        paddingBottom: hp(10),
    },
    noteItem: {
        backgroundColor: colors.white,
        borderRadius: fp(12),
        padding: wp(16),
        marginBottom: hp(12),
        borderWidth: wp(1),
        borderColor: colors.primary + "20",
        shadowColor: colors.black,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 3,
    },
    noteHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: hp(8),
    },
    noteTimeInfo: {
        flexDirection: "row",
        alignItems: "center",
    },
    noteVideoTime: {
        fontFamily: fonts.poppinsSemiBold,
        fontSize: fp(14),
        color: colors.primary,
        fontWeight: "600",
        marginRight: wp(8),
        backgroundColor: colors.primary + "15",
        paddingHorizontal: wp(8),
        paddingVertical: hp(2),
        borderRadius: fp(4),
    },
    noteTimestamp: {
        fontFamily: fonts.poppins,
        fontSize: fp(11),
        color: colors.primary,
        opacity: 0.6,
    },
    deleteButton: {
        width: wp(24),
        height: hp(24),
        borderRadius: wp(12),
        backgroundColor: colors.alert,
        justifyContent: "center",
        alignItems: "center",
    },
    deleteButtonText: {
        color: colors.white,
        fontSize: fp(16),
        fontFamily: fonts.poppinsBold,
        fontWeight: "bold",
    },
    noteText: {
        fontFamily: fonts.poppins,
        fontSize: fp(14),
        color: colors.primary,
        lineHeight: hp(20),
        letterSpacing: wp(0.3),
    },
    emptyState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: hp(40),
    },
    emptyStateText: {
        fontFamily: fonts.poppins,
        fontSize: fp(16),
        color: colors.primary,
        opacity: 0.6,
        textAlign: "center",
    },
    inputContainer: {
        backgroundColor: colors.white,
        borderTopWidth: wp(1),
        borderTopColor: colors.primary + "20",
        padding: wp(16),
    },
    textInput: {
        fontFamily: fonts.poppins,
        fontSize: fp(16),
        color: colors.primary,
        backgroundColor: colors.white,
        borderWidth: wp(1),
        borderColor: colors.primary + "30",
        borderRadius: fp(12),
        padding: wp(16),
        minHeight: hp(100),
        maxHeight: hp(150),
        textAlignVertical: "top",
        letterSpacing: wp(0.3),
    },
    inputFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
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
    },
    addButtonDisabled: {
        backgroundColor: colors.primary + "40",
    },
    addButtonText: {
        fontFamily: fonts.poppinsSemiBold,
        fontSize: fp(14),
        color: colors.white,
        fontWeight: "600",
    },
    addButtonTextDisabled: {
        color: colors.white + "80",
    },
});
