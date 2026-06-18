import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
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
import { SALONS } from "@/constants/data";
import { useAuth } from "@/context/AuthContext";
import { useBookings } from "@/context/BookingContext";
import { useColors } from "@/hooks/useColors";

const PENDING_APPROVALS = [
  { id: "p1", name: "Glamour Zone", city: "Thane", state: "Maharashtra" },
  { id: "p2", name: "Fresh Cuts Studio", city: "Kolhapur", state: "Maharashtra" },
  { id: "p3", name: "Style Hub", city: "Solapur", state: "Maharashtra" },
];

export default function AdminPanel() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { bookings } = useBookings();
  const [pendingApprovals, setPendingApprovals] = useState(PENDING_APPROVALS);
  const [activeSection, setActiveSection] = useState<"overview" | "approvals" | "reports">("overview");

  if (!user || user.role !== "admin") {
    return (
      <View style={[styles.root, styles.center, { backgroundColor: colors.background }]}>
        <Feather name="shield-off" size={48} color={colors.mutedForeground} />
        <Text style={[styles.accessTitle, { color: colors.foreground }]}>Admin Access Only</Text>
        <Text style={[styles.accessText, { color: colors.mutedForeground }]}>
          Login with admin@salon.com / admin123
        </Text>
        <Pressable
          style={[styles.backBtn, { backgroundColor: "#111111" }]}
          onPress={() => router.back()}
        >
          <Text style={styles.backBtnText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  function handleApprove(id: string) {
    setPendingApprovals((prev) => prev.filter((p) => p.id !== id));
  }

  function handleReject(id: string) {
    setPendingApprovals((prev) => prev.filter((p) => p.id !== id));
  }

  const totalRevenue = bookings
    .filter((b) => b.status === "Completed")
    .reduce((sum, b) => sum + b.servicePrice, 0);

  const STATS = [
    { icon: "users", label: "Total Users", value: "1,250", color: "#2196F3" },
    { icon: "scissors", label: "Active Salons", value: SALONS.length.toString(), color: "#F5B041" },
    { icon: "calendar", label: "Bookings", value: bookings.length.toString(), color: "#28A745" },
    { icon: "dollar-sign", label: "Revenue", value: `₹${(totalRevenue / 1000).toFixed(0)}K`, color: "#9C27B0" },
  ];

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
          <Text style={styles.headerTitle}>Admin Panel</Text>
          <Text style={styles.headerSub}>Platform Management</Text>
        </View>
        <View style={[styles.adminBadge, { backgroundColor: "#DC354530" }]}>
          <Feather name="shield" size={14} color="#DC3545" />
        </View>
      </View>

      <View style={[styles.tabsRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {(["overview", "approvals", "reports"] as const).map((tab) => (
          <Pressable
            key={tab}
            style={[
              styles.tabBtn,
              { borderBottomColor: activeSection === tab ? colors.primary : "transparent" },
            ]}
            onPress={() => setActiveSection(tab)}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeSection === tab ? colors.primary : colors.mutedForeground },
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === "approvals" && pendingApprovals.length > 0
                ? ` (${pendingApprovals.length})`
                : ""}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {activeSection === "overview" && (
          <View style={styles.content}>
            <View style={styles.statsGrid}>
              {STATS.map((stat) => (
                <View
                  key={stat.label}
                  style={[styles.statCard, { backgroundColor: colors.card }]}
                >
                  <View style={[styles.statIcon, { backgroundColor: stat.color + "20" }]}>
                    <Feather name={stat.icon as any} size={20} color={stat.color} />
                  </View>
                  <Text style={[styles.statValue, { color: colors.foreground }]}>{stat.value}</Text>
                  <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{stat.label}</Text>
                </View>
              ))}
            </View>

            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>User Management</Text>
            <View style={[styles.menuCard, { backgroundColor: colors.card }]}>
              <AdminRow icon="users" label="Manage Customers" count="1,150" colors={colors} />
              <AdminRow icon="scissors" label="Manage Salon Owners" count="100" colors={colors} />
              <AdminRow icon="shield" label="Manage Admins" count="3" colors={colors} />
            </View>

            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Salon Management</Text>
            <View style={[styles.menuCard, { backgroundColor: colors.card }]}>
              {SALONS.map((salon) => (
                <View key={salon.id} style={[styles.salonRow, { borderBottomColor: colors.border }]}>
                  <View>
                    <Text style={[styles.salonRowName, { color: colors.foreground }]}>{salon.name}</Text>
                    <Text style={[styles.salonRowSub, { color: colors.mutedForeground }]}>
                      {salon.city} · {salon.rating}
                    </Text>
                  </View>
                  <View style={[styles.activeBadge, { backgroundColor: "#D4EDDA" }]}>
                    <Text style={[styles.activeBadgeText, { color: "#28A745" }]}>Active</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {activeSection === "approvals" && (
          <View style={styles.content}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Pending Approvals ({pendingApprovals.length})
            </Text>
            {pendingApprovals.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: colors.card }]}>
                <Feather name="check-circle" size={36} color="#28A745" />
                <Text style={[styles.emptyText, { color: colors.foreground }]}>
                  All caught up! No pending approvals.
                </Text>
              </View>
            ) : (
              pendingApprovals.map((salon) => (
                <View key={salon.id} style={[styles.approvalCard, { backgroundColor: colors.card }]}>
                  <View style={[styles.approvalIcon, { backgroundColor: colors.accent }]}>
                    <Feather name="scissors" size={22} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.approvalName, { color: colors.foreground }]}>{salon.name}</Text>
                    <Text style={[styles.approvalSub, { color: colors.mutedForeground }]}>
                      {salon.city}, {salon.state}
                    </Text>
                  </View>
                  <View style={styles.approvalBtns}>
                    <Pressable
                      style={[styles.approveBtn, { backgroundColor: "#D4EDDA" }]}
                      onPress={() => handleApprove(salon.id)}
                    >
                      <Feather name="check" size={16} color="#28A745" />
                    </Pressable>
                    <Pressable
                      style={[styles.rejectBtn, { backgroundColor: "#F8D7DA" }]}
                      onPress={() => handleReject(salon.id)}
                    >
                      <Feather name="x" size={16} color="#DC3545" />
                    </Pressable>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {activeSection === "reports" && (
          <View style={styles.content}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Revenue Overview</Text>
            <View style={[styles.reportCard, { backgroundColor: "#111111" }]}>
              <Text style={styles.reportLabel}>Total Platform Revenue</Text>
              <Text style={styles.reportAmount}>₹{totalRevenue.toLocaleString("en-IN")}</Text>
              <View style={styles.reportMeta}>
                <Feather name="trending-up" size={14} color="rgba(255,255,255,0.5)" />
                <Text style={styles.reportMetaText}>From {bookings.filter((b) => b.status === "Completed").length} completed bookings</Text>
              </View>
            </View>

            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Booking Stats</Text>
            <View style={[styles.menuCard, { backgroundColor: colors.card }]}>
              <ReportRow label="Total Bookings" value={bookings.length.toString()} colors={colors} />
              <ReportRow
                label="Confirmed"
                value={bookings.filter((b) => b.status === "Confirmed").length.toString()}
                colors={colors}
                color="#28A745"
              />
              <ReportRow
                label="Completed"
                value={bookings.filter((b) => b.status === "Completed").length.toString()}
                colors={colors}
                color="#2196F3"
              />
              <ReportRow
                label="Cancelled"
                value={bookings.filter((b) => b.status === "Cancelled").length.toString()}
                colors={colors}
                color="#DC3545"
              />
            </View>
          </View>
        )}

        <View style={{ height: Platform.OS === "web" ? 34 : 100 }} />
      </ScrollView>
    </View>
  );
}

function AdminRow({ icon, label, count, colors }: { icon: string; label: string; count: string; colors: any }) {
  return (
    <View style={[styles.adminRow, { borderBottomColor: colors.border }]}>
      <View style={[styles.adminRowIcon, { backgroundColor: colors.accent }]}>
        <Feather name={icon as any} size={15} color={colors.primary} />
      </View>
      <Text style={[styles.adminRowLabel, { color: colors.foreground, flex: 1 }]}>{label}</Text>
      <View style={[styles.adminRowBadge, { backgroundColor: colors.muted }]}>
        <Text style={[styles.adminRowCount, { color: colors.mutedForeground }]}>{count}</Text>
      </View>
      <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
    </View>
  );
}

function ReportRow({ label, value, colors, color }: { label: string; value: string; colors: any; color?: string }) {
  return (
    <View style={[styles.adminRow, { borderBottomColor: colors.border }]}>
      <Text style={[styles.adminRowLabel, { color: colors.foreground, flex: 1 }]}>{label}</Text>
      <Text style={[styles.reportRowValue, { color: color ?? colors.primary }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { alignItems: "center", justifyContent: "center", padding: 30, gap: 14 },
  accessTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  accessText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
  backBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  backBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#F5B041" },
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingBottom: 18 },
  backIcon: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.15)" },
  headerTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  headerSub: { fontSize: 12, color: "rgba(255,255,255,0.6)", fontFamily: "Inter_400Regular" },
  adminBadge: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  tabsRow: { flexDirection: "row", borderBottomWidth: 1 },
  tabBtn: { flex: 1, alignItems: "center", paddingVertical: 12, borderBottomWidth: 2 },
  tabText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  content: { padding: 16 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 20 },
  statCard: { width: "47%", borderRadius: 14, padding: 14, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  statIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  statValue: { fontSize: 22, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 10 },
  menuCard: { borderRadius: 14, overflow: "hidden", marginBottom: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  adminRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderBottomWidth: 1 },
  adminRowIcon: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  adminRowLabel: { fontSize: 14, fontFamily: "Inter_500Medium" },
  adminRowBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  adminRowCount: { fontSize: 12, fontFamily: "Inter_500Medium" },
  reportRowValue: { fontSize: 16, fontFamily: "Inter_700Bold" },
  salonRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14, borderBottomWidth: 1 },
  salonRowName: { fontSize: 14, fontFamily: "Inter_500Medium" },
  salonRowSub: { fontSize: 12, fontFamily: "Inter_400Regular" },
  activeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  activeBadgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  approvalCard: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, padding: 14, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  approvalIcon: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  approvalName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  approvalSub: { fontSize: 12, fontFamily: "Inter_400Regular" },
  approvalBtns: { flexDirection: "row", gap: 8 },
  approveBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  rejectBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  emptyCard: { borderRadius: 14, padding: 30, alignItems: "center", gap: 10 },
  emptyText: { fontSize: 14, fontFamily: "Inter_500Medium", textAlign: "center" },
  reportCard: { borderRadius: 16, padding: 20, marginBottom: 20 },
  reportLabel: { fontSize: 14, color: "rgba(255,255,255,0.6)", fontFamily: "Inter_400Regular" },
  reportAmount: { fontSize: 30, fontFamily: "Inter_700Bold", color: "#F5B041", marginTop: 4 },
  reportMeta: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 },
  reportMetaText: { fontSize: 12, color: "rgba(255,255,255,0.5)", fontFamily: "Inter_400Regular" },
});
