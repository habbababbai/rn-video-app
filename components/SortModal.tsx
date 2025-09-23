import { colors } from "@/constants/colors";
import { fonts } from "@/constants/fonts";
import { SortOrder } from "@/services/youtubeApi";
import { fp, hp, wp } from "@/utils/responsive";
import React from "react";
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";

interface SortModalProps {
    visible: boolean;
    onClose: () => void;
    currentSortOrder: SortOrder;
    onSortChange: (sortOrder: SortOrder) => void;
}

export default function SortModal({
    visible,
    onClose,
    currentSortOrder,
    onSortChange,
}: SortModalProps) {
    const sortOptions: { value: SortOrder; label: string }[] = [
        { value: "relevance", label: "Most Popular" },
        { value: "date", label: "Newest First" },
        { value: "rating", label: "Highest Rated" },
    ];

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Sort Videos</Text>
                            {sortOptions.map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.sortOption,
                                        currentSortOrder === option.value &&
                                            styles.sortOptionSelected,
                                    ]}
                                    onPress={() => onSortChange(option.value)}
                                >
                                    <Text
                                        style={[
                                            styles.sortOptionText,
                                            currentSortOrder === option.value &&
                                                styles.sortOptionTextSelected,
                                        ]}
                                    >
                                        {option.label}
                                    </Text>
                                    {currentSortOrder === option.value && (
                                        <Text style={styles.checkmark}>✓</Text>
                                    )}
                                </TouchableOpacity>
                            ))}
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={onClose}
                            >
                                <Text style={styles.cancelButtonText}>
                                    Cancel
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: wp(40),
    },
    modalContent: {
        backgroundColor: colors.white,
        borderRadius: fp(16),
        paddingVertical: hp(24),
        paddingHorizontal: wp(20),
        width: "100%",
        maxWidth: wp(300),
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
    },
    modalTitle: {
        fontFamily: fonts.poppinsSemiBold,
        fontSize: fp(18),
        color: colors.primary,
        textAlign: "center",
        marginBottom: hp(20),
        letterSpacing: wp(0.5),
    },
    sortOption: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: hp(16),
        paddingHorizontal: wp(16),
        borderRadius: fp(8),
        marginBottom: hp(8),
        backgroundColor: "#f8f9fa",
    },
    sortOptionSelected: {
        backgroundColor: colors.primary,
    },
    sortOptionText: {
        fontFamily: fonts.poppinsMedium,
        fontSize: fp(16),
        color: colors.primary,
        letterSpacing: wp(0.5),
    },
    sortOptionTextSelected: {
        color: colors.white,
    },
    checkmark: {
        fontFamily: fonts.poppinsSemiBold,
        fontSize: fp(18),
        color: colors.white,
    },
    cancelButton: {
        marginTop: hp(12),
        paddingVertical: hp(12),
        alignItems: "center",
    },
    cancelButtonText: {
        fontFamily: fonts.poppins,
        fontSize: fp(16),
        color: colors.primary,
        letterSpacing: wp(0.5),
    },
});
