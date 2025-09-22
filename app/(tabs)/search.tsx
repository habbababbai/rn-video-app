import { StyleSheet, Text, View } from "react-native";

export default function SearchScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Search</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    text: {
        fontSize: 24,
        fontWeight: "bold",
    },
});
