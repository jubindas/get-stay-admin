import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Components
import BookingsChart from "@/components/BookingsChart";
import OccupancyCard from "@/components/OccupancyCard";
import RevenueChart from "@/components/RevenueChart";

const { width } = Dimensions.get("window");

const COLORS = {
  primaryBlue: "#003399",
  bg: "#F4F6F8",
  white: "#FFFFFF",
  orangeChart: "#F97316",
  tealCheck: "#38B2AC",
  pinkCheckOut: "#F87171",
  textMain: "#1F2937",
  textSubtle: "#6B7280",
};

export default function ZenDashboard() {
  const [activeTab, setActiveTab] = useState("Bookings");

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const renderAnalyticsContent = () => {
    switch (activeTab) {
      case "Bookings":
        return <BookingsChart />;
      case "Revenue":
        return <RevenueChart />;
      case "Occupancy":
        return <OccupancyCard />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        // contentContainerStyle is key for making flex content scrollable
        contentContainerStyle={styles.scrollPadding}
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        {/* Welcome Header */}
        <View style={styles.welcomeSection}>
          <Text style={styles.greeting}>Good Morning, @Dorji</Text>
          <Text style={styles.subGreeting}>Get Stay Hotel Management</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatusCard
            icon="log-in-outline"
            label="Check-in"
            value="0/2"
            color={COLORS.primaryBlue}
            bgColor="#EDF2FF"
          />
          <StatusCard
            icon="bed-outline"
            label="Stay"
            value="8"
            color={COLORS.orangeChart}
            bgColor="#FFF7ED"
          />
          <StatusCard
            icon="log-out-outline"
            label="Check-out"
            value="4/4"
            color={COLORS.pinkCheckOut}
            bgColor="#FEF2F2"
            isUrgent
          />
          <StatusCard
            icon="checkmark-circle-outline"
            label="Vacant"
            value="2"
            color={COLORS.tealCheck}
            bgColor="#E6FFFA"
          />
        </View>

        {/* Analytics Tabs */}
        <View style={styles.analyticsHeader}>
          <Text style={styles.sectionTitle}>Booking Analytics</Text>
          <View style={styles.subTabContainer}>
            {["Bookings", "Revenue", "Occupancy"].map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[
                  styles.subTab,
                  activeTab === tab && styles.subTabActive,
                ]}
              >
                <Text
                  style={[
                    styles.subTabText,
                    activeTab === tab && styles.subTabTextActive,
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.contentArea}>{renderAnalyticsContent()}</View>
      </Animated.ScrollView>
    </View>
  );
}

function StatusCard({ icon, label, value, color, bgColor, isUrgent }: any) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={[styles.statIconContainer, { backgroundColor: bgColor }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={styles.statTextContainer}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text
          style={[
            styles.statValue,
            { color: isUrgent ? color : COLORS.textMain },
          ]}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollPadding: {
    paddingTop: 30,
    paddingBottom: 40,
    flexGrow: 1, // Ensures the scroll view can expand
  },
  welcomeSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  greeting: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.textMain,
    letterSpacing: -0.5,
  },
  subGreeting: {
    fontSize: 14,
    color: COLORS.textSubtle,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  statCard: {
    backgroundColor: COLORS.white,
    width: (width - 50) / 2,
    padding: 16,
    borderRadius: 18,
    marginBottom: 15,
    borderLeftWidth: 5,
    flexDirection: "row",
    alignItems: "center",
    // Shadow/Elevation
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  statIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  statTextContainer: { flex: 1 },
  statLabel: {
    fontSize: 10,
    color: COLORS.textSubtle,
    textTransform: "uppercase",
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
    marginTop: 2,
  },
  analyticsHeader: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.textMain,
    marginBottom: 12,
  },
  subTabContainer: {
    flexDirection: "row",
    backgroundColor: "#E5E7EB",
    borderRadius: 12,
    padding: 4,
  },
  subTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  subTabActive: {
    backgroundColor: COLORS.white,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  subTabText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textSubtle,
  },
  subTabTextActive: {
    color: COLORS.primaryBlue,
  },
  contentArea: {
    paddingHorizontal: 20,
    minHeight: 300, // Helps ensure there is enough space for the charts
  },
});
