import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Image,
  Keyboard,
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
import { CATEGORIES, SALONS, type Salon } from "@/constants/data";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

const QUICK_SEARCHES = [
  { label: "Nashik", icon: "map-pin" },
  { label: "Mumbai", icon: "map-pin" },
  { label: "Pune", icon: "map-pin" },
  { label: "Haircut", icon: "scissors" },
  { label: "Facial", icon: "sun" },
  { label: "Bridal", icon: "heart" },
];

function scoreMatch(salon: Salon, query: string): number {
  const q = query.toLowerCase();
  let score = 0;
  if (salon.name.toLowerCase().startsWith(q)) score += 10;
  else if (salon.name.toLowerCase().includes(q)) score += 7;
  if (salon.city.toLowerCase().includes(q)) score += 6;
  if (salon.state.toLowerCase().includes(q)) score += 4;
  if (salon.categories.some((c) => c.includes(q))) score += 5;
  if (salon.services.some((s) => s.name.toLowerCase().includes(q))) score += 4;
  if (salon.address.toLowerCase().includes(q)) score += 2;
  return score;
}

function searchSalons(query: string): Salon[] {
  if (!query.trim()) return [];
  return SALONS.map((s) => ({ salon: s, score: scoreMatch(s, query) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.salon);
}

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [search, setSearch] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    "Nashik", "Haircut", "Facial",
  ]);

  const inputRef = useRef<TextInput>(null);
  const borderAnim = useRef(new Animated.Value(0)).current;
  const dropdownAnim = useRef(new Animated.Value(0)).current;

  const results = searchSalons(search);
  const showDropdown = isFocused && (search.length > 0 || recentSearches.length > 0);

  const animateFocus = useCallback((focused: boolean) => {
    Animated.timing(borderAnim, {
      toValue: focused ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
    Animated.timing(dropdownAnim, {
      toValue: focused ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, []);

  function handleFocus() {
    setIsFocused(true);
    animateFocus(true);
  }

  function handleBlur() {
    setTimeout(() => {
      setIsFocused(false);
      animateFocus(false);
    }, 150);
  }

  function commitSearch(q: string) {
    setSearch(q);
    inputRef.current?.blur();
    setIsFocused(false);
    animateFocus(false);
    if (q.trim() && !recentSearches.includes(q)) {
      setRecentSearches((prev) => [q, ...prev].slice(0, 5));
    }
    Keyboard.dismiss();
  }

  function clearSearch() {
    setSearch("");
    inputRef.current?.focus();
  }

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border ?? "#E5E7EB", "#F5B041"],
  });

  const topPaddingFromHeader =
    Platform.OS === "web" ? 67 + insets.top : insets.top;

  const topSalons = SALONS.slice(0, 3);
  const filteredByCategory = activeCategory
    ? SALONS.filter((s) => s.categories.includes(activeCategory))
    : [];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View
          style={[
            styles.heroSection,
            { backgroundColor: "#111111", paddingTop: topPaddingFromHeader + 16 },
          ]}
        >
          <View style={styles.greetingRow}>
            <View>
              <Text style={styles.greeting}>
                {user ? `Hello, ${user.name.split(" ")[0]} 👋` : "Welcome 👋"}
              </Text>
              <Text style={styles.heroTitle}>Find Your{"\n"}Perfect Salon</Text>
            </View>
            <Image
              source={require("@/assets/images/icon.png")}
              style={styles.heroIcon}
            />
          </View>

          <Animated.View
            style={[
              styles.searchBarWrapper,
              { backgroundColor: colors.card, borderColor },
            ]}
          >
            <Feather
              name="search"
              size={18}
              color={isFocused ? "#F5B041" : colors.mutedForeground}
            />
            <TextInput
              ref={inputRef}
              style={[styles.searchInput, { color: colors.foreground }]}
              placeholder="Search salons, cities, services..."
              placeholderTextColor={colors.mutedForeground}
              value={search}
              onChangeText={setSearch}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onSubmitEditing={() => commitSearch(search)}
              returnKeyType="search"
            />
            {search.length > 0 ? (
              <Pressable onPress={clearSearch} hitSlop={8}>
                <Feather name="x-circle" size={17} color={colors.mutedForeground} />
              </Pressable>
            ) : (
              <View style={[styles.filterHint, { backgroundColor: colors.muted }]}>
                <Feather name="sliders" size={12} color={colors.mutedForeground} />
              </View>
            )}
          </Animated.View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.quickRow}
            contentContainerStyle={{ paddingRight: 20 }}
          >
            {QUICK_SEARCHES.map((q) => (
              <Pressable
                key={q.label}
                style={[styles.quickChip, { backgroundColor: "rgba(255,255,255,0.10)" }]}
                onPress={() => commitSearch(q.label)}
              >
                <Feather name={q.icon as any} size={11} color="#F5B041" />
                <Text style={styles.quickChipText}>{q.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.container}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            <Pressable
              style={[
                styles.catPill,
                { backgroundColor: !activeCategory ? "#111111" : colors.card, marginLeft: 0 },
              ]}
              onPress={() => setActiveCategory(null)}
            >
              <Feather name="grid" size={14} color={!activeCategory ? "#F5B041" : colors.mutedForeground} />
              <Text style={[styles.catText, { color: !activeCategory ? "#F5B041" : colors.mutedForeground }]}>
                All
              </Text>
            </Pressable>
            {CATEGORIES.map((cat) => {
              const active = activeCategory === cat.id;
              return (
                <Pressable
                  key={cat.id}
                  style={[styles.catPill, { backgroundColor: active ? "#111111" : colors.card }]}
                  onPress={() => setActiveCategory(active ? null : cat.id)}
                >
                  <Feather name={cat.icon as any} size={14} color={active ? "#F5B041" : colors.mutedForeground} />
                  <Text style={[styles.catText, { color: active ? "#F5B041" : colors.mutedForeground }]}>
                    {cat.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {!search && activeCategory && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                  {CATEGORIES.find((c) => c.id === activeCategory)?.label} Salons
                </Text>
                <Text style={[styles.countBadge, { backgroundColor: colors.accent, color: colors.primary }]}>
                  {filteredByCategory.length}
                </Text>
              </View>
              {filteredByCategory.length === 0 ? (
                <EmptyState colors={colors} message="No salons for this category yet" />
              ) : (
                filteredByCategory.map((s) => <SalonCard key={s.id} salon={s} />)
              )}
            </>
          )}

          {search && (
            <View style={styles.resultsSection}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                  Search Results
                </Text>
                <View style={[styles.countBadgeWrap, { backgroundColor: results.length > 0 ? "#F5B041" : colors.muted }]}>
                  <Text style={[styles.countBadgeNum, { color: results.length > 0 ? "#111111" : colors.mutedForeground }]}>
                    {results.length}
                  </Text>
                </View>
              </View>
              {results.length === 0 ? (
                <EmptyState
                  colors={colors}
                  message={`No salons found for "${search}"`}
                  sub="Try searching a city, service, or salon name"
                />
              ) : (
                results.map((s) => <SalonCard key={s.id} salon={s} />)
              )}
            </View>
          )}

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

              <View style={[styles.promoCard, { backgroundColor: "#111111" }]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.promoTitle}>Salon Owner?</Text>
                  <Text style={styles.promoText}>
                    List your salon and reach thousands of customers across Maharashtra
                  </Text>
                  <Pressable style={styles.promoBtn} onPress={() => router.push("/register")}>
                    <Text style={styles.promoBtnText}>Register Now</Text>
                  </Pressable>
                </View>
                <Feather name="scissors" size={56} color="rgba(245,176,65,0.2)" />
              </View>
            </>
          )}

          <View style={{ height: Platform.OS === "web" ? 34 : 100 }} />
        </View>
      </ScrollView>

      {showDropdown && (
        <Animated.View
          style={[
            styles.dropdown,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              opacity: dropdownAnim,
              transform: [
                {
                  translateY: dropdownAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-8, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {search.length === 0 && recentSearches.length > 0 && (
            <>
              <View style={styles.dropdownSection}>
                <Feather name="clock" size={12} color={colors.mutedForeground} />
                <Text style={[styles.dropdownLabel, { color: colors.mutedForeground }]}>Recent</Text>
                <Pressable
                  onPress={() => setRecentSearches([])}
                  style={{ marginLeft: "auto" }}
                >
                  <Text style={[styles.clearAll, { color: colors.mutedForeground }]}>Clear</Text>
                </Pressable>
              </View>
              {recentSearches.map((r) => (
                <Pressable
                  key={r}
                  style={[styles.dropdownRow, { borderBottomColor: colors.border }]}
                  onPress={() => commitSearch(r)}
                >
                  <View style={[styles.dropdownIcon, { backgroundColor: colors.muted }]}>
                    <Feather name="clock" size={13} color={colors.mutedForeground} />
                  </View>
                  <Text style={[styles.dropdownText, { color: colors.foreground }]}>{r}</Text>
                  <Feather name="arrow-up-left" size={13} color={colors.mutedForeground} />
                </Pressable>
              ))}
            </>
          )}

          {search.length > 0 && results.length > 0 && (
            <>
              <View style={styles.dropdownSection}>
                <Feather name="scissors" size={12} color={colors.mutedForeground} />
                <Text style={[styles.dropdownLabel, { color: colors.mutedForeground }]}>
                  Salons ({results.length})
                </Text>
              </View>
              {results.slice(0, 4).map((salon) => (
                <Pressable
                  key={salon.id}
                  style={[styles.dropdownRow, { borderBottomColor: colors.border }]}
                  onPress={() => {
                    commitSearch(search);
                    router.push(`/salon/${salon.id}`);
                  }}
                >
                  <View style={[styles.dropdownIcon, { backgroundColor: colors.accent }]}>
                    <Feather name="scissors" size={13} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.dropdownText, { color: colors.foreground }]} numberOfLines={1}>
                      {salon.name}
                    </Text>
                    <Text style={[styles.dropdownSub, { color: colors.mutedForeground }]}>
                      {salon.city} · ⭐ {salon.rating}
                    </Text>
                  </View>
                  <Text style={[styles.dropdownPrice, { color: colors.primary }]}>
                    From ₹{Math.min(...salon.services.map((s) => s.price))}
                  </Text>
                </Pressable>
              ))}

              {results.length > 4 && (
                <Pressable
                  style={[styles.dropdownSeeAll, { borderTopColor: colors.border }]}
                  onPress={() => commitSearch(search)}
                >
                  <Text style={[styles.dropdownSeeAllText, { color: colors.primary }]}>
                    See all {results.length} results
                  </Text>
                  <Feather name="arrow-right" size={14} color={colors.primary} />
                </Pressable>
              )}
            </>
          )}

          {search.length > 0 && results.length === 0 && (
            <View style={styles.dropdownEmpty}>
              <Feather name="search" size={20} color={colors.mutedForeground} />
              <Text style={[styles.dropdownEmptyText, { color: colors.mutedForeground }]}>
                No results for "{search}"
              </Text>
            </View>
          )}
        </Animated.View>
      )}
    </View>
  );
}

function EmptyState({
  colors,
  message,
  sub,
}: {
  colors: any;
  message: string;
  sub?: string;
}) {
  return (
    <View style={styles.emptyState}>
      <Feather name="search" size={40} color={colors.mutedForeground} />
      <Text style={[styles.emptyTitle, { color: colors.foreground }]}>{message}</Text>
      {sub && (
        <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>{sub}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  heroSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
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
  searchBarWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderWidth: 1.5,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  filterHint: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  quickRow: {
    marginTop: 12,
    marginHorizontal: -20,
    paddingLeft: 20,
  },
  quickChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  quickChipText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.85)",
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
  countBadge: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  countBadgeWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  countBadgeNum: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
  },
  seeAll: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 12,
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
  resultsSection: {
    marginTop: 4,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
  },
  emptyText: {
    fontSize: 13,
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
  dropdown: {
    position: "absolute",
    top: Platform.OS === "web" ? 196 : 180,
    left: 14,
    right: 14,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
    zIndex: 100,
    overflow: "hidden",
  },
  dropdownSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  dropdownLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  clearAll: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  dropdownRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderBottomWidth: 1,
  },
  dropdownIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  dropdownText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    flex: 1,
  },
  dropdownSub: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
  dropdownPrice: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
  },
  dropdownSeeAll: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 13,
    borderTopWidth: 1,
  },
  dropdownSeeAllText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  dropdownEmpty: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 16,
  },
  dropdownEmptyText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
});
