import Header from "@/components/Header";
import React, { useMemo, useRef, useState } from "react";

import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

const HORIZONTAL_PADDING = 40;

const CARD_PADDING = 10;

const CALENDAR_INTERNAL_WIDTH = width - HORIZONTAL_PADDING - CARD_PADDING * 2;

const CELL_MARGIN = 2;

const COLUMN_WIDTH = CALENDAR_INTERNAL_WIDTH / 7 - CELL_MARGIN * 2;

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function firstDayOffset(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay(); // 0=Sun … 6=Sat
  return (day + 6) % 7; // shift so Mon=0
}
function buildMonthList(): { year: number; month: number }[] {
  const today = new Date();
  const result = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
    result.push({ year: d.getFullYear(), month: d.getMonth() });
  }
  return result;
}

interface RoomData {
  day: number;
  month: number;
  year: number;
  totalRooms: number;
  availableRooms: number;
  bookedRooms: number;
}

interface StatusColors {
  bg: string;
  text: string;
  border: string;
}

export default function RoomCategory() {
  const [selectedType, setSelectedType] = useState<string>("Single Room");

  const [selectedDay, setSelectedDay] = useState<RoomData | null>(null);

  const [selectedMonthIdx, setSelectedMonthIdx] = useState<number>(0);

  const fadeAnim = useRef(new Animated.Value(1)).current;

  const monthList = useMemo(() => buildMonthList(), []);

  const currentMonthMeta = monthList[selectedMonthIdx];

  const generateMonthData = (
    type: string,
    year: number,
    month: number,
  ): RoomData[] => {
    const seed = type.length + month + year;
    const count = daysInMonth(year, month);
    return Array.from({ length: count }, (_, i) => {
      const total = 20;
      const available = Math.max(0, Math.floor(Math.sin(i + seed) * 10) + 10);
      return {
        day: i + 1,
        month,
        year,
        totalRooms: total,
        availableRooms: available,
        bookedRooms: total - available,
      };
    });
  };

  const days = useMemo(
    () =>
      generateMonthData(
        selectedType,
        currentMonthMeta.year,
        currentMonthMeta.month,
      ),
    [selectedType, selectedMonthIdx],
  );

  const blankCount = firstDayOffset(
    currentMonthMeta.year,
    currentMonthMeta.month,
  );

  const blankDays = Array.from({ length: blankCount }, (_, i) => i);

  const handleTypeChange = (type: string) => {
    animateFade();
    setSelectedType(type);
  };

  const handleMonthChange = (idx: number) => {
    if (idx === selectedMonthIdx) return;
    animateFade();
    setSelectedMonthIdx(idx);
  };

  const animateFade = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const getStatusColor = (avail: number, total: number): StatusColors => {
    if (avail === 0)
      return { bg: "#FEE2E2", text: "#991B1B", border: "#FECACA" };
    if (avail < total * 0.4)
      return { bg: "#FFEDD5", text: "#9A3412", border: "#FED7AA" };
    return { bg: "#F0FDF4", text: "#166534", border: "#BBF7D0" };
  };

  const totalAvailable = days.reduce((s, d) => s + d.availableRooms, 0);

  const totalBooked = days.reduce((s, d) => s + d.bookedRooms, 0);

  const totalRooms = (days[0]?.totalRooms ?? 0) * days.length;

  const modalMonthName = selectedDay ? MONTH_NAMES[selectedDay.month] : "";

  return (
    <View style={styles.mainWrapper}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <Header />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryRow}>
          <View
            style={[
              styles.summaryCard,
              { backgroundColor: "#EFF6FF", borderColor: "#BFDBFE" },
            ]}
          >
            <Text style={[styles.summaryValue, { color: "#1D4ED8" }]}>
              {totalRooms}
            </Text>
            <Text style={[styles.summaryLabel, { color: "#3B82F6" }]}>
              Total
            </Text>
          </View>
          <View
            style={[
              styles.summaryCard,
              { backgroundColor: "#F0FDF4", borderColor: "#BBF7D0" },
            ]}
          >
            <Text style={[styles.summaryValue, { color: "#166534" }]}>
              {totalAvailable}
            </Text>
            <Text style={[styles.summaryLabel, { color: "#22C55E" }]}>
              Available
            </Text>
          </View>
          <View
            style={[
              styles.summaryCard,
              { backgroundColor: "#FFF7ED", borderColor: "#FED7AA" },
            ]}
          >
            <Text style={[styles.summaryValue, { color: "#9A3412" }]}>
              {totalBooked}
            </Text>
            <Text style={[styles.summaryLabel, { color: "#F97316" }]}>
              Booked
            </Text>
          </View>
        </View>

        <View style={styles.segmentContainer}>
          {["Single Room", "Double Bed", "King Suite"].map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => handleTypeChange(type)}
              style={[
                styles.segmentTab,
                selectedType === type && styles.activeSegment,
              ]}
            >
              <Text
                style={[
                  styles.segmentText,
                  selectedType === type && styles.activeSegmentText,
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.monthPickerScroll}
          contentContainerStyle={styles.monthPickerContent}
        >
          {monthList.map((m, idx) => {
            const isActive = idx === selectedMonthIdx;
            const shortName = MONTH_NAMES[m.month].slice(0, 3).toUpperCase();
            const isFirst = idx === 0;
            return (
              <TouchableOpacity
                key={`${m.year}-${m.month}`}
                onPress={() => handleMonthChange(idx)}
                style={[styles.monthChip, isActive && styles.monthChipActive]}
              >
                <Text
                  style={[
                    styles.monthChipText,
                    isActive && styles.monthChipTextActive,
                  ]}
                >
                  {shortName}
                </Text>
                <Text
                  style={[
                    styles.monthChipYear,
                    isActive && styles.monthChipYearActive,
                  ]}
                >
                  {isFirst ? "Now" : `${m.year}`}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Animated.View style={[styles.calendarCard, { opacity: fadeAnim }]}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity
              onPress={() =>
                handleMonthChange(Math.max(0, selectedMonthIdx - 1))
              }
              style={[
                styles.navBtn,
                selectedMonthIdx === 0 && styles.navBtnDisabled,
              ]}
              disabled={selectedMonthIdx === 0}
            >
              <Text
                style={[
                  styles.navBtnText,
                  selectedMonthIdx === 0 && styles.navBtnTextDisabled,
                ]}
              >
                ‹
              </Text>
            </TouchableOpacity>

            <View style={styles.calendarTitleBlock}>
              <Text style={styles.monthTitle}>
                {MONTH_NAMES[currentMonthMeta.month]}
              </Text>
              <Text style={styles.yearLabel}>{currentMonthMeta.year}</Text>
            </View>

            <TouchableOpacity
              onPress={() =>
                handleMonthChange(
                  Math.min(monthList.length - 1, selectedMonthIdx + 1),
                )
              }
              style={[
                styles.navBtn,
                selectedMonthIdx === monthList.length - 1 &&
                  styles.navBtnDisabled,
              ]}
              disabled={selectedMonthIdx === monthList.length - 1}
            >
              <Text
                style={[
                  styles.navBtnText,
                  selectedMonthIdx === monthList.length - 1 &&
                    styles.navBtnTextDisabled,
                ]}
              >
                ›
              </Text>
            </TouchableOpacity>
          </View>

          {/* Week Header */}
          <View style={styles.weekHeader}>
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <View
                key={d}
                style={{
                  width: COLUMN_WIDTH + CELL_MARGIN * 2,
                  alignItems: "center",
                }}
              >
                <Text
                  style={[styles.weekText, d === "Sun" && { color: "#EF4444" }]}
                >
                  {d}
                </Text>
              </View>
            ))}
          </View>

          {/* Grid */}
          <View style={styles.grid}>
            {blankDays.map((b) => (
              <View key={`blank-${b}`} style={styles.blankCell} />
            ))}
            {days.map((item) => {
              const colors = getStatusColor(
                item.availableRooms,
                item.totalRooms,
              );
              return (
                <Pressable
                  key={item.day}
                  onPress={() => setSelectedDay(item)}
                  style={({ pressed }) => [
                    styles.dayCell,
                    {
                      backgroundColor: colors.bg,
                      borderColor: colors.border,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <Text style={[styles.dayNumber, { color: colors.text }]}>
                    {item.availableRooms}
                  </Text>
                  <Text style={[styles.availText, { color: colors.text }]}>
                    {item.day}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: "#BBF7D0" }]}
              />
              <Text style={styles.legendText}>Available</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: "#FED7AA" }]}
              />
              <Text style={styles.legendText}>Low (&lt;40%)</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: "#FECACA" }]}
              />
              <Text style={styles.legendText}>Full</Text>
            </View>
          </View>
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── Detail Modal ── */}
      <Modal
        visible={!!selectedDay}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedDay(null)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setSelectedDay(null)}
        >
          <Pressable style={styles.modalCard} onPress={() => {}}>
            {selectedDay && (
              <>
                <Text style={styles.modalTitle}>
                  {modalMonthName} {selectedDay.day}, {selectedDay.year}
                </Text>
                <Text style={styles.modalSubtitle}>{selectedType}</Text>

                <View style={styles.modalStats}>
                  <View style={styles.modalStatItem}>
                    <Text style={[styles.modalStatValue, { color: "#1D4ED8" }]}>
                      {selectedDay.totalRooms}
                    </Text>
                    <Text style={styles.modalStatLabel}>Total Rooms</Text>
                  </View>
                  <View style={styles.modalDivider} />
                  <View style={styles.modalStatItem}>
                    <Text style={[styles.modalStatValue, { color: "#166534" }]}>
                      {selectedDay.availableRooms}
                    </Text>
                    <Text style={styles.modalStatLabel}>Available</Text>
                  </View>
                  <View style={styles.modalDivider} />
                  <View style={styles.modalStatItem}>
                    <Text style={[styles.modalStatValue, { color: "#9A3412" }]}>
                      {selectedDay.bookedRooms}
                    </Text>
                    <Text style={styles.modalStatLabel}>Booked</Text>
                  </View>
                </View>

                <View style={styles.occupancyBarBg}>
                  <View
                    style={[
                      styles.occupancyBarFill,
                      {
                        width: `${(selectedDay.bookedRooms / selectedDay.totalRooms) * 100}%`,
                        backgroundColor:
                          selectedDay.availableRooms === 0
                            ? "#EF4444"
                            : selectedDay.availableRooms <
                                selectedDay.totalRooms * 0.4
                              ? "#F97316"
                              : "#22C55E",
                      },
                    ]}
                  />
                </View>
                <Text style={styles.occupancyText}>
                  {Math.round(
                    (selectedDay.bookedRooms / selectedDay.totalRooms) * 100,
                  )}
                  % Occupancy
                </Text>

                <TouchableOpacity
                  style={styles.modalClose}
                  onPress={() => setSelectedDay(null)}
                >
                  <Text style={styles.modalCloseText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: { flex: 1, backgroundColor: "#F8FAFC" },
  container: { flex: 1, paddingHorizontal: 20, marginTop: 20 },

  summaryRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  summaryCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    alignItems: "center",
  },
  summaryValue: { fontSize: 22, fontWeight: "800" },
  summaryLabel: { fontSize: 11, fontWeight: "600", marginTop: 2 },

  segmentContainer: {
    flexDirection: "row",
    backgroundColor: "#E2E8F0",
    padding: 4,
    borderRadius: 12,
    marginBottom: 16,
  },
  segmentTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  activeSegment: {
    backgroundColor: "#FFF",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  segmentText: { fontSize: 12, fontWeight: "600", color: "#64748B" },
  activeSegmentText: { color: "#0F172A" },

  monthPickerScroll: { marginBottom: 16 },
  monthPickerContent: { paddingRight: 4, gap: 8, flexDirection: "row" },
  monthChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    alignItems: "center",
    minWidth: 56,
  },
  monthChipActive: { backgroundColor: "#1E293B", borderColor: "#1E293B" },
  monthChipText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#475569",
    letterSpacing: 0.5,
  },
  monthChipTextActive: { color: "#FFF" },
  monthChipYear: {
    fontSize: 10,
    color: "#94A3B8",
    marginTop: 1,
    fontWeight: "500",
  },
  monthChipYearActive: { color: "#94A3B8" },

  calendarCard: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: CARD_PADDING,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  calendarTitleBlock: { alignItems: "center" },
  monthTitle: { fontSize: 17, fontWeight: "700", color: "#1E293B" },
  yearLabel: {
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "500",
    marginTop: 1,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  navBtnDisabled: { backgroundColor: "#F8FAFC" },
  navBtnText: { fontSize: 22, color: "#1E293B", lineHeight: 26 },
  navBtnTextDisabled: { color: "#CBD5E1" },

  weekHeader: { flexDirection: "row", marginBottom: 8 },
  weekText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.5,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  dayCell: {
    width: COLUMN_WIDTH,
    height: COLUMN_WIDTH + 10,
    margin: CELL_MARGIN,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  blankCell: {
    width: COLUMN_WIDTH,
    height: COLUMN_WIDTH + 10,
    margin: CELL_MARGIN,
  },
  dayNumber: {
    fontSize: 9,
    fontWeight: "600",
    position: "absolute",
    top: 4,
    left: 5,
  },
  availText: { fontSize: 15, fontWeight: "800" },

  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginTop: 14,
    paddingBottom: 4,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 11, color: "#64748B", fontWeight: "500" },

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
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 24,
  },
  modalStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: 24,
  },
  modalStatItem: { alignItems: "center" },
  modalStatValue: { fontSize: 28, fontWeight: "800" },
  modalStatLabel: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 4,
    fontWeight: "500",
  },
  modalDivider: { width: 1, height: 40, backgroundColor: "#E2E8F0" },
  occupancyBarBg: {
    height: 8,
    backgroundColor: "#F1F5F9",
    borderRadius: 99,
    overflow: "hidden",
  },
  occupancyBarFill: { height: "100%", borderRadius: 99 },
  occupancyText: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    marginTop: 8,
    fontWeight: "500",
  },
  modalClose: {
    marginTop: 24,
    backgroundColor: "#1E293B",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  modalCloseText: { color: "#FFF", fontWeight: "700", fontSize: 15 },
});
