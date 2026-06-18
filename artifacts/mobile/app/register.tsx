import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { type UserRole, useAuth } from "@/context/AuthContext";
import { STATES } from "@/constants/data";
import { useColors } from "@/hooks/useColors";

export default function RegisterScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { register } = useAuth();

  const [role, setRole] = useState<UserRole>("customer");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("Maharashtra");
  const [showState, setShowState] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister() {
    if (!name || !phone || !email || !password || !city) {
      setError("Please fill in all fields");
      return;
    }
    if (phone.length < 10) {
      setError("Enter a valid 10-digit mobile number");
      return;
    }
    setLoading(true);
    setError("");
    const res = await register({ name, email, phone, password, role, city, state });
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
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: insets.top + (Platform.OS === "web" ? 67 : 16),
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 20),
          },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.logo, { color: colors.primary }]}>Next Generation Salon</Text>
        <Text style={[styles.heading, { color: colors.foreground }]}>Create Account</Text>
        <Text style={[styles.sub, { color: colors.mutedForeground }]}>Join India's salon platform</Text>

        {error ? (
          <View style={[styles.errorBox, { backgroundColor: "#FDE8E8" }]}>
            <Feather name="alert-circle" size={14} color="#DC3545" />
            <Text style={[styles.errorText, { color: "#DC3545" }]}>{error}</Text>
          </View>
        ) : null}

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>I am a</Text>
        <View style={styles.roleRow}>
          {(["customer", "owner"] as UserRole[]).map((r) => (
            <Pressable
              key={r}
              style={[
                styles.rolePill,
                {
                  backgroundColor: role === r ? colors.secondary : colors.muted,
                  flex: 1,
                },
              ]}
              onPress={() => setRole(r)}
            >
              <Feather
                name={r === "customer" ? "user" : "scissors"}
                size={14}
                color={role === r ? colors.secondaryForeground : colors.mutedForeground}
              />
              <Text
                style={[
                  styles.roleText,
                  { color: role === r ? colors.secondaryForeground : colors.mutedForeground },
                ]}
              >
                {r === "customer" ? "Customer" : "Salon Owner"}
              </Text>
            </Pressable>
          ))}
        </View>

        <Input label="Full Name" value={name} onChangeText={setName} placeholder="Enter your full name" colors={colors} />
        <Input label="Mobile Number" value={phone} onChangeText={setPhone} placeholder="10-digit mobile number" keyboardType="phone-pad" colors={colors} />
        <Input label="Email Address" value={email} onChangeText={setEmail} placeholder="Enter email address" keyboardType="email-address" autoCapitalize="none" colors={colors} />

        <Text style={[styles.label, { color: colors.mutedForeground }]}>Password</Text>
        <View style={[styles.passRow, { borderColor: colors.border }]}>
          <TextInput
            style={[styles.passInput, { color: colors.foreground }]}
            placeholder="Create password"
            placeholderTextColor={colors.mutedForeground}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPass}
          />
          <Pressable onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
            <Feather name={showPass ? "eye-off" : "eye"} size={18} color={colors.mutedForeground} />
          </Pressable>
        </View>

        <Input label="City" value={city} onChangeText={setCity} placeholder="Your city" colors={colors} />

        <Text style={[styles.label, { color: colors.mutedForeground }]}>State</Text>
        <Pressable
          style={[styles.selectBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
          onPress={() => setShowState(!showState)}
        >
          <Text style={[styles.selectText, { color: colors.foreground }]}>{state}</Text>
          <Feather name={showState ? "chevron-up" : "chevron-down"} size={18} color={colors.mutedForeground} />
        </Pressable>
        {showState && (
          <View style={[styles.dropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {STATES.map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.dropItem, { borderBottomColor: colors.border }]}
                onPress={() => { setState(s); setShowState(false); }}
              >
                <Text style={[styles.dropText, { color: s === state ? colors.primary : colors.foreground }]}>
                  {s}
                </Text>
                {s === state && <Feather name="check" size={14} color={colors.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Pressable
          style={({ pressed }) => [
            styles.registerBtn,
            { backgroundColor: colors.secondary, opacity: pressed ? 0.85 : 1 },
          ]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.secondaryForeground} />
          ) : (
            <Text style={[styles.registerBtnText, { color: colors.secondaryForeground }]}>
              Create Account
            </Text>
          )}
        </Pressable>

        <View style={styles.loginRow}>
          <Text style={[styles.loginText, { color: colors.mutedForeground }]}>Already have an account? </Text>
          <Pressable onPress={() => router.back()}>
            <Text style={[styles.loginLink, { color: colors.primary }]}>Login</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function Input({ label, colors, ...props }: any) {
  return (
    <>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
      <TextInput
        style={[styles.input, { borderColor: colors.border, color: colors.foreground }]}
        placeholderTextColor={colors.mutedForeground}
        {...props}
      />
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 20, flexGrow: 1 },
  logo: { fontSize: 22, fontFamily: "Inter_700Bold", textAlign: "center", marginBottom: 6 },
  heading: { fontSize: 24, fontFamily: "Inter_700Bold", marginBottom: 4 },
  sub: { fontSize: 14, fontFamily: "Inter_400Regular", marginBottom: 20 },
  errorBox: { flexDirection: "row", alignItems: "center", gap: 6, padding: 10, borderRadius: 8, marginBottom: 14 },
  errorText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  sectionLabel: { fontSize: 13, fontFamily: "Inter_500Medium", marginBottom: 8 },
  roleRow: { flexDirection: "row", gap: 10, marginBottom: 8 },
  rolePill: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 },
  roleText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  label: { fontSize: 13, fontFamily: "Inter_500Medium", marginBottom: 6, marginTop: 14 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, fontFamily: "Inter_400Regular" },
  passRow: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 10, paddingHorizontal: 14 },
  passInput: { flex: 1, paddingVertical: 12, fontSize: 15, fontFamily: "Inter_400Regular" },
  eyeBtn: { padding: 4 },
  selectBtn: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12 },
  selectText: { fontSize: 15, fontFamily: "Inter_400Regular" },
  dropdown: { borderWidth: 1, borderRadius: 10, overflow: "hidden", marginTop: 4 },
  dropItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1 },
  dropText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  registerBtn: { borderRadius: 10, paddingVertical: 14, alignItems: "center", marginTop: 24 },
  registerBtnText: { fontSize: 16, fontFamily: "Inter_700Bold" },
  loginRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 20, paddingBottom: 10 },
  loginText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  loginLink: { fontSize: 14, fontFamily: "Inter_700Bold" },
});
