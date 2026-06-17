import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import CalendarDayModal from "./CalendarDayModal";

const { width } = Dimensions.get("window");

// Adjust paddings to fit inside Dashboard Content Area (which has paddingHorizontal: 20)
const HORIZONTAL_PADDING = 40;
const CARD_PADDING = 5;
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

export default function OccupancyCard() {
  const [selectedType, setSelectedType] = useState<string>("Single Room");
  const [selectedDay, setSelectedDay] = useState<RoomData | null>(null);
  const [selectedMonthIdx, setSelectedMonthIdx] = useState<number>(0);
  const [refreshSeed, setRefreshSeed] = useState<number>(0);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const monthList = useMemo(() => buildMonthList(), []);
  const currentMonthMeta = monthList[selectedMonthIdx];

  const getVacancyForDay = (type: string, day: number) => {
    const seed = type.length + currentMonthMeta.month + currentMonthMeta.year + refreshSeed;
    const i = day - 1;
    return Math.max(0, Math.floor(Math.sin(i + seed) * 10) + 10);
  };

  const generateMonthData = (
    type: string,
    year: number,
    month: number,
    seedOffset: number
  ): RoomData[] => {
    const seed = type.length + month + year + seedOffset;
    const count = daysInMonth(year, month);
    return Array.from({ length: count }, (_, i) => {
      const total = 20;
      // Synthesize some varied data using a sin wave
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

  const scrollViewRef = useRef<ScrollView>(null);

  const handleTypeChange = (type: string) => {
    animateFade();
    setSelectedType(type);
  };

  const handleMonthChange = (idx: number) => {
    if (idx === selectedMonthIdx) return;
    setSelectedMonthIdx(idx);
    scrollViewRef.current?.scrollTo({ x: idx * CALENDAR_INTERNAL_WIDTH, animated: true });
  };

  const onMomentumScrollEnd = (e: any) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const idx = Math.round(offsetX / CALENDAR_INTERNAL_WIDTH);
    if (idx !== selectedMonthIdx && idx >= 0 && idx < monthList.length) {
      setSelectedMonthIdx(idx);
    }
  };

  const handleRefresh = () => {
    animateFade();
    // Change seed to show new/refreshed values
    setRefreshSeed((prev) => prev + 1);
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

  const modalMonthName = selectedDay ? MONTH_NAMES[selectedDay.month] : "";

  return (
    <View style={styles.mainWrapper}>
      {/* Horizontally scrollable room category types */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.roomTypeScroll}
        contentContainerStyle={styles.roomTypeContent}
      >
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
      </ScrollView>

      {/* Horizontally scrollable month picker */}
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

      {/* Calendar Card */}
      <Animated.View style={[styles.calendarCard, { opacity: fadeAnim }]}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity
            onPress={() => handleMonthChange(Math.max(0, selectedMonthIdx - 1))}
            style={[
              styles.navBtn,
              selectedMonthIdx === 0 && styles.navBtnDisabled,
            ]}
            disabled={selectedMonthIdx === 0}
          >
            <Ionicons
              name="chevron-back"
              size={18}
              color={selectedMonthIdx === 0 ? "#CBD5E1" : "#1E293B"}
            />
          </TouchableOpacity>

          <View style={styles.calendarTitleBlock}>
            <Text style={styles.monthTitle}>
              {MONTH_NAMES[currentMonthMeta.month]}
            </Text>
            <Text style={styles.yearLabel}>{currentMonthMeta.year}</Text>
          </View>

          {/* Refresh Button next to the month name */}
          <TouchableOpacity onPress={handleRefresh} style={styles.refreshBtn}>
            <Text style={styles.refreshText}>Refresh</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              handleMonthChange(
                Math.min(monthList.length - 1, selectedMonthIdx + 1)
              )
            }
            style={[
              styles.navBtn,
              selectedMonthIdx === monthList.length - 1 &&
              styles.navBtnDisabled,
            ]}
            disabled={selectedMonthIdx === monthList.length - 1}
          >
            <Ionicons
              name="chevron-forward"
              size={18}
              color={
                selectedMonthIdx === monthList.length - 1
                  ? "#CBD5E1"
                  : "#1E293B"
              }
            />
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
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onMomentumScrollEnd}
          style={{ width: CALENDAR_INTERNAL_WIDTH }}
        >
          {monthList.map((monthMeta, idx) => {
            const blankCount = firstDayOffset(monthMeta.year, monthMeta.month);
            const blankDays = Array.from({ length: blankCount }, (_, i) => i);
            const monthDays = generateMonthData(
              selectedType,
              monthMeta.year,
              monthMeta.month,
              refreshSeed
            );

            return (
              <View key={idx} style={[styles.grid, { width: CALENDAR_INTERNAL_WIDTH }]}>
                {blankDays.map((b) => (
                  <View key={`blank-${b}`} style={styles.blankCell} />
                ))}
                {monthDays.map((item) => {
                  const colors = getStatusColor(
                    item.availableRooms,
                    item.totalRooms
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
                      {/* Dates should be small and availability should be bigger */}
                      <Text style={[styles.dayNumber, { color: colors.text }]}>
                        {item.day}
                      </Text>
                      <Text style={[styles.availText, { color: colors.text }]}>
                        {item.availableRooms}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            );
          })}
        </ScrollView>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#BBF7D0" }]} />
            <Text style={styles.legendText}>Available</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#FED7AA" }]} />
            <Text style={styles.legendText}>Low (&lt;40%)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#FECACA" }]} />
            <Text style={styles.legendText}>Full</Text>
          </View>
        </View>
      </Animated.View>

      <CalendarDayModal
        visible={!!selectedDay}
        onClose={() => setSelectedDay(null)}
        dayData={selectedDay}
        roomType={selectedType}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
    backgroundColor: "transparent",
  },
  roomTypeScroll: {
    marginBottom: 6,
  },
  roomTypeContent: {
    gap: 8,
    flexDirection: "row",
    paddingRight: 4,
  },
  segmentTab: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    backgroundColor: "#E2E8F0",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  activeSegment: {
    backgroundColor: "#FFFFFF",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },
  activeSegmentText: {
    color: "#0F172A",
    fontWeight: "700",
  },
  monthPickerScroll: {
    marginBottom: 8,
  },
  monthPickerContent: {
    paddingRight: 4,
    gap: 8,
    flexDirection: "row",
  },
  monthChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    alignItems: "center",
    minWidth: 56,
  },
  monthChipActive: {
    backgroundColor: "#1E293B",
    borderColor: "#1E293B",
  },
  monthChipText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#475569",
    letterSpacing: 0.5,
  },
  monthChipTextActive: {
    color: "#FFF",
  },
  monthChipYear: {
    fontSize: 10,
    color: "#94A3B8",
    marginTop: 1,
    fontWeight: "500",
  },
  monthChipYearActive: {
    color: "#94A3B8",
  },
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
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  calendarTitleBlock: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E293B",
  },
  yearLabel: {
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "600",
  },
  refreshBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "transparent",
  },
  refreshText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  navBtnDisabled: {
    backgroundColor: "#F8FAFC",
  },
  weekHeader: {
    flexDirection: "row",
    marginBottom: 8,
  },
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
    height: COLUMN_WIDTH,
    margin: CELL_MARGIN,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  blankCell: {
    width: COLUMN_WIDTH,
    height: COLUMN_WIDTH,
    margin: CELL_MARGIN,
  },
  dayNumber: {
    fontSize: 9,
    fontWeight: "600",
    position: "absolute",
    top: 2,
    left: 3,
  },
  availText: {
    fontSize: 14,
    fontWeight: "800",
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginTop: 6,
    paddingBottom: 4,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "500",
  },
});
