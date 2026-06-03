import { useAuth } from "@/provider/AuthProvider";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  Modal,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Header from "../components/Header";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// Professional minimal color palette
const COLORS = {
  background: "#F3F4F6", // Light gray background for contrast
  cardBg: "#FFFFFF",
  textPrimary: "#111827",
  textSecondary: "#6B7280",
  primaryBlue: "#2563EB",
  border: "#E5E7EB",
  danger: "#DC2626",
  dangerBg: "#FEF2F2",
  warning: "#D97706",
  warningBg: "#FEF3C7",
  success: "#059669",
  successBg: "#D1FAE5",
};

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  age: number;
  user_type: string;
  is_active: boolean;
  host_attributes?: {
    image_url: string | null;
    kyc_document_image_url: string | null;
    kyc_document_type: string | null;
    kyc_rejection_reason: string | null;
    kyc_verification_status: string;
  };
}

export default function Profile() {
  const { token } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state for viewing KYC document
  const [docModalVisible, setDocModalVisible] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/host/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(response.data.user);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    } catch (err: any) {
      setError(
        err?.response?.data?.error || err.message || "Failed to load profile."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const getAvatarSource = () => {
    if (profile?.host_attributes?.image_url) {
      return { uri: `${API_BASE_URL}${profile.host_attributes.image_url}` };
    }
    return require("../assets/img/logo.png");
  };

  const getKycStatus = (status?: string) => {
    if (status === "Verified") return { color: COLORS.success, bg: COLORS.successBg, text: "Verified" };
    if (status === "Pending") return { color: COLORS.warning, bg: COLORS.warningBg, text: "Pending Review" };
    return { color: COLORS.danger, bg: COLORS.dangerBg, text: "Action Required" };
  };

  if (!token) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: COLORS.background }]}>
        <Ionicons name="lock-closed" size={48} color={COLORS.textSecondary} />
        <Text style={styles.errorText}>Session Expired</Text>
        <Text style={styles.errorSubText}>Please log in again to access your profile.</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => { }} activeOpacity={0.8}>
          <Text style={styles.primaryBtnText}>Log In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.cardBg} />
      <Header />

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="small" color={COLORS.primaryBlue} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle" size={48} color={COLORS.danger} />
          <Text style={styles.errorText}>Connection Error</Text>
          <Text style={styles.errorSubText}>{error}</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={fetchProfile} activeOpacity={0.8}>
            <Text style={styles.primaryBtnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : profile ? (
        <Animated.ScrollView
          style={{ opacity: fadeAnim }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Profile Summary */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarWrapper}>
              <Image source={getAvatarSource()} style={styles.avatar} />
              <View style={[styles.statusIndicator, { backgroundColor: profile.is_active ? COLORS.success : COLORS.textSecondary }]} />
            </View>
            <Text style={styles.userName}>{profile.full_name}</Text>
            <Text style={styles.userEmail}>{profile.email}</Text>

            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{profile.user_type}</Text>
            </View>
          </View>

          {/* Group: Personal Information */}
          <Text style={styles.groupTitle}>Personal Information</Text>
          <View style={styles.cardGroup}>
            <InfoRow label="Phone Number" value={profile.phone || "Not Provided"} />
            <View style={styles.divider} />
            <InfoRow label="Age" value={profile.age ? `${profile.age}` : "Not Provided"} />
            <View style={styles.divider} />
            <InfoRow label="Account Status" value={profile.is_active ? "Active" : "Inactive"} valueColor={profile.is_active ? COLORS.success : COLORS.textSecondary} />
          </View>

          {/* Group: Verification (KYC) */}
          <Text style={styles.groupTitle}>Verification & Security</Text>
          <View style={styles.cardGroup}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>KYC Status</Text>
              <View style={[styles.statusPill, { backgroundColor: getKycStatus(profile.host_attributes?.kyc_verification_status).bg }]}>
                <Text style={[styles.statusPillText, { color: getKycStatus(profile.host_attributes?.kyc_verification_status).color }]}>
                  {getKycStatus(profile.host_attributes?.kyc_verification_status).text}
                </Text>
              </View>
            </View>
            <View style={styles.divider} />
            <InfoRow label="Document Type" value={profile.host_attributes?.kyc_document_type || "None"} />

            {profile.host_attributes?.kyc_document_image_url && (
              <>
                <View style={styles.divider} />
                <TouchableOpacity
                  style={[styles.row, { paddingVertical: 14 }]}
                  onPress={() => setDocModalVisible(true)}
                  activeOpacity={0.6}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Ionicons name="document-text-outline" size={20} color={COLORS.primaryBlue} style={{ marginRight: 8 }} />
                    <Text style={[styles.rowLabel, { color: COLORS.primaryBlue, fontWeight: "500" }]}>View Uploaded Document</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </>
            )}
          </View>


          {profile.host_attributes?.kyc_rejection_reason && (
            <View style={styles.alertBox}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                <Ionicons name="warning" size={18} color={COLORS.danger} style={{ marginRight: 6 }} />
                <Text style={styles.alertTitle}>Verification Rejected</Text>
              </View>
              <Text style={styles.alertText}>{profile.host_attributes.kyc_rejection_reason}</Text>
            </View>
          )}

          {/* Group: Settings */}
          <Text style={styles.groupTitle}>Settings</Text>
          <View style={styles.cardGroup}>
            <ActionRow label="Edit Profile Details" icon="create-outline" />
            <View style={styles.divider} />
            <ActionRow label="Notification Preferences" icon="notifications-outline" />
            <View style={styles.divider} />
            <ActionRow label="Change Password" icon="lock-closed-outline" />
          </View>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutBtn} onPress={() => { }} activeOpacity={0.7}>
            <Text style={styles.logoutBtnText}>Log Out</Text>
          </TouchableOpacity>

          <Text style={styles.versionText}>App Version 1.0.0</Text>

          {/* Document Viewer Modal */}
          {profile.host_attributes?.kyc_document_image_url && (
            <Modal
              visible={docModalVisible}
              transparent={true}
              animationType="fade"
              onRequestClose={() => setDocModalVisible(false)}
            >
              <View style={styles.modalOverlay}>
                <SafeAreaView style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>{profile.host_attributes.kyc_document_type} Document</Text>
                    <TouchableOpacity onPress={() => setDocModalVisible(false)} style={styles.modalCloseBtn}>
                      <Ionicons name="close" size={24} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.modalImageContainer}>
                    <Image
                      source={{ uri: `${API_BASE_URL}${profile.host_attributes.kyc_document_image_url}` }}
                      style={styles.modalImage}
                      resizeMode="contain"
                    />
                  </View>
                </SafeAreaView>
              </View>
            </Modal>
          )}

        </Animated.ScrollView>
      ) : null}
    </View>
  );
}

// Reusable Components
const InfoRow = ({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={[styles.rowValue, valueColor ? { color: valueColor } : {}]}>{value}</Text>
  </View>
);

const ActionRow = ({ label, icon }: { label: string; icon: any }) => (
  <TouchableOpacity style={styles.actionRow} activeOpacity={0.6}>
    <View style={styles.actionRowLeft}>
      <Ionicons name={icon} size={20} color={COLORS.textSecondary} style={{ marginRight: 12 }} />
      <Text style={styles.actionRowLabel}>{label}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
  </TouchableOpacity>
);

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    color: COLORS.textPrimary,
    fontWeight: "600",
  },
  errorSubText: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 24,
  },
  primaryBtn: {
    backgroundColor: COLORS.primaryBlue,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  primaryBtnText: {
    color: COLORS.cardBg,
    fontWeight: "600",
    fontSize: 15,
  },

  // Profile Header
  profileHeader: {
    alignItems: "center",
    paddingVertical: 32,
    backgroundColor: COLORS.background,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.border,
  },
  statusIndicator: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 3,
    borderColor: COLORS.background,
  },
  userName: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  userEmail: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  roleBadge: {
    marginTop: 12,
    backgroundColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  roleText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textPrimary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Groups and Cards
  groupTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginLeft: 16,
    marginBottom: 8,
    marginTop: 24,
  },
  cardGroup: {
    backgroundColor: COLORS.cardBg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 16, // Indented divider like iOS
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: COLORS.cardBg,
  },
  rowLabel: {
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  rowValue: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: COLORS.cardBg,
  },
  actionRowLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionRowLabel: {
    fontSize: 15,
    color: COLORS.textPrimary,
  },

  // Pills and Alerts
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: "600",
  },
  alertBox: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: COLORS.dangerBg,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.danger,
  },
  alertText: {
    fontSize: 14,
    color: COLORS.danger,
    lineHeight: 20,
  },

  // Logout
  logoutBtn: {
    marginTop: 32,
    marginHorizontal: 16,
    backgroundColor: COLORS.cardBg,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },
  logoutBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.danger,
  },

  versionText: {
    textAlign: "center",
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 24,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
  },
  modalContent: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.cardBg,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalImageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalImage: {
    width: "100%",
    height: "100%",
  },
});
