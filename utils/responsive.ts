import { Dimensions, PixelRatio } from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export const FIGMA_DESIGN_WIDTH = 393;
export const FIGMA_DESIGN_HEIGHT = 852;

export const scale = (size: number): number => {
    return (screenWidth / FIGMA_DESIGN_WIDTH) * size;
};

export const scaleHeight = (size: number): number => {
    return (screenHeight / FIGMA_DESIGN_HEIGHT) * size;
};

export const scaleFont = (size: number): number => {
    const newSize = scale(size);
    return Math.max(12, PixelRatio.roundToNearestPixel(newSize));
};

export const wp = (percentage: number): number => {
    return (screenWidth * percentage) / 100;
};

export const hp = (percentage: number): number => {
    return (screenHeight * percentage) / 100;
};

export const getDeviceDimensions = () => ({
    width: screenWidth,
    height: screenHeight,
    figmaWidth: FIGMA_DESIGN_WIDTH,
    figmaHeight: FIGMA_DESIGN_HEIGHT,
});
