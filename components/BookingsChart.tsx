import React, { useEffect, useRef, useState } from "react";

import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";


const BOOKING_DATA: any = {
  Day: {
    vals: [4, 7, 3, 8, 5, 9, 6],
    labels: ["M", "T", "W", "T", "F", "S", "S"],
    subtitle: "Daily Volume",
  },
  Week: {
    vals: [35, 42, 38, 48],
    labels: ["W1", "W2", "W3", "W4"],
    subtitle: "Weekly Volume",
  },
  Month: {
    vals: [80, 95, 70, 110, 130, 120],
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    subtitle: "Monthly Volume",
  },
};

const COLORS = {
  primaryBlue: "#003399",
  accentBlue: "#E0E7FF",
  white: "#FFFFFF",
  textMain: "#1F2937",
  textSubtle: "#6B7280",
  bgSubtle: "#F3F4F6",
  gridLine: "#F1F5F9",
};

export default function BookingsChart() {
  const [filter, setFilter] = useState("Day");
  
  const current = BOOKING_DATA[filter];
  
  const totalBookings = current.vals.reduce((a: number, b: number) => a + b, 0);

  return (
    <View style={styles.analyticsCard}>
      <View style={styles.cardHeaderRow}>
        <View>
          <Text style={styles.cardTitle}>Bookings Trend</Text>
          <Text style={styles.cardSubtitle}>{current.subtitle}</Text>
        </View>

        <View style={styles.miniToggleContainer}>
          {["Day", "Week", "Month"].map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              style={[styles.miniToggle, filter === f && styles.miniToggleActive]}
            >
              <Text style={[styles.miniToggleText, filter === f && styles.miniToggleTextActive]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.summaryRow}>
         <View>
            <Text style={styles.summaryValue}>{totalBookings}</Text>
            <Text style={styles.summaryLabel}>Total Bookings</Text>
         </View>
         <View style={styles.badge}>
            <Text style={styles.badgeText}>+12.5%</Text>
         </View>
      </View>

      <View style={styles.chartContainer}>
        <View style={styles.gridLinesContainer}>
            <View style={styles.gridLine} />
            <View style={styles.gridLine} />
            <View style={styles.gridLine} />
        </View>

        <View style={styles.barChartContainer}>
          {current.vals.map((val: number, i: number) => (
            <AnimatedBar
              key={`${filter}-${i}`}
              val={val}
              height={val}
              maxVal={Math.max(...current.vals)}
              delay={i * 60}
              color={COLORS.primaryBlue}
            />
          ))}
        </View>
      </View>

      <View style={styles.barLabels}>
        {current.labels.map((label: string, i: number) => (
          <Text key={i} style={styles.barLabelText}>{label}</Text>
        ))}
      </View>
    </View>
  );
}

function AnimatedBar({ height, maxVal, delay, color, val }: any) {
  const barHeight = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    barHeight.setValue(0);
    opacity.setValue(0);
    Animated.parallel([
        Animated.spring(barHeight, {
            toValue: height,
            delay,
            useNativeDriver: false,
            tension: 30,
            friction: 8,
          }),
        Animated.timing(opacity, {
            toValue: 1,
            duration: 500,
            delay,
            useNativeDriver: true
        })
    ]).start();
  }, [height]);

  return (
    <View style={styles.barWrapper}>
      <Animated.Text style={[styles.valTooltip, { opacity }]}>{val}</Animated.Text>
      <Animated.View
        style={[
          styles.bar,
          {
            backgroundColor: color,
            height: barHeight.interpolate({
              inputRange: [0, maxVal],
              outputRange: [0, 100],
            }),
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  analyticsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.textMain,
    letterSpacing: -0.5,
  },
  cardSubtitle: {
    fontSize: 13,
    color: COLORS.textSubtle,
    marginTop: 2,
  },
  miniToggleContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.bgSubtle,
    borderRadius: 12,
    padding: 3,
  },
  miniToggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  miniToggleActive: {
    backgroundColor: COLORS.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  miniToggleText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textSubtle,
  },
  miniToggleTextActive: {
    color: COLORS.primaryBlue,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
    backgroundColor: '#F8FAFC',
    padding: 15,
    borderRadius: 16,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  summaryLabel: {
    fontSize: 12,
    color: COLORS.textSubtle,
    fontWeight: '600',
  },
  badge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    color: '#166534',
    fontSize: 12,
    fontWeight: '700',
  },
  chartContainer: {
    height: 130, // Increased to fit tooltips
    justifyContent: 'flex-end',
  },
  gridLinesContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    paddingVertical: 5,
    height: 100,
    top: 30,
  },
  gridLine: {
    height: 1,
    backgroundColor: COLORS.gridLine,
    width: '100%',
  },
  barChartContainer: {
    height: 130,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 5,
    zIndex: 2,
  },
  barWrapper: {
    height: "100%",
    justifyContent: "flex-end",
    width: 32,
    alignItems: "center",
  },
  valTooltip: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primaryBlue,
    marginBottom: 4,
  },
  bar: {
    width: 16,
    borderRadius: 6,
    opacity: 0.85, // Gives it a modern "soft" look
  },
  barLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    paddingHorizontal: 5,
  },
  barLabelText: {
    fontSize: 11,
    color: COLORS.textSubtle,
    fontWeight: "700",
  },
});