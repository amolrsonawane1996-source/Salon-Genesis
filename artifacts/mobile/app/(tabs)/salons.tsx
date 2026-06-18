import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
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
import { useColors } from "@/hooks/useColors";

const STATES_FILTER = ["All States", "Maharashtra", "Gujarat", "Karnataka", "Delhi"];

export default function SalonsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeState, setActiveState] = useState("Maharashtra");
  const [sortBy, setSortBy] = useState<"rating" | "price">("rating");

  const filtered = SALONS.filter((s) => {
    const matchSearch =
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.city.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !activeCategory || s.categories.includes(activeCategory);
    const matchState = activeState === "All States" || s.state === activeState;
    return matchSearch && matchCategory && matchState;
  }).sort((a, b) => {
    if (sortBy === "rating") return b.rating - a.rating;
    return (
      Math.min(...a.services.map((sv) => sv.price)) -
      Math.min(...b.services.map((sv) => sv.price))
    );
  });

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
        <Text style={styles.headerTitle}>Discover Salons</Text>
        <Text style={styles.headerSub}>Maharashtra & India</Text>
        <View style={[styles.searchBar, { backgroundColor: colors.card }]}>
          <Feather name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search by name or city..."
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

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.filters}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {STATES_FILTER.map((s) => {
              const active = activeState === s;
              return (
                <Pressable
                  key={s}
                  style={[
                    styles.filterPill,
                    {
                      backgroundColor: active ? "#111111" : colors.card,
                      borderColor: active ? "#111111" : colors.border,
                    },
                  ]}
                  onPress={() => setActiveState(s)}
                >
                  <Text
                    style={[
                      styles.filterText,
                      { color: active ? "#F5B041" : colors.foreground },
                    ]}
                  >
                    {s}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.subFilters}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
            <Pressable
              style={[
                styles.catChip,
                { backgroundColor: !activeCategory ? colors.accent : colors.muted },
              ]}
              onPress={() => setActiveCategory(null)}
            >
              <Text
                style={[
                  styles.catChipText,
                  { color: !activeCategory ? colors.primary : colors.mutedForeground },
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
                    styles.catChip,
                    { backgroundColor: active ? colors.accent : colors.muted },
                  ]}
                  onPress={() => setActiveCategory(active ? null : cat.id)}
                >
                  <Feather
                    name={cat.icon as any}
                    size={12}
                    color={active ? colors.primary : colors.mutedForeground}
                  />
                  <Text
                    style={[
                      styles.catChipText,
                      { color: active ? colors.primary : colors.mutedForeground },
                    ]}
                  >
                    {cat.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.sortGroup}>
            {(["rating", "price"] as const).map((s) => (
              <Pressable
                key={s}
                style={[
                  styles.sortBtn,
                  { backgroundColor: sortBy === s ? colors.primary : colors.card },
                ]}
                onPress={() => setSortBy(s)}
              >
                <Feather
                  name={s === "rating" ? "star" : "tag"}
                  size={12}
                  color={sortBy === s ? colors.primaryForeground : colors.mutedForeground}
                />
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.list}>
          <Text style={[styles.count, { color: colors.mutedForeground }]}>
            {filtered.length} salon{filtered.length !== 1 ? "s" : ""} found
          </Text>
          {filtered.length === 0 ? (
            <View style={styles.empty}>
              <Feather name="map-pin" size={40} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No salons found</Text>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                Try adjusting your filters
              </Text>
            </View>
          ) : (
            filtered.map((s) => <SalonCard key={s.id} salon={s} />)
          )}
          <View style={{ height: Platform.OS === "web" ? 34 : 100 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
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
    marginBottom: 14,
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
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  filters: {
    paddingVertical: 12,
    paddingLeft: 16,
  },
  filterPill: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginRight: 8,
  },
  filterText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  subFilters: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 16,
    paddingRight: 12,
    marginBottom: 4,
    gap: 8,
  },
  catChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 6,
  },
  catChipText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  sortGroup: {
    flexDirection: "row",
    gap: 6,
  },
  sortBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  count: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginBottom: 12,
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
});
