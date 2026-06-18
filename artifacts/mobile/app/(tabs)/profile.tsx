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
        <Text style={[styles.guestTitle, { color: colors.foreground }]}>Join Next Generation Salon</Text>
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

  const ROLE_LABELS: Record<string, { label: string; color: string }> = {
    customer: { label: "Customer", color: "#2196F3" },
    owner: { label: "Salon Owner", color: "#F5B041" },
    admin: { label: "Admin", color: "#DC3545" },
  };

  const roleMeta = ROLE_LABELS[user.role] || { label: user.role, color: colors.primary };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View
          style={[
            styles.hero,
            {
              backgroundColor: "#111111",
              paddingTop: (Platform.OS === "web" ? 67 : insets.top) + 20,
            },
          ]}
        >
          <View style={styles.avatarRow}>
            <View style={[styles.avatar, { backgroundColor: "#F5B041" }]}>
              <Text style={styles.avatarInitial}>{user.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <View style={[styles.roleBadge, { backgroundColor: roleMeta.color + "30" }]}>
                <Text style={[styles.roleText, { color: roleMeta.color }]}>{roleMeta.label}</Text>
              </View>
            </View>
          </View>

          <View style={styles.statsRow}>
            <StatBlock value={confirmed} label="Upcoming" />
            <View style={[styles.statDivider, { backgroundColor: "rgba(255,255,255,0.15)" }]} />
            <StatBlock value={completed} label="Completed" />
            <View style={[styles.statDivider, { backgroundColor: "rgba(255,255,255,0.15)" }]} />
            <StatBlock value={`₹${totalSpent}`} label="Spent" />
          </View>
        </View>

        <View style={styles.content}>
          {user.role === "owner" && (
            <Section title="Owner Tools" colors={colors}>
              <MenuRow icon="bar-chart-2" label="Owner Dashboard" colors={colors} onPress={() => router.push("/owner")} />
            </Section>
          )}

          {user.role === "admin" && (
            <Section title="Admin Tools" colors={colors}>
              <MenuRow icon="shield" label="Admin Panel" colors={colors} onPress={() => router.push("/admin")} />
            </Section>
          )}

          <Section title="Account" colors={colors}>
            <MenuRow icon="user" label="Personal Info" colors={colors} value={`${user.city}, ${user.state}`} />
            <MenuRow icon="phone" label="Mobile Number" colors={colors} value={user.phone} />
            <MenuRow icon="mail" label="Email" colors={colors} value={user.email} />
          </Section>

          <Section title="Quick Access" colors={colors}>
            <MenuRow icon="calendar" label="My Bookings" colors={colors} onPress={() => router.push("/(tabs)/bookings")} />
            <MenuRow icon="map-pin" label="Find Salons" colors={colors} onPress={() => router.push("/(tabs)/salons")} />
          </Section>

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
  guestTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
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
  authBtnText: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: "#F5B041",
  },
  authBtnOutline: {
    borderWidth: 1.5,
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  authBtnOutlineText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  hero: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    color: "#111111",
  },
  userName: {
    fontSize: 19,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
  },
  userEmail: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.6)",
    marginTop: 2,
  },
  roleBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 5,
  },
  roleText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 14,
    paddingVertical: 14,
  },
  statBlock: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#F5B041",
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.6)",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    marginVertical: 4,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
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
  menuLabel: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  menuValue: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    maxWidth: 120,
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
  logoutText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
});
