import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SalonCard } from "@/components/SalonCard";
import { CATEGORIES, SALONS } from "@/constants/data";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const topSalons = SALONS.slice(0, 3);
  const filtered = SALONS.filter((s) => {
    const matchSearch =
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.city.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !activeCategory || s.categories.includes(activeCategory);
    return matchSearch && matchCategory;
  });

  const topPaddingFromHeader =
    Platform.OS === "web" ? 67 + insets.top : insets.top;

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={[
          styles.heroSection,
          { backgroundColor: "#111111", paddingTop: topPaddingFromHeader + 16 },
        ]}
      >
        <View style={styles.greetingRow}>
          <View>
            <Text style={styles.greeting}>
              {user ? `Hello, ${user.name.split(" ")[0]}` : "Welcome"}
            </Text>
            <Text style={styles.heroTitle}>Find Your{"\n"}Perfect Salon</Text>
          </View>
          <Image
            source={require("@/assets/images/icon.png")}
            style={styles.heroIcon}
          />
        </View>

        <View style={[styles.searchBar, { backgroundColor: colors.card }]}>
          <Feather name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search salons, cities..."
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <Pressable onPress={() => setSearch("")}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <View style={styles.container}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
          <Pressable
            style={[
              styles.catPill,
              {
                backgroundColor: !activeCategory ? "#111111" : colors.card,
                marginLeft: 0,
              },
            ]}
            onPress={() => setActiveCategory(null)}
          >
            <Feather name="grid" size={14} color={!activeCategory ? "#F5B041" : colors.mutedForeground} />
            <Text
              style={[
                styles.catText,
                { color: !activeCategory ? "#F5B041" : colors.mutedForeground },
              ]}
            >
              All
            </Text>
          </Pressable>
          {CATEGORIES.map((cat) => {
            const active = activeCategory === cat.id;
            return (
              <Pressable
                key={cat.id}
                style={[
                  styles.catPill,
                  { backgroundColor: active ? "#111111" : colors.card },
                ]}
                onPress={() => setActiveCategory(active ? null : cat.id)}
              >
                <Feather
                  name={cat.icon as any}
                  size={14}
                  color={active ? "#F5B041" : colors.mutedForeground}
                />
                <Text
                  style={[styles.catText, { color: active ? "#F5B041" : colors.mutedForeground }]}
                >
                  {cat.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {!search && !activeCategory && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Top Rated</Text>
              <Pressable onPress={() => router.push("/(tabs)/salons")}>
                <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
              </Pressable>
            </View>
            {topSalons.map((s) => (
              <SalonCard key={s.id} salon={s} />
            ))}
          </>
        )}

        {(search || activeCategory) && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 4 }]}>
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </Text>
            {filtered.length === 0 ? (
              <View style={styles.emptyState}>
                <Feather name="search" size={40} color={colors.mutedForeground} />
                <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No salons found</Text>
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                  Try searching a different city or service
                </Text>
              </View>
            ) : (
              filtered.map((s) => <SalonCard key={s.id} salon={s} />)
            )}
          </>
        )}

        {!search && !activeCategory && (
          <View style={[styles.promoCard, { backgroundColor: "#111111" }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.promoTitle}>Salon Owner?</Text>
              <Text style={styles.promoText}>List your salon and reach thousands of customers across Maharashtra</Text>
              <Pressable
                style={styles.promoBtn}
                onPress={() => router.push("/register")}
              >
                <Text style={styles.promoBtnText}>Register Now</Text>
              </Pressable>
            </View>
            <Feather name="scissors" size={56} color="rgba(245,176,65,0.2)" />
          </View>
        )}

        <View style={{ height: Platform.OS === "web" ? 34 : 100 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  heroSection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  greeting: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
    fontFamily: "Inter_400Regular",
  },
  heroTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    marginTop: 4,
    lineHeight: 34,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  container: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    marginBottom: 12,
  },
  seeAll: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  categoriesScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  catPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  catText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
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
  promoCard: {
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 8,
  },
  promoTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  promoText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.7)",
    marginBottom: 14,
    lineHeight: 18,
  },
  promoBtn: {
    backgroundColor: "#F5B041",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: "flex-start",
  },
  promoBtnText: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    color: "#111111",
  },
});
