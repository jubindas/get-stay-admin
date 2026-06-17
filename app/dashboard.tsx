
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

import BookingsChart from "../components/BookingsChart";

import OccupancyCard from "../components/OccupancyCard";

import Header from "../components/Header";

import { useAuth } from "@/provider/AuthProvider";

import axios from "axios";

import { router } from "expo-router";

import VacancyModal from "../components/VacancyModal";
import WalkInBookingModal from "../components/WalkInBookingModal";
import RevenueChart from "../components/RevenueChart";

const { width } = Dimensions.get("window");

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

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
  const [activeTab, setActiveTab] = useState("Occupancy");
  const [properties, setProperties] = useState<any[]>([]); // New state to hold properties
  const [loading, setLoading] = useState(true); // Track loading status
  const [vacancyModalVisible, setVacancyModalVisible] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);

  const todayDate = new Date();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const { token } = useAuth();

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

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${API_BASE_URL}/api/host/properties`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );


        // Safely set the array from response.data.properties
        if (response.data && Array.isArray(response.data.properties)) {
          setProperties(response.data.properties);
        }
      } catch (error) {
        console.log("the error is", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, [token]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Header />
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollPadding}
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <View style={styles.todaysHeaderContainer}>
          <Text style={styles.todaysHeaderText}>Today's</Text>
        </View>
        <View style={styles.statsGrid}>
          <StatusCard
            icon="log-in-outline"
            label="CHECK-IN"
            value="2"
            color={COLORS.primaryBlue}
            bgColor="#EDF2FF"
            onPress={() => router.push("/todays-check-in")}
          />
          <StatusCard
            icon="checkmark-circle-outline"
            label="VACANT"
            value="2"
            color={COLORS.tealCheck}
            bgColor="#E6FFFA"
            onPress={() => setVacancyModalVisible(true)}
          />
          <StatusCard
            icon="bed-outline"
            label="Booked"
            value="8"
            color={COLORS.orangeChart}
            bgColor="#FFF7ED"
            onPress={() => setShowBookingForm(true)}
          />
          <StatusCard
            icon="log-out-outline"
            label="Revenue"
            value="₹25000"
            color={COLORS.pinkCheckOut}
            bgColor="#FEF2F2"
            onPress={() => router.push("/manage-rates")}
          />
        </View>

        {/* Dynamic Condition Checking: Show Analytics OR Empty State CTA */}
        {!loading && properties.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="business-outline" size={32} color={COLORS.primaryBlue} />
            </View>
            <Text style={styles.emptyTitle}>No Properties Found</Text>
            <Text style={styles.emptySubtitle}>
              You havent added any listed rental spots yet. Add a property to start tracking your metrics.
            </Text>
            <TouchableOpacity
              style={styles.addPropertyButton}
              activeOpacity={0.85}
              onPress={() => {
                // Adjust route path if necessary to match your add property route layout
                router.push("/add-property");
              }}
            >
              <Ionicons name="add-circle-outline" size={20} color={COLORS.white} style={{ marginRight: 6 }} />
              <Text style={styles.addPropertyButtonText}>Add First Property</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.analyticsHeader}>

              <View style={styles.subTabContainer}>
                {["Occupancy", "Revenue", "Bookings"].map((tab) => (
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
          </>
        )}
      </Animated.ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fabWrapper}
        onPress={() => setShowBookingForm(true)}
        activeOpacity={0.85}
      >
        <View style={styles.fabCircle}>
          <Ionicons name="add" size={32} color={COLORS.white} />
        </View>
        <Text style={styles.fabText}>Book Room</Text>
      </TouchableOpacity>

      <VacancyModal
        visible={vacancyModalVisible}
        onClose={() => setVacancyModalVisible(false)}
        day={todayDate.getDate()}
        month={todayDate.getMonth()}
        year={todayDate.getFullYear()}
      />

      <WalkInBookingModal 
        visible={showBookingForm}
        onClose={() => setShowBookingForm(false)}
      />
    </View>
  );
}

function StatusCard({ icon, label, value, color, bgColor, isUrgent, onPress }: any) {
  return (
    <TouchableOpacity
      style={[styles.statCard, { borderLeftColor: color }]}
      activeOpacity={0.7}
      onPress={onPress}
    >
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
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollPadding: {
    paddingTop: 5,
    paddingBottom: 10,
    flexGrow: 1,
  },
  todaysHeaderContainer: {
    paddingHorizontal: 20,
    marginTop: 5,
    marginBottom: 0,
  },
  todaysHeaderText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000',
  },
  fabWrapper: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99,
  },
  fabCircle: {
    backgroundColor: '#001A72',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#001A72',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    marginBottom: 4,
  },
  fabText: {
    color: '#001A72',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 5,
  },
  statCard: {
    backgroundColor: COLORS.white,
    width: (width - 50) / 2,
    padding: 10,
    borderRadius: 18,
    marginBottom: 8,
    borderLeftWidth: 5,
    flexDirection: "row",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  statIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  statTextContainer: { flex: 1 },
  statLabel: {
    fontSize: 9,
    color: COLORS.textSubtle,
    textTransform: "uppercase",
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "800",
    marginTop: 1,
  },
  analyticsHeader: {
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
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
    paddingVertical: 6,
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
    minHeight: 200,
  },

  // Premium Empty State Styling
  emptyStateContainer: {
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    marginTop: 25,
    paddingVertical: 40,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.textMain,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textSubtle,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  addPropertyButton: {
    flexDirection: "row",
    backgroundColor: COLORS.primaryBlue,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: COLORS.primaryBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  addPropertyButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});

