import React from "react";
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

interface RoomData {
  day: number;
  month: number;
  year: number;
  totalRooms: number;
  availableRooms: number;
  bookedRooms: number;
}

interface CalendarDayModalProps {
  visible: boolean;
  onClose: () => void;
  dayData: RoomData | null;
  roomType: string;
}

export default function CalendarDayModal({ visible, onClose, dayData, roomType }: CalendarDayModalProps) {
  if (!visible || !dayData) return null;

  const modalMonthName = MONTH_NAMES[dayData.month];

  // Dummy check-ins data for UI presentation
  const dummyCheckIns = [
    { name: "Shri Sanjeev Kumar", persons: 3 },
    { name: "Shri Raja Sharma", persons: 4 },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalCard} onPress={() => {}}>
          {/* Header */}
          <Text style={styles.modalTitle}>
            {modalMonthName} {dayData.day}, {dayData.year}
          </Text>
          <Text style={styles.modalSubtitle}>{roomType}</Text>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: "#2563EB" }]}>{dayData.totalRooms}</Text>
              <Text style={styles.statLabel}>Total Rooms</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: "#10B981" }]}>{dayData.availableRooms}</Text>
              <Text style={styles.statLabel}>Available</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: "#991B1B" }]}>{dayData.bookedRooms}</Text>
              <Text style={styles.statLabel}>Booked</Text>
            </View>
          </View>

          {/* Red Divider Line */}
          <View style={styles.redDivider} />

          {/* Check-ins Section */}
          <View style={styles.checkInsSection}>
            <Text style={styles.checkInsTitle}>Check-Ins</Text>
            {dummyCheckIns.map((guest, index) => (
              <View key={index} style={styles.checkInItemRow}>
                <Text style={styles.checkInItemName}>{index + 1}.{guest.name}</Text>
                <Text style={styles.checkInItemPersons}>: {guest.persons} {guest.persons > 1 ? "persons" : "person"}</Text>
              </View>
            ))}
          </View>

          {/* Close Button */}
          <TouchableOpacity style={styles.modalClose} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.modalCloseText}>Close</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1E293B",
    textAlign: "center",
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 24,
    fontWeight: "500",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#E2E8F0",
  },
  redDivider: {
    height: 6,
    backgroundColor: "#EF4444",
    borderRadius: 3,
    marginBottom: 16,
    marginHorizontal: 4,
  },
  checkInsSection: {
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  checkInsTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 10,
  },
  checkInItemRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  checkInItemName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E293B",
    flex: 1.5,
  },
  checkInItemPersons: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E293B",
    flex: 1,
  },
  modalClose: {
    backgroundColor: "#1E293B",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  modalCloseText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
