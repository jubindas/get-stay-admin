import { useAuth } from "@/provider/AuthProvider";




import axios from "axios";

import { LinearGradient } from "expo-linear-gradient";

import {
  BedDouble,
  CheckCircle, Clock,
  CreditCard,
  MapPin,
  Plus,
  Receipt, Users,
  X, XCircle
} from "lucide-react-native";

import React, { useEffect, useRef, useState } from "react";

import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Modal,
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

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

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

  const [alert, setAlert] = useState<AlertState>(ALERT_HIDDEN);
  const dismissAlert = () => setAlert((a) => ({ ...a, visible: false }));
  const showAlert = (config: Omit<AlertState, "visible">) =>
    setAlert({ ...config, visible: true });

  const [showForm, setShowForm] = useState(false);

  // Bookings List State
  const [bookings, setBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [refreshingBookings, setRefreshingBookings] = useState(false);

  // Booking Details Modal State
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);

  useEffect(() => {
    if (token) {
      fetchBookings();
    }
  }, [token]);

  const fetchBookings = async () => {
    setLoadingBookings(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/host/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(res.data.data || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoadingBookings(false);
    }
  };

  const onRefreshBookings = async () => {
    setRefreshingBookings(true);
    await fetchBookings();
    setRefreshingBookings(false);
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedBooking) return;
    setStatusUpdateLoading(true);
    try {
      await axios.patch(
        `${API_BASE_URL}/api/host/bookings/${selectedBooking.id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedBooking = { ...selectedBooking, booking_status: status };
      setSelectedBooking(updatedBooking);
      setBookings(bookings.map(b => b.id === selectedBooking.id ? updatedBooking : b));

      showAlert({
        type: "success",
        title: "Status Updated",
        message: `Booking has been marked as ${status}.`,
        primaryLabel: "OK",
        onPrimary: dismissAlert
      });
    } catch (error: any) {
      showAlert({
        type: "error",
        title: "Update Failed",
        message: error?.response?.data?.error || "Failed to update booking status.",
        primaryLabel: "OK",
        onPrimary: dismissAlert
      });
    } finally {
      setStatusUpdateLoading(false);
    }
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
              <AnimatedBookingCard item={item} index={index} onPress={() => setSelectedBooking(item)} />
            )}
            contentContainerStyle={styles.flatListContent}
            refreshControl={<RefreshControl refreshing={refreshingBookings} onRefresh={onRefreshBookings} />}
          />
        )}
      </View>

      {/* BOOKING DETAILS MODAL */}
      <Modal visible={!!selectedBooking} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setSelectedBooking(null)}>
        {selectedBooking && (
          <View style={{ flex: 1, backgroundColor: COLORS.background }}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Booking Info</Text>
                <Text style={styles.bookingRef}>{selectedBooking.booking_reference}</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedBooking(null)} style={styles.closeBtn}>
                <X size={24} color={COLORS.textMain} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>

              {/* Grand Total & Status Overview */}
              <LinearGradient colors={[COLORS.primaryMain, COLORS.primary]} style={styles.overviewCard}>
                <View style={styles.overviewRow}>
                  <View>
                    <Text style={styles.overviewLabel}>Grand Total</Text>
                    <Text style={styles.overviewValue}>₹{selectedBooking.grand_total?.toLocaleString() || selectedBooking.total_price}</Text>
                  </View>
                  <View style={styles.overviewStatusContainer}>
                    <Text style={styles.overviewStatusText}>{selectedBooking.booking_status}</Text>
                  </View>
                </View>
              </LinearGradient>

              {/* Check-in / Check-out Details */}
              <View style={styles.detailsSection}>
                <View style={styles.detailsRow}>
                  <View style={styles.detailsCol}>
                    <Text style={styles.detailsLabel}>Check-in</Text>
                    <Text style={styles.detailsValText}>{new Date(selectedBooking.check_in_date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</Text>
                  </View>
                  <View style={styles.detailsDivider} />
                  <View style={styles.detailsCol}>
                    <Text style={styles.detailsLabel}>Check-out</Text>
                    <Text style={styles.detailsValText}>{new Date(selectedBooking.check_out_date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</Text>
                  </View>
                </View>
              </View>

              {/* Guest Information */}
              <View style={styles.modalSection}>
                <View style={styles.sectionTitleRow}>
                  <Users size={18} color={COLORS.primaryMain} />
                  <Text style={styles.modalSectionTitle}>Guest Details</Text>
                </View>
                <Text style={styles.guestNameText}>{selectedBooking.user?.full_name || selectedBooking.guest_name || "Walk-in Guest"}</Text>
                {(selectedBooking.user?.phone || selectedBooking.guest_phone) && (
                  <Text style={styles.guestContactText}>Phone: {selectedBooking.user?.phone || selectedBooking.guest_phone}</Text>
                )}
                {(selectedBooking.user?.email || selectedBooking.guest_email) && (
                  <Text style={styles.guestContactText}>Email: {selectedBooking.user?.email || selectedBooking.guest_email}</Text>
                )}
              </View>

              {/* Property & Room Details */}
              <View style={styles.modalSection}>
                <View style={styles.sectionTitleRow}>
                  <BedDouble size={18} color={COLORS.primaryMain} />
                  <Text style={styles.modalSectionTitle}>Property & Rooms</Text>
                </View>
                <Text style={styles.propertyNameText}>{selectedBooking.property?.property_name}</Text>

                {selectedBooking.booking_items?.map((item: any, idx: number) => (
                  <View key={item.id || idx} style={styles.roomItemCard}>
                    <Text style={styles.roomItemName}>
                      {item.room?.room_category?.category_name || "Standard Room"} x {item.number_of_rooms}
                    </Text>
                    <View style={styles.roomItemDetailsRow}>
                      <Text style={styles.roomItemSubtext}>{item.adults} Adults, {item.children} Children</Text>
                      <Text style={styles.roomItemPrice}>₹{item.total_room_amount?.toLocaleString()}</Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Payment Details */}
              <View style={styles.modalSection}>
                <View style={styles.sectionTitleRow}>
                  <CreditCard size={18} color={COLORS.primaryMain} />
                  <Text style={styles.modalSectionTitle}>Payment Status</Text>
                </View>
                <View style={styles.paymentRow}>
                  <Text style={styles.paymentLabel}>Status:</Text>
                  <Text style={[styles.paymentValue, selectedBooking.payment_status === "Completed" ? { color: COLORS.success } : { color: COLORS.warning }]}>
                    {selectedBooking.payment_status}
                  </Text>
                </View>
                <View style={styles.paymentRow}>
                  <Text style={styles.paymentLabel}>Amount Paid:</Text>
                  <Text style={styles.paymentValue}>₹{selectedBooking.amount_paid?.toLocaleString() || 0}</Text>
                </View>
              </View>

              {/* Status Update Actions */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Manage Booking</Text>
                <View style={styles.statusButtonsGrid}>
                  <TouchableOpacity
                    style={[styles.statusBtn, selectedBooking.booking_status === "Confirmed" && styles.statusBtnActive]}
                    onPress={() => handleUpdateStatus("Confirmed")}
                    disabled={statusUpdateLoading}
                  >
                    <CheckCircle size={16} color={selectedBooking.booking_status === "Confirmed" ? "#FFF" : COLORS.primaryMain} />
                    <Text style={[styles.statusBtnText, selectedBooking.booking_status === "Confirmed" && styles.statusBtnTextActive]}>Confirm</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.statusBtn, selectedBooking.booking_status === "Pending" && styles.statusBtnActive]}
                    onPress={() => handleUpdateStatus("Pending")}
                    disabled={statusUpdateLoading}
                  >
                    <Clock size={16} color={selectedBooking.booking_status === "Pending" ? "#FFF" : COLORS.primaryMain} />
                    <Text style={[styles.statusBtnText, selectedBooking.booking_status === "Pending" && styles.statusBtnTextActive]}>Pending</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.statusBtn, selectedBooking.booking_status === "Completed" && styles.statusBtnActive]}
                    onPress={() => handleUpdateStatus("Completed")}
                    disabled={statusUpdateLoading}
                  >
                    <CheckCircle size={16} color={selectedBooking.booking_status === "Completed" ? "#FFF" : COLORS.primaryMain} />
                    <Text style={[styles.statusBtnText, selectedBooking.booking_status === "Completed" && styles.statusBtnTextActive]}>Complete</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.statusBtn, selectedBooking.booking_status === "Cancelled" && styles.statusBtnActive, { borderColor: COLORS.danger }]}
                    onPress={() => handleUpdateStatus("Cancelled")}
                    disabled={statusUpdateLoading}
                  >
                    <XCircle size={16} color={selectedBooking.booking_status === "Cancelled" ? "#FFF" : COLORS.danger} />
                    <Text style={[styles.statusBtnText, selectedBooking.booking_status === "Cancelled" && styles.statusBtnTextActive, { color: selectedBooking.booking_status === "Cancelled" ? "#FFF" : COLORS.danger }]}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>

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

  /* Details Modal Styles */
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: COLORS.background,
  },
  modalTitle: { fontSize: 24, fontWeight: "800", color: COLORS.textMain, letterSpacing: -0.5 },
  closeBtn: { padding: 8, backgroundColor: COLORS.card, borderRadius: 20, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  modalContent: { padding: 20, paddingBottom: 60, backgroundColor: COLORS.background },

  overviewCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: COLORS.primaryMain,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  overviewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  overviewLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  overviewValue: {
    color: "#FFF",
    fontSize: 32,
    fontWeight: "800",
  },
  overviewStatusContainer: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  overviewStatusText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 13,
  },

  detailsSection: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailsCol: {
    flex: 1,
  },
  detailsDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.border,
    marginHorizontal: 16,
  },
  detailsLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  detailsValText: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.textMain,
  },

  modalSection: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  modalSectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.textMain,
  },
  guestNameText: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textMain,
    marginBottom: 8,
  },
  guestContactText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  propertyNameText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textMain,
    marginBottom: 12,
  },
  roomItemCard: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  roomItemName: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.textMain,
    marginBottom: 8,
  },
  roomItemDetailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  roomItemSubtext: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  roomItemPrice: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.primaryMain,
  },

  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  paymentLabel: {
    fontSize: 15,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  paymentValue: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textMain,
  },

  statusButtonsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statusBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.primaryMain,
    width: "48%",
    backgroundColor: COLORS.card,
  },
  statusBtnActive: { backgroundColor: COLORS.primaryMain },
  statusBtnText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.primaryMain,
  },
  statusBtnTextActive: { color: "#FFF" },

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