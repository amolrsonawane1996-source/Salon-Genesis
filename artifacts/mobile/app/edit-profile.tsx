import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
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
import { STATES } from "@/constants/data";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

const GENDERS = ["Male", "Female", "Other", "Prefer not to say"];

export default function EditProfileScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, updateProfile } = useAuth();

  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: user?.name ?? "",
    phone: user?.phone ?? "",
    city: user?.city ?? "",
    state: user?.state ?? "",
    bio: user?.bio ?? "",
    whatsapp: user?.whatsapp ?? "",
    gender: user?.gender ?? "",
    dob: user?.dob ?? "",
    salonName: user?.salonName ?? "",
    businessAddress: user?.businessAddress ?? "",
    department: user?.department ?? "",
  });

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    if (!form.name.trim()) {
      Alert.alert("Validation", "Name is required.");
      return;
    }
    if (!form.phone.trim() || form.phone.replace(/\D/g, "").length < 10) {
      Alert.alert("Validation", "Enter a valid 10-digit phone number.");
      return;
    }
    if (!form.city.trim()) {
      Alert.alert("Validation", "City is required.");
      return;
    }

    setSaving(true);
    const result = await updateProfile({
      name: form.name.trim(),
      phone: form.phone.trim(),
      city: form.city.trim(),
      state: form.state,
      bio: form.bio.trim(),
      whatsapp: form.whatsapp.trim(),
      gender: form.gender,
      dob: form.dob.trim(),
      salonName: form.salonName.trim(),
      businessAddress: form.businessAddress.trim(),
      department: form.department.trim(),
    });
    setSaving(false);

    if (result.success) {
      if (Platform.OS !== "web") {
        Alert.alert("Saved!", "Your profile has been updated.", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        router.back();
      }
    } else {
      Alert.alert("Error", result.message);
    }
  }

  if (!user) return null;

  const roleColor =
    user.role === "admin" ? "#DC3545" : user.role === "owner" ? "#F5B041" : "#2196F3";
  const roleLabel =
    user.role === "admin" ? "Admin" : user.role === "owner" ? "Salon Owner" : "Customer";

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: "#111111",
            paddingTop: (Platform.OS === "web" ? 67 : insets.top) + 12,
          },
        ]}
      >
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="#FFFFFF" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={[styles.rolePill, { backgroundColor: roleColor + "30" }]}>
            <Text style={[styles.roleText, { color: roleColor }]}>{roleLabel}</Text>
          </View>
        </View>
        <Pressable
          style={[styles.saveBtn, { backgroundColor: saving ? "#999" : "#F5B041" }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <Feather name="loader" size={16} color="#111111" />
          ) : (
            <Feather name="check" size={16} color="#111111" />
          )}
          <Text style={styles.saveBtnText}>{saving ? "Saving..." : "Save"}</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Avatar section */}
        <View style={[styles.avatarSection, { backgroundColor: "#111111" }]}>
          <View style={[styles.avatar, { backgroundColor: roleColor }]}>
            <Text style={styles.avatarInitial}>
              {form.name.trim().charAt(0).toUpperCase() || "?"}
            </Text>
          </View>
          <View style={{ alignItems: "center", gap: 2 }}>
            <Text style={styles.avatarName}>{form.name || "Your Name"}</Text>
            <Text style={styles.avatarEmail}>{user.email}</Text>
          </View>
        </View>

        <View style={styles.sections}>
          {/* ─── Basic Info ─────────────────────────────────────────── */}
          <FormSection title="Basic Information" colors={colors}>
            <Field
              label="Full Name"
              icon="user"
              value={form.name}
              placeholder="Enter your full name"
              onChangeText={(v) => set("name", v)}
              colors={colors}
            />
            <Field
              label="Email"
              icon="mail"
              value={user.email}
              placeholder=""
              onChangeText={() => {}}
              colors={colors}
              editable={false}
              hint="Email cannot be changed"
            />
            <Field
              label="Phone Number"
              icon="phone"
              value={form.phone}
              placeholder="10-digit mobile number"
              onChangeText={(v) => set("phone", v)}
              keyboardType="phone-pad"
              colors={colors}
            />
            <Field
              label="WhatsApp Number"
              icon="message-circle"
              value={form.whatsapp}
              placeholder="WhatsApp number (if different)"
              onChangeText={(v) => set("whatsapp", v)}
              keyboardType="phone-pad"
              colors={colors}
            />
            <Field
              label="Bio"
              icon="file-text"
              value={form.bio}
              placeholder="A short bio about yourself..."
              onChangeText={(v) => set("bio", v)}
              multiline
              colors={colors}
            />
          </FormSection>

          {/* ─── Location ───────────────────────────────────────────── */}
          <FormSection title="Location" colors={colors}>
            <Field
              label="City"
              icon="map-pin"
              value={form.city}
              placeholder="Your city"
              onChangeText={(v) => set("city", v)}
              colors={colors}
            />
            <View style={[styles.fieldWrap, { borderBottomColor: colors.border }]}>
              <View style={[styles.fieldIcon, { backgroundColor: colors.accent }]}>
                <Feather name="globe" size={14} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>State</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginTop: 6 }}
                  contentContainerStyle={{ gap: 6, paddingRight: 8 }}
                >
                  {STATES.map((s) => (
                    <Pressable
                      key={s}
                      onPress={() => set("state", s)}
                      style={[
                        styles.stateChip,
                        {
                          backgroundColor:
                            form.state === s ? "#111111" : colors.muted,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.stateChipText,
                          { color: form.state === s ? "#F5B041" : colors.mutedForeground },
                        ]}
                      >
                        {s}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            </View>
          </FormSection>

          {/* ─── Customer-specific ──────────────────────────────────── */}
          {user.role === "customer" && (
            <FormSection title="Personal Details" colors={colors}>
              <View style={[styles.fieldWrap, { borderBottomColor: colors.border }]}>
                <View style={[styles.fieldIcon, { backgroundColor: colors.accent }]}>
                  <Feather name="users" size={14} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
                    Gender
                  </Text>
                  <View style={styles.genderRow}>
                    {GENDERS.map((g) => (
                      <Pressable
                        key={g}
                        onPress={() => set("gender", g)}
                        style={[
                          styles.genderChip,
                          {
                            backgroundColor:
                              form.gender === g ? "#111111" : colors.muted,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.genderChipText,
                            { color: form.gender === g ? "#F5B041" : colors.mutedForeground },
                          ]}
                        >
                          {g}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </View>
              <Field
                label="Date of Birth"
                icon="calendar"
                value={form.dob}
                placeholder="DD/MM/YYYY"
                onChangeText={(v) => set("dob", v)}
                keyboardType="numbers-and-punctuation"
                colors={colors}
              />
            </FormSection>
          )}

          {/* ─── Owner-specific ─────────────────────────────────────── */}
          {user.role === "owner" && (
            <FormSection title="Salon Information" colors={colors}>
              <Field
                label="Salon Name"
                icon="scissors"
                value={form.salonName}
                placeholder="Name of your salon"
                onChangeText={(v) => set("salonName", v)}
                colors={colors}
              />
              <Field
                label="Business Address"
                icon="map"
                value={form.businessAddress}
                placeholder="Full salon address"
                onChangeText={(v) => set("businessAddress", v)}
                multiline
                colors={colors}
              />
            </FormSection>
          )}

          {/* ─── Admin-specific ─────────────────────────────────────── */}
          {user.role === "admin" && (
            <FormSection title="Admin Details" colors={colors}>
              <Field
                label="Department"
                icon="shield"
                value={form.department}
                placeholder="e.g. Platform Management"
                onChangeText={(v) => set("department", v)}
                colors={colors}
              />
              <Field
                label="Admin ID"
                icon="hash"
                value={user.id}
                placeholder=""
                onChangeText={() => {}}
                editable={false}
                hint="System-assigned, cannot be changed"
                colors={colors}
              />
            </FormSection>
          )}

          {/* ─── Save button (bottom) ────────────────────────────────── */}
          <Pressable
            style={[styles.saveBottom, { backgroundColor: saving ? "#999" : "#111111" }]}
            onPress={handleSave}
            disabled={saving}
          >
            <Feather name={saving ? "loader" : "check-circle"} size={18} color="#F5B041" />
            <Text style={styles.saveBottomText}>
              {saving ? "Saving..." : "Save Changes"}
            </Text>
          </Pressable>

          <View style={{ height: Platform.OS === "web" ? 34 : 100 }} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function FormSection({
  title,
  children,
  colors,
}: {
  title: string;
  children: React.ReactNode;
  colors: any;
}) {
  return (
    <View style={styles.formSection}>
      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>{title}</Text>
      <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>{children}</View>
    </View>
  );
}

function Field({
  label,
  icon,
  value,
  placeholder,
  onChangeText,
  editable = true,
  keyboardType = "default",
  multiline = false,
  hint,
  colors,
}: {
  label: string;
  icon: string;
  value: string;
  placeholder: string;
  onChangeText: (v: string) => void;
  editable?: boolean;
  keyboardType?: any;
  multiline?: boolean;
  hint?: string;
  colors: any;
}) {
  return (
    <View style={[styles.fieldWrap, { borderBottomColor: colors.border }]}>
      <View style={[styles.fieldIcon, { backgroundColor: editable ? colors.accent : colors.muted }]}>
        <Feather name={icon as any} size={14} color={editable ? colors.primary : colors.mutedForeground} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{label}</Text>
        <TextInput
          style={[
            styles.fieldInput,
            {
              color: editable ? colors.foreground : colors.mutedForeground,
              height: multiline ? 72 : undefined,
              textAlignVertical: multiline ? "top" : "center",
            },
          ]}
          value={value}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground}
          onChangeText={onChangeText}
          editable={editable}
          keyboardType={keyboardType}
          multiline={multiline}
          autoCorrect={false}
        />
        {hint && (
          <Text style={[styles.fieldHint, { color: colors.mutedForeground }]}>{hint}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
  },
  rolePill: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 3,
  },
  roleText: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },
  saveBtnText: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    color: "#111111",
  },
  avatarSection: {
    alignItems: "center",
    gap: 10,
    paddingVertical: 24,
    paddingBottom: 28,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarInitial: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    color: "#111111",
  },
  avatarName: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
  },
  avatarEmail: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.55)",
  },
  sections: { padding: 16 },
  formSection: { marginBottom: 20 },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionCard: {
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  fieldWrap: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 14,
    borderBottomWidth: 1,
  },
  fieldIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  fieldLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.3,
    marginBottom: 3,
  },
  fieldInput: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    paddingVertical: 2,
  },
  fieldHint: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
    fontStyle: "italic",
  },
  stateChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
  },
  stateChipText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  genderRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 6,
  },
  genderChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
  },
  genderChipText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  saveBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    paddingVertical: 15,
    marginTop: 4,
    marginBottom: 8,
  },
  saveBottomText: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: "#F5B041",
  },
});
