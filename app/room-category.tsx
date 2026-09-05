import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Header from "../components/Header";

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

function isSameDate(a: RoomData, b: RoomData): boolean {
  return a.year === b.year && a.month === b.month && a.day === b.day;
}


type SelectionMode = "single" | "multi" | "month";

export default function RoomCategory() {
  const [selectedType, setSelectedType] = useState<string>("Single Room");

  const [selectedDays, setSelectedDays] = useState<RoomData[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  const [selectionMode, setSelectionMode] = useState<SelectionMode>("single");

  const [fabOpen, setFabOpen] = useState(false);
  const fabAnim = useRef(new Animated.Value(0)).current;

  const toggleFab = () => {
    Animated.timing(fabAnim, {
      toValue: fabOpen ? 0 : 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
    setFabOpen(!fabOpen);
  };

  const closeFab = () => {
    if (fabOpen) {
      Animated.timing(fabAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
      setFabOpen(false);
    }
  };

  const [selectedMonthIdx, setSelectedMonthIdx] = useState<number>(0);

  const [blockedRooms, setBlockedRooms] = useState<Record<string, boolean>>({});

  const getRoomPrefix = (type: string): number => {
    if (type === "Double Bed") return 200;
    if (type === "King Suite") return 300;
    return 100;
  };

  const getBlockKey = (type: string, day: RoomData, roomNum: number) =>
    `${type}|${day.year}-${day.month}-${day.day}|${roomNum}`;

  const getRoomBlockStatus = useCallback(
    (roomNum: number): "none" | "partial" | "all" => {
      if (selectedDays.length === 0) return "none";
      const blockedCount = selectedDays.filter(
        (d) => !!blockedRooms[getBlockKey(selectedType, d, roomNum)],
      ).length;
      if (blockedCount === 0) return "none";
      if (blockedCount === selectedDays.length) return "all";
      return "partial";
    },
    [selectedDays, selectedType, blockedRooms],
  );

  const toggleBlock = useCallback(
    (roomNum: number) => {
      if (selectedDays.length === 0) return;
      const status = getRoomBlockStatus(roomNum);
      const target = status !== "all";
      setBlockedRooms((prev) => {
        const next = { ...prev };
        selectedDays.forEach((d) => {
          next[getBlockKey(selectedType, d, roomNum)] = target;
        });
        return next;
      });
    },
    [selectedDays, selectedType, getRoomBlockStatus],
  );

  const referenceDay = selectedDays[0] ?? null;

  const modalRooms = useMemo(() => {
    if (!referenceDay) return [];
    const prefix = getRoomPrefix(selectedType);
    return Array.from({ length: referenceDay.totalRooms }, (_, i) => prefix + i + 1);
  }, [referenceDay, selectedType]);

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

  const handleDayPress = (item: RoomData) => {
    if (selectionMode === "single") {
      setSelectedDays([item]);
      setModalVisible(true);
      return;
    }
    setSelectedDays((prev) =>
      prev.some((d) => isSameDate(d, item))
        ? prev.filter((d) => !isSameDate(d, item))
        : [...prev, item],
    );
  };

  const changeSelectionMode = (mode: SelectionMode) => {
    if (mode === selectionMode) return;
    setSelectionMode(mode);
    setModalVisible(false);
    setSelectedDays(mode === "month" ? days : []);
    closeFab();
  };

  useEffect(() => {
    if (selectionMode === "month") {
      setSelectedDays(days);
    }
  }, [days, selectionMode]);

  const selectWholeMonth = () => setSelectedDays(days);

  const closeModal = () => {
    setModalVisible(false);
    if (selectionMode === "single") setSelectedDays([]);
  };

  const getStatusColor = (avail: number, total: number): StatusColors => {
    if (avail === 0)
      return { bg: "#EF4444", text: "#FFFFFF", border: "#EF4444" };
    return { bg: "#FFFFFF", text: "#EF4444", border: "#EF4444" };
  };

  const totalAvailable = days.reduce((s, d) => s + d.availableRooms, 0);

  const totalBooked = days.reduce((s, d) => s + d.bookedRooms, 0);

  const totalRooms = (days[0]?.totalRooms ?? 0) * days.length;

  const modalStats = useMemo(() => {
    if (selectedDays.length === 0) return null;
    const capacity = referenceDay?.totalRooms ?? 0;
    const bookedSum = selectedDays.reduce((s, d) => s + d.bookedRooms, 0);
    const availableSum = selectedDays.reduce((s, d) => s + d.availableRooms, 0);
    const occupancyPct =
      capacity > 0 && selectedDays.length > 0
        ? Math.round((bookedSum / (capacity * selectedDays.length)) * 100)
        : 0;
    return { capacity, bookedSum, availableSum, occupancyPct };
  }, [selectedDays, referenceDay]);

  return (
    <View style={styles.mainWrapper}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <Header />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#0f172a' }}>
            {MONTH_NAMES[currentMonthMeta.month]} {currentMonthMeta.year}
          </Text>
        </View>
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

        {selectionMode === "multi" && (
          <Text style={[styles.modeHint, { marginBottom: 12, marginTop: -4 }]}>
            Multi-Select Mode: Tap dates below, then manage them together
          </Text>
        )}
        {selectionMode === "month" && (
          <Text style={[styles.modeHint, { marginBottom: 12, marginTop: -4 }]}>
            Whole Month Mode: Every day is selected — tap a date to exclude it
          </Text>
        )}

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
              const isSelected =
                selectionMode !== "single" &&
                selectedDays.some((d) => isSameDate(d, item));
              return (
                <Pressable
                  key={item.day}
                  onPress={() => handleDayPress(item)}
                  style={({ pressed }) => [
                    styles.dayCell,
                    {
                      backgroundColor: colors.bg,
                      borderColor: isSelected ? "#1D4ED8" : colors.border,
                      borderWidth: isSelected ? 2 : 1,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <Text style={[styles.dayNumber, { color: colors.text }]}>
                    {item.day}
                  </Text>
                  <Text style={[styles.availText, { color: colors.text }]}>
                    {item.availableRooms}
                  </Text>
                  {isSelected && (
                    <View style={styles.selectedBadge}>
                      <Text style={styles.selectedBadgeText}>✓</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#EF4444" }]}
              />
              <Text style={styles.legendText}>Available</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: "#EF4444" }]}
              />
              <Text style={styles.legendText}>Full</Text>
            </View>
          </View>

          {/* ── Multi-select / whole-month action bar ── */}
          {selectionMode !== "single" && (
            <View style={styles.multiActionBar}>
              <Text style={styles.multiActionText}>
                {selectionMode === "month"
                  ? `${selectedDays.length} of ${days.length} days selected`
                  : `${selectedDays.length} date${selectedDays.length !== 1 ? "s" : ""} selected`}
              </Text>
              <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                {selectionMode === "month" && selectedDays.length < days.length && (
                  <TouchableOpacity style={styles.clearBtn} onPress={selectWholeMonth}>
                    <Text style={styles.clearBtnText}>Select All</Text>
                  </TouchableOpacity>
                )}
                {selectedDays.length > 0 && (
                  <TouchableOpacity
                    style={styles.clearBtn}
                    onPress={() => setSelectedDays([])}
                  >
                    <Text style={styles.clearBtnText}>Clear</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.manageBtn, selectedDays.length === 0 && styles.manageBtnDisabled]}
                  onPress={() => selectedDays.length > 0 && setModalVisible(true)}
                  disabled={selectedDays.length === 0}
                >
                  <Text style={styles.manageBtnText}>
                    {selectionMode === "month" ? "Manage Whole Month" : "Manage Rooms"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── Detail Modal ── */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <Pressable style={styles.modalOverlay} onPress={closeModal}>
          <Pressable style={styles.modalCard} onPress={() => { }}>
            {selectedDays.length > 0 && modalStats && (
              <>
                {selectedDays.length === 1 ? (
                  <Text style={styles.modalTitle}>
                    {MONTH_NAMES[selectedDays[0].month]} {selectedDays[0].day}, {selectedDays[0].year}
                  </Text>
                ) : (
                  <Text style={styles.modalTitle}>
                    {selectedDays.length} Dates Selected
                  </Text>
                )}
                <Text style={styles.modalSubtitle}>{selectedType}</Text>

                {selectedDays.length > 1 && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.dateChipsScroll}
                    contentContainerStyle={styles.dateChipsRow}
                  >
                    {selectedDays
                      .slice()
                      .sort((a, b) => a.day - b.day)
                      .map((d) => (
                        <View key={`${d.year}-${d.month}-${d.day}`} style={styles.dateChip}>
                          <Text style={styles.dateChipText}>
                            {MONTH_NAMES[d.month].slice(0, 3)} {d.day}
                          </Text>
                        </View>
                      ))}
                  </ScrollView>
                )}

                <View style={styles.modalStats}>
                  <View style={styles.modalStatItem}>
                    <Text style={[styles.modalStatValue, { color: "#1D4ED8" }]}>
                      {modalStats.capacity}
                    </Text>
                    <Text style={styles.modalStatLabel}>
                      {selectedDays.length === 1 ? "Total Rooms" : "Rooms / Day"}
                    </Text>
                  </View>
                  <View style={styles.modalDivider} />
                  <View style={styles.modalStatItem}>
                    <Text style={[styles.modalStatValue, { color: "#166534" }]}>
                      {modalStats.availableSum}
                    </Text>
                    <Text style={styles.modalStatLabel}>
                      {selectedDays.length === 1 ? "Available" : "Available (nights)"}
                    </Text>
                  </View>
                  <View style={styles.modalDivider} />
                  <View style={styles.modalStatItem}>
                    <Text style={[styles.modalStatValue, { color: "#9A3412" }]}>
                      {modalStats.bookedSum}
                    </Text>
                    <Text style={styles.modalStatLabel}>
                      {selectedDays.length === 1 ? "Booked" : "Booked (nights)"}
                    </Text>
                  </View>
                </View>

                <View style={styles.occupancyBarBg}>
                  <View
                    style={[
                      styles.occupancyBarFill,
                      {
                        width: `${modalStats.occupancyPct}%`,
                        backgroundColor:
                          modalStats.occupancyPct >= 100
                            ? "#EF4444"
                            : modalStats.occupancyPct >= 60
                              ? "#F97316"
                              : "#22C55E",
                      },
                    ]}
                  />
                </View>
                <Text style={styles.occupancyText}>
                  {modalStats.occupancyPct}% Occupancy
                  {selectedDays.length > 1 ? " (avg)" : ""}
                </Text>

                {/* ── Room Block / Unblock List ── */}
                <View style={styles.roomListSection}>
                  <Text style={styles.roomListTitle}>Rooms</Text>
                  <Text style={styles.roomListHint}>
                    {selectedDays.length === 1
                      ? "Tap to block or unblock individual rooms"
                      : selectionMode === "month"
                        ? "Blocking applies to every selected day this month"
                        : "Blocking applies to every selected date at once"}
                  </Text>
                  <ScrollView
                    style={styles.roomListScroll}
                    nestedScrollEnabled
                    showsVerticalScrollIndicator={false}
                  >
                    {modalRooms.map((roomNum) => {
                      const status = getRoomBlockStatus(roomNum);
                      const dotColor =
                        status === "all"
                          ? "#EF4444"
                          : status === "partial"
                            ? "#F59E0B"
                            : "#22C55E";
                      const btnStyle =
                        status === "all"
                          ? styles.unblockBtn
                          : status === "partial"
                            ? styles.partialBlockBtn
                            : styles.blockBtnDefault;
                      const btnTextStyle =
                        status === "all"
                          ? styles.unblockBtnText
                          : status === "partial"
                            ? styles.partialBlockBtnText
                            : styles.blockBtnTextDefault;
                      const label =
                        status === "all"
                          ? "Unblock"
                          : status === "partial"
                            ? "Block All"
                            : "Block";
                      return (
                        <View key={roomNum} style={styles.roomRow}>
                          <View style={styles.roomInfo}>
                            <View style={[styles.roomDot, { backgroundColor: dotColor }]} />
                            <Text style={styles.roomNumber}>Room {roomNum}</Text>
                          </View>
                          <TouchableOpacity
                            onPress={() => toggleBlock(roomNum)}
                            style={[styles.blockBtn, btnStyle]}
                          >
                            <Text style={[styles.blockBtnText, btnTextStyle]}>
                              {label}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </ScrollView>
                </View>

                <TouchableOpacity style={styles.modalClose} onPress={closeModal}>
                  <Text style={styles.modalCloseText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── FAB Speed Dial ── */}
      <View style={styles.fabContainer} pointerEvents="box-none">
        <View pointerEvents={fabOpen ? "auto" : "none"} style={styles.fabChildrenWrapper}>
          <Animated.View style={[styles.fabChild, { opacity: fabAnim, transform: [{ translateY: fabAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
            <View style={styles.fabLabelContainer}>
              <Text style={styles.fabLabel}>Whole Month</Text>
            </View>
            <TouchableOpacity style={[styles.fabBtn, { backgroundColor: "#EA580C" }]} onPress={() => changeSelectionMode("month")} activeOpacity={0.8}>
              <Ionicons name="calendar" size={20} color="#FFF" />
            </TouchableOpacity>
          </Animated.View>
          <Animated.View style={[styles.fabChild, { opacity: fabAnim, transform: [{ translateY: fabAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }] }]}>
            <View style={styles.fabLabelContainer}>
              <Text style={styles.fabLabel}>Multi-Select</Text>
            </View>
            <TouchableOpacity style={[styles.fabBtn, { backgroundColor: "#9333EA" }]} onPress={() => changeSelectionMode("multi")} activeOpacity={0.8}>
              <Ionicons name="list-outline" size={20} color="#FFF" />
            </TouchableOpacity>
          </Animated.View>
          <Animated.View style={[styles.fabChild, { opacity: fabAnim, transform: [{ translateY: fabAnim.interpolate({ inputRange: [0, 1], outputRange: [60, 0] }) }] }]}>
            <View style={styles.fabLabelContainer}>
              <Text style={styles.fabLabel}>Single Date</Text>
            </View>
            <TouchableOpacity style={[styles.fabBtn, { backgroundColor: "#1D4ED8" }]} onPress={() => changeSelectionMode("single")} activeOpacity={0.8}>
              <Ionicons name="calendar-outline" size={20} color="#FFF" />
            </TouchableOpacity>
          </Animated.View>
        </View>

        <TouchableOpacity style={styles.fabMain} onPress={toggleFab} activeOpacity={0.8}>
          <Animated.View style={{ transform: [{ rotate: fabAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '45deg'] }) }] }}>
            <Ionicons name="add" size={28} color="#FFF" />
          </Animated.View>
        </TouchableOpacity>
      </View>
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

  // Selection mode toggle
  modeRow: { marginBottom: 12 },
  modeToggleContainer: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    padding: 3,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  modeTab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  modeTabActive: {
    backgroundColor: "#1D4ED8",
  },
  modeTabText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
  },
  modeTabTextActive: {
    color: "#FFFFFF",
  },
  modeHint: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "500",
    marginTop: 6,
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
  selectedBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    width: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: "#1D4ED8",
    justifyContent: "center",
    alignItems: "center",
  },
  selectedBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#FFFFFF",
  },

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

  // Multi-select action bar (inside calendar card)
  multiActionBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  multiActionText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#334155",
  },
  clearBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
  },
  clearBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
  },
  manageBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: "#1D4ED8",
  },
  manageBtnDisabled: {
    backgroundColor: "#CBD5E1",
  },
  manageBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },

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
    maxHeight: "85%",
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
  },
  dateChipsScroll: {
    marginTop: 14,
    marginHorizontal: -28,
  },
  dateChipsRow: {
    paddingHorizontal: 28,
    gap: 8,
  },
  dateChip: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  dateChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1D4ED8",
  },
  modalStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 24,
  },
  modalStatItem: { alignItems: "center" },
  modalStatValue: { fontSize: 28, fontWeight: "800" },
  modalStatLabel: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 4,
    fontWeight: "500",
    textAlign: "center",
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

  // Room list styles
  roomListSection: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 16,
  },
  roomListTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 2,
  },
  roomListHint: {
    fontSize: 11,
    color: "#94A3B8",
    marginBottom: 12,
    fontWeight: "500",
  },
  roomListScroll: {
    maxHeight: 220,
  },
  roomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  roomInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  roomDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  roomNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },
  blockBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  blockBtnDefault: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  unblockBtn: {
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
  },
  partialBlockBtn: {
    backgroundColor: "#FFFBEB",
    borderColor: "#FDE68A",
  },
  blockBtnText: {
    fontSize: 12,
    fontWeight: "700",
  },
  blockBtnTextDefault: {
    color: "#DC2626",
  },
  unblockBtnText: {
    color: "#16A34A",
  },
  partialBlockBtnText: {
    color: "#B45309",
  },

  // FAB Styles
  fabContainer: {
    position: "absolute",
    bottom: 24,
    right: 20,
    alignItems: "flex-end",
    zIndex: 999,
  },
  fabChildrenWrapper: {
    alignItems: "flex-end",
    marginBottom: 16,
    gap: 16,
  },
  fabChild: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 12,
  },
  fabLabelContainer: {
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  fabLabel: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "600",
  },
  fabBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  fabMain: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#1D4ED8",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
});