import { useAuth } from "@/provider/AuthProvider";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import { CheckCircle, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import AlertPopUp, { AlertType } from "@/components/AlertPopUp";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const COLORS = {
  primaryMain: "#2563EB",
  primaryLight: "#EFF6FF",
  textMain: "#0F172A",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",
  background: "#F8FAFC",
  card: "#FFFFFF",
  border: "#E2E8F0",
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
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [numberOfRooms, setNumberOfRooms] = useState("1");
  const [adults, setAdults] = useState("1");
  const [children, setChildren] = useState("0");
  const [extraBeds, setExtraBeds] = useState("0");

  useEffect(() => {
    if (visible && token) {
      if (properties.length === 0) {
        fetchProperties();
      } else {
        setLoadingForm(false);
      }
    }
  }, [visible, token]);

  const fetchProperties = async () => {
    setLoadingForm(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/host/properties`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProperties(response.data.properties || []);
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setLoadingForm(false);
    }
  };

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
        check_in_date: checkIn.toISOString(),
        check_out_date: checkOut.toISOString(),
        rooms: [
          {
            room_details_id: selectedRoomId,
            number_of_rooms: parseInt(numberOfRooms) || 1,
            adults: parseInt(adults) || 1,
            children: parseInt(children) || 0,
            extra_beds: parseInt(extraBeds) || 0,
          },
        ],
      };

      await axios.post(
        `${API_BASE_URL}/api/host/bookings/walk-in`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showAlert({
        type: "success",
        title: "Success",
        message: "Walk-in Booking registered successfully!",
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
    setCheckInDate("");
    setCheckOutDate("");
    setSelectedRoomId("");
    setNumberOfRooms("1");
    setAdults("1");
    setChildren("0");
    setExtraBeds("0");
  };

  return (
    <>
      <Modal visible={visible} animationType="slide" presentationStyle="formSheet" onRequestClose={onClose}>
        <View style={styles.formHeaderRow}>
          <Text style={styles.formHeaderText}>New Walk-in Booking</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={20} color={COLORS.textMain} />
          </TouchableOpacity>
        </View>

        {loadingForm ? (
          <View style={styles.centerFill}>
            <ActivityIndicator size="large" color={COLORS.primaryMain} />
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {/* 1. Property Selection */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>1. Select Property</Text>
              {properties.length === 0 ? (
                <Text style={styles.emptyTextForm}>No properties found.</Text>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginHorizontal: -16, paddingHorizontal: 16 }}
                >
                  {properties.map((prop) => (
                    <TouchableOpacity
                      key={prop.id}
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
              <Text style={styles.cardTitle}>2. Guest Details</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Full Name *</Text>
                <TextInput
                  placeholder="Guest Name"
                  value={guestName}
                  onChangeText={setGuestName}
                  style={styles.input}
                />
              </View>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Phone Number *</Text>
                <TextInput
                  placeholder="Guest Phone"
                  keyboardType="phone-pad"
                  value={guestPhone}
                  onChangeText={setGuestPhone}
                  style={styles.input}
                />
              </View>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <TextInput
                  placeholder="Guest Email (Optional)"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={guestEmail}
                  onChangeText={setGuestEmail}
                  style={styles.input}
                />
              </View>
            </View>

            {/* 3. Dates */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>3. Booking Dates</Text>
              <View style={styles.row}>
                {/* Check-in */}
                <View style={[styles.inputWrapper, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Check-in Date *</Text>
                  <TouchableOpacity
                    onPress={() => setShowCheckInPicker(true)}
                    style={styles.datePickerBtn}
                  >
                    <Text style={styles.datePickerText}>
                      {checkInDate || "Select Date"}
                    </Text>
                    <Ionicons name="calendar" size={20} color={COLORS.textSecondary} />
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

                <View style={{ width: 12 }} />

                {/* Check-out */}
                <View style={[styles.inputWrapper, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Check-out Date *</Text>
                  <TouchableOpacity
                    onPress={() => setShowCheckOutPicker(true)}
                    style={styles.datePickerBtn}
                  >
                    <Text style={styles.datePickerText}>
                      {checkOutDate || "Select Date"}
                    </Text>
                    <Ionicons name="calendar" size={20} color={COLORS.textSecondary} />
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
                <Text style={styles.cardTitle}>4. Select Room</Text>
                {availableRooms.length === 0 ? (
                  <Text style={styles.emptyTextForm}>No rooms available in this property.</Text>
                ) : (
                  <View>
                    {availableRooms.map((room: any, index: number) => (
                      <TouchableOpacity
                        key={room.id}
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
                        {selectedRoomId === room.id && (
                          <CheckCircle size={24} color={COLORS.primaryMain} />
                        )}
                      </TouchableOpacity>
                    ))}

                    {selectedRoomId ? (
                      <View style={styles.quantitiesContainer}>
                        <View style={styles.row}>
                          <View style={[styles.inputWrapper, { flex: 1 }]}>
                            <Text style={styles.inputLabel}>No. of Rooms</Text>
                            <TextInput
                              keyboardType="numeric"
                              value={numberOfRooms}
                              onChangeText={setNumberOfRooms}
                              style={styles.input}
                            />
                          </View>
                          <View style={{ width: 12 }} />
                          <View style={[styles.inputWrapper, { flex: 1 }]}>
                            <Text style={styles.inputLabel}>Adults</Text>
                            <TextInput
                              keyboardType="numeric"
                              value={adults}
                              onChangeText={setAdults}
                              style={styles.input}
                            />
                          </View>
                        </View>
                        <View style={styles.row}>
                          <View style={[styles.inputWrapper, { flex: 1 }]}>
                            <Text style={styles.inputLabel}>Children</Text>
                            <TextInput
                              keyboardType="numeric"
                              value={children}
                              onChangeText={setChildren}
                              style={styles.input}
                            />
                          </View>
                          <View style={{ width: 12 }} />
                          <View style={[styles.inputWrapper, { flex: 1 }]}>
                            <Text style={styles.inputLabel}>Extra Beds</Text>
                            <TextInput
                              keyboardType="numeric"
                              value={extraBeds}
                              onChangeText={setExtraBeds}
                              style={styles.input}
                            />
                          </View>
                        </View>
                      </View>
                    ) : null}
                  </View>
                )}
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.submitButton, submitting && { opacity: 0.7 }]}
              onPress={handleBooking}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitButtonText}>Confirm Walk-in Booking</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        )}
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
  centerFill: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
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
  closeBtn: { padding: 8, backgroundColor: COLORS.card, borderRadius: 20, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
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
  emptyTextForm: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontStyle: "italic",
    textAlign: "center",
  },
});
