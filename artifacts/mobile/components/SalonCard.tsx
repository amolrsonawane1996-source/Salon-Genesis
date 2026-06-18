import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { SALON_IMAGES, type Salon } from "@/constants/data";
import { useColors } from "@/hooks/useColors";

interface SalonCardProps {
  salon: Salon;
}

export function SalonCard({ salon }: SalonCardProps) {
  const colors = useColors();
  const router = useRouter();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, opacity: pressed ? 0.92 : 1 },
      ]}
      onPress={() => router.push(`/salon/${salon.id}`)}
    >
      <Image source={SALON_IMAGES[salon.imageIndex]} style={styles.image} />
      <View style={styles.body}>
        <Text style={[styles.name, { color: colors.foreground }]}>{salon.name}</Text>
        <View style={styles.row}>
          <Feather name="map-pin" size={13} color={colors.mutedForeground} />
          <Text style={[styles.location, { color: colors.mutedForeground }]}>
            {" "}{salon.city}, {salon.state}
          </Text>
        </View>
        <View style={styles.footer}>
          <View style={styles.ratingRow}>
            <Feather name="star" size={13} color={colors.primary} />
            <Text style={[styles.rating, { color: colors.foreground }]}>
              {" "}{salon.rating}
            </Text>
            <Text style={[styles.reviewCount, { color: colors.mutedForeground }]}>
              {" "}({salon.reviewCount})
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: colors.accent }]}>
            <Text style={[styles.badgeText, { color: colors.primary }]}>
              From ₹{Math.min(...salon.services.map((s) => s.price))}
            </Text>
          </View>
        </View>
        <View style={styles.categories}>
          {salon.categories.slice(0, 3).map((cat) => (
            <View key={cat} style={[styles.catPill, { backgroundColor: colors.muted }]}>
              <Text style={[styles.catText, { color: colors.mutedForeground }]}>{cat}</Text>
            </View>
          ))}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  image: {
    width: "100%",
    height: 180,
    resizeMode: "cover",
  },
  body: {
    padding: 14,
    gap: 6,
  },
  name: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  location: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  rating: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  reviewCount: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  categories: {
    flexDirection: "row",
    gap: 6,
    marginTop: 4,
  },
  catPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  catText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    textTransform: "capitalize",
  },
});
