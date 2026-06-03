import { useAuth } from "@/provider/AuthProvider";


import { Ionicons } from "@expo/vector-icons";

import axios from "axios";

import React, { useEffect, useRef, useState } from "react";

import {
  ActivityIndicator,
  Animated,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import Header from "../components/Header";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const COLORS = {
  primary: "#003399",
  primaryLight: "#EEF2FF",
  background: "#FFFFFF",
  cardBg: "#FFFFFF",
  surface: "#F8FAFC",
  textMain: "#0F172A",
  textSubtle: "#64748B",
  success: "#10B981",
  successLight: "#ECFDF5",
  warning: "#F59E0B",
  warningLight: "#FFFBEB",
  danger: "#EF4444",
  dangerLight: "#FEF2F2",
  border: "#F1F5F9",
};



type BookingStatus = "Pending" | "Confirmed" | "Cancelled" | "CheckedIn";

interface RoomCategory {
  id: string;
  category_name: string;
  description: string;
}

interface Room {
  id: string;
  property_name: string;
  room_capacity: number;
  base_price: number;
  amenities: string[];
  check_in_time: string;
  check_out_time: string;
  total_inventory: number;
  room_category: RoomCategory;
}

interface BookingItem {
  id: string;
  number_of_rooms: number;
  adults: number;
  children: number;
  extra_beds: number;
  base_price_booked: number;
  total_room_amount: number;
  extra_bed_amount: number;
  tax_amount: number;
  discount_amount: number;
  room: Room;
}

interface Booking {
  id: string;
  booking_reference: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  booking_status: BookingStatus;
  payment_status: string;
  check_in_date: string;
  check_out_date: string;
  grand_total: number;
  amount_paid: number;
  booking_items: BookingItem[];
  property?: { name?: string };
  created_at: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function getNights(checkIn: string, checkOut: string): number {
  const a = new Date(checkIn);
  const b = new Date(checkOut);
  return Math.max(1, Math.round((b.getTime() - a.getTime()) / 86400000));
}

function statusColor(status: BookingStatus) {
  switch (status) {
    case "CheckedIn":
      return { bg: COLORS.successLight, text: COLORS.success };
    case "Confirmed":
      return { bg: COLORS.primaryLight, text: COLORS.primary };
    case "Cancelled":
      return { bg: COLORS.dangerLight, text: COLORS.danger };
    default:
      return { bg: COLORS.warningLight, text: COLORS.warning };
  }
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function TodaysCheckIn() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchActive, setSearchActive] = useState(false);

  const fetchBookings = async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/host/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(response.data?.data ?? []);
    } catch (e: any) {
      setError("Could not load bookings. Pull down to retry.");
      console.error("Error fetching bookings:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings(true);
  };

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const todayISO = new Date().toISOString().split("T")[0];

  const todayArrivals = bookings.filter(
    (b) => b.check_in_date.split("T")[0] === todayISO
  );

  const counts = {
    pending: bookings.filter((b) => b.booking_status === "Pending").length,
    arrived: bookings.filter((b) => b.booking_status === "CheckedIn").length,
    cancelled: bookings.filter((b) => b.booking_status === "Cancelled").length,
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <Header />

      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Arrivals</Text>
          <Text style={styles.subtitle}>{today}</Text>
        </View>
        <TouchableOpacity
          style={styles.iconCircle}
          onPress={() => setSearchActive((v) => !v)}
        >
          <Ionicons
            name={searchActive ? "close" : "search"}
            size={20}
            color={COLORS.textMain}
          />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading bookings…</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Ionicons name="cloud-offline-outline" size={48} color={COLORS.textSubtle} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => fetchBookings()}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
          }
        >
          {/* ── Stats ── */}
          <View style={styles.statsRow}>
            <StatItem label="Pending" value={String(counts.pending)} active />
            <StatItem label="Checked In" value={String(counts.arrived)} />
            <StatItem label="Cancelled" value={String(counts.cancelled)} />
          </View>

          {/* ── Today's arrivals header ── */}
          {todayArrivals.length > 0 && (
            <SectionLabel label={`Today's Arrivals (${todayArrivals.length})`} />
          )}

          {/* ── All bookings ── */}
          {bookings.length === 0 ? (
            <EmptyState />
          ) : (
            bookings.map((item, index) => (
              <BookingCard key={item.id} item={item} index={index} />
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatItem = ({
  label,
  value,
  active,
}: {
  label: string;
  value: string;
  active?: boolean;
}) => (
  <View style={[styles.statItem, active && styles.statItemActive]}>
    <Text style={[styles.statValue, active && styles.statTextActive]}>
      {value}
    </Text>
    <Text style={[styles.statLabel, active && styles.statTextActive]}>
      {label}
    </Text>
  </View>
);

const SectionLabel = ({ label }: { label: string }) => (
  <View style={styles.sectionLabel}>
    <View style={styles.sectionDot} />
    <Text style={styles.sectionLabelText}>{label}</Text>
  </View>
);

const EmptyState = () => (
  <View style={styles.emptyState}>
    <Ionicons name="calendar-outline" size={48} color={COLORS.textSubtle} />
    <Text style={styles.emptyTitle}>No bookings yet</Text>
    <Text style={styles.emptySubtitle}>
      Bookings made by guests will appear here.
    </Text>
  </View>
);

function BookingCard({ item, index }: { item: Booking; index: number }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const sc = statusColor(item.booking_status);
  const nights = getNights(item.check_in_date, item.check_out_date);
  const bookingItem = item.booking_items?.[0];
  const room = bookingItem?.room;
  const isPending = item.booking_status === "Pending";

  return (
    <Animated.View
      style={[
        styles.card,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      {/* ── Header row ── */}
      <View style={styles.cardMain}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(item.guest_name)}</Text>
        </View>

        <View style={styles.info}>
          <Text style={styles.guestName}>{item.guest_name}</Text>
          <Text style={styles.refText}>{item.booking_reference}</Text>
          {room?.room_category && (
            <Text style={styles.roomInfo}>
              {room.room_category.category_name}
              {room.property_name ? ` • ${room.property_name}` : ""}
            </Text>
          )}
        </View>

        <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
          <Text style={[styles.statusText, { color: sc.text }]}>
            {item.booking_status}
          </Text>
        </View>
      </View>

      {/* ── Date strip ── */}
      <View style={styles.detailStrip}>
        <DetailChip icon="log-in-outline" label={formatDate(item.check_in_date)} />
        <View style={styles.nightPill}>
          <Text style={styles.nightText}>{nights}N</Text>
        </View>
        <DetailChip icon="log-out-outline" label={formatDate(item.check_out_date)} />
      </View>

      {/* ── Room meta grid ── */}
      {bookingItem && (
        <View style={styles.metaGrid}>
          <MetaChip icon="people-outline" label={`${bookingItem.adults} Adult${bookingItem.adults !== 1 ? "s" : ""}${bookingItem.children > 0 ? `, ${bookingItem.children} Child` : ""}`} />
          <MetaChip icon="bed-outline" label={`${bookingItem.number_of_rooms} Room${bookingItem.number_of_rooms !== 1 ? "s" : ""}`} />
          {room && (
            <MetaChip icon="time-outline" label={`Check-in ${room.check_in_time}:00`} />
          )}
          {room?.amenities?.length > 0 && (
            <MetaChip icon="wifi-outline" label={room.amenities.join(", ")} />
          )}
        </View>
      )}

      {/* ── Amount breakdown ── */}
      <View style={styles.amountCard}>
        <AmountRow label="Base price / night" value={`₹${(bookingItem?.base_price_booked ?? 0).toLocaleString("en-IN")}`} />
        {(bookingItem?.discount_amount ?? 0) > 0 && (
          <AmountRow label="Discount" value={`-₹${bookingItem!.discount_amount.toLocaleString("en-IN")}`} green />
        )}
        {(bookingItem?.tax_amount ?? 0) > 0 && (
          <AmountRow label="Tax" value={`₹${bookingItem!.tax_amount.toLocaleString("en-IN")}`} />
        )}
        {(bookingItem?.extra_bed_amount ?? 0) > 0 && (
          <AmountRow label="Extra bed" value={`₹${bookingItem!.extra_bed_amount.toLocaleString("en-IN")}`} />
        )}
        <View style={styles.amountDivider} />
        <View style={styles.amountTotalRow}>
          <Text style={styles.amountTotalLabel}>Grand Total</Text>
          <Text style={styles.amountTotalValue}>
            ₹{item.grand_total.toLocaleString("en-IN")}
          </Text>
        </View>
        <View style={styles.paidRow}>
          <Text style={styles.paidLabel}>Paid</Text>
          <Text style={[styles.paidValue, { color: item.amount_paid > 0 ? COLORS.success : COLORS.warning }]}>
            ₹{item.amount_paid.toLocaleString("en-IN")}
          </Text>
        </View>
      </View>

      {/* ── Contact row ── */}
      <View style={styles.contactRow}>
        <ContactChip icon="call-outline" label={item.guest_phone} />
        <ContactChip icon="mail-outline" label={item.guest_email} />
      </View>

      {/* ── Payment badge ── */}
      <View style={styles.paymentRow}>
        <Text style={styles.paymentLabel}>Payment</Text>
        <View style={[styles.statusBadge, {
          backgroundColor: item.payment_status === "Paid" ? COLORS.successLight : COLORS.warningLight
        }]}>
          <Text style={[styles.statusText, {
            color: item.payment_status === "Paid" ? COLORS.success : COLORS.warning
          }]}>
            {item.payment_status}
          </Text>
        </View>
      </View>

      {/* ── Action ── */}
      {isPending && (
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="checkmark-circle-outline" size={16} color={COLORS.primary} />
          <Text style={styles.actionButtonText}>Check In Guest</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const DetailChip = ({ icon, label }: { icon: any; label: string }) => (
  <View style={styles.detailChip}>
    <Ionicons name={icon} size={13} color={COLORS.textSubtle} />
    <Text style={styles.detailChipText}>{label}</Text>
  </View>
);

const MetaChip = ({ icon, label }: { icon: any; label: string }) => (
  <View style={styles.metaChip}>
    <Ionicons name={icon} size={12} color={COLORS.primary} />
    <Text style={styles.metaChipText}>{label}</Text>
  </View>
);

const AmountRow = ({
  label,
  value,
  green,
}: {
  label: string;
  value: string;
  green?: boolean;
}) => (
  <View style={styles.amountRow}>
    <Text style={styles.amountRowLabel}>{label}</Text>
    <Text style={[styles.amountRowValue, green && { color: COLORS.success }]}>
      {value}
    </Text>
  </View>
);

const ContactChip = ({ icon, label }: { icon: any; label: string }) => (
  <View style={styles.contactChip}>
    <Ionicons name={icon} size={12} color={COLORS.textSubtle} />
    <Text style={styles.contactChipText} numberOfLines={1}>
      {label}
    </Text>
  </View>
);

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.textMain,
    letterSpacing: -0.5,
  },
  subtitle: { fontSize: 14, color: COLORS.textSubtle, fontWeight: "500", marginTop: 2 },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
  },

  scrollContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 40 },

  // Stats
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 12,
    marginHorizontal: 4,
    backgroundColor: COLORS.surface,
  },
  statItemActive: { backgroundColor: COLORS.primary },
  statValue: { fontSize: 18, fontWeight: "700", color: COLORS.textMain },
  statLabel: { fontSize: 11, color: COLORS.textSubtle, marginTop: 2 },
  statTextActive: { color: "#FFF" },

  // Section label
  sectionLabel: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginRight: 8,
  },
  sectionLabelText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSubtle,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Card
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardMain: { flexDirection: "row", alignItems: "flex-start" },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { fontSize: 14, fontWeight: "700", color: COLORS.primary },
  info: { flex: 1, marginLeft: 12 },
  guestName: { fontSize: 15, fontWeight: "700", color: COLORS.textMain },
  refText: { fontSize: 12, color: COLORS.textSubtle, marginTop: 1 },
  roomInfo: { fontSize: 12, color: COLORS.textSubtle, marginTop: 2 },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  statusText: { fontSize: 11, fontWeight: "700" },

  // Detail strip
  detailStrip: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    justifyContent: "center",
    gap: 8,
  },
  detailChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  detailChipText: { fontSize: 12, color: COLORS.textSubtle, fontWeight: "500" },
  nightPill: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  nightText: { fontSize: 11, fontWeight: "700", color: COLORS.textSubtle },

  // Footer
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  amountLabel: { fontSize: 11, color: COLORS.textSubtle, marginBottom: 2 },
  amountValue: { fontSize: 15, fontWeight: "700", color: COLORS.textMain },
  paymentStatus: { fontSize: 13, fontWeight: "700" },

  // Meta grid
  metaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
  },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  metaChipText: { fontSize: 12, color: COLORS.primary, fontWeight: "600" },

  // Amount card
  amountCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    marginTop: 14,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  amountRowLabel: { fontSize: 13, color: COLORS.textSubtle },
  amountRowValue: { fontSize: 13, fontWeight: "600", color: COLORS.textMain },
  amountDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 8,
  },
  amountTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  amountTotalLabel: { fontSize: 14, fontWeight: "700", color: COLORS.textMain },
  amountTotalValue: { fontSize: 15, fontWeight: "800", color: COLORS.primary },
  paidRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2,
  },
  paidLabel: { fontSize: 12, color: COLORS.textSubtle },
  paidValue: { fontSize: 13, fontWeight: "700" },

  // Contact row
  contactRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  contactChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
  },
  contactChipText: {
    fontSize: 12,
    color: COLORS.textSubtle,
    fontWeight: "500",
    flex: 1,
  },


  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },

  paymentLabel: { fontSize: 11, color: COLORS.textSubtle },

  actionButton: {
    marginTop: 14,
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  actionButtonText: { fontSize: 14, fontWeight: "700", color: COLORS.primary },

  // Loading / Error
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    gap: 12,
  },
  loadingText: { fontSize: 14, color: COLORS.textSubtle, marginTop: 8 },
  errorText: {
    fontSize: 14,
    color: COLORS.textSubtle,
    textAlign: "center",
    lineHeight: 22,
  },
  retryBtn: {
    marginTop: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryBtnText: { color: "#FFF", fontWeight: "700", fontSize: 14 },

  // Empty
  emptyState: {
    alignItems: "center",
    paddingTop: 60,
    gap: 10,
  },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: COLORS.textMain },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textSubtle,
    textAlign: "center",
  },
});