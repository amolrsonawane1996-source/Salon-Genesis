import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useBookings } from "@/context/BookingContext";
import { useColors } from "@/hooks/useColors";

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { getUserBookings } = useBookings();

  function handleLogout() {
    if (Platform.OS === "web") {
      logout();
      return;
    }
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
      },
    ]);
  }

  if (!user) {
    return (
      <View style={[styles.root, styles.center, { backgroundColor: colors.background }]}>
        <View style={[styles.avatarPlaceholder, { backgroundColor: "#111111" }]}>
          <Feather name="user" size={40} color="#F5B041" />
        </View>
        <Text style={[styles.guestTitle, { color: colors.foreground }]}>
          Join Next Generation Salon
        </Text>
        <Text style={[styles.guestText, { color: colors.mutedForeground }]}>
          Sign in to book appointments, view your history, and manage your profile
        </Text>
        <Pressable
          style={[styles.authBtn, { backgroundColor: "#111111" }]}
          onPress={() => router.push("/login")}
        >
          <Feather name="log-in" size={16} color="#F5B041" />
          <Text style={styles.authBtnText}>Login</Text>
        </Pressable>
        <Pressable
          style={[styles.authBtnOutline, { borderColor: "#111111" }]}
          onPress={() => router.push("/register")}
        >
          <Text style={[styles.authBtnOutlineText, { color: "#111111" }]}>Create Account</Text>
        </Pressable>
      </View>
    );
  }

  const bookings = getUserBookings(user.id);
  const confirmed = bookings.filter((b) => b.status === "Confirmed").length;
  const completed = bookings.filter((b) => b.status === "Completed").length;
  const totalSpent = bookings
    .filter((b) => b.status === "Completed")
    .reduce((sum, b) => sum + b.servicePrice, 0);

  const ROLE_META: Record<string, { label: string; color: string; icon: string }> = {
    customer: { label: "Customer", color: "#2196F3", icon: "user" },
    owner: { label: "Salon Owner", color: "#F5B041", icon: "scissors" },
    admin: { label: "Admin", color: "#DC3545", icon: "shield" },
  };
  const roleMeta = ROLE_META[user.role] ?? { label: user.role, color: colors.primary, icon: "user" };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ─── Hero ─────────────────────────────────────────────────── */}
        <View
          style={[
            styles.hero,
            { backgroundColor: "#111111", paddingTop: (Platform.OS === "web" ? 67 : insets.top) + 20 },
          ]}
        >
          <View style={styles.avatarRow}>
            <View style={[styles.avatar, { backgroundColor: roleMeta.color }]}>
              <Text style={styles.avatarInitial}>{user.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <View style={[styles.roleBadge, { backgroundColor: roleMeta.color + "30" }]}>
                <Feather name={roleMeta.icon as any} size={10} color={roleMeta.color} />
                <Text style={[styles.roleText, { color: roleMeta.color }]}>{roleMeta.label}</Text>
              </View>
            </View>

            {/* Edit button */}
            <Pressable
              style={styles.editBtn}
              onPress={() => router.push("/edit-profile")}
            >
              <Feather name="edit-2" size={14} color="#F5B041" />
              <Text style={styles.editBtnText}>Edit</Text>
            </Pressable>
          </View>

          {/* Bio */}
          {user.bio ? (
            <Text style={styles.bio}>{user.bio}</Text>
          ) : null}

          {/* Stats */}
          <View style={styles.statsRow}>
            <StatBlock value={confirmed} label="Upcoming" />
            <View style={[styles.statDivider, { backgroundColor: "rgba(255,255,255,0.15)" }]} />
            <StatBlock value={completed} label="Completed" />
            <View style={[styles.statDivider, { backgroundColor: "rgba(255,255,255,0.15)" }]} />
            <StatBlock value={`₹${totalSpent}`} label="Spent" />
          </View>
        </View>

        <View style={styles.content}>

          {/* ─── Role-specific tools ─────────────────────────────────── */}
          {user.role === "owner" && (
            <Section title="Owner Tools" colors={colors}>
              <MenuRow
                icon="bar-chart-2"
                label="Owner Dashboard"
                colors={colors}
                onPress={() => router.push("/owner")}
              />
              {user.salonName ? (
                <MenuRow icon="scissors" label="Salon Name" colors={colors} value={user.salonName} />
              ) : null}
            </Section>
          )}

          {user.role === "admin" && (
            <Section title="Admin Tools" colors={colors}>
              <MenuRow
                icon="shield"
                label="Admin Panel"
                colors={colors}
                onPress={() => router.push("/admin")}
              />
              {user.department ? (
                <MenuRow icon="briefcase" label="Department" colors={colors} value={user.department} />
              ) : null}
            </Section>
          )}

          {/* ─── Account info ────────────────────────────────────────── */}
          <Section title="Account" colors={colors}>
            <InfoRow
              icon="user"
              label="Full Name"
              value={user.name}
              colors={colors}
              onEdit={() => router.push("/edit-profile")}
            />
            <InfoRow
              icon="phone"
              label="Mobile Number"
              value={user.phone}
              colors={colors}
              onEdit={() => router.push("/edit-profile")}
            />
            {user.whatsapp ? (
              <InfoRow icon="message-circle" label="WhatsApp" value={user.whatsapp} colors={colors} onEdit={() => router.push("/edit-profile")} />
            ) : null}
            <InfoRow
              icon="mail"
              label="Email"
              value={user.email}
              colors={colors}
            />
            <InfoRow
              icon="map-pin"
              label="Location"
              value={`${user.city}, ${user.state}`}
              colors={colors}
              onEdit={() => router.push("/edit-profile")}
            />
            {user.role === "customer" && user.gender ? (
              <InfoRow icon="users" label="Gender" value={user.gender} colors={colors} onEdit={() => router.push("/edit-profile")} />
            ) : null}
            {user.role === "customer" && user.dob ? (
              <InfoRow icon="calendar" label="Date of Birth" value={user.dob} colors={colors} onEdit={() => router.push("/edit-profile")} />
            ) : null}
            {user.role === "owner" && user.businessAddress ? (
              <InfoRow icon="map" label="Business Address" value={user.businessAddress} colors={colors} onEdit={() => router.push("/edit-profile")} />
            ) : null}
          </Section>

          {/* ─── Edit profile card ───────────────────────────────────── */}
          <Pressable
            style={[styles.editProfileCard, { backgroundColor: "#111111" }]}
            onPress={() => router.push("/edit-profile")}
          >
            <View style={styles.editProfileCardLeft}>
              <View style={[styles.editProfileIcon, { backgroundColor: "#F5B041" + "20" }]}>
                <Feather name="edit-3" size={20} color="#F5B041" />
              </View>
              <View>
                <Text style={styles.editProfileCardTitle}>Edit Your Profile</Text>
                <Text style={styles.editProfileCardSub}>
                  Update name, phone, location
                  {user.role === "owner" ? ", salon details" : ""}
                  {user.role === "customer" ? ", gender, DOB" : ""}
                  {user.role === "admin" ? ", department" : ""}
                </Text>
              </View>
            </View>
            <Feather name="chevron-right" size={18} color="#F5B041" />
          </Pressable>

          {/* ─── Quick access ────────────────────────────────────────── */}
          <Section title="Quick Access" colors={colors}>
            <MenuRow
              icon="calendar"
              label="My Bookings"
              colors={colors}
              onPress={() => router.push("/(tabs)/bookings")}
            />
            <MenuRow
              icon="map-pin"
              label="Find Salons"
              colors={colors}
              onPress={() => router.push("/(tabs)/salons")}
            />
            <MenuRow
              icon="map"
              label="Salon Map"
              colors={colors}
              onPress={() => router.push("/(tabs)/map")}
            />
          </Section>

          {/* ─── Logout ──────────────────────────────────────────────── */}
          <Pressable
            style={[styles.logoutBtn, { borderColor: colors.destructive }]}
            onPress={handleLogout}
          >
            <Feather name="log-out" size={16} color={colors.destructive} />
            <Text style={[styles.logoutText, { color: colors.destructive }]}>Logout</Text>
          </Pressable>
        </View>

        <View style={{ height: Platform.OS === "web" ? 34 : 100 }} />
      </ScrollView>
    </View>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatBlock({ value, label }: { value: string | number; label: string }) {
  return (
    <View style={styles.statBlock}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Section({
  title,
  children,
  colors,
}: {
  title: string;
  children: React.ReactNode;
  colors: any;
}) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>{title}</Text>
      <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>{children}</View>
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
  colors,
  onEdit,
}: {
  icon: string;
  label: string;
  value: string;
  colors: any;
  onEdit?: () => void;
}) {
  return (
    <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
      <View style={[styles.menuIcon, { backgroundColor: colors.accent }]}>
        <Feather name={icon as any} size={14} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: colors.foreground }]} numberOfLines={2}>
          {value}
        </Text>
      </View>
      {onEdit ? (
        <Pressable onPress={onEdit} hitSlop={8}>
          <Feather name="edit-2" size={13} color={colors.mutedForeground} />
        </Pressable>
      ) : null}
    </View>
  );
}

function MenuRow({
  icon,
  label,
  value,
  colors,
  onPress,
}: {
  icon: string;
  label: string;
  value?: string;
  colors: any;
  onPress?: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.menuRow,
        { borderBottomColor: colors.border, opacity: pressed ? 0.7 : 1 },
      ]}
      onPress={onPress}
    >
      <View style={[styles.menuIcon, { backgroundColor: colors.accent }]}>
        <Feather name={icon as any} size={15} color={colors.primary} />
      </View>
      <Text style={[styles.menuLabel, { color: colors.foreground, flex: 1 }]}>{label}</Text>
      {value ? (
        <Text style={[styles.menuValue, { color: colors.mutedForeground }]} numberOfLines={1}>
          {value}
        </Text>
      ) : null}
      {onPress ? <Feather name="chevron-right" size={16} color={colors.mutedForeground} /> : null}
    </Pressable>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { alignItems: "center", justifyContent: "center", padding: 30, gap: 16 },
  avatarPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  guestTitle: { fontSize: 20, fontFamily: "Inter_700Bold", textAlign: "center" },
  guestText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  authBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 12,
    width: "100%",
    justifyContent: "center",
  },
  authBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#F5B041" },
  authBtnOutline: {
    borderWidth: 1.5,
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  authBtnOutlineText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },

  hero: { paddingHorizontal: 20, paddingBottom: 24 },
  avatarRow: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 14 },
  avatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: { fontSize: 26, fontFamily: "Inter_700Bold", color: "#111111" },
  userName: { fontSize: 19, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  userEmail: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.6)",
    marginTop: 2,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 5,
  },
  roleText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: "rgba(245,176,65,0.15)",
    alignSelf: "flex-start",
  },
  editBtnText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#F5B041" },
  bio: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.65)",
    lineHeight: 18,
    marginBottom: 14,
    fontStyle: "italic",
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 14,
    paddingVertical: 14,
  },
  statBlock: { flex: 1, alignItems: "center" },
  statValue: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#F5B041" },
  statLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.6)",
    marginTop: 2,
  },
  statDivider: { width: 1, marginVertical: 4 },

  content: { padding: 16 },
  section: { marginBottom: 20 },
  sectionTitle: {
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
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderBottomWidth: 1,
  },
  infoLabel: { fontSize: 11, fontFamily: "Inter_400Regular", marginBottom: 2 },
  infoValue: { fontSize: 14, fontFamily: "Inter_500Medium", lineHeight: 19 },

  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
    borderBottomWidth: 1,
  },
  menuIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: { fontSize: 14, fontFamily: "Inter_500Medium" },
  menuValue: { fontSize: 12, fontFamily: "Inter_400Regular", maxWidth: 120 },

  editProfileCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  editProfileCardLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  editProfileIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  editProfileCardTitle: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  editProfileCardSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.55)",
    maxWidth: 200,
  },

  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 13,
    marginTop: 4,
    marginBottom: 8,
  },
  logoutText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
