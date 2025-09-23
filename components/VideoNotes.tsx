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
import * as Haptics from "expo-haptics";
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
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import { useDispatch, useSelector } from "react-redux";

interface VideoNotesProps {
    videoId: string;
    currentVideoTime?: number; // Current video playback time in seconds
    onBeginInputFocus?: () => void;
}

export default function VideoNotes({
    videoId,
    currentVideoTime = 0,
    onBeginInputFocus,
}: VideoNotesProps) {
    const dispatch = useDispatch();
    const notes = useSelector((state: RootState) =>
        selectNotesForVideo(state, videoId)
    );
    const [newNoteText, setNewNoteText] = useState("");
    const [longPressActive, setLongPressActive] = useState<string | null>(null);
    const overlayOpacity = useSharedValue(0);

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

    const handleLongPressStart = useCallback(
        (noteId: string) => {
            setLongPressActive(noteId);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

            // Animate overlay fade in
            overlayOpacity.value = withTiming(1, {
                duration: 300,
                easing: Easing.out(Easing.quad),
            });
        },
        [overlayOpacity]
    );

    const handleLongPressEnd = useCallback(() => {
        setLongPressActive(null);

        // Animate overlay fade out
        overlayOpacity.value = withTiming(0, {
            duration: 200,
            easing: Easing.in(Easing.quad),
        });
    }, [overlayOpacity]);

    const handleLongPress = useCallback(
        (noteId: string) => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            setLongPressActive(null);

            // Reset animations immediately
            overlayOpacity.value = 0;

            handleDeleteNote(noteId);
        },
        [handleDeleteNote, overlayOpacity]
    );

    const formatVideoTime = (videoTime: number) => {
        const minutes = Math.floor(videoTime / 60);
        const seconds = videoTime % 60;
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    const animatedOverlayStyle = useAnimatedStyle(() => {
        return {
            opacity: overlayOpacity.value,
        };
    });

    const renderNoteItem = ({ item }: { item: VideoNote }) => (
        <TouchableOpacity
            style={[
                styles.noteItem,
                longPressActive === item.id && styles.noteItemLongPress,
            ]}
            onLongPress={() => handleLongPress(item.id)}
            onPressIn={() => handleLongPressStart(item.id)}
            onPressOut={handleLongPressEnd}
            delayLongPress={1000}
            activeOpacity={0.7}
        >
            {longPressActive === item.id && (
                <Animated.View
                    style={[styles.longPressOverlay, animatedOverlayStyle]}
                >
                    <Text style={styles.longPressText}>Hold to delete</Text>
                </Animated.View>
            )}
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
                keyboardShouldPersistTaps="handled"
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
                    onFocus={() => {
                        onBeginInputFocus && onBeginInputFocus();
                    }}
                    onPressIn={() => {
                        onBeginInputFocus && onBeginInputFocus();
                    }}
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
        position: "relative",
        overflow: "hidden",
    },
    noteItemLongPress: {
        backgroundColor: "#f8f9fa",
        borderColor: "#6b7280",
        borderWidth: wp(1.5),
        shadowColor: "#6b7280",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    longPressOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(107, 114, 128, 0.15)",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: fp(12),
        zIndex: 1,
    },
    longPressText: {
        color: "#374151",
        fontFamily: fonts.poppinsSemiBold,
        fontSize: fp(12),
        fontWeight: "600",
        textAlign: "center",
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        paddingHorizontal: wp(8),
        paddingVertical: hp(4),
        borderRadius: fp(8),
        overflow: "hidden",
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
