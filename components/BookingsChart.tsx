import React, { useEffect, useMemo, useRef, useState } from "react";

import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

const COLORS = {
  white: "#FFFFFF",
  textDark: "#1E293B",
  textMuted: "#94A3B8",
  surface: "#F8FAFC",
  border: "#E2E8F0",
  blueOnline: "#3B82F6",
  greenOffline: "#10B981",
};

const maxBarHeight = 130;

export default function BookingsChart() {

  const [activeTab, setActiveTab] = useState<string>("Day");

  const animValue = useRef(new Animated.Value(0)).current;


  useEffect(() => {
    animValue.setValue(0);
    Animated.timing(animValue, {
      toValue: 1,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [activeTab]);

  const activeData = useMemo(() => {
    if (activeTab === "Month") {
      return [
        { day: "Jan", online: 120, offline: 40 },
        { day: "Feb", online: 150, offline: 50 },
        { day: "Mar", online: 180, offline: 60 },
        { day: "Apr", online: 160, offline: 50 },
        { day: "May", online: 190, offline: 60 },
        { day: "Jun", online: 200, offline: 70 },
      ];
    }
    if (activeTab === "Year") {
      return [
        { day: "2023", online: 1200, offline: 400 },
        { day: "2024", online: 1500, offline: 500 },
        { day: "2025", online: 1800, offline: 600 },
        { day: "2026", online: 2100, offline: 700 },
      ];
    }

    return [
      { day: "1", online: 15, offline: 5 },
      { day: "2", online: 22, offline: 8 },
      { day: "3", online: 12, offline: 4 },
      { day: "4", online: 30, offline: 10 },
      { day: "5", online: 18, offline: 6 },
      { day: "6", online: 26, offline: 9 },
      { day: "7", online: 27, offline: 8 },
    ];
  }, [activeTab]);

  const maxVal = useMemo(() => {
    const vals = activeData.flatMap((d) => [d.online, d.offline]);
    return Math.max(...vals, 1);
  }, [activeData]);

  const formatVal = (val: number) => {
    if (activeTab === "Year" && val >= 1000) {
      return `${(val / 1000).toFixed(1)}k`;
    }
    return `${val}`;
  };

  return (
    <View style={styles.container}>

      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>
          {activeTab === "Day" && "Bookings (Month-To-date)"}
          {activeTab === "Month" && "Bookings (Year-to-date)"}
          {activeTab === "Year" && "Bookings (Yearwise)"}
        </Text>
        <View style={styles.tabContainer}>
          {["Day", "Month", "Year"].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.tabText, activeTab === tab && styles.activeTabText]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>


      <View style={styles.chartWrapper}>

        <View style={styles.gridLinesContainer}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={styles.gridLine} />
          ))}
        </View>

        {/* Grouped Vertical Bar Chart */}
        <View style={styles.barsArea}>
          {activeData.map((item) => (
            <View key={item.day} style={styles.barGroupContainer}>
              <View style={styles.barsContainer}>
                {/* Online Bar */}
                <View style={styles.barWrapper}>
                  <Text style={styles.barValText}>{formatVal(item.online)}</Text>
                  <Animated.View
                    style={[
                      styles.bar,
                      {
                        backgroundColor: COLORS.blueOnline,
                        height: animValue.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, (item.online / maxVal) * maxBarHeight],
                        }),
                      },
                    ]}
                  />
                </View>

                {/* Offline Bar */}
                <View style={styles.barWrapper}>
                  <Text style={styles.barValText}>{formatVal(item.offline)}</Text>
                  <Animated.View
                    style={[
                      styles.bar,
                      {
                        backgroundColor: COLORS.greenOffline,
                        height: animValue.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, (item.offline / maxVal) * maxBarHeight],
                        }),
                      },
                    ]}
                  />
                </View>
              </View>
              <Text style={styles.xAxisLabel}>{item.day}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Summary Section below Chart */}
      <View style={styles.summaryContainer}>
        {/* Left Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryBadgeBlue}>
            <View style={styles.dotBlue} />
            <Text style={styles.summaryBadgeTextBlue}>Online</Text>
          </View>
          <Text style={styles.summaryValueText}>
            {activeTab === "Day" && "150 (75%)"}
            {activeTab === "Month" && "1,000 (75%)"}
            {activeTab === "Year" && "6,600 (75%)"}
          </Text>
          <Text style={styles.summaryLabelText}>Online Bookings</Text>
        </View>

        {/* Vertical Divider */}
        <View style={styles.verticalDivider} />

        {/* Right Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryBadgeGreen}>
            <View style={styles.dotGreen} />
            <Text style={styles.summaryBadgeTextGreen}>Offline</Text>
          </View>
          <Text style={styles.summaryValueText}>
            {activeTab === "Day" && "50 (25%)"}
            {activeTab === "Month" && "330 (25%)"}
            {activeTab === "Year" && "2,200 (25%)"}
          </Text>
          <Text style={styles.summaryLabelText}>Offline Bookings</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 4,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.textDark,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    padding: 3,
    borderRadius: 8,
  },
  tab: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  activeTab: {
    backgroundColor: COLORS.white,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  tabText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textMuted,
  },
  activeTabText: {
    color: "#0F172A",
    fontWeight: "700",
  },
  chartWrapper: {
    height: 185,
    justifyContent: "flex-end",
    position: "relative",
  },
  gridLinesContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 25,
    height: maxBarHeight,
    justifyContent: "space-between",
    zIndex: 1,
  },
  gridLine: {
    height: 1,
    backgroundColor: "#F1F5F9",
    width: "100%",
  },
  barsArea: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: "100%",
    zIndex: 2,
    paddingHorizontal: 5,
  },
  barGroupContainer: {
    alignItems: "center",
    flex: 1,
  },
  barsContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
    height: maxBarHeight + 20,
    justifyContent: "center",
  },
  barWrapper: {
    alignItems: "center",
    justifyContent: "flex-end",
  },
  barValText: {
    fontSize: 8,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 4,
  },
  bar: {
    width: 8,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  xAxisLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: "600",
    marginTop: 6,
  },
  summaryContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    borderRadius: 18,
    padding: 14,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  summaryCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 6,
  },
  verticalDivider: {
    width: 1,
    height: 48,
    backgroundColor: "#E2E8F0",
  },
  summaryBadgeBlue: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 6,
  },
  dotBlue: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.blueOnline,
    marginRight: 4,
  },
  summaryBadgeTextBlue: {
    fontSize: 10,
    color: "#1E40AF",
    fontWeight: "700",
  },
  summaryBadgeGreen: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 6,
  },
  dotGreen: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.greenOffline,
    marginRight: 4,
  },
  summaryBadgeTextGreen: {
    fontSize: 10,
    color: "#065F46",
    fontWeight: "700",
  },
  summaryValueText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  summaryLabelText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: "600",
    marginTop: 2,
  },
});