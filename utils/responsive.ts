import { Dimensions, PixelRatio } from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export const FIGMA_DESIGN_WIDTH = 393;
export const FIGMA_DESIGN_HEIGHT = 852;

export const fp = (figmaFontSize: number): number => {
    const scaledSize = (screenWidth / FIGMA_DESIGN_WIDTH) * figmaFontSize;
    return Math.max(12, PixelRatio.roundToNearestPixel(scaledSize));
};

export const wp = (figmaWidth: number): number => {
    return (screenWidth / FIGMA_DESIGN_WIDTH) * figmaWidth;
};

export const hp = (figmaHeight: number): number => {
    return (screenHeight / FIGMA_DESIGN_HEIGHT) * figmaHeight;
};

export const sp = (figmaSpacing: number): number => {
    return (screenWidth / FIGMA_DESIGN_WIDTH) * figmaSpacing;
};

export const spacing = {
    xxs: sp(4),
    xs: sp(8),
    sm: sp(12),
    md: sp(16),
    lg: sp(20),
    xl: sp(24),
    xxl: sp(32),
    xxxl: sp(40),
} as const;
