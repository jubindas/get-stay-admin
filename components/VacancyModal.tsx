import React from "react";
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const getVacancyForDay = (type: string, day: number, month: number, year: number, refreshSeed: number = 0) => {
  const seed = type.length + month + year + refreshSeed;
  const i = day - 1;
  return Math.max(0, Math.floor(Math.sin(i + seed) * 10) + 10);
};

export default function VacancyModal({ visible, onClose, day, month, year }: any) {
  if (!visible) return null;

  const modalMonthName = MONTH_NAMES[month];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalCard} onPress={() => {}}>
          <Text style={styles.modalTitle}>
            {modalMonthName} {day}, {year}
          </Text>
          <Text style={styles.modalSubtitle}>Vacancy</Text>

          <View style={styles.modalContentContainer}>
            <View style={styles.vacancyRow}>
              <Text style={styles.vacancyLabel}>1. Single Room</Text>
              <Text style={styles.vacancySeparator}>:</Text>
              <Text style={styles.vacancyValue}>{getVacancyForDay("Single Room", day, month, year)}</Text>
            </View>
            <View style={styles.vacancyRow}>
              <Text style={styles.vacancyLabel}>2. Double Room</Text>
              <Text style={styles.vacancySeparator}>:</Text>
              <Text style={styles.vacancyValue}>{getVacancyForDay("Double Bed", day, month, year)}</Text>
            </View>
            <View style={styles.vacancyRow}>
              <Text style={styles.vacancyLabel}>3. King Suite</Text>
              <Text style={styles.vacancySeparator}>:</Text>
              <Text style={styles.vacancyValue}>{getVacancyForDay("King Suite", day, month, year)}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.modalClose} onPress={onClose}>
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
    backgroundColor: "rgba(15,23,42,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 28,
    width: "100%",
    elevation: 12,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1E293B",
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 18,
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 2,
    fontWeight: "600",
    marginBottom: 15,
  },
  modalContentContainer: {
    paddingHorizontal: 20,
    marginVertical: 15,
    alignSelf: "center",
    width: "90%",
  },
  vacancyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 6,
  },
  vacancyLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#64748B",
    width: "60%",
  },
  vacancySeparator: {
    fontSize: 16,
    fontWeight: "700",
    color: "#64748B",
    width: "10%",
    textAlign: "center",
  },
  vacancyValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#64748B",
    width: "30%",
    textAlign: "right",
  },
  modalClose: {
    marginTop: 24,
    backgroundColor: "#1E2433",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  modalCloseText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 15,
  },
});
