import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { Booking, BookingStatus } from "@/context/BookingContext";
import { useColors } from "@/hooks/useColors";

interface BookingCardProps {
  booking: Booking;
  showActions?: boolean;
  onAccept?: () => void;
  onReject?: () => void;
}

const STATUS_CONFIG: Record<BookingStatus, { bg: string; text: string; icon: string }> = {
  Confirmed: { bg: "#D4EDDA", text: "#155724", icon: "check-circle" },
  Completed: { bg: "#CCE5FF", text: "#004085", icon: "award" },
  Cancelled: { bg: "#F8D7DA", text: "#721C24", icon: "x-circle" },
};

export function BookingCard({ booking, showActions, onAccept, onReject }: BookingCardProps) {
  const colors = useColors();
  const statusCfg = STATUS_CONFIG[booking.status];

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.salonName, { color: colors.foreground }]}>{booking.salonName}</Text>
          <Text style={[styles.location, { color: colors.mutedForeground }]}>
            {booking.salonCity}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
          <Feather name={statusCfg.icon as any} size={12} color={statusCfg.text} />
          <Text style={[styles.statusText, { color: statusCfg.text }]}>{booking.status}</Text>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.details}>
        <Detail icon="scissors" label={booking.service} colors={colors} />
        <Detail icon="calendar" label={booking.date} colors={colors} />
        <Detail icon="clock" label={booking.time} colors={colors} />
        <Detail icon="credit-card" label={booking.paymentMethod} colors={colors} />
      </View>

      <View style={styles.footer}>
        <Text style={[styles.amount, { color: colors.primary }]}>₹{booking.servicePrice}</Text>
        {showActions && booking.status === "Confirmed" && (
          <View style={styles.actions}>
            {onReject && (
              <View style={[styles.actionBtn, { backgroundColor: colors.muted }]}>
                <Text
                  onPress={onReject}
                  style={[styles.actionText, { color: colors.foreground }]}
                >
                  Reject
                </Text>
              </View>
            )}
            {onAccept && (
              <View style={[styles.actionBtn, { backgroundColor: colors.primary }]}>
                <Text
                  onPress={onAccept}
                  style={[styles.actionText, { color: colors.primaryForeground }]}
                >
                  Accept
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

function Detail({ icon, label, colors }: { icon: string; label: string; colors: any }) {
  return (
    <View style={styles.detailRow}>
      <Feather name={icon as any} size={13} color={colors.mutedForeground} />
      <Text style={[styles.detailText, { color: colors.foreground }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  salonName: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  location: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  divider: {
    height: 1,
    marginBottom: 12,
  },
  details: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    minWidth: "45%",
  },
  detailText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  amount: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  actionText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
});
