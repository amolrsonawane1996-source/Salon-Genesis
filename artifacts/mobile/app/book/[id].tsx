import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
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
import { SALONS, TIME_SLOTS } from "@/constants/data";
import { useAuth } from "@/context/AuthContext";
import { useBookings } from "@/context/BookingContext";
import { useColors } from "@/hooks/useColors";

type PaymentMethod = "Cash" | "UPI";

export default function BookScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { addBooking } = useBookings();

  const salon = SALONS.find((s) => s.id === id);

  const [customerName, setCustomerName] = useState(user?.name ?? "");
  const [customerPhone, setCustomerPhone] = useState(user?.phone ?? "");
  const [selectedService, setSelectedService] = useState(salon?.services[0] ?? null);
  const [date, setDate] = useState("");
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [selectedTime, setSelectedTime] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Cash");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!salon) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }]}>
        <Text style={{ color: colors.foreground }}>Salon not found</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.root, styles.center, { backgroundColor: colors.background }]}>
        <Feather name="lock" size={48} color={colors.mutedForeground} />
        <Text style={[styles.authTitle, { color: colors.foreground }]}>Login Required</Text>
        <Text style={[styles.authText, { color: colors.mutedForeground }]}>Please login to book an appointment</Text>
        <Pressable style={[styles.authBtn, { backgroundColor: "#111111" }]} onPress={() => router.push("/login")}>
          <Text style={[styles.authBtnText]}>Login</Text>
        </Pressable>
      </View>
    );
  }

  async function handleBook() {
    if (!customerName || !customerPhone || !selectedService || !date || !selectedTime) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    setError("");
    await addBooking({
      userId: user!.id,
      salonId: salon!.id,
      salonName: salon!.name,
      salonCity: salon!.city,
      service: selectedService.name,
      servicePrice: selectedService.price,
      date,
      time: selectedTime,
      paymentMethod,
    });
    setLoading(false);
    setSuccess(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  if (success) {
    return (
      <View style={[styles.root, styles.center, { backgroundColor: colors.background }]}>
        <View style={[styles.successIcon, { backgroundColor: "#D4EDDA" }]}>
          <Feather name="check" size={40} color="#28A745" />
        </View>
        <Text style={[styles.successTitle, { color: colors.foreground }]}>Booking Confirmed!</Text>
        <Text style={[styles.successText, { color: colors.mutedForeground }]}>
          Your appointment at {salon.name} has been booked successfully
        </Text>
        <View style={[styles.successCard, { backgroundColor: colors.card }]}>
          <SuccessRow label="Salon" value={salon.name} colors={colors} />
          <SuccessRow label="Service" value={selectedService?.name ?? ""} colors={colors} />
          <SuccessRow label="Date" value={date} colors={colors} />
          <SuccessRow label="Time" value={selectedTime} colors={colors} />
          <SuccessRow label="Amount" value={`₹${selectedService?.price}`} colors={colors} highlight />
        </View>
        <Pressable
          style={[styles.doneBtn, { backgroundColor: "#111111" }]}
          onPress={() => router.replace("/(tabs)/bookings")}
        >
          <Text style={styles.doneBtnText}>View My Bookings</Text>
        </Pressable>
      </View>
    );
  }

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
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color="#FFFFFF" />
        </Pressable>
        <View>
          <Text style={styles.headerTitle}>Book Appointment</Text>
          <Text style={styles.headerSub}>{salon.name} · {salon.city}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          {error ? (
            <View style={[styles.errorBox, { backgroundColor: "#FDE8E8" }]}>
              <Feather name="alert-circle" size={14} color="#DC3545" />
              <Text style={[styles.errorText, { color: "#DC3545" }]}>{error}</Text>
            </View>
          ) : null}

          <FormLabel label="Customer Name" colors={colors} />
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.foreground }]}
            placeholder="Your full name"
            placeholderTextColor={colors.mutedForeground}
            value={customerName}
            onChangeText={setCustomerName}
          />

          <FormLabel label="Mobile Number" colors={colors} />
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.foreground }]}
            placeholder="10-digit mobile number"
            placeholderTextColor={colors.mutedForeground}
            value={customerPhone}
            onChangeText={setCustomerPhone}
            keyboardType="phone-pad"
          />

          <FormLabel label="Select Service" colors={colors} />
          <View style={styles.servicesGrid}>
            {salon.services.map((svc) => {
              const selected = selectedService?.name === svc.name;
              return (
                <Pressable
                  key={svc.name}
                  style={[
                    styles.serviceChip,
                    {
                      backgroundColor: selected ? "#111111" : colors.card,
                      borderColor: selected ? "#111111" : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedService(svc)}
                >
                  <Text
                    style={[
                      styles.serviceChipName,
                      { color: selected ? "#FFFFFF" : colors.foreground },
                    ]}
                  >
                    {svc.name}
                  </Text>
                  <Text
                    style={[
                      styles.serviceChipPrice,
                      { color: selected ? "#F5B041" : colors.primary },
                    ]}
                  >
                    ₹{svc.price}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <FormLabel label="Date" colors={colors} />
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.foreground }]}
            placeholder="e.g. 25 Jun 2026"
            placeholderTextColor={colors.mutedForeground}
            value={date}
            onChangeText={setDate}
          />

          <FormLabel label="Time Slot" colors={colors} />
          <Pressable
            style={[styles.selectBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
            onPress={() => setShowTimeDropdown(!showTimeDropdown)}
          >
            <Text
              style={[
                styles.selectText,
                { color: selectedTime ? colors.foreground : colors.mutedForeground },
              ]}
            >
              {selectedTime || "Select time slot"}
            </Text>
            <Feather
              name={showTimeDropdown ? "chevron-up" : "chevron-down"}
              size={18}
              color={colors.mutedForeground}
            />
          </Pressable>
          {showTimeDropdown && (
            <View style={[styles.timesGrid, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {TIME_SLOTS.map((slot) => (
                <TouchableOpacity
                  key={slot}
                  style={[
                    styles.timeSlot,
                    {
                      backgroundColor:
                        selectedTime === slot ? "#111111" : colors.muted,
                    },
                  ]}
                  onPress={() => { setSelectedTime(slot); setShowTimeDropdown(false); }}
                >
                  <Text
                    style={[
                      styles.timeSlotText,
                      { color: selectedTime === slot ? "#F5B041" : colors.foreground },
                    ]}
                  >
                    {slot}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <FormLabel label="Payment Method" colors={colors} />
          <View style={styles.paymentRow}>
            {(["Cash", "UPI"] as PaymentMethod[]).map((pm) => (
              <Pressable
                key={pm}
                style={[
                  styles.paymentChip,
                  {
                    flex: 1,
                    backgroundColor: paymentMethod === pm ? "#111111" : colors.card,
                    borderColor: paymentMethod === pm ? "#111111" : colors.border,
                  },
                ]}
                onPress={() => setPaymentMethod(pm)}
              >
                <Feather
                  name={pm === "Cash" ? "dollar-sign" : "smartphone"}
                  size={16}
                  color={paymentMethod === pm ? "#F5B041" : colors.mutedForeground}
                />
                <Text
                  style={[
                    styles.paymentChipText,
                    { color: paymentMethod === pm ? "#FFFFFF" : colors.foreground },
                  ]}
                >
                  {pm}
                </Text>
              </Pressable>
            ))}
          </View>

          {selectedService && (
            <View style={[styles.summaryCard, { backgroundColor: colors.accent, borderColor: colors.primary + "40" }]}>
              <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Total Amount</Text>
              <Text style={[styles.summaryAmount, { color: colors.primary }]}>
                ₹{selectedService.price}
              </Text>
            </View>
          )}

          <Pressable
            style={({ pressed }) => [
              styles.bookBtn,
              { backgroundColor: "#111111", opacity: pressed ? 0.85 : 1 },
            ]}
            onPress={handleBook}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#F5B041" />
            ) : (
              <>
                <Text style={styles.bookBtnText}>Confirm Booking</Text>
                <Feather name="check" size={18} color="#F5B041" />
              </>
            )}
          </Pressable>
        </View>

        <View style={{ height: Platform.OS === "web" ? 34 : 40 }} />
      </ScrollView>
    </View>
  );
}

function FormLabel({ label, colors }: { label: string; colors: any }) {
  return (
    <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
  );
}

function SuccessRow({ label, value, colors, highlight }: { label: string; value: string; colors: any; highlight?: boolean }) {
  return (
    <View style={[styles.successRow, { borderBottomColor: colors.border }]}>
      <Text style={[styles.successRowLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.successRowValue, { color: highlight ? colors.primary : colors.foreground }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { alignItems: "center", justifyContent: "center", padding: 30, gap: 14 },
  authTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  authText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
  authBtn: { paddingHorizontal: 28, paddingVertical: 12, borderRadius: 10 },
  authBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#F5B041" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
    paddingBottom: 18,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  headerSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.6)" },
  content: { padding: 18 },
  errorBox: { flexDirection: "row", alignItems: "center", gap: 6, padding: 10, borderRadius: 8, marginBottom: 14 },
  errorText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  label: { fontSize: 13, fontFamily: "Inter_500Medium", marginTop: 16, marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, fontFamily: "Inter_400Regular" },
  servicesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  serviceChip: { borderWidth: 1, borderRadius: 10, padding: 12, minWidth: "45%", flexGrow: 1 },
  serviceChipName: { fontSize: 13, fontFamily: "Inter_600SemiBold", marginBottom: 4 },
  serviceChipPrice: { fontSize: 15, fontFamily: "Inter_700Bold" },
  selectBtn: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12 },
  selectText: { fontSize: 15, fontFamily: "Inter_400Regular" },
  timesGrid: { borderWidth: 1, borderRadius: 10, flexDirection: "row", flexWrap: "wrap", gap: 8, padding: 10, marginTop: 4 },
  timeSlot: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7, minWidth: "22%" },
  timeSlotText: { fontSize: 12, fontFamily: "Inter_500Medium", textAlign: "center" },
  paymentRow: { flexDirection: "row", gap: 10 },
  paymentChip: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1, borderRadius: 10, paddingVertical: 12 },
  paymentChipText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  summaryCard: { borderWidth: 1, borderRadius: 12, padding: 16, marginTop: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  summaryLabel: { fontSize: 14, fontFamily: "Inter_500Medium" },
  summaryAmount: { fontSize: 26, fontFamily: "Inter_700Bold" },
  bookBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 12, paddingVertical: 15, marginTop: 16 },
  bookBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#F5B041" },
  successIcon: { width: 88, height: 88, borderRadius: 44, alignItems: "center", justifyContent: "center" },
  successTitle: { fontSize: 22, fontFamily: "Inter_700Bold", textAlign: "center" },
  successText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
  successCard: { width: "100%", borderRadius: 14, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  successRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  successRowLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  successRowValue: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  doneBtn: { paddingHorizontal: 28, paddingVertical: 13, borderRadius: 12, marginTop: 6 },
  doneBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#F5B041" },
});
