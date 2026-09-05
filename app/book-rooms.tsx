import { useAuth } from "@/provider/AuthProvider";

import { LinearGradient } from "expo-linear-gradient";

import { useRouter } from "expo-router";

import {
  MapPin,
  Plus,
  Receipt,
} from "lucide-react-native";

import React, { useEffect, useRef, useState } from "react";

import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import AlertPopUp, { AlertType } from "@/components/AlertPopUp";

import Header from "../components/Header";

import WalkInBookingModal from "../components/WalkInBookingModal";

const { width } = Dimensions.get("window");

const COLORS = {
  primary: "#1E3A8A",
  primaryLight: "#EFF6FF",
  primaryMain: "#2563EB",
  textMain: "#0F172A",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",
  background: "#F8FAFC",
  card: "#FFFFFF",
  border: "#E2E8F0",
  success: "#10B981",
  successLight: "#D1FAE5",
  warning: "#F59E0B",
  warningLight: "#FEF3C7",
  danger: "#EF4444",
  dangerLight: "#FEE2E2",
  info: "#3B82F6",
};

interface AlertState {
  visible: boolean;
  type: AlertType;
  title: string;
  message: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  onPrimary?: () => void;
  onSecondary?: () => void;
}

const ALERT_HIDDEN: AlertState = {
  visible: false,
  type: "info",
  title: "",
  message: "",
};

let MOCK_BOOKINGS = [
  {
    id: "booking_1",
    booking_reference: "REF-10293",
    booking_status: "Confirmed",
    check_in_date: "2026-09-05T14:00:00.000Z",
    check_out_date: "2026-09-10T11:00:00.000Z",
    grand_total: 12500,
    total_price: 12500,
    guest_name: "Rahul Sharma",
    guest_phone: "+91 9876543210",
    guest_email: "rahul@example.com",
    property: { property_name: "Ocean View Resort" },
    payment_status: "Completed",
    amount_paid: 12500,
    booking_items: [
      {
        id: "item_1",
        room: { room_category: { category_name: "Deluxe Suite" } },
        number_of_rooms: 1,
        adults: 2,
        children: 1,
        total_room_amount: 12500
      }
    ]
  },
  {
    id: "booking_2",
    booking_reference: "REF-55821",
    booking_status: "Pending",
    check_in_date: "2026-09-12T14:00:00.000Z",
    check_out_date: "2026-09-15T11:00:00.000Z",
    grand_total: 8000,
    total_price: 8000,
    guest_name: "Priya Desai",
    guest_phone: "+91 8765432109",
    guest_email: "priya@example.com",
    property: { property_name: "Mountain Retreat" },
    payment_status: "Pending",
    amount_paid: 2000,
    booking_items: [
      {
        id: "item_2",
        room: { room_category: { category_name: "Cabin" } },
        number_of_rooms: 2,
        adults: 4,
        children: 0,
        total_room_amount: 8000
      }
    ]
  },
  {
    id: "booking_3",
    booking_reference: "REF-99231",
    booking_status: "Cancelled",
    check_in_date: "2026-09-01T14:00:00.000Z",
    check_out_date: "2026-09-03T11:00:00.000Z",
    grand_total: 4500,
    total_price: 4500,
    guest_name: "Amit Patel",
    guest_phone: "+91 7654321098",
    guest_email: "amit@example.com",
    property: { property_name: "Ocean View Resort" },
    payment_status: "Refunded",
    amount_paid: 0,
    booking_items: [
      {
        id: "item_3",
        room: { room_category: { category_name: "Standard Room" } },
        number_of_rooms: 1,
        adults: 2,
        children: 0,
        total_room_amount: 4500
      }
    ]
  }
];

const AnimatedBookingCard = ({ item, index, onPress }: { item: any, index: number, onPress: () => void }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const checkIn = new Date(item.check_in_date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const checkOut = new Date(item.check_out_date).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const renderStatusBadge = (status: string) => {
    let color = COLORS.textMuted;
    let bg = "#F1F5F9";
    if (status === "Pending") { color = COLORS.warning; bg = COLORS.warningLight; }
    else if (status === "Confirmed") { color = COLORS.primaryMain; bg = COLORS.primaryLight; }
    else if (status === "Cancelled") { color = COLORS.danger; bg = COLORS.dangerLight; }
    else if (status === "Completed") { color = COLORS.success; bg = COLORS.successLight; }

    return (
      <View style={[styles.statusBadge, { backgroundColor: bg }]}>
        <Text style={[styles.statusBadgeText, { color }]}>{status}</Text>
      </View>
    );
  };

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <TouchableOpacity
        style={styles.bookingCard}
        activeOpacity={0.9}
        onPress={onPress}
      >
        <LinearGradient
          colors={["#ffffff", "#f8fafc"]}
          style={styles.cardGradient}
        >
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.bookingRef}>{item.booking_reference}</Text>
              <Text style={styles.bookingCardTitle}>{item.user?.full_name || item.guest_name || "Walk-in Guest"}</Text>
            </View>
            {renderStatusBadge(item.booking_status)}
          </View>

          <View style={styles.cardLocationRow}>
            <MapPin size={14} color={COLORS.textMuted} />
            <Text style={styles.bookingCardSubtitle} numberOfLines={1}>{item.property?.property_name}</Text>
          </View>

          <View style={styles.bookingCardFooter}>
            <View style={styles.dateBlock}>
              <Text style={styles.dateLabel}>Check-in</Text>
              <Text style={styles.dateValue}>{checkIn}</Text>
            </View>
            <View style={styles.dateDivider} />
            <View style={styles.dateBlock}>
              <Text style={styles.dateLabel}>Check-out</Text>
              <Text style={styles.dateValue}>{checkOut}</Text>
            </View>
            <View style={styles.priceBlock}>
              <Text style={styles.dateLabel}>Total</Text>
              <Text style={styles.bookingPrice}>₹{item.grand_total?.toLocaleString() || item.total_price}</Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function BookRooms() {
  const { token } = useAuth();
  const router = useRouter();

  const [alert, setAlert] = useState<AlertState>(ALERT_HIDDEN);
  const dismissAlert = () => setAlert((a) => ({ ...a, visible: false }));
  const showAlert = (config: Omit<AlertState, "visible">) =>
    setAlert({ ...config, visible: true });

  const [showForm, setShowForm] = useState(false);

  // Bookings List State
  const [bookings, setBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [refreshingBookings, setRefreshingBookings] = useState(false);

  useEffect(() => {
    if (token) {
      fetchBookings();
    }
  }, [token]);

  const fetchBookings = async () => {
    setLoadingBookings(true);
    try {
      setTimeout(() => {
        setBookings(MOCK_BOOKINGS);
        setLoadingBookings(false);
      }, 500);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setLoadingBookings(false);
    }
  };

  const onRefreshBookings = async () => {
    setRefreshingBookings(true);
    await fetchBookings();
    setRefreshingBookings(false);
  };

  const openBookingDetails = (booking: any) => {
    router.push({
      pathname: "/booking-details",
      params: { booking: JSON.stringify(booking) },
    });
  };



  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <Header />

      {/* Main List Screen */}
      <View style={styles.listContainer}>
        <LinearGradient colors={["#ffffff", COLORS.background]} style={styles.listHeader}>
          <View>
            <Text style={styles.pageTitle}>All Bookings</Text>
            <Text style={styles.pageSubtitle}>Manage reservations and walk-ins.</Text>
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            activeOpacity={0.8}
            onPress={() => setShowForm(true)}
          >
            <Plus size={18} color="#FFF" />
            <Text style={styles.addBtnText}>Book</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Static Total Bookings Section */}
        {!loadingBookings && bookings.length > 0 && (
          <View style={styles.totalBookingsSection}>
            <View style={styles.totalBookingsCard}>
              <View style={styles.totalBookingsLeft}>
                <Text style={styles.totalBookingsNum}>{bookings.length}</Text>
                <Text style={styles.totalBookingsLabel}>Total Bookings</Text>
              </View>
              <View style={styles.bookingsStatusBadge}>
                <View style={styles.statusDotGreen} />
                <Text style={styles.bookingsStatusText}>Active</Text>
              </View>
            </View>
          </View>
        )}

        {loadingBookings ? (
          <View style={styles.centerFill}>
            <ActivityIndicator size="large" color={COLORS.primaryMain} />
          </View>
        ) : bookings.length === 0 ? (
          <ScrollView refreshControl={<RefreshControl refreshing={refreshingBookings} onRefresh={onRefreshBookings} />} contentContainerStyle={styles.centerFill}>
            <View style={styles.emptyStateContainer}>
              <Receipt size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No bookings found.</Text>
              <Text style={styles.emptySubText}>When guests book properties, they will appear here.</Text>
            </View>
          </ScrollView>
        ) : (
          <FlatList
            data={bookings}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <AnimatedBookingCard item={item} index={index} onPress={() => openBookingDetails(item)} />
            )}
            contentContainerStyle={styles.flatListContent}
            refreshControl={<RefreshControl refreshing={refreshingBookings} onRefresh={onRefreshBookings} />}
          />
        )}
      </View>



      <WalkInBookingModal
        visible={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={() => fetchBookings()}
      />

      <AlertPopUp
        visible={alert.visible}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        primaryLabel={alert.primaryLabel}
        secondaryLabel={alert.secondaryLabel}
        onPrimary={alert.onPrimary}
        onSecondary={alert.onSecondary}
        onDismiss={dismissAlert}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContainer: {
    flex: 1,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.textMain,
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  addBtn: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.primaryMain, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, gap: 6 },

  addBtnText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 14,
  },
  flatListContent: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 40,
  },
  totalBookingsSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  totalBookingsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  totalBookingsLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  totalBookingsNum: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.textMain,
  },
  totalBookingsLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  bookingsStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusDotGreen: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
    marginRight: 4,
  },
  bookingsStatusText: {
    fontSize: 11,
    color: "#065F46",
    fontWeight: "700",
  },
  centerFill: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textMain,
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
    marginTop: 8,
    maxWidth: 240,
  },
  emptyTextForm: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontStyle: "italic",
    textAlign: "center",
  },

  // Beautiful Card Styles
  bookingCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 3,
    overflow: "hidden",
  },
  cardGradient: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  bookingRef: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.primaryMain,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  bookingCardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.textMain,
    letterSpacing: -0.3,
  },
  cardLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 6,
  },
  bookingCardSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    flexShrink: 1,
  },
  bookingCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    borderStyle: "dashed",
  },
  dateBlock: {
    flex: 1,
  },
  dateDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.border,
    marginHorizontal: 12,
  },
  priceBlock: {
    flex: 1,
    alignItems: "flex-end",
  },
  dateLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    textTransform: "uppercase",
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textMain,
  },
  bookingPrice: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.primaryMain,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },



  /* Form Modal Styles */
  formHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: COLORS.background,
  },
  formHeaderText: { fontSize: 22, fontWeight: "800", color: COLORS.textMain, letterSpacing: -0.5 },
  content: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: COLORS.card,
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textMain,
    marginBottom: 16,
  },
  inputWrapper: { marginBottom: 16 },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    fontSize: 15,
    color: COLORS.textMain,
  },
  datePickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
  },
  datePickerText: { fontSize: 15, color: COLORS.textMain, fontWeight: "500" },
  row: { flexDirection: "row", gap: 12 },
  selectablePill: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectablePillActive: {
    backgroundColor: COLORS.primaryMain,
    borderColor: COLORS.primaryMain,
  },
  selectablePillText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  selectablePillTextActive: { color: "#FFFFFF" },
  roomSelectCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    marginBottom: 12,
  },
  roomSelectCardActive: {
    borderColor: COLORS.primaryMain,
    backgroundColor: COLORS.primaryLight,
  },
  roomName: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textMain,
    marginBottom: 4,
  },
  roomNameActive: { color: COLORS.primaryMain },
  roomPrice: { fontSize: 14, color: COLORS.textSecondary, fontWeight: "500" },
  quantitiesContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    borderStyle: "dashed",
  },
  submitButton: {
    backgroundColor: COLORS.primaryMain,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    shadowColor: COLORS.primaryMain,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
});