import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function LoginScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    setError("");
    const res = await login(email, password);
    setLoading(false);
    if (res.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)");
    } else {
      setError(res.message);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }

  return (
    <View style={[styles.root, { backgroundColor: "#111111" }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            {
              paddingTop: insets.top + (Platform.OS === "web" ? 67 : 20),
              paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 20),
            },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.topSection}>
            <Text style={styles.logo}>Next Generation Salon</Text>
            <Text style={styles.tagline}>Maharashtra & India's Premier Salon Platform</Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.title, { color: colors.foreground }]}>Welcome Back</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              Sign in to continue
            </Text>

            {error ? (
              <View style={[styles.errorBox, { backgroundColor: "#FDE8E8" }]}>
                <Feather name="alert-circle" size={14} color="#DC3545" />
                <Text style={[styles.errorText, { color: "#DC3545" }]}>{error}</Text>
              </View>
            ) : null}

            <Text style={[styles.label, { color: colors.mutedForeground }]}>Email</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.foreground }]}
              placeholder="Enter email address"
              placeholderTextColor={colors.mutedForeground}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={[styles.label, { color: colors.mutedForeground }]}>Password</Text>
            <View style={[styles.passwordContainer, { borderColor: colors.border }]}>
              <TextInput
                style={[styles.passwordInput, { color: colors.foreground }]}
                placeholder="Enter password"
                placeholderTextColor={colors.mutedForeground}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
              />
              <Pressable onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                <Feather name={showPass ? "eye-off" : "eye"} size={18} color={colors.mutedForeground} />
              </Pressable>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.loginBtn,
                { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
              ]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.primaryForeground} />
              ) : (
                <Text style={[styles.loginBtnText, { color: colors.primaryForeground }]}>Login</Text>
              )}
            </Pressable>

            <View style={styles.hint}>
              <Feather name="info" size={12} color={colors.mutedForeground} />
              <Text style={[styles.hintText, { color: colors.mutedForeground }]}>
                Demo: user@gmail.com / user123
              </Text>
            </View>

            <View style={styles.dividerRow}>
              <View style={[styles.divLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.divText, { color: colors.mutedForeground }]}>OR</Text>
              <View style={[styles.divLine, { backgroundColor: colors.border }]} />
            </View>

            <View style={styles.registerRow}>
              <Text style={[styles.registerText, { color: colors.mutedForeground }]}>
                Don't have an account?{" "}
              </Text>
              <Pressable onPress={() => router.push("/register")}>
                <Text style={[styles.registerLink, { color: colors.primary }]}>Register</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  topSection: {
    alignItems: "center",
    marginBottom: 28,
  },
  logo: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    color: "#F5B041",
    textAlign: "center",
  },
  tagline: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    fontFamily: "Inter_400Regular",
    marginTop: 6,
    textAlign: "center",
  },
  card: {
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginBottom: 20,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
  },
  errorText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  label: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  eyeBtn: {
    padding: 4,
  },
  loginBtn: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 20,
  },
  loginBtnText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  hint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    justifyContent: "center",
    marginTop: 10,
  },
  hintText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 18,
    gap: 10,
  },
  divLine: {
    flex: 1,
    height: 1,
  },
  divText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  registerText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  registerLink: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
});
