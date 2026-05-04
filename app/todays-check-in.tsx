import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

const COLORS = {
  primary: "#003399",
  teal: "#38B2AC",
  bg: "#F8FAFC",
  white: "#FFFFFF",
  textMain: "#1A202C",
  textSubtle: "#718096",
  success: "#10B981",
  warning: "#F59E0B",
  border: "#E2E8F0",
};

// Mock data for check-ins
const CHECK_INS = [
  {
    id: "1",
    guest: "James Miller",
    room: "302",
    type: "Deluxe",
    status: "Pending",
    time: "12:30 PM",
  },
  {
    id: "2",
    guest: "Sarah Jenkins",
    room: "105",
    type: "Standard",
    status: "Checked-in",
    time: "10:15 AM",
  },
  {
    id: "3",
    guest: "Michael Chen",
    room: "410",
    type: "Suite",
    status: "Pending",
    time: "02:00 PM",
  },
  {
    id: "4",
    guest: "Emma Wilson",
    room: "202",
    type: "Deluxe",
    status: "Pending",
    time: "03:45 PM",
  },
];

export default function TodaysCheckIn() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Expected Arrivals</Text>
        <Text style={styles.subtitle}>
          {CHECK_INS.length} guests checking in today
        </Text>
      </View>

      {CHECK_INS.map((item, index) => (
        <CheckInCard key={item.id} item={item} index={index} />
      ))}
    </ScrollView>
  );
}

function CheckInCard({ item, index }: { item: any; index: number }) {
  // Animation setup
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 500,
      delay: index * 150, // Stagger effect
      useNativeDriver: true,
    }).start();
  }, []);

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 0],
  });

  return (
    <Animated.View
      style={[
        styles.card,
        {
          opacity: animatedValue,
          transform: [{ translateY }],
        },
      ]}
    >
      <View style={styles.cardContent}>
        <View style={styles.infoSide}>
          <Text style={styles.guestName}>{item.guest}</Text>
          <View style={styles.roomRow}>
            <Ionicons name="bed-outline" size={14} color={COLORS.textSubtle} />
            <Text style={styles.roomText}>
              Room {item.room} • {item.type}
            </Text>
          </View>
          <View style={styles.timeRow}>
            <Ionicons name="time-outline" size={14} color={COLORS.textSubtle} />
            <Text style={styles.roomText}>ETA: {item.time}</Text>
          </View>
        </View>

        <View style={styles.actionSide}>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  item.status === "Checked-in" ? "#DCFCE7" : "#FEF3C7",
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color:
                    item.status === "Checked-in"
                      ? COLORS.success
                      : COLORS.warning,
                },
              ]}
            >
              {item.status}
            </Text>
          </View>

          {item.status === "Pending" && (
            <TouchableOpacity style={styles.checkInBtn}>
              <Text style={styles.btnText}>Check-in</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, padding: 16 },
  header: { marginBottom: 20, marginTop: 10 },
  title: { fontSize: 20, fontWeight: "800", color: COLORS.textMain },
  subtitle: { fontSize: 14, color: COLORS.textSubtle, marginTop: 4 },
  card: {
    backgroundColor: COLORS.white,
    marginBottom: 12,
    borderRadius: 0, // Keeping your professional square design
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    // Professional shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardContent: {
    flexDirection: "row",
    padding: 16,
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoSide: { flex: 1 },
  guestName: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textMain,
    marginBottom: 6,
  },
  roomRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  timeRow: { flexDirection: "row", alignItems: "center" },
  roomText: { fontSize: 13, color: COLORS.textSubtle, marginLeft: 6 },
  actionSide: { alignItems: "flex-end" },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 0,
    marginBottom: 10,
  },
  statusText: { fontSize: 11, fontWeight: "700", textTransform: "uppercase" },
  checkInBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 0,
  },
  btnText: { color: "#fff", fontSize: 12, fontWeight: "600" },
});
