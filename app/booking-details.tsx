import { useAuth } from "@/provider/AuthProvider";

import { LinearGradient } from "expo-linear-gradient";

import {
  ArrowLeft,
  BedDouble,
  CreditCard,
  Edit2,
  FileText,
  Receipt,
  Users,
  XCircle,
} from "lucide-react-native";

import React, { useState } from "react";

import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import AlertPopUp, { AlertType } from "@/components/AlertPopUp";

import Header from "../components/Header";

import { useLocalSearchParams, useRouter } from "expo-router";

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

export default function BookingDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { token } = useAuth();

  const [alert, setAlert] = useState<AlertState>(ALERT_HIDDEN);
  const dismissAlert = () => setAlert((a) => ({ ...a, visible: false }));
  const showAlert = (config: Omit<AlertState, "visible">) =>
    setAlert({ ...config, visible: true });

  // Parse the booking data from route params
  const booking = React.useMemo(() => {
    try {
      if (params.booking) {
        return JSON.parse(params.booking as string);
      }
      return null;
    } catch {
      return null;
    }
  }, [params.booking]);

  const [showInvoice, setShowInvoice] = useState(true);

  const [currentStatus, setCurrentStatus] = useState(
    booking?.booking_status || "Pending"
  );
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);

  const handleUpdateStatus = async (status: string) => {
    if (!booking) return;
    setStatusUpdateLoading(true);
    try {
      setTimeout(() => {
        setCurrentStatus(status);
        showAlert({
          type: "success",
          title: "Status Updated",
          message: `Booking has been marked as ${status}.`,
          primaryLabel: "OK",
          onPrimary: dismissAlert,
        });
        setStatusUpdateLoading(false);
      }, 400);
    } catch (error: any) {
      showAlert({
        type: "error",
        title: "Update Failed",
        message: error?.message || "Failed to update booking status.",
        primaryLabel: "OK",
        onPrimary: dismissAlert,
      });
      setStatusUpdateLoading(false);
    }
  };

  if (!booking) {
    return (
      <View style={styles.mainContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <Header />
        <View style={styles.centerFill}>
          <Text style={styles.emptyText}>Booking not found.</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <Header />

      {/* Screen Header */}
      <View style={styles.screenHeader}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color={COLORS.textMain} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.screenTitle}>Booking Info</Text>
          <Text style={styles.bookingRef}>{booking.booking_reference}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Grand Total & Status Overview */}
        <LinearGradient
          colors={[COLORS.primaryMain, COLORS.primary]}
          style={styles.overviewCard}
        >
          <View style={styles.overviewRow}>
            <View>
              <Text style={styles.overviewLabel}>Grand Total</Text>
              <Text style={styles.overviewValue}>
                ₹{booking.grand_total?.toLocaleString() || booking.total_price}
              </Text>
            </View>
            <View style={styles.overviewStatusContainer}>
              <Text style={styles.overviewStatusText}>{currentStatus}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Check-in / Check-out Details */}
        <View style={styles.detailsSection}>
          <View style={styles.detailsRow}>
            <View style={styles.detailsCol}>
              <Text style={styles.detailsLabel}>Check-in</Text>
              <Text style={styles.detailsValText}>
                {new Date(booking.check_in_date).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </Text>
            </View>
            <View style={styles.detailsDivider} />
            <View style={styles.detailsCol}>
              <Text style={styles.detailsLabel}>Check-out</Text>
              <Text style={styles.detailsValText}>
                {new Date(booking.check_out_date).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </Text>
            </View>
          </View>
        </View>

        {/* Guest Information */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Users size={18} color={COLORS.primaryMain} />
            <Text style={styles.sectionTitle}>Guest Details</Text>
          </View>
          <Text style={styles.guestNameText}>
            {booking.user?.full_name ||
              booking.guest_name ||
              "Walk-in Guest"}
          </Text>
          {(booking.user?.phone || booking.guest_phone) && (
            <Text style={styles.guestContactText}>
              Phone: {booking.user?.phone || booking.guest_phone}
            </Text>
          )}
          {(booking.user?.email || booking.guest_email) && (
            <Text style={styles.guestContactText}>
              Email: {booking.user?.email || booking.guest_email}
            </Text>
          )}
        </View>

        {/* Property & Room Details */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <BedDouble size={18} color={COLORS.primaryMain} />
            <Text style={styles.sectionTitle}>Property & Rooms</Text>
          </View>
          <Text style={styles.propertyNameText}>
            {booking.property?.property_name}
          </Text>

          {booking.booking_items?.map((item: any, idx: number) => (
            <View key={item.id || idx} style={styles.roomItemCard}>
              <Text style={styles.roomItemName}>
                {item.room?.room_category?.category_name || "Standard Room"} x{" "}
                {item.number_of_rooms}
              </Text>
              <View style={styles.roomItemDetailsRow}>
                <Text style={styles.roomItemSubtext}>
                  {item.adults} Adults, {item.children} Children
                </Text>
                <Text style={styles.roomItemPrice}>
                  ₹{item.total_room_amount?.toLocaleString()}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Payment Details */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <CreditCard size={18} color={COLORS.primaryMain} />
            <Text style={styles.sectionTitle}>Payment Status</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Status:</Text>
            <Text
              style={[
                styles.paymentValue,
                booking.payment_status === "Completed"
                  ? { color: COLORS.success }
                  : { color: COLORS.warning },
              ]}
            >
              {booking.payment_status}
            </Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Amount Paid:</Text>
            <Text style={styles.paymentValue}>
              ₹{booking.amount_paid?.toLocaleString() || 0}
            </Text>
          </View>
        </View>

        {/* Tax Mode Toggle & Invoice */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <FileText size={18} color={COLORS.primaryMain} />
            <Text style={styles.sectionTitle}>Invoice</Text>
          </View>
          <View style={styles.invoiceToggleRow}>
            <TouchableOpacity
              style={[
                styles.invoiceToggleBtn,
                showInvoice && styles.invoiceToggleBtnActive,
              ]}
              onPress={() => setShowInvoice(true)}
              activeOpacity={0.7}
            >
              <Receipt
                size={15}
                color={showInvoice ? "#FFF" : COLORS.primaryMain}
              />
              <Text
                style={[
                  styles.invoiceToggleText,
                  showInvoice && styles.invoiceToggleTextActive,
                ]}
              >
                Inclusive Tax
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.invoiceToggleBtn,
                !showInvoice && styles.invoiceToggleBtnActive,
              ]}
              onPress={() => setShowInvoice(false)}
              activeOpacity={0.7}
            >
              <Receipt
                size={15}
                color={!showInvoice ? "#FFF" : COLORS.textSecondary}
              />
              <Text
                style={[
                  styles.invoiceToggleText,
                  !showInvoice && styles.invoiceToggleTextActive,
                ]}
              >
                Exclusive Tax
              </Text>
            </TouchableOpacity>
          </View>

          {(() => {
            const isInclusive = showInvoice;
            const GST_RATE = 0.12;

            const roomTotal =
              booking.booking_items?.reduce(
                (sum: number, item: any) =>
                  sum + (item.total_room_amount || 0),
                0
              ) || 0;

            // Inclusive: room price already has tax → extract base
            // Exclusive: room price is base → add tax on top
            const baseAmount = isInclusive
              ? Math.round(roomTotal / (1 + GST_RATE))
              : roomTotal;
            const gstAmount = isInclusive
              ? roomTotal - Math.round(roomTotal / (1 + GST_RATE))
              : Math.round(roomTotal * GST_RATE);
            const grandTotal = isInclusive
              ? roomTotal
              : roomTotal + gstAmount;

            const nights = Math.max(
              1,
              Math.ceil(
                (new Date(booking.check_out_date).getTime() -
                  new Date(booking.check_in_date).getTime()) /
                  (1000 * 60 * 60 * 24)
              )
            );

            return (
              <View style={styles.invoiceCard}>
                {/* Invoice Header */}
                <View style={styles.invoiceHeader}>
                  <Text style={styles.invoiceHeaderTitle}>Tax Invoice</Text>
                  <View style={styles.taxModeBadge}>
                    <Text style={styles.taxModeBadgeText}>
                      {isInclusive ? "Tax Inclusive" : "Tax Exclusive"}
                    </Text>
                  </View>
                </View>
                <Text style={styles.invoiceHeaderRef}>
                  {booking.booking_reference}
                </Text>

                <View style={styles.invoiceDivider} />

                {/* Room Charges */}
                {booking.booking_items?.map((item: any, idx: number) => {
                  const itemBase = isInclusive
                    ? Math.round(
                        (item.total_room_amount || 0) / (1 + GST_RATE)
                      )
                    : item.total_room_amount || 0;
                  return (
                    <View key={item.id || idx}>
                      <View style={styles.invoiceLineItem}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.invoiceItemName}>
                            {item.room?.room_category?.category_name ||
                              "Standard Room"}
                          </Text>
                          <Text style={styles.invoiceItemMeta}>
                            {item.number_of_rooms} room(s) × {nights} night(s)
                          </Text>
                        </View>
                        <Text style={styles.invoiceItemAmount}>
                          ₹{itemBase.toLocaleString()}
                        </Text>
                      </View>
                    </View>
                  );
                })}

                <View style={styles.invoiceDividerDashed} />

                {/* Subtotal (base) */}
                <View style={styles.invoiceSummaryRow}>
                  <Text style={styles.invoiceSummaryLabel}>Subtotal</Text>
                  <Text style={styles.invoiceSummaryValue}>
                    ₹{baseAmount.toLocaleString()}
                  </Text>
                </View>

                {/* GST */}
                <View style={styles.invoiceSummaryRow}>
                  <Text style={styles.invoiceSummaryLabel}>
                    GST (12%){isInclusive ? " — included" : ""}
                  </Text>
                  <Text
                    style={[
                      styles.invoiceSummaryValue,
                      isInclusive && { color: COLORS.textMuted },
                    ]}
                  >
                    {isInclusive ? "" : "+ "}₹{gstAmount.toLocaleString()}
                  </Text>
                </View>

                {/* Discount */}
                {booking.discount_amount > 0 && (
                  <View style={styles.invoiceSummaryRow}>
                    <Text
                      style={[
                        styles.invoiceSummaryLabel,
                        { color: COLORS.success },
                      ]}
                    >
                      Discount
                    </Text>
                    <Text
                      style={[
                        styles.invoiceSummaryValue,
                        { color: COLORS.success },
                      ]}
                    >
                      -₹{booking.discount_amount?.toLocaleString()}
                    </Text>
                  </View>
                )}

                <View style={styles.invoiceDivider} />

                {/* Grand Total */}
                <View style={styles.invoiceGrandTotalRow}>
                  <Text style={styles.invoiceGrandTotalLabel}>
                    Grand Total
                  </Text>
                  <Text style={styles.invoiceGrandTotalValue}>
                    ₹{grandTotal.toLocaleString()}
                  </Text>
                </View>

                {/* Amount Paid / Balance */}
                <View style={styles.invoiceSummaryRow}>
                  <Text style={styles.invoiceSummaryLabel}>Amount Paid</Text>
                  <Text
                    style={[
                      styles.invoiceSummaryValue,
                      { color: COLORS.success },
                    ]}
                  >
                    ₹{booking.amount_paid?.toLocaleString() || 0}
                  </Text>
                </View>
                {grandTotal - (booking.amount_paid || 0) > 0 && (
                  <View style={styles.invoiceSummaryRow}>
                    <Text
                      style={[
                        styles.invoiceSummaryLabel,
                        { color: COLORS.danger, fontWeight: "700" },
                      ]}
                    >
                      Balance Due
                    </Text>
                    <Text
                      style={[
                        styles.invoiceSummaryValue,
                        { color: COLORS.danger, fontWeight: "800" },
                      ]}
                    >
                      ₹
                      {(
                        grandTotal - (booking.amount_paid || 0)
                      ).toLocaleString()}
                    </Text>
                  </View>
                )}
              </View>
            );
          })()}
        </View>

        {/* Actions */}
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity
            style={styles.modifyBtn}
            onPress={() => {
              showAlert({
                type: "info",
                title: "Modify Booking",
                message: "Modification feature coming soon.",
                primaryLabel: "OK",
                onPrimary: dismissAlert,
              });
            }}
            activeOpacity={0.8}
          >
            <Edit2 size={18} color="#FFF" />
            <Text style={styles.modifyBtnText}>Modify Booking</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => {
              showAlert({
                type: "warning",
                title: "Cancel Booking?",
                message: "Are you sure you want to cancel this booking? This action cannot be undone.",
                primaryLabel: "Yes, Cancel",
                secondaryLabel: "No, Keep",
                onPrimary: () => {
                  handleUpdateStatus("Cancelled");
                },
                onSecondary: dismissAlert,
              });
            }}
            activeOpacity={0.8}
            disabled={currentStatus === "Cancelled"}
          >
            <XCircle size={18} color={currentStatus === "Cancelled" ? COLORS.textMuted : COLORS.danger} />
            <Text style={[styles.cancelBtnText, currentStatus === "Cancelled" && { color: COLORS.textMuted }]}>
              {currentStatus === "Cancelled" ? "Booking Cancelled" : "Cancel Booking"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

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
  centerFill: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textMain,
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: COLORS.primaryMain,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 15,
  },

  // Screen Header
  screenHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 14,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.textMain,
    letterSpacing: -0.5,
  },
  bookingRef: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.primaryMain,
    marginTop: 2,
    letterSpacing: 0.5,
  },

  // Content
  content: {
    padding: 20,
    paddingBottom: 60,
  },

  // Overview Card
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

  // Check-in / Check-out
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

  // Sections
  section: {
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
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.textMain,
  },

  // Guest
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

  // Property
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

  // Payment
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

  // Action Buttons
  actionButtonsRow: {
    flexDirection: "column",
    gap: 12,
    marginBottom: 30,
  },
  modifyBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.primaryMain,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: COLORS.primaryMain,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  modifyBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  cancelBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.card,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.danger,
  },
  cancelBtnText: {
    color: COLORS.danger,
    fontSize: 16,
    fontWeight: "700",
  },

  // Invoice Toggle
  invoiceToggleRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  invoiceToggleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  invoiceToggleBtnActive: {
    backgroundColor: COLORS.primaryMain,
    borderColor: COLORS.primaryMain,
  },
  invoiceToggleText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textSecondary,
  },
  invoiceToggleTextActive: {
    color: "#FFF",
  },

  // Invoice Card
  invoiceCard: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  invoiceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  invoiceHeaderTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textMain,
    letterSpacing: -0.3,
  },
  invoiceHeaderRef: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.primaryMain,
    letterSpacing: 0.5,
  },
  taxModeBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  taxModeBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.primaryMain,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  invoiceDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  invoiceDividerDashed: {
    height: 1,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    borderStyle: "dashed",
    marginVertical: 12,
  },
  invoiceLineItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 8,
  },
  invoiceItemName: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textMain,
    marginBottom: 2,
  },
  invoiceItemMeta: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: "500",
  },
  invoiceItemAmount: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textMain,
  },
  invoiceSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
  },
  invoiceSummaryLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  invoiceSummaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textMain,
  },
  invoiceGrandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    marginBottom: 4,
  },
  invoiceGrandTotalLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textMain,
  },
  invoiceGrandTotalValue: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.primaryMain,
  },
});
