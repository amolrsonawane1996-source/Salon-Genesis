import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SALON_IMAGES, SALONS } from "@/constants/data";
import { useColors } from "@/hooks/useColors";

export default function SalonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<"services" | "reviews">("services");

  const salon = SALONS.find((s) => s.id === id);

  if (!salon) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.background }]}>
        <Feather name="alert-circle" size={40} color={colors.mutedForeground} />
        <Text style={[styles.notFoundText, { color: colors.foreground }]}>Salon not found</Text>
      </View>
    );
  }

  function renderStars(rating: number) {
    const full = Math.floor(rating);
    return Array.from({ length: 5 }).map((_, i) => (
      <Feather
        key={i}
        name="star"
        size={13}
        color={i < full ? colors.primary : colors.muted}
      />
    ));
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image source={SALON_IMAGES[salon.imageIndex]} style={styles.banner} />
          <Pressable
            style={[
              styles.backBtn,
              {
                top: (Platform.OS === "web" ? 67 : insets.top) + 12,
                backgroundColor: "rgba(0,0,0,0.6)",
              },
            ]}
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={20} color="#FFFFFF" />
          </Pressable>
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
          <View style={styles.nameRow}>
            <Text style={[styles.salonName, { color: colors.foreground }]}>{salon.name}</Text>
          </View>

          <View style={styles.metaRow}>
            <Feather name="map-pin" size={14} color={colors.mutedForeground} />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
              {salon.city}, {salon.state}
            </Text>
            <View style={styles.dot} />
            <View style={styles.ratingRow}>
              <Feather name="star" size={14} color={colors.primary} />
              <Text style={[styles.rating, { color: colors.foreground }]}>{salon.rating}</Text>
              <Text style={[styles.reviewCount, { color: colors.mutedForeground }]}>
                ({salon.reviewCount})
              </Text>
            </View>
          </View>

          <Text style={[styles.description, { color: colors.mutedForeground }]}>
            {salon.description}
          </Text>

          <View style={styles.contactRow}>
            <Pressable
              style={[styles.contactBtn, { backgroundColor: "#25D366" }]}
            >
              <Feather name="message-circle" size={16} color="#FFFFFF" />
              <Text style={[styles.contactBtnText, { color: "#FFFFFF" }]}>WhatsApp</Text>
            </Pressable>
            <Pressable
              style={[styles.contactBtn, { backgroundColor: colors.muted }]}
            >
              <Feather name="phone" size={16} color={colors.foreground} />
              <Text style={[styles.contactBtnText, { color: colors.foreground }]}>Call</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.tabsRow}>
          {(["services", "reviews"] as const).map((tab) => (
            <Pressable
              key={tab}
              style={[
                styles.tabBtn,
                {
                  borderBottomColor:
                    activeTab === tab ? colors.primary : "transparent",
                  borderBottomWidth: 2,
                },
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === tab ? colors.primary : colors.mutedForeground },
                ]}
              >
                {tab === "services" ? "Services" : `Reviews (${salon.reviews.length})`}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.tabContent}>
          {activeTab === "services" && (
            <View style={[styles.servicesCard, { backgroundColor: colors.card }]}>
              {salon.services.map((service, i) => (
                <View
                  key={i}
                  style={[
                    styles.serviceRow,
                    i < salon.services.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                    },
                  ]}
                >
                  <View style={[styles.serviceIcon, { backgroundColor: colors.accent }]}>
                    <Feather name="scissors" size={14} color={colors.primary} />
                  </View>
                  <Text style={[styles.serviceName, { color: colors.foreground, flex: 1 }]}>
                    {service.name}
                  </Text>
                  <Text style={[styles.servicePrice, { color: colors.primary }]}>
                    ₹{service.price}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {activeTab === "reviews" && (
            <View style={[styles.servicesCard, { backgroundColor: colors.card }]}>
              {salon.reviews.map((review, i) => (
                <View
                  key={i}
                  style={[
                    styles.reviewItem,
                    i < salon.reviews.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.reviewHeader}>
                    <View style={[styles.reviewAvatar, { backgroundColor: "#111111" }]}>
                      <Text style={styles.reviewInitial}>{review.name.charAt(0)}</Text>
                    </View>
                    <View>
                      <Text style={[styles.reviewName, { color: colors.foreground }]}>
                        {review.name}
                      </Text>
                      <View style={styles.starsRow}>{renderStars(review.rating)}</View>
                    </View>
                  </View>
                  <Text style={[styles.reviewComment, { color: colors.mutedForeground }]}>
                    {review.comment}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={{ height: Platform.OS === "web" ? 34 + 80 : 120 }} />
      </ScrollView>

      <View
        style={[
          styles.bookBar,
          {
            backgroundColor: colors.card,
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 8),
            borderTopColor: colors.border,
          },
        ]}
      >
        <View>
          <Text style={[styles.bookBarFrom, { color: colors.mutedForeground }]}>Starting from</Text>
          <Text style={[styles.bookBarPrice, { color: colors.primary }]}>
            ₹{Math.min(...salon.services.map((s) => s.price))}
          </Text>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.bookNowBtn,
            { backgroundColor: "#111111", opacity: pressed ? 0.85 : 1 },
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push(`/book/${salon.id}`);
          }}
        >
          <Text style={styles.bookNowText}>Book Appointment</Text>
          <Feather name="arrow-right" size={16} color="#F5B041" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  notFoundText: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  imageContainer: { position: "relative" },
  banner: { width: "100%", height: 260, resizeMode: "cover" },
  backBtn: {
    position: "absolute",
    left: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  infoCard: {
    margin: 16,
    padding: 18,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  salonName: { fontSize: 22, fontFamily: "Inter_700Bold", flex: 1 },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  metaText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#BBBBBB",
  },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  rating: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  reviewCount: { fontSize: 12, fontFamily: "Inter_400Regular" },
  description: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20, marginBottom: 14 },
  contactRow: { flexDirection: "row", gap: 10 },
  contactBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  contactBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  tabsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  tabBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  tabText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  tabContent: { padding: 16 },
  servicesCard: {
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  serviceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
  },
  serviceIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  serviceName: { fontSize: 14, fontFamily: "Inter_500Medium" },
  servicePrice: { fontSize: 15, fontFamily: "Inter_700Bold" },
  reviewItem: { padding: 14 },
  reviewHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  reviewInitial: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#F5B041" },
  reviewName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  starsRow: { flexDirection: "row", gap: 2, marginTop: 2 },
  reviewComment: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  bookBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  bookBarFrom: { fontSize: 12, fontFamily: "Inter_400Regular" },
  bookBarPrice: { fontSize: 22, fontFamily: "Inter_700Bold" },
  bookNowBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: 12,
  },
  bookNowText: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: "#F5B041",
  },
});
