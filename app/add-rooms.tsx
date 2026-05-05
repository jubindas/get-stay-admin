import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  LayoutAnimation,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";

// Enable LayoutAnimation for Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- TypeScript Interfaces ---
interface RoomAvailability {
  checkInTime: string;
  checkOutTime: string;
  instantBooking: boolean;
}

interface RoomFormData {
  title: string;
  type: string;
  price: string;
  maxPeople: string;
  desc: string;
  roomSize: string;
  bedType: string;
  smoking: boolean;
  facilities: string[];
  extraPrice: string;
  availabilitySettings: RoomAvailability;
}

const facilityIcons: Record<string, string> = {
  WiFi: "wifi",
  AC: "air-conditioner",
  TV: "television",
  Breakfast: "silverware-fork-knife",
  Parking: "car",
  "Room Service": "room-service",
  Gym: "dumbbell",
};

export default function AddRooms() {
  const [formData, setFormData] = useState<RoomFormData>({
    title: "",
    type: "Deluxe",
    price: "",
    maxPeople: "",
    desc: "",
    roomSize: "",
    bedType: "Queen",
    smoking: false,
    facilities: [],
    extraPrice: "500",
    availabilitySettings: {
      checkInTime: "12:00",
      checkOutTime: "11:00",
      instantBooking: true,
    },
  });

  const toggleFacility = (item: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFormData((prev) => ({
      ...prev,
      facilities: prev.facilities.includes(item)
        ? prev.facilities.filter((f) => f !== item)
        : [...prev.facilities, item],
    }));
  };

  const updateField = (field: keyof RoomFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />


      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Card */}
        <View style={styles.sectionHeader}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color="#6B7280"
          />
          <Text style={styles.sectionLabel}>Basic Information</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.inputLabel}>Room Title</Text>
          <View style={styles.inputWrapper}>
            <Ionicons
              name="bed-outline"
              size={20}
              color="#9CA3AF"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="e.g. Deluxe Ocean View"
              value={formData.title}
              onChangeText={(txt) => updateField("title", txt)}
            />
          </View>

          <View style={styles.row}>
            <View style={styles.flex1}>
              <Text style={styles.inputLabel}>Price (₹)</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.currencyPrefix}>₹</Text>
                <TextInput
                  style={[styles.input, { paddingLeft: 8 }]}
                  keyboardType="numeric"
                  value={formData.price}
                  onChangeText={(txt) => updateField("price", txt)}
                />
              </View>
            </View>
            <View style={[styles.flex1, { marginLeft: 12 }]}>
              <Text style={styles.inputLabel}>Guests</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="people-outline"
                  size={20}
                  color="#9CA3AF"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={formData.maxPeople}
                  onChangeText={(txt) => updateField("maxPeople", txt)}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Facilities */}
        <View style={styles.sectionHeader}>
          <Ionicons name="list-outline" size={20} color="#6B7280" />
          <Text style={styles.sectionLabel}>Amenities</Text>
        </View>

        <View style={styles.chipContainer}>
          {Object.keys(facilityIcons).map((item) => {
            const isSelected = formData.facilities.includes(item);
            return (
              <TouchableOpacity
                key={item}
                onPress={() => toggleFacility(item)}
                style={[styles.chip, isSelected && styles.chipSelected]}
              >
                <MaterialCommunityIcons
                  name={facilityIcons[item] as any}
                  size={18}
                  color={isSelected ? "#FFF" : "#4B5563"}
                />
                <Text
                  style={[
                    styles.chipText,
                    isSelected && styles.chipTextSelected,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.saveButton} activeOpacity={0.9}>
            <Text style={styles.saveButtonText}>Publish Listing</Text>
            <Ionicons
              name="arrow-forward"
              size={20}
              color="#FFF"
              style={{ marginLeft: 8 }}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  flex1: { flex: 1 },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backButton: { padding: 8, borderRadius: 12, backgroundColor: "#F3F4F6" },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -0.5,
  },
  content: { padding: 20 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    marginTop: 12,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6B7280",
    marginLeft: 8,
    textTransform: "uppercase",
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 2 },
    }),
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  inputIcon: { marginRight: 10 },
  currencyPrefix: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginRight: 4,
  },
  input: { flex: 1, paddingVertical: 12, fontSize: 15, color: "#111827" },
  row: { flexDirection: "row", alignItems: "center" },
  switchRow: { justifyContent: "space-between" },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 30,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  chipSelected: { backgroundColor: "#4F46E5", borderColor: "#4F46E5" },
  chipText: {
    color: "#4B5563",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  chipTextSelected: { color: "#FFF" },
  footer: { marginTop: 20, marginBottom: 40 },
  saveButton: {
    flexDirection: "row",
    backgroundColor: "#003399",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#003399",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  saveButtonText: { color: "#FFF", fontSize: 17, fontWeight: "700" },
});
