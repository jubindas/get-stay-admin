import AlertPopUp, { AlertType } from "@/components/AlertPopUp";
import { useAuth } from "@/provider/AuthProvider";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import { Banknote, CheckCircle2, CreditCard, Minus, Plus, Smartphone, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

/**
 * Design tokens
 * A restrained slate + indigo palette with a single warm accent reserved
 * for money/attention states (totals, warnings). Spacing follows a 4px scale.
 */
const COLORS = {
  primary: "#1E3A8A",        // deep indigo — headers, primary actions
  primaryHover: "#1E293B",
  primarySoft: "#EEF2FF",    // soft tint for selected states
  accent: "#B45309",         // amber — grand total emphasis only
  accentSoft: "#FFFBEB",
  success: "#15803D",
  ink: "#0F172A",            // primary text
  inkMuted: "#475569",       // secondary text
  inkFaint: "#94A3B8",       // placeholder / tertiary text
  line: "#E2E8F0",           // hairline borders
  lineStrong: "#CBD5E1",
  surface: "#FFFFFF",
  canvas: "#F1F5F9",         // page background
  fieldFill: "#F8FAFC",
};

const SPACING = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };

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

/** Numbered section header used throughout the form for a consistent, professional rhythm. */
function SectionHeader({ index, title }: { index: number; title: string }) {
  return (
    <View style={styles.sectionHeaderRow}>
      <View style={styles.sectionBadge}>
        <Text style={styles.sectionBadgeText}>{index}</Text>
      </View>
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
  );
}

const MOCK_PROPERTIES = [
  {
    id: "prop_1",
    property_name: "Ocean View Resort",
    room_details: [
      { id: "room_1", base_price: 2500 },
      { id: "room_2", base_price: 4000 },
    ],
  },
  {
    id: "prop_2",
    property_name: "Mountain Retreat",
    room_details: [
      { id: "room_3", base_price: 1800 },
      { id: "room_4", base_price: 3200 },
    ],
  },
];

export default function WalkInBookingModal({ visible, onClose, onSuccess }: any) {
  const { token } = useAuth();

  const [alert, setAlert] = useState<AlertState>(ALERT_HIDDEN);
  const dismissAlert = () => setAlert((a) => ({ ...a, visible: false }));
  const showAlert = (config: Omit<AlertState, "visible">) =>
    setAlert({ ...config, visible: true });

  const [properties, setProperties] = useState<any[]>([]);
  const [loadingForm, setLoadingForm] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [propertyId, setPropertyId] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestAddress, setGuestAddress] = useState("");
  const [guestRemarks, setGuestRemarks] = useState("");
  const [withBreakfast, setWithBreakfast] = useState(false);
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [numberOfRooms, setNumberOfRooms] = useState("1");
  const [adults, setAdults] = useState("1");
  const [children, setChildren] = useState("0");
  const [extraBedNeeded, setExtraBedNeeded] = useState(false);
  const [extraBeds, setExtraBeds] = useState("0");
  const [paymentType, setPaymentType] = useState<"Cash" | "Online" | "UPI">("Cash");
  const [isInclusiveTax, setIsInclusiveTax] = useState(true);

  const fetchProperties = async () => {
    setLoadingForm(true);
    try {
      // STATIC MODE: Bypass API and use mock properties
      setProperties(MOCK_PROPERTIES);
    } catch (error) {
      console.log("Error fetching properties for modal", error);
      setProperties(MOCK_PROPERTIES);
    } finally {
      setLoadingForm(false);
    }
  };

  useEffect(() => {
    if (visible && token) {
      if (properties.length === 0) {
        fetchProperties();
      }
    }
  }, [visible, token]);

  const getRoomsForSelectedProperty = () => {
    const prop = properties.find((p) => p.id === propertyId);
    return prop?.room_details || [];
  };

  const availableRooms = getRoomsForSelectedProperty();

  const handleBooking = async () => {
    const missingFields = [];
    if (!propertyId) missingFields.push("Property");
    if (!guestName) missingFields.push("Guest Name");
    if (!guestPhone) missingFields.push("Guest Phone");
    if (!checkInDate) missingFields.push("Check-in Date");
    if (!checkOutDate) missingFields.push("Check-out Date");
    if (!selectedRoomId) missingFields.push("Room Selection");

    if (missingFields.length) {
      showAlert({
        type: "warning",
        title: "Missing Information",
        message: `Please provide: ${missingFields.join(", ")}.`,
        primaryLabel: "Got it",
        onPrimary: dismissAlert,
      });
      return;
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      showAlert({
        type: "warning",
        title: "Invalid Dates",
        message: "Please select valid check-in and check-out dates.",
        primaryLabel: "Got it",
        onPrimary: dismissAlert,
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        property_id: propertyId,
        guest_name: guestName,
        guest_email: guestEmail || "walkin@noemail.com",
        guest_phone: guestPhone,
        guest_address: guestAddress,
        guest_remarks: guestRemarks,
        with_breakfast: withBreakfast,
        payment_type: paymentType,
        tax_inclusive: isInclusiveTax,
        check_in_date: checkIn.toISOString(),
        check_out_date: checkOut.toISOString(),
        rooms: [
          {
            room_details_id: selectedRoomId,
            number_of_rooms: parseInt(numberOfRooms) || 1,
            adults: parseInt(adults) || 1,
            children: parseInt(children) || 0,
            extra_beds: extraBedNeeded ? (parseInt(extraBeds) || 1) : 0,
          },
        ],
      };

      // STATIC MODE: Simulate API delay and succeed
      await new Promise((resolve) => setTimeout(resolve, 1000));

      showAlert({
        type: "success",
        title: "Success",
        message: "Walk-in Booking registered successfully! (Static Mode)",
        primaryLabel: "OK",
        onPrimary: () => {
          resetForm();
          onClose();
          dismissAlert();
          if (onSuccess) onSuccess();
        },
      });
    } catch (error: any) {
      const errMessage = error?.response?.data?.error || error?.response?.data?.message || "An error occurred.";
      showAlert({
        type: "error",
        title: "Booking Failed",
        message: errMessage,
        primaryLabel: "OK",
        onPrimary: dismissAlert,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setPropertyId("");
    setGuestName("");
    setGuestEmail("");
    setGuestPhone("");
    setGuestAddress("");
    setGuestRemarks("");
    setWithBreakfast(false);
    setCheckInDate("");
    setCheckOutDate("");
    setSelectedRoomId("");
    setNumberOfRooms("1");
    setAdults("1");
    setChildren("0");
    setExtraBedNeeded(false);
    setExtraBeds("0");
    setPaymentType("Cash");
    setIsInclusiveTax(true);
  };

  // Pricing calculations
  const selectedRoom = availableRooms.find((r: any) => r.id === selectedRoomId);
  const numRooms = parseInt(numberOfRooms) || 1;
  const numNights = (() => {
    if (!checkInDate || !checkOutDate) return 0;
    const diff = new Date(checkOutDate).getTime() - new Date(checkInDate).getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  })();
  const basePrice = selectedRoom?.base_price || 0;
  const roomChargesInput = basePrice * numRooms * numNights;
  const extraBedCharges = extraBedNeeded ? (parseInt(extraBeds) || 1) * 500 * numNights : 0;

  const GST_RATE = 0.12;
  const rawSubtotal = roomChargesInput + extraBedCharges;

  const baseAmount = isInclusiveTax ? Math.round(rawSubtotal / (1 + GST_RATE)) : rawSubtotal;
  const gstAmount = isInclusiveTax ? rawSubtotal - baseAmount : Math.round(rawSubtotal * GST_RATE);
  const grandTotal = isInclusiveTax ? rawSubtotal : rawSubtotal + gstAmount;

  return (
    <>
      <Modal visible={visible} animationType="slide" presentationStyle="formSheet" onRequestClose={onClose}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.formHeaderRow}>
            <View>
              <Text style={styles.formHeaderEyebrow}>FRONT DESK</Text>
              <Text style={styles.formHeaderText}>New Walk-in Booking</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={8}>
              <X size={18} color={COLORS.ink} />
            </TouchableOpacity>
          </View>

          {loadingForm ? (
            <View style={styles.centerFill}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Loading properties…</Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
              {/* 1. Property Selection */}
              <View style={styles.card}>
                <SectionHeader index={1} title="Select Property" />
                {properties.length === 0 ? (
                  <Text style={styles.emptyTextForm}>No properties found.</Text>
                ) : (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ marginHorizontal: -SPACING.md, paddingHorizontal: SPACING.md }}
                  >
                    {properties.map((prop) => (
                      <TouchableOpacity
                        key={prop.id}
                        activeOpacity={0.85}
                        style={[
                          styles.selectablePill,
                          propertyId === prop.id && styles.selectablePillActive,
                        ]}
                        onPress={() => {
                          setPropertyId(prop.id);
                          setSelectedRoomId("");
                        }}
                      >
                        <Text
                          style={[
                            styles.selectablePillText,
                            propertyId === prop.id && styles.selectablePillTextActive,
                          ]}
                        >
                          {prop.property_name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>

              {/* 2. Guest Details */}
              <View style={styles.card}>
                <SectionHeader index={2} title="Guest Details" />
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Full Name *</Text>
                  <TextInput
                    placeholder="Guest name"
                    placeholderTextColor={COLORS.inkFaint}
                    value={guestName}
                    onChangeText={setGuestName}
                    style={styles.input}
                  />
                </View>
                <View style={styles.row}>
                  <View style={[styles.inputWrapper, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>Phone Number *</Text>
                    <TextInput
                      placeholder="Guest phone"
                      placeholderTextColor={COLORS.inkFaint}
                      keyboardType="phone-pad"
                      value={guestPhone}
                      onChangeText={setGuestPhone}
                      style={styles.input}
                    />
                  </View>
                  <View style={{ width: SPACING.md }} />
                  <View style={[styles.inputWrapper, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>Email Address</Text>
                    <TextInput
                      placeholder="Optional"
                      placeholderTextColor={COLORS.inkFaint}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={guestEmail}
                      onChangeText={setGuestEmail}
                      style={styles.input}
                    />
                  </View>
                </View>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Guest Address</Text>
                  <TextInput
                    placeholder="Optional"
                    placeholderTextColor={COLORS.inkFaint}
                    value={guestAddress}
                    onChangeText={setGuestAddress}
                    style={styles.input}
                  />
                </View>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Guest Remarks</Text>
                  <TextInput
                    placeholder="Any special remarks (optional)"
                    placeholderTextColor={COLORS.inkFaint}
                    value={guestRemarks}
                    onChangeText={setGuestRemarks}
                    style={styles.input}
                  />
                </View>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Breakfast Included?</Text>
                  <View style={styles.segmentedControl}>
                    <TouchableOpacity
                      style={[styles.segment, withBreakfast && styles.segmentActive]}
                      onPress={() => setWithBreakfast(true)}
                      activeOpacity={0.85}
                    >
                      <Text style={[styles.segmentText, withBreakfast && styles.segmentTextActive]}>
                        With Breakfast
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.segment, !withBreakfast && styles.segmentActive]}
                      onPress={() => setWithBreakfast(false)}
                      activeOpacity={0.85}
                    >
                      <Text style={[styles.segmentText, !withBreakfast && styles.segmentTextActive]}>
                        Without Breakfast
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* 3. Dates */}
              <View style={styles.card}>
                <SectionHeader index={3} title="Booking Dates" />
                <View style={styles.row}>
                  <View style={[styles.inputWrapper, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>Check-in Date *</Text>
                    <TouchableOpacity
                      onPress={() => setShowCheckInPicker(true)}
                      style={styles.datePickerBtn}
                      activeOpacity={0.85}
                    >
                      <Text
                        style={[
                          styles.datePickerText,
                          !checkInDate && styles.datePickerPlaceholder,
                        ]}
                      >
                        {checkInDate || "Select date"}
                      </Text>
                      <Ionicons name="calendar-outline" size={18} color={COLORS.inkMuted} />
                    </TouchableOpacity>
                    {showCheckInPicker && (
                      <DateTimePicker
                        value={checkInDate ? new Date(checkInDate) : new Date()}
                        mode="date"
                        display="default"
                        onChange={(event, date) => {
                          setShowCheckInPicker(false);
                          if (date) {
                            const iso = date.toISOString().split("T")[0];
                            setCheckInDate(iso);
                          }
                        }}
                      />
                    )}
                  </View>

                  <View style={{ width: SPACING.md }} />

                  <View style={[styles.inputWrapper, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>Check-out Date *</Text>
                    <TouchableOpacity
                      onPress={() => setShowCheckOutPicker(true)}
                      style={styles.datePickerBtn}
                      activeOpacity={0.85}
                    >
                      <Text
                        style={[
                          styles.datePickerText,
                          !checkOutDate && styles.datePickerPlaceholder,
                        ]}
                      >
                        {checkOutDate || "Select date"}
                      </Text>
                      <Ionicons name="calendar-outline" size={18} color={COLORS.inkMuted} />
                    </TouchableOpacity>
                    {showCheckOutPicker && (
                      <DateTimePicker
                        value={checkOutDate ? new Date(checkOutDate) : new Date()}
                        mode="date"
                        display="default"
                        onChange={(event, date) => {
                          setShowCheckOutPicker(false);
                          if (date) {
                            const iso = date.toISOString().split("T")[0];
                            setCheckOutDate(iso);
                          }
                        }}
                      />
                    )}
                  </View>
                </View>
              </View>

              {/* 4. Room Selection */}
              {propertyId ? (
                <View style={styles.card}>
                  <SectionHeader index={4} title="Select Room" />
                  {availableRooms.length === 0 ? (
                    <Text style={styles.emptyTextForm}>No rooms available in this property.</Text>
                  ) : (
                    <View>
                      {availableRooms.map((room: any, index: number) => (
                        <TouchableOpacity
                          key={room.id}
                          activeOpacity={0.85}
                          style={[
                            styles.roomSelectCard,
                            selectedRoomId === room.id && styles.roomSelectCardActive,
                          ]}
                          onPress={() => setSelectedRoomId(room.id)}
                        >
                          <View>
                            <Text
                              style={[
                                styles.roomName,
                                selectedRoomId === room.id && styles.roomNameActive,
                              ]}
                            >
                              Room {index + 1}
                            </Text>
                            <Text style={styles.roomPrice}>₹{room.base_price} / night</Text>
                          </View>
                          {selectedRoomId === room.id ? (
                            <CheckCircle2 size={22} color={COLORS.primary} />
                          ) : (
                            <View style={styles.roomSelectDot} />
                          )}
                        </TouchableOpacity>
                      ))}

                      {selectedRoomId ? (
                        <View style={styles.quantitiesContainer}>
                          <View style={[styles.inputWrapper, { marginBottom: 0 }]}>
                            <Text style={styles.inputLabel}>No. of Rooms</Text>
                            <TextInput
                              keyboardType="numeric"
                              value={numberOfRooms}
                              onChangeText={setNumberOfRooms}
                              style={styles.input}
                            />
                          </View>
                        </View>
                      ) : null}
                    </View>
                  )}
                </View>
              ) : null}

              {/* 5. Guest Members */}
              {selectedRoomId ? (
                <View style={styles.card}>
                  <SectionHeader index={5} title="Guest Members" />
                  <View style={styles.stepperRow}>
                    <View style={styles.stepperItem}>
                      <Text style={styles.stepperLabel}>Total Adults</Text>
                      <View style={styles.stepperControls}>
                        <TouchableOpacity
                          style={styles.stepperBtn}
                          onPress={() => setAdults(String(Math.max(1, (parseInt(adults) || 1) - 1)))}
                        >
                          <Minus size={15} color={COLORS.primary} />
                        </TouchableOpacity>
                        <TextInput
                          style={styles.stepperInput}
                          keyboardType="numeric"
                          value={adults}
                          onChangeText={setAdults}
                          selectTextOnFocus
                        />
                        <TouchableOpacity
                          style={styles.stepperBtn}
                          onPress={() => setAdults(String((parseInt(adults) || 1) + 1))}
                        >
                          <Plus size={15} color={COLORS.primary} />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={styles.stepperDivider} />
                    <View style={styles.stepperItem}>
                      <Text style={styles.stepperLabel}>Total Children</Text>
                      <View style={styles.stepperControls}>
                        <TouchableOpacity
                          style={styles.stepperBtn}
                          onPress={() => setChildren(String(Math.max(0, (parseInt(children) || 0) - 1)))}
                        >
                          <Minus size={15} color={COLORS.primary} />
                        </TouchableOpacity>
                        <TextInput
                          style={styles.stepperInput}
                          keyboardType="numeric"
                          value={children}
                          onChangeText={setChildren}
                          selectTextOnFocus
                        />
                        <TouchableOpacity
                          style={styles.stepperBtn}
                          onPress={() => setChildren(String((parseInt(children) || 0) + 1))}
                        >
                          <Plus size={15} color={COLORS.primary} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              ) : null}

              {/* 6. Extra Bed */}
              {selectedRoomId ? (
                <View style={styles.card}>
                  <SectionHeader index={6} title="Extra Bed" />
                  <View style={styles.segmentedControl}>
                    <TouchableOpacity
                      style={[styles.segment, extraBedNeeded && styles.segmentActive]}
                      onPress={() => { setExtraBedNeeded(true); if (extraBeds === "0") setExtraBeds("1"); }}
                      activeOpacity={0.85}
                    >
                      <Text style={[styles.segmentText, extraBedNeeded && styles.segmentTextActive]}>
                        Yes, Need Extra Bed
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.segment, !extraBedNeeded && styles.segmentActive]}
                      onPress={() => { setExtraBedNeeded(false); setExtraBeds("0"); }}
                      activeOpacity={0.85}
                    >
                      <Text style={[styles.segmentText, !extraBedNeeded && styles.segmentTextActive]}>
                        No Extra Bed
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {extraBedNeeded && (
                    <View style={[styles.stepperRow, { marginTop: SPACING.md }]}>
                      <View style={styles.stepperItem}>
                        <Text style={styles.stepperLabel}>No. of Extra Beds</Text>
                        <View style={styles.stepperControls}>
                          <TouchableOpacity
                            style={styles.stepperBtn}
                            onPress={() => setExtraBeds(String(Math.max(1, (parseInt(extraBeds) || 1) - 1)))}
                          >
                            <Minus size={15} color={COLORS.primary} />
                          </TouchableOpacity>
                          <TextInput
                            style={styles.stepperInput}
                            keyboardType="numeric"
                            value={extraBeds}
                            onChangeText={setExtraBeds}
                            selectTextOnFocus
                          />
                          <TouchableOpacity
                            style={styles.stepperBtn}
                            onPress={() => setExtraBeds(String((parseInt(extraBeds) || 1) + 1))}
                          >
                            <Plus size={15} color={COLORS.primary} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  )}
                </View>
              ) : null}

              {/* 7. Payment Type */}
              <View style={styles.card}>
                <SectionHeader index={7} title="Payment Type" />
                <View style={styles.paymentTypeRow}>
                  {(["Cash", "Online", "UPI"] as const).map((type) => {
                    const isActive = paymentType === type;
                    const Icon = type === "Cash" ? Banknote : type === "Online" ? CreditCard : Smartphone;
                    return (
                      <TouchableOpacity
                        key={type}
                        style={[styles.paymentTypeBtn, isActive && styles.paymentTypeBtnActive]}
                        onPress={() => setPaymentType(type)}
                        activeOpacity={0.85}
                      >
                        <Icon size={17} color={isActive ? "#FFFFFF" : COLORS.inkMuted} />
                        <Text style={[styles.paymentTypeText, isActive && styles.paymentTypeTextActive]}>
                          {type}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Pricing Summary */}
              {selectedRoomId && numNights > 0 ? (
                <View style={styles.pricingCard}>
                  <View style={styles.pricingHeaderRow}>
                    <Text style={styles.pricingTitle}>Pricing Summary</Text>
                    <View style={styles.taxToggleContainer}>
                      <TouchableOpacity
                        style={[styles.taxToggleBtn, isInclusiveTax && styles.taxToggleBtnActive]}
                        onPress={() => setIsInclusiveTax(true)}
                      >
                        <Text style={[styles.taxToggleText, isInclusiveTax && styles.taxToggleTextActive]}>
                          Inclusive
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.taxToggleBtn, !isInclusiveTax && styles.taxToggleBtnActive]}
                        onPress={() => setIsInclusiveTax(false)}
                      >
                        <Text style={[styles.taxToggleText, !isInclusiveTax && styles.taxToggleTextActive]}>
                          Exclusive
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.pricingDivider} />

                  <View style={styles.pricingRow}>
                    <Text style={styles.pricingLabel}>
                      Room ({numRooms} × ₹{basePrice} × {numNights} night{numNights > 1 ? "s" : ""})
                    </Text>
                    <Text style={styles.pricingValue}>₹{roomChargesInput.toLocaleString()}</Text>
                  </View>
                  {extraBedCharges > 0 && (
                    <View style={styles.pricingRow}>
                      <Text style={styles.pricingLabel}>
                        Extra Bed ({extraBeds} × ₹500 × {numNights} night{numNights > 1 ? "s" : ""})
                      </Text>
                      <Text style={styles.pricingValue}>₹{extraBedCharges.toLocaleString()}</Text>
                    </View>
                  )}

                  <View style={styles.pricingDividerDashed} />

                  <View style={styles.pricingRow}>
                    <Text style={styles.pricingLabel}>Subtotal</Text>
                    <Text style={styles.pricingValue}>₹{baseAmount.toLocaleString()}</Text>
                  </View>
                  <View style={styles.pricingRow}>
                    <Text style={styles.pricingLabel}>
                      GST (12%){isInclusiveTax ? " — included" : ""}
                    </Text>
                    <Text style={[styles.pricingValue, isInclusiveTax && { color: COLORS.inkFaint }]}>
                      {isInclusiveTax ? "" : "+ "}₹{gstAmount.toLocaleString()}
                    </Text>
                  </View>

                  <View style={styles.pricingTotalRow}>
                    <Text style={styles.pricingTotalLabel}>Grand Total</Text>
                    <Text style={styles.pricingTotalValue}>₹{grandTotal.toLocaleString()}</Text>
                  </View>
                </View>
              ) : null}

              <TouchableOpacity
                style={[styles.submitButton, submitting && { opacity: 0.7 }]}
                onPress={handleBooking}
                disabled={submitting}
                activeOpacity={0.9}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Confirm Walk-in Booking</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>

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
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.canvas,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  centerFill: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: SPACING.sm,
  },
  loadingText: {
    fontSize: 13,
    color: COLORS.inkMuted,
    fontWeight: "500",
  },

  // Header
  formHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.canvas,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
  },
  formHeaderEyebrow: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.primary,
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  formHeaderText: {
    fontSize: 19,
    fontWeight: "800",
    color: COLORS.ink,
    letterSpacing: -0.4,
  },
  closeBtn: {
    padding: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.line,
  },

  content: { padding: SPACING.md, paddingBottom: SPACING.xl },

  // Cards
  card: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: 14,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  sectionBadge: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: COLORS.primarySoft,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.primary,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.ink,
    letterSpacing: -0.1,
  },

  // Inputs
  inputWrapper: { marginBottom: SPACING.md },
  inputLabel: {
    fontSize: 10.5,
    fontWeight: "700",
    color: COLORS.inkMuted,
    marginBottom: SPACING.xs + 2,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  input: {
    backgroundColor: COLORS.fieldFill,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 10,
    paddingHorizontal: SPACING.md,
    height: 42,
    fontSize: 13.5,
    color: COLORS.ink,
  },
  datePickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.fieldFill,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 10,
    paddingHorizontal: SPACING.md,
    height: 42,
  },
  datePickerText: { fontSize: 13.5, color: COLORS.ink, fontWeight: "600" },
  datePickerPlaceholder: { color: COLORS.inkFaint, fontWeight: "500" },
  row: { flexDirection: "row" },

  // Segmented control (replaces radio buttons)
  segmentedControl: {
    flexDirection: "row",
    backgroundColor: COLORS.fieldFill,
    borderRadius: 10,
    padding: 3,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  segment: {
    flex: 1,
    paddingVertical: 9,
    alignItems: "center",
    borderRadius: 8,
  },
  segmentActive: {
    backgroundColor: COLORS.primary,
  },
  segmentText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: COLORS.inkMuted,
  },
  segmentTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  // Property pills
  selectablePill: {
    backgroundColor: COLORS.fieldFill,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm + 2,
    borderRadius: 10,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  selectablePillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  selectablePillText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: COLORS.inkMuted,
  },
  selectablePillTextActive: { color: "#FFFFFF" },

  // Room cards
  roomSelectCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: COLORS.fieldFill,
    marginBottom: SPACING.sm,
  },
  roomSelectCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primarySoft,
  },
  roomSelectDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: COLORS.lineStrong,
  },
  roomName: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.ink,
    marginBottom: 2,
  },
  roomNameActive: { color: COLORS.primary },
  roomPrice: { fontSize: 12, color: COLORS.inkMuted, fontWeight: "600" },
  quantitiesContainer: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
    borderStyle: "dashed",
  },

  // Stepper controls
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepperItem: {
    flex: 1,
    alignItems: "center",
  },
  stepperLabel: {
    fontSize: 10.5,
    fontWeight: "700",
    color: COLORS.inkMuted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: SPACING.sm,
  },
  stepperControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: COLORS.primarySoft,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  stepperInput: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.ink,
    minWidth: 30,
    textAlign: "center",
    padding: 0,
    margin: 0,
  },
  stepperDivider: {
    width: 1,
    height: 38,
    backgroundColor: COLORS.line,
    marginHorizontal: SPACING.sm,
  },

  // Payment Type
  paymentTypeRow: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  paymentTypeBtn: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.xs + 2,
    paddingVertical: SPACING.md + 2,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: COLORS.fieldFill,
  },
  paymentTypeBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  paymentTypeText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.inkMuted,
  },
  paymentTypeTextActive: {
    color: "#FFFFFF",
  },

  // Pricing Summary
  pricingCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: 14,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.lineStrong,
  },
  pricingHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.sm,
  },
  pricingTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.ink,
  },
  taxToggleContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.fieldFill,
    borderRadius: 8,
    padding: 3,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  taxToggleBtn: {
    paddingVertical: SPACING.xs + 1,
    paddingHorizontal: SPACING.md,
    alignItems: "center",
    borderRadius: 6,
  },
  taxToggleBtnActive: {
    backgroundColor: COLORS.primary,
  },
  taxToggleText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: COLORS.inkMuted,
  },
  taxToggleTextActive: {
    color: "#FFFFFF",
  },
  pricingDivider: {
    height: 1,
    backgroundColor: COLORS.line,
    marginVertical: SPACING.sm,
  },
  pricingDividerDashed: {
    height: 1,
    borderTopWidth: 1,
    borderColor: COLORS.line,
    borderStyle: "dashed",
    marginVertical: SPACING.sm,
  },
  pricingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: SPACING.xs,
  },
  pricingLabel: {
    fontSize: 12,
    color: COLORS.inkMuted,
    fontWeight: "500",
    flex: 1,
  },
  pricingValue: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.ink,
  },
  pricingTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: SPACING.sm,
    paddingTop: SPACING.md,
    borderTopWidth: 1.5,
    borderTopColor: COLORS.ink,
  },
  pricingTotalLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.ink,
  },
  pricingTotalValue: {
    fontSize: 19,
    fontWeight: "800",
    color: COLORS.accent,
  },

  // Submit
  submitButton: {
    backgroundColor: COLORS.primary,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: SPACING.xs,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14.5,
    letterSpacing: 0.2,
  },
  emptyTextForm: {
    fontSize: 13,
    color: COLORS.inkFaint,
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: SPACING.sm,
  },
});