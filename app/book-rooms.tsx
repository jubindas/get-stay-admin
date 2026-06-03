import { useAuth } from "@/provider/AuthProvider";

import { Ionicons } from "@expo/vector-icons";

import DateTimePicker from "@react-native-community/datetimepicker";

import axios from "axios";

import React, { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import Header from "../components/Header";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const COLORS = {
  textSecondary: "#64748B",
};

export default function BookRooms() {
  const { token } = useAuth();


  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [propertyId, setPropertyId] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");

  // Date Picker State
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);

  // Room Form State
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [numberOfRooms, setNumberOfRooms] = useState("1");
  const [adults, setAdults] = useState("1");
  const [children, setChildren] = useState("0");
  const [extraBeds, setExtraBeds] = useState("0");

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/host/properties`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProperties(response.data.properties || []);
    } catch (error) {
      console.error("Error fetching properties:", error);
      Alert.alert("Error", "Failed to load properties.");
    } finally {
      setLoading(false);
    }
  };

  const getRoomsForSelectedProperty = () => {
    const prop = properties.find((p) => p.id === propertyId);
    return prop?.room_details || [];
  };

  const handleBooking = async () => {
    const missingFields = [];
    if (!propertyId) missingFields.push("Property");
    if (!guestName) missingFields.push("Guest Name");
    if (!guestPhone) missingFields.push("Guest Phone");
    if (!checkInDate) missingFields.push("Check-in Date");
    if (!checkOutDate) missingFields.push("Check-out Date");
    if (!selectedRoomId) missingFields.push("Room Selection");

    if (missingFields.length) {
      Alert.alert(
        "Missing Information",
        `Please provide: ${missingFields.join(", ")}.`
      );
      return;
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      Alert.alert("Invalid Dates", "Please select valid check-in and check-out dates.");
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

      Alert.alert("Success", "Walk-in Booking registered successfully!", [
        { text: "OK", onPress: resetForm },
      ]);
    } catch (error: any) {
      console.error(error?.response?.data || error.message);
      Alert.alert(
        "Booking Failed",
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "An error occurred."
      );
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

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#1E3A8A" />
      </View>
    );
  }

  const availableRooms = getRoomsForSelectedProperty();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F7FB" />
      <Header />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.pageHeader}>
          <Text style={styles.heroTitle}>Walk-in Booking</Text>
          <Text style={styles.heroSubtitle}>Register a direct booking for walk-in guests.</Text>
        </View>

        {/* 1. Property Selection */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>1. Select Property</Text>
          {properties.length === 0 ? (
            <Text style={styles.emptyText}>No properties found.</Text>
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
              <Text style={styles.emptyText}>No rooms available in this property.</Text>
            ) : (
              <View>
                {availableRooms.map((room: any, index: number) => (
                  <TouchableOpacity
                    key={room.id}
                    style={[
                      styles.roomCard,
                      selectedRoomId === room.id && styles.roomCardActive,
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
                      <Ionicons name="checkmark-circle" size={24} color="#1E3A8A" />
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7FB",
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  pageHeader: {
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1E3A8A",
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 16,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    fontSize: 15,
    color: "#0F172A",
  },
  datePickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
  },
  datePickerText: {
    fontSize: 15,
    color: "#0F172A",
  },
  row: {
    flexDirection: "row",
  },
  selectablePill: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  selectablePillActive: {
    backgroundColor: "#1E3A8A",
    borderColor: "#1E3A8A",
  },
  selectablePillText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },
  selectablePillTextActive: {
    color: "#FFFFFF",
  },
  roomCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
    marginBottom: 10,
  },
  roomCardActive: {
    borderColor: "#1E3A8A",
    backgroundColor: "#EFF6FF",
  },
  roomName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 4,
  },
  roomNameActive: {
    color: "#1E3A8A",
  },
  roomPrice: {
    fontSize: 13,
    color: "#64748B",
  },
  quantitiesContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  submitButton: {
    backgroundColor: "#1E3A8A",
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    shadowColor: "#1E3A8A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
  emptyText: {
    fontSize: 14,
    color: "#94A3B8",
    fontStyle: "italic",
  },
});