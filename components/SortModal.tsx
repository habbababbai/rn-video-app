import { colors } from "@/constants/colors";
import { fonts } from "@/constants/fonts";
import { CustomSortOrder } from "@/services/youtubeApi";
import { fp, hp, spacing, wp } from "@/utils/responsive";
import React, { useEffect, useState } from "react";
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
    currentSortOrder: CustomSortOrder;
    onSortChange: (sortOrder: CustomSortOrder) => void;
}

export default function SortModal({
    visible,
    onClose,
    currentSortOrder,
    onSortChange,
}: SortModalProps) {
    const [selectedSortOrder, setSelectedSortOrder] =
        useState<CustomSortOrder>(currentSortOrder);

    const sortOptions: { value: CustomSortOrder; label: string }[] = [
        { value: "latest", label: "Upload date: latest" },
        { value: "oldest", label: "Upload date: oldest" },
        { value: "popular", label: "Most popular" },
    ];

    useEffect(() => {
        setSelectedSortOrder(currentSortOrder);
    }, [currentSortOrder]);

    const handleConfirm = () => {
        onSortChange(selectedSortOrder);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback
                        onPress={(e) => e.stopPropagation()}
                    >
                        <View style={styles.modalContent}>
                            <View>
                                <Text style={styles.modalTitle}>
                                    Sort records by:
                                </Text>
                                {sortOptions.map((option) => (
                                    <TouchableOpacity
                                        key={option.value}
                                        style={styles.sortOption}
                                        onPress={() =>
                                            setSelectedSortOrder(option.value)
                                        }
                                    >
                                        <View style={styles.optionContent}>
                                            <View style={styles.bulletDot}>
                                                {selectedSortOrder ===
                                                    option.value && (
                                                    <View
                                                        style={styles.solidDot}
                                                    />
                                                )}
                                            </View>
                                            <Text style={styles.sortOptionText}>
                                                {option.label}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <TouchableOpacity
                                style={styles.confirmButton}
                                onPress={handleConfirm}
                            >
                                <Text style={styles.confirmButtonText}>
                                    Confirm
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
        backgroundColor: colors.overlay.darker,
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        justifyContent: "space-between",
        backgroundColor: colors.secondary,
        borderRadius: fp(16),
        paddingVertical: hp(24),
        paddingHorizontal: wp(20),
        maxWidth: wp(300),
        shadowColor: colors.black,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
        height: hp(400),
        width: wp(320),
    },
    modalTitle: {
        fontFamily: fonts.poppinsSemiBold,
        fontWeight: "600",

        fontSize: fp(18),
        color: colors.white,
        textAlign: "left",
        marginBottom: hp(20),
        letterSpacing: wp(0.5),
        paddingHorizontal: spacing.xs,
    },
    sortOption: {
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        paddingVertical: hp(12),
        paddingHorizontal: wp(16),
    },
    optionContent: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    bulletDot: {
        width: fp(24),
        height: fp(24),
        borderRadius: wp(12),
        borderWidth: wp(2),
        borderColor: colors.white,
        marginRight: wp(12),
        alignItems: "center",
        justifyContent: "center",
    },
    solidDot: {
        width: wp(14),
        height: hp(14),
        borderRadius: wp(6),
        backgroundColor: colors.primary,
    },
    sortOptionText: {
        fontFamily: fonts.poppins,
        fontSize: fp(14),
        color: colors.white,
        letterSpacing: wp(0.5),
        fontWeight: "400",
    },
    confirmButton: {
        marginTop: hp(12),
        paddingVertical: hp(12),
        alignItems: "center",
        backgroundColor: colors.primary,
        width: wp(256),
        height: hp(40),
        borderRadius: fp(8),
    },
    confirmButtonText: {
        fontFamily: fonts.poppinsSemiBold,
        fontSize: fp(14),
        fontWeight: "600",
        color: colors.white,
        letterSpacing: wp(0.5),
    },
});
