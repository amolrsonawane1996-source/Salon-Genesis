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
import { type BookingStatus, useBookings } from "@/context/BookingContext";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

const FILTERS: BookingStatus[] = ["Confirmed", "Completed", "Cancelled"];

export default function BookingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { getUserBookings } = useBookings();
  const [activeFilter, setActiveFilter] = useState<BookingStatus | "All">("All");

  if (!user) {
    return (
      <View style={[styles.root, styles.center, { backgroundColor: colors.background }]}>
        <Feather name="calendar" size={52} color={colors.mutedForeground} />
        <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No Bookings Yet</Text>
        <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
          Login to view and manage your appointments
        </Text>
        <Pressable
          style={[styles.loginBtn, { backgroundColor: "#111111" }]}
          onPress={() => router.push("/login")}
        >
          <Text style={[styles.loginBtnText, { color: "#FFFFFF" }]}>Login</Text>
        </Pressable>
      </View>
    );
  }

  const allBookings = getUserBookings(user.id);
  const filtered =
    activeFilter === "All"
      ? allBookings
      : allBookings.filter((b) => b.status === activeFilter);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            backgroundColor: "#111111",
            paddingTop: (Platform.OS === "web" ? 67 : insets.top) + 16,
          },
        ]}
      >
        <Text style={styles.headerTitle}>My Bookings</Text>
        <Text style={styles.headerSub}>{allBookings.length} total appointments</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.filtersRow}>
          <Pressable
            style={[
              styles.filterChip,
              {
                backgroundColor: activeFilter === "All" ? "#111111" : colors.card,
              },
            ]}
            onPress={() => setActiveFilter("All")}
          >
            <Text
              style={[
                styles.filterText,
                { color: activeFilter === "All" ? "#F5B041" : colors.foreground },
              ]}
            >
              All
            </Text>
          </Pressable>
          {FILTERS.map((f) => (
            <Pressable
              key={f}
              style={[
                styles.filterChip,
                { backgroundColor: activeFilter === f ? "#111111" : colors.card },
              ]}
              onPress={() => setActiveFilter(f)}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: activeFilter === f ? "#F5B041" : colors.foreground },
                ]}
              >
                {f}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.list}>
          {filtered.length === 0 ? (
            <View style={styles.empty}>
              <Feather name="calendar" size={44} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                No {activeFilter !== "All" ? activeFilter.toLowerCase() : ""} bookings
              </Text>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                Book an appointment to get started
              </Text>
              <Pressable
                style={[styles.bookBtn, { backgroundColor: colors.primary }]}
                onPress={() => router.push("/(tabs)/salons")}
              >
                <Text style={[styles.bookBtnText, { color: colors.primaryForeground }]}>
                  Find Salons
                </Text>
              </Pressable>
            </View>
          ) : (
            filtered.map((b) => <BookingCard key={b.id} booking={b} />)
          )}
        </View>

        <View style={{ height: Platform.OS === "web" ? 34 : 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { alignItems: "center", justifyContent: "center", padding: 30, gap: 12 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
  },
  headerSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.6)",
  },
  filtersRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  filterText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  list: {
    paddingHorizontal: 16,
  },
  empty: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  loginBtn: {
    marginTop: 8,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 10,
  },
  loginBtnText: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  bookBtn: {
    marginTop: 8,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 10,
  },
  bookBtnText: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
});
