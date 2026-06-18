import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BookingCard } from "@/components/BookingCard";
import { useAuth } from "@/context/AuthContext";
import { useBookings } from "@/context/BookingContext";
import { useColors } from "@/hooks/useColors";

export default function OwnerDashboard() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { bookings, updateStatus } = useBookings();

  if (!user || user.role !== "owner") {
    return (
      <View style={[styles.root, styles.center, { backgroundColor: colors.background }]}>
        <Feather name="lock" size={48} color={colors.mutedForeground} />
        <Text style={[styles.accessTitle, { color: colors.foreground }]}>Owner Access Only</Text>
        <Text style={[styles.accessText, { color: colors.mutedForeground }]}>
          Login with owner@salon.com / owner123
        </Text>
        <Pressable
          style={[styles.backBtn, { backgroundColor: "#111111" }]}
          onPress={() => router.back()}
        >
          <Text style={[styles.backBtnText]}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const confirmed = bookings.filter((b) => b.status === "Confirmed");
  const todaysBookings = confirmed.slice(0, 4);
  const monthlyRevenue = bookings
    .filter((b) => b.status === "Completed")
    .reduce((sum, b) => sum + b.servicePrice, 0);
  const totalBookings = bookings.length;
  const completedCount = bookings.filter((b) => b.status === "Completed").length;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            backgroundColor: "#111111",
            paddingTop: (Platform.OS === "web" ? 67 : insets.top) + 12,
          },
        ]}
      >
        <Pressable onPress={() => router.back()} style={styles.backIcon}>
          <Feather name="arrow-left" size={20} color="#FFFFFF" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Owner Dashboard</Text>
          <Text style={styles.headerSub}>{today}</Text>
        </View>
        <View style={[styles.ownerBadge, { backgroundColor: "#F5B041" + "30" }]}>
          <Feather name="scissors" size={14} color="#F5B041" />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.statsRow}>
          <StatCard
            icon="calendar"
            label="Today"
            value={todaysBookings.length}
            bg={colors.accent}
            iconColor={colors.primary}
            colors={colors}
          />
          <StatCard
            icon="check-circle"
            label="Total"
            value={totalBookings}
            bg="#D4EDDA"
            iconColor="#28A745"
            colors={colors}
          />
          <StatCard
            icon="award"
            label="Done"
            value={completedCount}
            bg="#CCE5FF"
            iconColor="#004085"
            colors={colors}
          />
        </View>

        <View style={[styles.revenueCard, { backgroundColor: "#111111" }]}>
          <View>
            <Text style={styles.revLabel}>Monthly Revenue</Text>
            <Text style={styles.revAmount}>₹{monthlyRevenue.toLocaleString("en-IN")}</Text>
          </View>
          <View style={styles.revIcon}>
            <Feather name="trending-up" size={28} color="#F5B041" />
          </View>
        </View>

        <View style={styles.quickActions}>
          <QuickAction
            icon="plus-circle"
            label="Add Service"
            colors={colors}
            onPress={() => {}}
          />
          <QuickAction
            icon="edit-2"
            label="Edit Salon"
            colors={colors}
            onPress={() => {}}
          />
          <QuickAction
            icon="bar-chart-2"
            label="Analytics"
            colors={colors}
            onPress={() => {}}
          />
          <QuickAction
            icon="settings"
            label="Settings"
            colors={colors}
            onPress={() => {}}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Recent Bookings ({confirmed.length} pending)
          </Text>
          {todaysBookings.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.card }]}>
              <Feather name="calendar" size={36} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                No bookings yet today
              </Text>
            </View>
          ) : (
            todaysBookings.map((b) => (
              <BookingCard
                key={b.id}
                booking={b}
                showActions
                onAccept={() => updateStatus(b.id, "Completed")}
                onReject={() => updateStatus(b.id, "Cancelled")}
              />
            ))
          )}
        </View>

        <View style={{ height: Platform.OS === "web" ? 34 : 100 }} />
      </ScrollView>
    </View>
  );
}

function StatCard({
  icon,
  label,
  value,
  bg,
  iconColor,
  colors,
}: {
  icon: string;
  label: string;
  value: number;
  bg: string;
  iconColor: string;
  colors: any;
}) {
  return (
    <View style={[styles.statCard, { backgroundColor: colors.card }]}>
      <View style={[styles.statIconBox, { backgroundColor: bg }]}>
        <Feather name={icon as any} size={18} color={iconColor} />
      </View>
      <Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

function QuickAction({
  icon,
  label,
  colors,
  onPress,
}: {
  icon: string;
  label: string;
  colors: any;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.quickBtn,
        { backgroundColor: colors.card, opacity: pressed ? 0.8 : 1 },
      ]}
      onPress={onPress}
    >
      <View style={[styles.quickIcon, { backgroundColor: colors.accent }]}>
        <Feather name={icon as any} size={18} color={colors.primary} />
      </View>
      <Text style={[styles.quickLabel, { color: colors.foreground }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { alignItems: "center", justifyContent: "center", padding: 30, gap: 14 },
  accessTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  accessText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
  backBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  backBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#F5B041" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 18,
  },
  backIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  headerTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  headerSub: { fontSize: 12, color: "rgba(255,255,255,0.6)", fontFamily: "Inter_400Regular" },
  ownerBadge: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  statsRow: { flexDirection: "row", gap: 12, padding: 16 },
  statCard: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  statIconBox: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  statValue: { fontSize: 22, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  revenueCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  revLabel: { fontSize: 14, color: "rgba(255,255,255,0.6)", fontFamily: "Inter_400Regular" },
  revAmount: { fontSize: 28, fontFamily: "Inter_700Bold", color: "#F5B041", marginTop: 4 },
  revIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(245,176,65,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  quickActions: {
    flexDirection: "row",
    gap: 10,
    padding: 16,
  },
  quickBtn: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  quickIcon: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  quickLabel: { fontSize: 11, fontFamily: "Inter_500Medium", textAlign: "center" },
  section: { paddingHorizontal: 16 },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 12 },
  emptyCard: {
    borderRadius: 14,
    padding: 30,
    alignItems: "center",
    gap: 10,
  },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular" },
});
