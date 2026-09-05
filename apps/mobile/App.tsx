import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
// Import direto do módulo de tokens (não do barrel `@togu/design-system`):
// os componentes do barrel são elementos DOM (<div>, <button>...) e não
// rodam em React Native, além de arrastarem os tipos de @types/react do
// web (v19) para o typecheck do mobile (v18), quebrando a compilação.
import { lightColors } from "@togu/design-system/src/tokens/colors";

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
