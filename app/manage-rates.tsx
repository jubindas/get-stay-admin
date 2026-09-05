import DateTimePicker from "@react-native-community/datetimepicker";
import {
  CalendarDays,
  CircleDollarSign,
  Percent,
  Receipt,
  Save,
  SlidersHorizontal
} from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import Header from "../components/Header";
import CalendarDayModal from "../components/CalendarDayModal";

const { width } = Dimensions.get("window");
const HORIZONTAL_PADDING = 32;
const CARD_PADDING = 10;
const CALENDAR_INTERNAL_WIDTH = width - HORIZONTAL_PADDING - CARD_PADDING * 2;
const CELL_MARGIN = 2;
const COLUMN_WIDTH = CALENDAR_INTERNAL_WIDTH / 7 - CELL_MARGIN * 2;

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}
function firstDayOffset(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  return (day + 6) % 7;
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
  isBlocked: boolean;
}

interface RoomAvailData {
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

const MOCK_ROOMS = [
  { id: "room_101", name: "Room 101", defaultRate: 2500 },
  { id: "room_102", name: "Room 102", defaultRate: 3000 },
  { id: "room_103", name: "Room 103", defaultRate: 2500 },
];

export default function ManageRates() {
  const [basePrice, setBasePrice] = useState("2499");
  const [weekendPrice, setWeekendPrice] = useState("3299");
  const [discount, setDiscount] = useState("10");
  const [taxEnabled, setTaxEnabled] = useState(true);
  const [activeInput, setActiveInput] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<RoomAvailData | null>(null);

  const [days, setDays] = useState<RoomData[]>([]);
  const [selectedMonthIdx, setSelectedMonthIdx] = useState<number>(0);

  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  // Format: 'YYYY-MM-DD' -> { roomId: rate }
  const [ratesByDate, setRatesByDate] = useState<Record<string, Record<string, number>>>({});

  // Rate Modal State
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [newRateValue, setNewRateValue] = useState("");
  const [rateStartDate, setRateStartDate] = useState(new Date());
  const [rateEndDate, setRateEndDate] = useState(new Date());
  const [showRateStartPicker, setShowRateStartPicker] = useState(false);
  const [showRateEndPicker, setShowRateEndPicker] = useState(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const monthList = useMemo(() => buildMonthList(), []);
  const currentMonthMeta = monthList[selectedMonthIdx];

  const generateMonthData = (year: number, month: number): RoomData[] => {
    const count = daysInMonth(year, month);
    return Array.from({ length: count }, (_, i) => {
      const isBlocked = false;
      return {
        day: i + 1,
        month,
        year,
        isBlocked
      };
    });
  };

  const generateAvailData = (year: number, month: number): RoomAvailData[] => {
    const seed = month + year;
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

  const getStatusColor = (avail: number, total: number): StatusColors => {
    if (avail === 0)
      return { bg: "#FEE2E2", text: "#991B1B", border: "#FECACA" };
    if (avail < total * 0.4)
      return { bg: "#FFEDD5", text: "#9A3412", border: "#FED7AA" };
    return { bg: "#F0FDF4", text: "#166534", border: "#BBF7D0" };
  };

  const availDays = useMemo(
    () => generateAvailData(currentMonthMeta.year, currentMonthMeta.month),
    [currentMonthMeta.year, currentMonthMeta.month]
  );

  useEffect(() => {
    setDays(generateMonthData(currentMonthMeta.year, currentMonthMeta.month));
  }, [selectedMonthIdx]);

  const getDateKey = (date: Date) => {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  };

  const handleSaveRate = () => {
    if (!editingRoomId) return;

    const trimmedValue = newRateValue.trim();
    const rateNumber = Number(trimmedValue);
    if (trimmedValue === "" || isNaN(rateNumber) || rateNumber < 0) {
      Alert.alert("Invalid Rate", "Please enter a valid positive number.");
      return;
    }

    setRatesByDate(prev => {
      const nextRates = { ...prev };
      let currentDate = new Date(rateStartDate);
      currentDate.setHours(0, 0, 0, 0);
      const end = new Date(rateEndDate);
      end.setHours(0, 0, 0, 0);

      while (currentDate <= end) {
        const dateKey = getDateKey(currentDate);
        const existingRates = nextRates[dateKey] || {};
        nextRates[dateKey] = {
          ...existingRates,
          [editingRoomId]: rateNumber
        };
        currentDate.setDate(currentDate.getDate() + 1);
      }
      return nextRates;
    });

    setEditingRoomId(null);
    setNewRateValue("");
    Alert.alert("Success", "Rates updated successfully.");
  };

  const handleMonthChange = (idx: number) => {
    if (idx === selectedMonthIdx) return;
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
    setSelectedMonthIdx(idx);

    const newMonthMeta = monthList[idx];
    setSelectedDate(new Date(newMonthMeta.year, newMonthMeta.month, 1));
  };

  const blankCount = firstDayOffset(currentMonthMeta.year, currentMonthMeta.month);
  const blankDays = Array.from({ length: blankCount }, (_, i) => i);

  const selectedDateKey = selectedDate ? getDateKey(selectedDate) : null;
  const selectedDateRates = selectedDateKey ? (ratesByDate[selectedDateKey] || {}) : {};

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <View style={styles.iconContainer}>
            <SlidersHorizontal color="#0284c7" size={20} />
          </View>
          <View style={styles.heroTextContainer}>
            <Text style={styles.heroTitle}>Manage Room Rates</Text>
            <Text style={styles.heroSubtitle}>
              Set different prices for different rooms on specific dates.
            </Text>
          </View>
        </View>

        {/* --- Availability Calendar Section --- */}
        <View style={styles.card}>
          <Text style={styles.cardMainTitle}>Room Availability</Text>

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
                  <Text style={[styles.monthChipText, isActive && styles.monthChipTextActive]}>
                    {shortName}
                  </Text>
                  <Text style={[styles.monthChipYear, isActive && styles.monthChipYearActive]}>
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
              {availDays.map((item) => {
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
        </View>

        {/* --- Room Rates Section --- */}
        {selectedDate && (
          <View style={styles.card}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={styles.cardMainTitle}>
                Rates for {selectedDate.toDateString()}
              </Text>
            </View>

            <View style={styles.roomListContainer}>
              <View style={styles.roomListHeader}>
                <Text style={[styles.roomListHeaderText, { flex: 2 }]}>Room</Text>
                <Text style={[styles.roomListHeaderText, { flex: 1.5, textAlign: 'right' }]}>Rate</Text>
                <Text style={[styles.roomListHeaderText, { flex: 1, textAlign: 'right' }]}>Action</Text>
              </View>

              {MOCK_ROOMS.map((room, index) => {
                const isLast = index === MOCK_ROOMS.length - 1;
                const customRate = selectedDateRates[room.id];
                const hasCustomRate = customRate !== undefined;
                const displayRate = hasCustomRate ? customRate : "Not Set";

                return (
                  <View key={room.id} style={[styles.roomRow, !isLast && styles.roomRowBorder]}>
                    <View style={{ flex: 2 }}>
                      <Text style={styles.roomName}>{room.name}</Text>
                      {hasCustomRate && (
                        <Text style={styles.customRateBadge}>Custom Rate</Text>
                      )}
                    </View>

                    <Text style={[
                      styles.roomRate,
                      { flex: 1.5, textAlign: 'right', color: hasCustomRate ? "#0284c7" : "#64748B" }
                    ]}>
                      {hasCustomRate ? `₹${displayRate}` : displayRate}
                    </Text>

                    <TouchableOpacity
                      style={styles.editBtn}
                      onPress={() => {
                        setEditingRoomId(room.id);
                        setNewRateValue(hasCustomRate ? customRate.toString() : room.defaultRate.toString());
                        if (selectedDate) {
                          setRateStartDate(selectedDate);
                          setRateEndDate(selectedDate);
                        }
                      }}
                    >
                      <Text style={styles.editBtnText}>Set</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardMainTitle}>Rate Optimization</Text>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Base Price Per Night</Text>
            <View style={[
              styles.inputContainer,
              activeInput === "base" && styles.inputContainerActive
            ]}>
              <View style={styles.prefix}>
                <CircleDollarSign color={activeInput === "base" ? "#0284c7" : "#64748b"} size={18} />
              </View>
              <TextInput
                value={basePrice}
                onChangeText={setBasePrice}
                keyboardType="numeric"
                placeholder="0.00"
                placeholderTextColor="#94a3b8"
                style={styles.input}
                onFocus={() => setActiveInput("base")}
                onBlur={() => setActiveInput(null)}
              />
              <Text style={styles.suffixText}>RS</Text>
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Weekend Surge Premium</Text>
            <View style={[
              styles.inputContainer,
              activeInput === "weekend" && styles.inputContainerActive
            ]}>
              <View style={styles.prefix}>
                <CalendarDays color={activeInput === "weekend" ? "#0284c7" : "#64748b"} size={18} />
              </View>
              <TextInput
                value={weekendPrice}
                onChangeText={setWeekendPrice}
                keyboardType="numeric"
                placeholder="0.00"
                placeholderTextColor="#94a3b8"
                style={styles.input}
                onFocus={() => setActiveInput("weekend")}
                onBlur={() => setActiveInput(null)}
              />
              <Text style={styles.suffixText}>RS</Text>
            </View>
          </View>
        </View>

        {/* Marketing & Discounts */}
        <View style={styles.card}>
          <Text style={styles.cardMainTitle}>Promotional Strategy</Text>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Default Discount Offer</Text>
            <View style={[
              styles.inputContainer,
              activeInput === "discount" && styles.inputContainerActive
            ]}>
              <TextInput
                value={discount}
                onChangeText={setDiscount}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#94a3b8"
                style={[styles.input, { paddingLeft: 16 }]}
                onFocus={() => setActiveInput("discount")}
                onBlur={() => setActiveInput(null)}
              />
              <View style={styles.suffixIcon}>
                <Percent color={activeInput === "discount" ? "#0284c7" : "#64748b"} size={16} />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.toggleCard}>
          <View style={styles.toggleHeader}>
            <View style={styles.toggleIconBox}>
              <Receipt color="#10b981" size={20} />
            </View>
            <View style={styles.toggleTextPane}>
              <Text style={styles.toggleTitle}>Automate Regional Taxes</Text>
              <Text style={styles.toggleSubtitle}>
                Calculate and transparently attach mandatory dynamic itemized tax structures onto the room base totals.
              </Text>
            </View>
          </View>
          <Switch
            value={taxEnabled}
            onValueChange={setTaxEnabled}
            trackColor={{ false: "#e2e8f0", true: "#a7f3d0" }}
            thumbColor={taxEnabled ? "#10b981" : "#f1f5f9"}
          />
        </View>

        <TouchableOpacity style={styles.saveButton} activeOpacity={0.8}>
          <Save color="#ffffff" size={18} style={{ marginRight: 8 }} />
          <Text style={styles.saveButtonText}>Commit Rate Updates</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Set Rate Modal - Matched Design */}
      <Modal visible={!!editingRoomId} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setEditingRoomId(null)}>
          <Pressable style={styles.modalCard} onPress={() => { }}>

            <Text style={styles.modalTitle}>Update Rates</Text>
            <Text style={styles.modalSubtitle}>
              {MOCK_ROOMS.find(r => r.id === editingRoomId)?.name}
            </Text>

            <View style={styles.datePickerRow}>
              <View style={styles.datePickerCol}>
                <Text style={styles.modalLabel}>Start Date</Text>
                <TouchableOpacity
                  style={styles.dateBtn}
                  onPress={() => setShowRateStartPicker(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dateBtnText}>
                    {rateStartDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.datePickerCol}>
                <Text style={styles.modalLabel}>End Date</Text>
                <TouchableOpacity
                  style={styles.dateBtn}
                  onPress={() => setShowRateEndPicker(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dateBtnText}>
                    {rateEndDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.rateInputSection}>
              <Text style={styles.modalLabel}>New Rate (₹)</Text>
              <TextInput
                style={styles.rateInput}
                value={newRateValue}
                onChangeText={setNewRateValue}
                keyboardType="numeric"
                placeholder="2500"
                placeholderTextColor="#94A3B8"
              />
            </View>

            {showRateStartPicker && (
              <DateTimePicker
                value={rateStartDate}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  setShowRateStartPicker(false);
                  if (date) setRateStartDate(date);
                }}
              />
            )}

            {showRateEndPicker && (
              <DateTimePicker
                value={rateEndDate}
                mode="date"
                display="default"
                minimumDate={rateStartDate}
                onChange={(event, date) => {
                  setShowRateEndPicker(false);
                  if (date) setRateEndDate(date);
                }}
              />
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setEditingRoomId(null)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyBtn}
                onPress={handleSaveRate}
              >
                <Text style={styles.applyBtnText}>Save Rate</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <CalendarDayModal
        visible={!!selectedDay}
        onClose={() => setSelectedDay(null)}
        dayData={selectedDay}
        roomType="All Rooms"
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  content: {
    padding: 16,
  },
  heroCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconContainer: {
    backgroundColor: "#e0f2fe",
    padding: 10,
    borderRadius: 12,
    marginRight: 14,
  },
  heroTextContainer: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: "#64748b",
  },
  card: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardMainTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    color: "#475569",
    marginBottom: 6,
    fontWeight: "600",
  },
  inputContainer: {
    height: 48,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
  },
  inputContainerActive: {
    borderColor: "#0284c7",
    borderWidth: 1.5,
  },
  prefix: {
    paddingLeft: 12,
    paddingRight: 8,
    justifyContent: "center",
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 15,
    color: "#0f172a",
    fontWeight: "500",
  },
  suffixText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#94a3b8",
    paddingRight: 14,
  },
  suffixIcon: {
    paddingRight: 14,
    justifyContent: "center",
  },
  toggleCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toggleHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
    paddingRight: 16,
  },
  toggleIconBox: {
    backgroundColor: "#d1fae5",
    padding: 8,
    borderRadius: 10,
    marginRight: 12,
    marginTop: 2,
  },
  toggleTextPane: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
  },
  toggleSubtitle: {
    fontSize: 12,
    color: "#64748b",
    lineHeight: 16,
    marginTop: 2,
  },
  saveButton: {
    backgroundColor: "#0f172a",
    height: 52,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
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

  // Room List Styles
  roomListContainer: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden"
  },
  roomListHeader: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#F1F5F9",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  roomListHeaderText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.5
  },
  roomRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 16,
    alignItems: "center",
    backgroundColor: "#FFF"
  },
  roomRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9"
  },
  roomName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 2
  },
  customRateBadge: {
    fontSize: 10,
    color: "#0284c7",
    fontWeight: "600",
    backgroundColor: "#E0F2FE",
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2
  },
  roomRate: {
    fontSize: 15,
    fontWeight: "700"
  },
  editBtn: {
    flex: 1,
    alignItems: "flex-end",
    justifyContent: "center"
  },
  editBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0284c7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#E0F2FE",
    borderRadius: 6
  },

  // Modal Styling (Matched Design)
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
  datePickerRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  datePickerCol: {
    flex: 1,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  dateBtn: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
  },
  dateBtnText: {
    color: "#1E293B",
    fontWeight: "700",
    fontSize: 14,
  },
  rateInputSection: {
    marginBottom: 24,
  },
  rateInput: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    paddingHorizontal: 16,
    paddingVertical: 12,
    textAlign: "center",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
  },
  cancelBtnText: {
    fontWeight: "700",
    color: "#475569",
    fontSize: 15,
  },
  applyBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#1E293B",
    alignItems: "center",
  },
  applyBtnText: {
    fontWeight: "700",
    color: "#FFFFFF",
    fontSize: 15,
  }
});