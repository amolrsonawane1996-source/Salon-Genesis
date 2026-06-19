import { Feather } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  Animated,
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

// ─── Haversine distance (km) ────────────────────────────────────────────────
function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDist(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

// ─── Scoring search ──────────────────────────────────────────────────────────
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

type NearSalon = Salon & { distance: number };

// ─── Pulsing dot for location loading ───────────────────────────────────────
function PulseDot({ color }: { color: string }) {
  const scale = useRef(new Animated.Value(1)).current;
  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.4, duration: 600, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View
      style={{
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: color,
        transform: [{ scale }],
      }}
    />
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [search, setSearch] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>(["Nashik", "Haircut", "Facial"]);

  // Near Me state
  const [nearMeActive, setNearMeActive] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [nearMeSalons, setNearMeSalons] = useState<NearSalon[]>([]);
  const [userCity, setUserCity] = useState<string | null>(null);

  const inputRef = useRef<TextInput>(null);
  const borderAnim = useRef(new Animated.Value(0)).current;
  const dropdownAnim = useRef(new Animated.Value(0)).current;
  const nearMeAnim = useRef(new Animated.Value(0)).current;

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

  // ─── Near Me handler ───────────────────────────────────────────────────────
  async function handleNearMe() {
    if (nearMeActive) {
      // Toggle off
      setNearMeActive(false);
      setNearMeSalons([]);
      setUserCity(null);
      setLocationError(null);
      Animated.timing(nearMeAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start();
      return;
    }

    setLocationLoading(true);
    setLocationError(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationError("Location permission denied. Enable it in Settings to find nearby salons.");
        setLocationLoading(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = loc.coords;

      // Reverse geocode to get city name
      try {
        const [geo] = await Location.reverseGeocodeAsync({ latitude, longitude });
        setUserCity(geo?.city ?? geo?.subregion ?? null);
      } catch {}

      // Calculate distances and sort
      const salonsWithDist: NearSalon[] = SALONS.map((s) => ({
        ...s,
        distance: haversine(latitude, longitude, s.lat, s.lng),
      })).sort((a, b) => a.distance - b.distance);

      setNearMeSalons(salonsWithDist);
      setNearMeActive(true);
      // Clear search / category when near me activates
      setSearch("");
      setActiveCategory(null);

      Animated.spring(nearMeAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 70,
        friction: 12,
      }).start();
    } catch (e) {
      setLocationError("Could not get your location. Please try again.");
    } finally {
      setLocationLoading(false);
    }
  }

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border ?? "#E5E7EB", "#F5B041"],
  });

  const topPaddingFromHeader = Platform.OS === "web" ? 67 + insets.top : insets.top;
  const topSalons = SALONS.slice(0, 3);
  const filteredByCategory = activeCategory
    ? SALONS.filter((s) => s.categories.includes(activeCategory))
    : [];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ─── Hero / Search header ─────────────────────────────────── */}
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
              <Text style={styles.heroTitle}>{"Find Your\nPerfect Salon"}</Text>
            </View>
            <Image source={require("@/assets/images/icon.png")} style={styles.heroIcon} />
          </View>

          {/* Search row */}
          <View style={styles.searchRow}>
            <Animated.View
              style={[styles.searchBarWrapper, { backgroundColor: colors.card, borderColor, flex: 1 }]}
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
                onChangeText={(t) => {
                  setSearch(t);
                  if (nearMeActive) { setNearMeActive(false); setNearMeSalons([]); }
                }}
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
                <View style={[styles.filterHint, { backgroundColor: "rgba(255,255,255,0.12)" }]}>
                  <Feather name="sliders" size={12} color="rgba(255,255,255,0.5)" />
                </View>
              )}
            </Animated.View>

            {/* Near Me button */}
            <Pressable
              style={[
                styles.nearMeBtn,
                {
                  backgroundColor: nearMeActive
                    ? "#F5B041"
                    : locationLoading
                    ? "rgba(245,176,65,0.3)"
                    : "rgba(255,255,255,0.12)",
                },
              ]}
              onPress={handleNearMe}
              disabled={locationLoading}
            >
              {locationLoading ? (
                <PulseDot color="#F5B041" />
              ) : (
                <Feather
                  name="navigation"
                  size={17}
                  color={nearMeActive ? "#111111" : "#F5B041"}
                />
              )}
            </Pressable>
          </View>

          {/* Quick search chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.quickRow}
            contentContainerStyle={{ paddingRight: 20 }}
          >
            {/* Near Me chip if active shows city */}
            {nearMeActive && userCity && (
              <View style={[styles.quickChip, { backgroundColor: "#F5B041" }]}>
                <Feather name="navigation" size={11} color="#111111" />
                <Text style={[styles.quickChipText, { color: "#111111" }]}>
                  {"Near " + userCity}
                </Text>
              </View>
            )}
            {QUICK_SEARCHES.map((q) => (
              <Pressable
                key={q.label}
                style={[styles.quickChip, { backgroundColor: "rgba(255,255,255,0.10)" }]}
                onPress={() => {
                  if (nearMeActive) { setNearMeActive(false); setNearMeSalons([]); }
                  commitSearch(q.label);
                }}
              >
                <Feather name={q.icon as any} size={11} color="#F5B041" />
                <Text style={styles.quickChipText}>{q.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.container}>
          {/* Location error banner */}
          {locationError && (
            <View style={[styles.errorBanner, { backgroundColor: "#FFF3CD" }]}>
              <Feather name="alert-triangle" size={15} color="#856404" />
              <Text style={styles.errorText}>{locationError}</Text>
              <Pressable onPress={() => setLocationError(null)}>
                <Feather name="x" size={14} color="#856404" />
              </Pressable>
            </View>
          )}

          {/* ─── Near Me Results ─────────────────────────────────────── */}
          {nearMeActive && nearMeSalons.length > 0 && (
            <Animated.View
              style={{
                opacity: nearMeAnim,
                transform: [
                  {
                    translateY: nearMeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              }}
            >
              {/* Location pill */}
              <View style={[styles.locationPill, { backgroundColor: colors.card }]}>
                <View style={styles.locationDot} />
                <Text style={[styles.locationPillText, { color: colors.foreground }]}>
                  {userCity ? `Salons near ${userCity}` : "Salons near you"}
                </Text>
                <Text style={[styles.locationPillSub, { color: colors.mutedForeground }]}>
                  {" · "}sorted by distance
                </Text>
              </View>

              {nearMeSalons.map((salon, idx) => (
                <View key={salon.id} style={styles.nearMeCardWrap}>
                  <SalonCard salon={salon} />
                  {/* Distance badge overlay */}
                  <View style={styles.distanceBadgeWrap}>
                    <View
                      style={[
                        styles.distanceBadge,
                        {
                          backgroundColor:
                            idx === 0 ? "#F5B041" : colors.card,
                          borderColor: idx === 0 ? "#F5B041" : colors.border,
                        },
                      ]}
                    >
                      <Feather
                        name="navigation"
                        size={10}
                        color={idx === 0 ? "#111111" : colors.primary}
                      />
                      <Text
                        style={[
                          styles.distanceBadgeText,
                          { color: idx === 0 ? "#111111" : colors.primary },
                        ]}
                      >
                        {formatDist(salon.distance)}
                        {idx === 0 ? " · Nearest" : ""}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}

              <Pressable
                style={[styles.clearNearMe, { borderColor: colors.border }]}
                onPress={() => {
                  setNearMeActive(false);
                  setNearMeSalons([]);
                  setUserCity(null);
                }}
              >
                <Feather name="x" size={13} color={colors.mutedForeground} />
                <Text style={[styles.clearNearMeText, { color: colors.mutedForeground }]}>
                  Clear Near Me
                </Text>
              </Pressable>
            </Animated.View>
          )}

          {/* ─── Categories ──────────────────────────────────────────── */}
          {!nearMeActive && (
            <>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Categories</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoriesScroll}
              >
                <Pressable
                  style={[
                    styles.catPill,
                    { backgroundColor: !activeCategory ? "#111111" : colors.card, marginLeft: 0 },
                  ]}
                  onPress={() => setActiveCategory(null)}
                >
                  <Feather
                    name="grid"
                    size={14}
                    color={!activeCategory ? "#F5B041" : colors.mutedForeground}
                  />
                  <Text
                    style={[styles.catText, { color: !activeCategory ? "#F5B041" : colors.mutedForeground }]}
                  >
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
                      <Feather
                        name={cat.icon as any}
                        size={14}
                        color={active ? "#F5B041" : colors.mutedForeground}
                      />
                      <Text style={[styles.catText, { color: active ? "#F5B041" : colors.mutedForeground }]}>
                        {cat.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {/* Category results */}
              {!search && activeCategory && (
                <>
                  <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                      {CATEGORIES.find((c) => c.id === activeCategory)?.label} Salons
                    </Text>
                    <Text
                      style={[
                        styles.countBadge,
                        { backgroundColor: colors.accent, color: colors.primary },
                      ]}
                    >
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

              {/* Search results */}
              {search && (
                <View style={styles.resultsSection}>
                  <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                      Search Results
                    </Text>
                    <View
                      style={[
                        styles.countBadgeWrap,
                        { backgroundColor: results.length > 0 ? "#F5B041" : colors.muted },
                      ]}
                    >
                      <Text
                        style={[
                          styles.countBadgeNum,
                          { color: results.length > 0 ? "#111111" : colors.mutedForeground },
                        ]}
                      >
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

              {/* Default: Top rated + promo */}
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
            </>
          )}

          <View style={{ height: Platform.OS === "web" ? 34 : 100 }} />
        </View>
      </ScrollView>

      {/* ─── Live search dropdown ──────────────────────────────────── */}
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
                <Pressable onPress={() => setRecentSearches([])} style={{ marginLeft: "auto" }}>
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
                  {"Salons (" + results.length + ")"}
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
                    <Text
                      style={[styles.dropdownText, { color: colors.foreground }]}
                      numberOfLines={1}
                    >
                      {salon.name}
                    </Text>
                    <Text style={[styles.dropdownSub, { color: colors.mutedForeground }]}>
                      {salon.city + " · ⭐ " + salon.rating}
                    </Text>
                  </View>
                  <Text style={[styles.dropdownPrice, { color: colors.primary }]}>
                    {"₹" + Math.min(...salon.services.map((s) => s.price))}
                  </Text>
                </Pressable>
              ))}
              {results.length > 4 && (
                <Pressable
                  style={[styles.dropdownSeeAll, { borderTopColor: colors.border }]}
                  onPress={() => commitSearch(search)}
                >
                  <Text style={[styles.dropdownSeeAllText, { color: colors.primary }]}>
                    {"See all " + results.length + " results"}
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
                {'No results for "' + search + '"'}
              </Text>
            </View>
          )}
        </Animated.View>
      )}
    </View>
  );
}

function EmptyState({ colors, message, sub }: { colors: any; message: string; sub?: string }) {
  return (
    <View style={styles.emptyState}>
      <Feather name="search" size={40} color={colors.mutedForeground} />
      <Text style={[styles.emptyTitle, { color: colors.foreground }]}>{message}</Text>
      {sub && <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>{sub}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  heroSection: { paddingHorizontal: 20, paddingBottom: 20 },
  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  greeting: { fontSize: 14, color: "rgba(255,255,255,0.6)", fontFamily: "Inter_400Regular" },
  heroTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    marginTop: 4,
    lineHeight: 34,
  },
  heroIcon: { width: 56, height: 56, borderRadius: 12 },

  searchRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  searchBarWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderWidth: 1.5,
  },
  searchInput: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  filterHint: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  nearMeBtn: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  quickRow: { marginTop: 12, marginHorizontal: -20, paddingLeft: 20 },
  quickChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  quickChipText: { fontSize: 12, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.85)" },

  container: { padding: 20 },

  errorBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#856404",
    lineHeight: 18,
  },

  locationPill: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignSelf: "flex-start",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  locationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#F5B041",
    marginRight: 6,
  },
  locationPillText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  locationPillSub: { fontSize: 12, fontFamily: "Inter_400Regular" },

  nearMeCardWrap: { position: "relative", marginBottom: 2 },
  distanceBadgeWrap: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
  },
  distanceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 3,
  },
  distanceBadgeText: { fontSize: 11, fontFamily: "Inter_700Bold" },

  clearNearMe: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 8,
    marginBottom: 8,
  },
  clearNearMeText: { fontSize: 13, fontFamily: "Inter_500Medium" },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 12 },
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
  countBadgeNum: { fontSize: 12, fontFamily: "Inter_700Bold" },
  seeAll: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 12 },
  categoriesScroll: { marginHorizontal: -20, paddingHorizontal: 20, marginBottom: 20 },
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
  catText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  resultsSection: { marginTop: 4 },
  emptyState: { alignItems: "center", paddingVertical: 40, gap: 10 },
  emptyTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  emptyText: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },
  promoCard: {
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 8,
  },
  promoTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#FFFFFF", marginBottom: 6 },
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
  promoBtnText: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#111111" },

  dropdown: {
    position: "absolute",
    top: Platform.OS === "web" ? 210 : 192,
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
  clearAll: { fontSize: 11, fontFamily: "Inter_500Medium" },
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
  dropdownText: { fontSize: 14, fontFamily: "Inter_500Medium", flex: 1 },
  dropdownSub: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },
  dropdownPrice: { fontSize: 12, fontFamily: "Inter_700Bold" },
  dropdownSeeAll: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 13,
    borderTopWidth: 1,
  },
  dropdownSeeAllText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  dropdownEmpty: { flexDirection: "row", alignItems: "center", gap: 10, padding: 16 },
  dropdownEmptyText: { fontSize: 13, fontFamily: "Inter_400Regular" },
});
