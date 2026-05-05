import { Ionicons } from "@expo/vector-icons";

import React, { useEffect, useRef } from "react";

import {
  Animated,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const COLORS = {
  primary: "#003399",
  background: "#FFFFFF",
  cardBg: "#FFFFFF",
  surface: "#F8FAFC",
  textMain: "#0F172A",
  textSubtle: "#64748B",
  success: "#10B981",
  warning: "#F59E0B",
  border: "#F1F5F9",
};

const CHECK_INS = [
  {
    id: "1",
    guest: "James Miller",
    room: "302",
    type: "Deluxe AC",
    status: "Pending",
    time: "12:30 PM",
    initials: "JM",
  },
  {
    id: "2",
    guest: "Sarah Jenkins",
    room: "105",
    type: "Standard",
    status: "Arrived",
    time: "10:15 AM",
    initials: "SJ",
  },
  {
    id: "3",
    guest: "Michael Chen",
    room: "410",
    type: "Executive Suite",
    status: "Pending",
    time: "02:00 PM",
    initials: "MC",
  },
  {
    id: "4",
    guest: "Emma Wilson",
    room: "202",
    type: "Deluxe AC",
    status: "Pending",
    time: "03:45 PM",
    initials: "EW",
  },
];

export default function TodaysCheckIn() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Arrivals</Text>
          <Text style={styles.subtitle}>Tuesday, 5 May</Text>
        </View>
        <TouchableOpacity style={styles.iconCircle}>
          <Ionicons name="search" size={20} color={COLORS.textMain} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statsRow}>
          <StatItem label="Remaining" value="3" active />
          <StatItem label="Arrived" value="1" />
          <StatItem label="Canceled" value="0" />
        </View>

        {CHECK_INS.map((item, index) => (
          <CheckInCard key={item.id} item={item} index={index} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const StatItem = ({ label, value, active }: any) => (
  <View style={[styles.statItem, active && styles.statItemActive]}>
    <Text style={[styles.statValue, active && styles.statTextActive]}>
      {value}
    </Text>
    <Text style={[styles.statLabel, active && styles.statTextActive]}>
      {label}
    </Text>
  </View>
);

function CheckInCard({ item, index }: { item: any; index: number }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      delay: index * 100,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
      <View style={styles.cardMain}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.initials}</Text>
        </View>

        <View style={styles.info}>
          <Text style={styles.guestName}>{item.guest}</Text>
          <Text style={styles.roomInfo}>
            Room {item.room} • {item.type}
          </Text>
        </View>

        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{item.time}</Text>
          <View
            style={[
              styles.dot,
              {
                backgroundColor:
                  item.status === "Arrived" ? COLORS.success : COLORS.warning,
              },
            ]}
          />
        </View>
      </View>

      {item.status === "Pending" && (
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Check In</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.textMain,
    letterSpacing: -0.5,
  },
  subtitle: { fontSize: 15, color: COLORS.textSubtle, fontWeight: "500" },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10 },

  // Stats
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  statItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 12,
    marginHorizontal: 4,
    backgroundColor: COLORS.surface,
  },
  statItemActive: { backgroundColor: COLORS.primary },
  statValue: { fontSize: 18, fontWeight: "700", color: COLORS.textMain },
  statLabel: { fontSize: 12, color: COLORS.textSubtle, marginTop: 2 },
  statTextActive: { color: "#FFF" },

  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardMain: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { fontSize: 14, fontWeight: "700", color: COLORS.primary },
  info: { flex: 1, marginLeft: 15 },
  guestName: { fontSize: 16, fontWeight: "700", color: COLORS.textMain },
  roomInfo: { fontSize: 13, color: COLORS.textSubtle, marginTop: 2 },

  timeContainer: { alignItems: "flex-end" },
  timeText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textSubtle,
    marginBottom: 4,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },

  actionButton: {
    marginTop: 15,
    backgroundColor: COLORS.surface,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  actionButtonText: { fontSize: 14, fontWeight: "700", color: COLORS.primary },
});
