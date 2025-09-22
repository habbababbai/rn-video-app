import HomePressedIcon from "@/assets/images/svg/home-icon-pressed.svg";
import HomeIcon from "@/assets/images/svg/home-icon.svg";
import SearchPressedIcon from "@/assets/images/svg/search-icon-pressed.svg";
import SearchIcon from "@/assets/images/svg/search-icon.svg";
import { colors } from "@/constants/colors";
import { fonts } from "@/constants/fonts";
import { fp, hp, spacing, wp } from "@/utils/responsive";
import { Tabs } from "expo-router";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TabLayout() {
    return (
        <SafeAreaView
            style={{ flex: 1, backgroundColor: colors.secondary }}
            edges={["bottom"]}
        >
            <Tabs
                screenOptions={{
                    tabBarActiveTintColor: colors.white,
                    tabBarInactiveTintColor: colors.primary,
                    tabBarStyle: {
                        backgroundColor: colors.secondary,
                        paddingTop: hp(8),
                    },
                    tabBarLabelStyle: styles.tabBarLabelStyle,
                    headerShown: false,
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        title: "Home",
                        tabBarIcon: ({ focused }) =>
                            focused ? <HomePressedIcon /> : <HomeIcon />,
                    }}
                />
                <Tabs.Screen
                    name="search"
                    options={{
                        title: "Search",
                        tabBarIcon: ({ focused }) =>
                            focused ? <SearchPressedIcon /> : <SearchIcon />,
                    }}
                />
            </Tabs>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    tabBarLabelStyle: {
        padding: spacing.sm,
        fontFamily: fonts.poppins,
        fontSize: fp(16),
        letterSpacing: wp(1),
    },
});
