import React, { useMemo } from "react";

import { Platform, StyleSheet, Text, View } from "react-native";

const OccupancyCard = ({
  title = "Wellness Center",
  current = 42,
  max = 60,
  lastUpdated = "2m ago",
}) => {
  const { percentage, status, colors } = useMemo(() => {

    const ratio = Math.min(current / max, 1);
    
    const pct = Math.round(ratio * 100);

    if (ratio > 0.85)
      return {
        percentage: pct,
        status: "Crowded",
        colors: ["#FF5F6D", "#FFC371"],
      };
    if (ratio > 0.6)
      return {
        percentage: pct,
        status: "Balanced",
        colors: ["#FFB75E", "#ED8F03"],
      };
    return {
      percentage: pct,
      status: "Plentiful Space",
      colors: ["#00b09b", "#96c93d"],
    };
  }, [current, max]);

  return (
    <View style={styles.card}>
      {/* Background Accent Blur (Optional visual fluff) */}
      <View
        style={[
          styles.accentCircle,
          { backgroundColor: colors[0], opacity: 0.05 },
        ]}
      />

      <View style={styles.topRow}>
        <View>
          <Text style={styles.titleText}>{title}</Text>
          <Text style={styles.statusLabel}>{status}</Text>
        </View>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{lastUpdated}</Text>
        </View>
      </View>

      <View style={styles.mainInfo}>
        <View style={styles.counterContainer}>
          <Text style={styles.currentText}>{current}</Text>
          <Text style={styles.totalText}>/ {max}</Text>
        </View>
        <View style={styles.percentBadge}>
          <Text style={styles.percentBadgeText}>{percentage}%</Text>
        </View>
      </View>

      {/* Modern Progress Bar */}
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${percentage}%`, backgroundColor: colors[0] },
          ]}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.capacityMessage}>
          {percentage > 90 ? "Expect a wait time" : "Ready for your workout"}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 20,
    marginVertical: 10,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  accentCircle: {
    position: "absolute",
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  titleText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1A1C1E",
    letterSpacing: -0.5,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6C727A",
    marginTop: 2,
  },
  timeContainer: {
    backgroundColor: "#F3F5F7",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  timeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#9CA3AF",
  },
  mainInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  counterContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  currentText: {
    fontSize: 42,
    fontWeight: "900",
    color: "#1A1C1E",
    letterSpacing: -1,
  },
  totalText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ADB5BD",
    marginLeft: 4,
  },
  percentBadge: {
    backgroundColor: "#1A1C1E",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  percentBadgeText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "800",
  },
  progressTrack: {
    height: 12,
    backgroundColor: "#F1F3F5",
    borderRadius: 10,
    width: "100%",
    marginBottom: 16,
  },
  progressFill: {
    height: "100%",
    borderRadius: 10,
    // Note: Use LinearGradient here for even more "beauty"
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
  },
  capacityMessage: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6C727A",
  },
});

export default OccupancyCard;
