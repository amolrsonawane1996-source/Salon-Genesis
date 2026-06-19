import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { createElement, useEffect, useRef, useState } from "react";
import {
  Animated,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SALON_IMAGES, SALONS, type Salon } from "@/constants/data";
import { useColors } from "@/hooks/useColors";
import { Image } from "expo-image";

let MapView: any = null;
let Marker: any = null;
let Callout: any = null;
if (Platform.OS !== "web") {
  const maps = require("react-native-maps");
  MapView = maps.default;
  Marker = maps.Marker;
  Callout = maps.Callout;
}

const MAHARASHTRA_CENTER = { latitude: 19.7515, longitude: 75.7139 };

function openDirections(salon: Salon) {
  const label = encodeURIComponent(salon.name);
  const url =
    Platform.OS === "ios"
      ? `maps://?q=${label}&ll=${salon.lat},${salon.lng}`
      : `geo:${salon.lat},${salon.lng}?q=${label}`;
  Linking.openURL(url).catch(() => {
    Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${salon.lat},${salon.lng}`
    );
  });
}

function WebMapEmbed({ salon }: { salon: Salon | null }) {
  const query = salon
    ? `${salon.lat},${salon.lng}`
    : "salons+in+Maharashtra+India";
  const src = `https://maps.google.com/maps?q=${query}&z=14&output=embed`;
  if (Platform.OS !== "web") return null;
  return createElement("iframe", {
    key: src,
    src,
    style: {
      width: "100%",
      height: "100%",
      border: "none",
    },
    loading: "lazy",
    allowFullScreen: true,
  });
}

function SalonPopup({
  salon,
  onClose,
  onDirections,
}: {
  salon: Salon;
  onClose: () => void;
  onDirections: () => void;
}) {
  const colors = useColors();
  const router = useRouter();
  const slideAnim = useRef(new Animated.Value(200)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 80,
      friction: 12,
    }).start();
  }, [salon.id]);

  return (
    <Animated.View
      style={[
        styles.popup,
        { backgroundColor: colors.card, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <Pressable style={styles.popupClose} onPress={onClose}>
        <Feather name="x" size={16} color={colors.mutedForeground} />
      </Pressable>

      <Pressable
        style={styles.popupContent}
        onPress={() => router.push(`/salon/${salon.id}`)}
      >
        <Image
          source={SALON_IMAGES[salon.imageIndex]}
          style={styles.popupImage}
          contentFit="cover"
        />
        <View style={styles.popupInfo}>
          <Text style={[styles.popupName, { color: colors.foreground }]} numberOfLines={1}>
            {salon.name}
          </Text>
          <View style={styles.popupMeta}>
            <Feather name="map-pin" size={11} color={colors.mutedForeground} />
            <Text style={[styles.popupCity, { color: colors.mutedForeground }]} numberOfLines={1}>
              {salon.city}
            </Text>
          </View>
          <View style={styles.popupRating}>
            <Feather name="star" size={11} color="#F5B041" />
            <Text style={[styles.popupRatingText, { color: colors.foreground }]}>
              {salon.rating} ({salon.reviewCount})
            </Text>
            <Text style={[styles.popupPrice, { color: colors.primary }]}>
              From ₹{Math.min(...salon.services.map((s) => s.price))}
            </Text>
          </View>
        </View>
      </Pressable>

      <View style={styles.popupActions}>
        <Pressable
          style={[styles.popupBtn, { backgroundColor: "#111111", flex: 1 }]}
          onPress={onDirections}
        >
          <Feather name="navigation" size={14} color="#F5B041" />
          <Text style={styles.popupBtnText}>Directions</Text>
        </Pressable>
        <Pressable
          style={[styles.popupBtn, { backgroundColor: colors.accent, flex: 1 }]}
          onPress={() => router.push(`/book/${salon.id}`)}
        >
          <Feather name="calendar" size={14} color={colors.primary} />
          <Text style={[styles.popupBtnText, { color: colors.primary }]}>Book</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

export default function MapScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Salon | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const filtered = SALONS.filter((s) => {
    if (!search) return true;
    return (
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.city.toLowerCase().includes(search.toLowerCase()) ||
      s.address.toLowerCase().includes(search.toLowerCase())
    );
  });

  const displaySalon = selected ?? (filtered.length === 1 ? filtered[0] : null);

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
        <Text style={styles.headerTitle}>Salon Map</Text>
        <Text style={styles.headerSub}>Find salons near you</Text>
        <View style={[styles.searchBar, { backgroundColor: "rgba(255,255,255,0.12)" }]}>
          <Feather name="search" size={16} color="rgba(255,255,255,0.6)" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search salons or cities..."
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={search}
            onChangeText={(t) => {
              setSearch(t);
              setSelected(null);
            }}
          />
          {search ? (
            <Pressable onPress={() => { setSearch(""); setSelected(null); }}>
              <Feather name="x" size={15} color="rgba(255,255,255,0.5)" />
            </Pressable>
          ) : null}
        </View>
      </View>

      {Platform.OS === "web" ? (
        <WebView_Salons
          filtered={filtered}
          selected={selected}
          onSelect={setSelected}
          colors={colors}
          router={router}
        />
      ) : (
        <View style={{ flex: 1 }}>
          <MapView
            style={styles.nativeMap}
            initialRegion={{
              ...MAHARASHTRA_CENTER,
              latitudeDelta: 5.5,
              longitudeDelta: 5.5,
            }}
            showsUserLocation
            showsMyLocationButton
            onMapReady={() => setMapReady(true)}
          >
            {mapReady &&
              filtered.map((salon) => (
                <Marker
                  key={salon.id}
                  coordinate={{ latitude: salon.lat, longitude: salon.lng }}
                  pinColor={selected?.id === salon.id ? "#F5B041" : "#111111"}
                  onPress={() => setSelected(salon)}
                >
                  <View
                    style={[
                      styles.markerPin,
                      {
                        backgroundColor:
                          selected?.id === salon.id ? "#F5B041" : "#111111",
                      },
                    ]}
                  >
                    <Feather name="scissors" size={12} color="#FFFFFF" />
                  </View>
                </Marker>
              ))}
          </MapView>

          {selected && (
            <SalonPopup
              salon={selected}
              onClose={() => setSelected(null)}
              onDirections={() => openDirections(selected)}
            />
          )}

          {!selected && (
            <View
              style={[
                styles.legendBar,
                { backgroundColor: colors.card, borderTopColor: colors.border },
              ]}
            >
              <Feather name="map-pin" size={14} color={colors.primary} />
              <Text style={[styles.legendText, { color: colors.mutedForeground }]}>
                {filtered.length} salon{filtered.length !== 1 ? "s" : ""} on map · tap a pin for details
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

function WebView_Salons({
  filtered,
  selected,
  onSelect,
  colors,
  router,
}: {
  filtered: Salon[];
  selected: Salon | null;
  onSelect: (s: Salon) => void;
  colors: any;
  router: any;
}) {
  const displaySalon = selected ?? null;

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.webMapContainer}>
        <WebMapEmbed salon={displaySalon} />
        {displaySalon && (
          <Pressable
            style={styles.webMapLabel}
            onPress={() =>
              Linking.openURL(
                `https://www.google.com/maps/search/?api=1&query=${displaySalon.lat},${displaySalon.lng}`
              )
            }
          >
            <Feather name="external-link" size={12} color="#FFFFFF" />
            <Text style={styles.webMapLabelText}>Open in Google Maps</Text>
          </Pressable>
        )}
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={styles.webList}>
          <Text style={[styles.webListTitle, { color: colors.mutedForeground }]}>
            {filtered.length} salon{filtered.length !== 1 ? "s" : ""} found
          </Text>
          {filtered.map((salon) => {
            const isSelected = selected?.id === salon.id;
            return (
              <Pressable
                key={salon.id}
                style={[
                  styles.webSalonCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: isSelected ? "#F5B041" : colors.border,
                    borderWidth: isSelected ? 2 : 1,
                  },
                ]}
                onPress={() => onSelect(salon)}
              >
                <Image
                  source={SALON_IMAGES[salon.imageIndex]}
                  style={styles.webSalonImg}
                  contentFit="cover"
                />
                <View style={styles.webSalonInfo}>
                  <Text style={[styles.webSalonName, { color: colors.foreground }]} numberOfLines={1}>
                    {salon.name}
                  </Text>
                  <View style={styles.webSalonMeta}>
                    <Feather name="map-pin" size={11} color={colors.mutedForeground} />
                    <Text style={[styles.webSalonCity, { color: colors.mutedForeground }]} numberOfLines={1}>
                      {salon.city}
                    </Text>
                  </View>
                  <Text style={[styles.webSalonAddr, { color: colors.mutedForeground }]} numberOfLines={1}>
                    {salon.address}
                  </Text>
                  <View style={styles.webSalonBottom}>
                    <View style={styles.webSalonRating}>
                      <Feather name="star" size={11} color="#F5B041" />
                      <Text style={[styles.webSalonRatingText, { color: colors.foreground }]}>
                        {salon.rating}
                      </Text>
                    </View>
                    <View style={styles.webSalonBtns}>
                      <Pressable
                        style={[styles.webBtn, { backgroundColor: "#111111" }]}
                        onPress={() =>
                          Linking.openURL(
                            `https://www.google.com/maps/search/?api=1&query=${salon.lat},${salon.lng}`
                          )
                        }
                      >
                        <Feather name="navigation" size={11} color="#F5B041" />
                        <Text style={styles.webBtnText}>Directions</Text>
                      </Pressable>
                      <Pressable
                        style={[styles.webBtn, { backgroundColor: colors.accent }]}
                        onPress={() => router.push(`/book/${salon.id}`)}
                      >
                        <Feather name="calendar" size={11} color={colors.primary} />
                        <Text style={[styles.webBtnText, { color: colors.primary }]}>Book</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              </Pressable>
            );
          })}
          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
  },
  headerSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.55)",
    marginBottom: 10,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#FFFFFF",
  },
  nativeMap: {
    flex: 1,
  },
  markerPin: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  legendBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  legendText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  popup: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
  },
  popupClose: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  popupContent: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
  },
  popupImage: {
    width: 72,
    height: 72,
    borderRadius: 12,
  },
  popupInfo: {
    flex: 1,
    justifyContent: "center",
    gap: 3,
  },
  popupName: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  popupMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  popupCity: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  popupRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  popupRatingText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  popupPrice: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    marginLeft: 8,
  },
  popupActions: {
    flexDirection: "row",
    gap: 10,
  },
  popupBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
  },
  popupBtnText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "#F5B041",
  },
  webMapContainer: {
    height: 260,
    position: "relative",
  },
  webMapLabel: {
    position: "absolute",
    bottom: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  webMapLabelText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: "#FFFFFF",
  },
  webList: {
    padding: 14,
  },
  webListTitle: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginBottom: 10,
  },
  webSalonCard: {
    flexDirection: "row",
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 12,
  },
  webSalonImg: {
    width: 90,
    height: 110,
  },
  webSalonInfo: {
    flex: 1,
    padding: 12,
    gap: 3,
  },
  webSalonName: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  webSalonMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  webSalonCity: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  webSalonAddr: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    lineHeight: 16,
  },
  webSalonBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  webSalonRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  webSalonRatingText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  webSalonBtns: {
    flexDirection: "row",
    gap: 6,
  },
  webBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  webBtnText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: "#F5B041",
  },
});
