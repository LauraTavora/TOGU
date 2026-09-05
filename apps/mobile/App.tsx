import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { lightColors } from "@togu/design-system";

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>TOGU</Text>
      <Text style={styles.subtitle}>Seu tempo. Suas pessoas. Juntos.</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightColors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: lightColors.textPrimary,
  },
  subtitle: {
    marginTop: 8,
    color: lightColors.textSecondary,
  },
});
