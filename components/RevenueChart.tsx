import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { Circle, Defs, LinearGradient, Stop, Svg } from "react-native-svg";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const COLORS = {
  white: "#FFFFFF",
  primary: "#F97316",
  primaryLight: "#FFEDD5",
  secondary: "#4D90E7", // Soft blue for contrast
  textDark: "#111827",
  textMuted: "#9CA3AF",
  surface: "#F8FAFC",
  border: "#E2E8F0",
};

const REVENUE_DATA = [4500, 7200, 3800, 9100, 5600, 8400, 10500];
const LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function RevenueChart() {
  const [focusIndex, setFocusIndex] = useState(REVENUE_DATA.length - 1);
  const totalRevenue = REVENUE_DATA.reduce((a, b) => a + b, 0);
  const maxVal = Math.max(...REVENUE_DATA);

  const handleDayPress = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFocusIndex(index);
  };

  return (
    <View style={styles.container}>
      {/* Premium Header with Segmented Control */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Revenue Insight</Text>
          <Text style={styles.subtitle}>Real-time earnings flow</Text>
        </View>
      </View>

      <View style={styles.mainVisual}>
        {/* Layered Hub */}
        <View style={styles.hubWrapper}>
          <Svg height="200" width="200" viewBox="0 0 100 100">
            <Defs>
              <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor={COLORS.primary} stopOpacity="1" />
                <Stop offset="1" stopColor="#FB923C" stopOpacity="1" />
              </LinearGradient>
            </Defs>
            {REVENUE_DATA.map((val, i) => (
              <DepthRing
                key={i}
                index={i}
                val={val}
                maxVal={maxVal}
                isFocused={focusIndex === i}
              />
            ))}
          </Svg>

          <View style={styles.centerDisplay}>
            <Text style={styles.centerDay}>
              {LABELS[focusIndex].toUpperCase()}
            </Text>
            <Text style={styles.centerValue}>
              ₹{REVENUE_DATA[focusIndex].toLocaleString()}
            </Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>Live</Text>
            </View>
          </View>
        </View>

        {/* Vertical Metric List */}
        <View style={styles.metricList}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Gross</Text>
            <Text style={styles.metricValue}>
              ₹{(totalRevenue / 1000).toFixed(1)}k
            </Text>
          </View>
          <View
            style={[
              styles.metricItem,
              { borderLeftWidth: 1, borderLeftColor: COLORS.border },
            ]}
          >
            <Text style={styles.metricLabel}>Avg/Day</Text>
            <Text style={styles.metricValue}>
              ₹{(totalRevenue / 7 / 1000).toFixed(1)}k
            </Text>
          </View>
        </View>
      </View>

      {/* Interactive Timeline Legend */}
      <View style={styles.timeline}>
        {LABELS.map((label, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => handleDayPress(i)}
            style={styles.timeStep}
          >
            <View
              style={[
                styles.stepIndicator,
                focusIndex === i
                  ? styles.stepActive
                  : { height: (REVENUE_DATA[i] / maxVal) * 15 + 4 },
              ]}
            />
            <Text
              style={[
                styles.stepText,
                focusIndex === i && styles.stepTextActive,
              ]}
            >
              {label[0]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function DepthRing({
  index,
  val,
  maxVal,
  isFocused,
}: {
  index: number;
  val: number;
  maxVal: number;
  isFocused: boolean;
}) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const radius = 42 - index * 5;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: (val / maxVal) * circumference,
      duration: 1200,
      delay: index * 80,
      useNativeDriver: true,
    }).start();
  }, [val]);

  return (
    <>
      <Circle
        cx="50"
        cy="50"
        r={radius}
        stroke={COLORS.surface}
        strokeWidth="3"
        fill="transparent"
      />
      <AnimatedCircle
        cx="50"
        cy="50"
        r={radius}
        stroke={isFocused ? "url(#grad)" : COLORS.border}
        strokeWidth={isFocused ? "4.5" : "2"}
        fill="transparent"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={Animated.subtract(circumference, animatedValue)}
        strokeLinecap="round"
        opacity={isFocused ? 1 : 0.3}
        transform={`rotate(-90 50 50)`}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 32,
    padding: 24,
    margin: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 30,
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.textDark,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  segmentedControl: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    padding: 4,
    borderRadius: 12,
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: COLORS.white,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  tabText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textMuted,
  },
  activeTabText: {
    color: COLORS.primary,
  },
  mainVisual: {
    alignItems: "center",
  },
  hubWrapper: {
    justifyContent: "center",
    alignItems: "center",
  },
  centerDisplay: {
    position: "absolute",
    alignItems: "center",
  },
  centerDay: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.textMuted,
    letterSpacing: 2,
  },
  centerValue: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.textDark,
    marginVertical: 2,
  },
  statusBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    color: "#166534",
    fontSize: 9,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  metricList: {
    flexDirection: "row",
    marginTop: 30,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    width: "100%",
  },
  metricItem: {
    flex: 1,
    padding: 15,
    alignItems: "center",
  },
  metricLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: "600",
  },
  metricValue: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textDark,
    marginTop: 4,
  },
  timeline: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 25,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.surface,
  },
  timeStep: {
    alignItems: "center",
    width: 35,
  },
  stepIndicator: {
    width: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    marginBottom: 8,
  },
  stepActive: {
    backgroundColor: COLORS.primary,
    width: 6,
    height: 20,
  },
  stepText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textMuted,
  },
  stepTextActive: {
    color: COLORS.textDark,
    fontWeight: "900",
  },
});
