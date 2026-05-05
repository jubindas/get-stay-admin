import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const COLORS = {
  bgLight: "#F8FAFC",
  bgUserSection: "#F1F5F9",
  textMain: "#1A202C",
  textSubtle: "#718096",
  primaryBlue: "#003399",
  teal: "#38B2AC",
  activeIndicator: "#3B82F6",
  white: "#FFFFFF",
  border: "#E2E8F0",
  cardBg: "#FFFFFF",
  danger: "#DC2626",
  dangerSoft: "#FEF2F2",
  tealSoft: "#E6FFFA",
  blueSoft: "#EBF5FF",
  online: "#22C55E",
};

export default function Profile() {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Hero Header ── */}
      <View style={styles.heroSection}>
        {/* Background decoration */}
        <View style={styles.heroBg} />
        <View style={styles.heroBgCircle1} />
        <View style={styles.heroBgCircle2} />

        {/* Avatar */}
        <View style={styles.avatarOuterRing}>
          <View style={styles.avatarInnerRing}>
            <Image
              source={require("../assets/img/logo.png")}
              style={styles.avatar}
            />
          </View>
        </View>

        {/* Online badge */}
        <View style={styles.onlineBadge}>
          <View style={styles.onlineDot} />
          <Text style={styles.onlineText}>Active</Text>
        </View>

        <Text style={styles.heroName}>Zubeens Hotel</Text>
        <Text style={styles.heroRole}>Hotel Owner · Assam, India</Text>
      </View>

      {/* ── Stats Strip ── */}
      <View style={styles.statsStrip}>
        <StatBox
          title="Rooms"
          value="24"
          icon="bed-outline"
          color={COLORS.primaryBlue}
          soft={COLORS.blueSoft}
        />
        <View style={styles.statDivider} />
        <StatBox
          title="Bookings"
          value="132"
          icon="calendar-outline"
          color={COLORS.teal}
          soft={COLORS.tealSoft}
        />
        <View style={styles.statDivider} />
        <StatBox
          title="Revenue"
          value="₹1.2L"
          icon="cash-outline"
          color={COLORS.activeIndicator}
          soft="#EFF6FF"
        />
      </View>

      {/* ── Section Title ── */}
      <Text style={styles.sectionTitle}>Hotel Information</Text>

      {/* ── Info Card ── */}
      <View style={styles.infoCard}>
        <InfoRow
          icon="business-outline"
          label="Hotel Name"
          value="Zubeens Hotel"
          isLast={false}
        />
        <InfoRow
          icon="location-outline"
          label="Location"
          value="Assam, India"
          isLast={false}
        />
        <InfoRow
          icon="mail-outline"
          label="Email"
          value="hotel@email.com"
          isLast={false}
        />
        <InfoRow
          icon="call-outline"
          label="Phone"
          value="+91 9876543210"
          isLast={true}
        />
      </View>

      {/* ── Actions ── */}
      <Text style={styles.sectionTitle}>Account</Text>
      <View style={styles.actionsCard}>
        <ActionRow
          icon="create-outline"
          label="Edit Profile"
          sublabel="Update your hotel details"
          iconColor={COLORS.primaryBlue}
          iconBg={COLORS.blueSoft}
          showChevron
          isLast={false}
        />
        <ActionRow
          icon="notifications-outline"
          label="Notifications"
          sublabel="Manage alerts & preferences"
          iconColor={COLORS.teal}
          iconBg={COLORS.tealSoft}
          showChevron
          isLast={false}
        />
        <ActionRow
          icon="shield-checkmark-outline"
          label="Privacy & Security"
          sublabel="Password, 2FA settings"
          iconColor={COLORS.activeIndicator}
          iconBg="#EFF6FF"
          showChevron
          isLast={true}
        />
      </View>

      {/* ── Logout ── */}
      <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.8}>
        <View style={styles.logoutIconWrap}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
        </View>
        <Text style={styles.logoutText}>Log Out</Text>
        <Ionicons
          name="chevron-forward"
          size={16}
          color={COLORS.danger}
          style={{ marginLeft: "auto" }}
        />
      </TouchableOpacity>

      <Text style={styles.version}>GetStay v1.0.0</Text>
    </ScrollView>
  );
}

/* ── Sub-components ── */

const InfoRow = ({ icon, label, value, isLast }: any) => (
  <View style={[styles.infoRow, !isLast && styles.infoRowBorder]}>
    <View style={styles.infoIconWrap}>
      <Ionicons name={icon} size={17} color={COLORS.primaryBlue} />
    </View>
    <View style={styles.infoTextWrap}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

const StatBox = ({ title, value, icon, color, soft }: any) => (
  <View style={styles.statBox}>
    <View style={[styles.statIconWrap, { backgroundColor: soft }]}>
      <Ionicons name={icon} size={18} color={color} />
    </View>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statTitle}>{title}</Text>
  </View>
);

const ActionRow = ({
  icon,
  label,
  sublabel,
  iconColor,
  iconBg,
  showChevron,
  isLast,
}: any) => (
  <TouchableOpacity
    style={[styles.actionRow, !isLast && styles.infoRowBorder]}
    activeOpacity={0.7}
  >
    <View style={[styles.actionIconWrap, { backgroundColor: iconBg }]}>
      <Ionicons name={icon} size={19} color={iconColor} />
    </View>
    <View style={styles.actionText}>
      <Text style={styles.actionLabel}>{label}</Text>
      <Text style={styles.actionSublabel}>{sublabel}</Text>
    </View>
    {showChevron && (
      <Ionicons name="chevron-forward" size={16} color={COLORS.textSubtle} />
    )}
  </TouchableOpacity>
);

/* ── Styles ── */

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: COLORS.bgLight,
  },
  container: {
    paddingBottom: 40,
  },

  /* ── Hero ── */
  heroSection: {
    alignItems: "center",
    paddingTop: 48,
    paddingBottom: 32,
    marginBottom: 0,
    overflow: "hidden",
    position: "relative",
    backgroundColor: COLORS.white,
  },
  heroBg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 110,
    backgroundColor: COLORS.primaryBlue,
  },
  heroBgCircle1: {
    position: "absolute",
    top: -30,
    right: -30,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "rgba(56,178,172,0.18)",
  },
  heroBgCircle2: {
    position: "absolute",
    top: 20,
    left: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  avatarOuterRing: {
    padding: 4,
    borderRadius: 58,
    backgroundColor: COLORS.white,
    shadowColor: COLORS.primaryBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
    marginTop: 16,
  },
  avatarInnerRing: {
    padding: 3,
    borderRadius: 52,
    borderWidth: 2.5,
    borderColor: COLORS.teal,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
  },
  onlineBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    marginTop: 12,
    gap: 5,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.online,
  },
  onlineText: {
    fontSize: 11,
    color: "#16A34A",
    fontWeight: "600",
  },
  heroName: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.textMain,
    marginTop: 10,
    letterSpacing: 0.3,
  },
  heroRole: {
    fontSize: 13,
    color: COLORS.textSubtle,
    fontWeight: "500",
    marginTop: 3,
  },

  /* ── Stats Strip ── */
  statsStrip: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginVertical: 4,
  },
  statIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  statValue: {
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  statTitle: {
    fontSize: 11,
    color: COLORS.textSubtle,
    fontWeight: "500",
  },

  /* ── Section Title ── */
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textSubtle,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginTop: 24,
    marginBottom: 8,
    paddingHorizontal: 20,
  },

  /* ── Info Card ── */
  infoCard: {
    backgroundColor: COLORS.cardBg,
    marginHorizontal: 16,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 12,
  },
  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.blueSoft,
    justifyContent: "center",
    alignItems: "center",
  },
  infoTextWrap: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: COLORS.textSubtle,
    fontWeight: "500",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textMain,
  },

  actionsCard: {
    backgroundColor: COLORS.cardBg,
    marginHorizontal: 16,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    gap: 12,
  },
  actionIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  actionText: {
    flex: 1,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textMain,
  },
  actionSublabel: {
    fontSize: 12,
    color: COLORS.textSubtle,
    marginTop: 1,
  },

  /* ── Logout ── */
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cardBg,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#FECACA",
    gap: 12,
  },
  logoutIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: COLORS.dangerSoft,
    justifyContent: "center",
    alignItems: "center",
  },
  logoutText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.danger,
  },

  version: {
    textAlign: "center",
    fontSize: 11,
    color: COLORS.textSubtle,
    marginTop: 28,
    letterSpacing: 0.5,
  },
});
