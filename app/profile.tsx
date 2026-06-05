import { useAuth } from "@/provider/AuthProvider";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Modal,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import BankDetails from "../components/BankDetails";
import Header from "../components/Header";

const { width } = Dimensions.get("window");
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// Professional modern color palette
const COLORS = {
  background: "#F8FAFC",
  cardBg: "#FFFFFF",
  textPrimary: "#0F172A",
  textSecondary: "#64748B",
  primary: "#3B82F6",
  primaryLight: "#EFF6FF",
  border: "#E2E8F0",
  danger: "#EF4444",
  dangerBg: "#FEF2F2",
  warning: "#F59E0B",
  warningBg: "#FFFBEB",
  success: "#10B981",
  successBg: "#ECFDF5",
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
    bank_name?: string | null;
    account_number?: string | null;
    ifsc_code?: string | null;
    account_holder_name?: string | null;
    branch_name?: string | null;
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
  const slideAnim = useRef(new Animated.Value(20)).current;

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/host/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(response.data.user);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        })
      ]).start();
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
    if (status === "Verified") return { color: COLORS.success, bg: COLORS.successBg, text: "Verified", icon: "checkmark-circle" };
    if (status === "Pending") return { color: COLORS.warning, bg: COLORS.warningBg, text: "Pending Review", icon: "time" };
    return { color: COLORS.danger, bg: COLORS.dangerBg, text: "Action Required", icon: "alert-circle" };
  };

  if (!token) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: COLORS.background }]}>
        <View style={styles.iconCircleLarge}>
          <Ionicons name="lock-closed" size={40} color={COLORS.primary} />
        </View>
        <Text style={styles.errorText}>Session Expired</Text>
        <Text style={styles.errorSubText}>Please log in again to access your secure profile.</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => { }} activeOpacity={0.8}>
          <Text style={styles.primaryBtnText}>Log In Securely</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Subtle Background Gradient Header */}
      <LinearGradient
        colors={[COLORS.primaryLight, COLORS.background]}
        style={styles.headerBackground}
      />

      <SafeAreaView style={styles.safeArea}>
        <Header />

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={[styles.loadingText, { color: COLORS.textSecondary }]}>Loading your profile...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <View style={[styles.iconCircleLarge, { backgroundColor: COLORS.dangerBg }]}>
              <Ionicons name="cloud-offline" size={40} color={COLORS.danger} />
            </View>
            <Text style={[styles.errorText, { color: COLORS.textPrimary }]}>Connection Error</Text>
            <Text style={[styles.errorSubText, { color: COLORS.textSecondary }]}>{error}</Text>
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: COLORS.primary }]} onPress={fetchProfile} activeOpacity={0.8}>
              <Text style={[styles.primaryBtnText, { color: COLORS.cardBg }]}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : profile ? (
          <Animated.ScrollView
            style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Top Profile Summary Card */}
            <View style={styles.profileCard}>
              <View style={styles.avatarContainer}>
                <Image source={getAvatarSource()} style={styles.avatar} />
                <View style={[styles.activeIndicator, { backgroundColor: profile.is_active ? COLORS.success : COLORS.textSecondary }]} />
              </View>

              <Text style={styles.userName}>{profile.full_name}</Text>
              <Text style={styles.userEmail}>{profile.email}</Text>

              <View style={styles.roleBadge}>
                <Ionicons name="shield-checkmark" size={14} color={COLORS.primary} style={{ marginRight: 4 }} />
                <Text style={styles.roleText}>{profile.user_type}</Text>
              </View>
            </View>

            {/* Quick Stats or Highlights */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <View style={[styles.iconCircle, { backgroundColor: COLORS.successBg }]}>
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                </View>
                <Text style={styles.statValue}>{profile.is_active ? "Active" : "Inactive"}</Text>
                <Text style={styles.statLabel}>Account Status</Text>
              </View>
              <View style={styles.statCard}>
                <View style={[styles.iconCircle, { backgroundColor: getKycStatus(profile.host_attributes?.kyc_verification_status).bg }]}>
                  <Ionicons name={getKycStatus(profile.host_attributes?.kyc_verification_status).icon as any} size={20} color={getKycStatus(profile.host_attributes?.kyc_verification_status).color} />
                </View>
                <Text style={styles.statValue} numberOfLines={1}>{getKycStatus(profile.host_attributes?.kyc_verification_status).text}</Text>
                <Text style={styles.statLabel}>KYC Status</Text>
              </View>
            </View>

            {/* Group: Personal Information */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              <View style={styles.cardGroup}>
                <InfoRow icon="call-outline" label="Phone Number" value={profile.phone || "Not Provided"} />
                <View style={styles.divider} />
                <InfoRow icon="calendar-outline" label="Age" value={profile.age ? `${profile.age} years` : "Not Provided"} />
              </View>
            </View>

            {/* Group: Verification (KYC) */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Verification & Security</Text>
              <View style={styles.cardGroup}>
                <InfoRow icon="document-text-outline" label="Document Type" value={profile.host_attributes?.kyc_document_type || "None"} />

                {profile.host_attributes?.kyc_document_image_url && (
                  <>
                    <View style={styles.divider} />
                    <TouchableOpacity
                      style={styles.actionRow}
                      onPress={() => setDocModalVisible(true)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.actionRowLeft}>
                        <View style={[styles.iconCircle, { backgroundColor: COLORS.primaryLight, marginRight: 12 }]}>
                          <Ionicons name="eye-outline" size={18} color={COLORS.primary} />
                        </View>
                        <Text style={styles.actionRowLabelPrimary}>View Uploaded Document</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                  </>
                )}
              </View>

              {profile.host_attributes?.kyc_rejection_reason && (
                <View style={styles.alertBox}>
                  <View style={styles.alertHeader}>
                    <Ionicons name="warning" size={20} color={COLORS.danger} style={{ marginRight: 8 }} />
                    <Text style={styles.alertTitle}>Verification Rejected</Text>
                  </View>
                  <Text style={styles.alertText}>{profile.host_attributes.kyc_rejection_reason}</Text>
                  <TouchableOpacity style={styles.alertAction}>
                    <Text style={styles.alertActionText}>Update Document</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Group: Bank Details */}
            <View style={styles.sectionContainer}>
              <BankDetails
                profile={profile}
                token={token}
                onUpdate={(updatedData) => {
                  setProfile((prev: any) => prev ? {
                    ...prev,
                    host_attributes: {
                      ...prev.host_attributes,
                      ...updatedData
                    }
                  } : prev);
                }}
              />
            </View>

            {/* Group: Settings */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Settings & Preferences</Text>
              <View style={styles.cardGroup}>
                <ActionRow icon="create-outline" label="Edit Profile Details" />
                <View style={styles.divider} />
                <ActionRow icon="notifications-outline" label="Notification Preferences" />
                <View style={styles.divider} />
                <ActionRow icon="lock-closed-outline" label="Change Password" />
              </View>
            </View>

            {/* Logout Button */}
            <TouchableOpacity style={styles.logoutBtn} onPress={() => { }} activeOpacity={0.8}>
              <Ionicons name="log-out-outline" size={20} color={COLORS.danger} style={{ marginRight: 8 }} />
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
                        <View style={styles.closeIconBg}>
                          <Ionicons name="close" size={20} color={COLORS.textPrimary} />
                        </View>
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
      </SafeAreaView>
    </View>
  );
}

// Reusable Components
const InfoRow = ({ label, value, icon }: { label: string; value: string; icon: any }) => (
  <View style={styles.row}>
    <View style={styles.rowLeft}>
      <View style={[styles.iconCircle, { backgroundColor: COLORS.background, marginRight: 12 }]}>
        <Ionicons name={icon} size={18} color={COLORS.textSecondary} />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
    </View>
    <Text style={styles.rowValue}>{value}</Text>
  </View>
);

const ActionRow = ({ label, icon }: { label: string; icon: any }) => (
  <TouchableOpacity style={styles.actionRow} activeOpacity={0.7}>
    <View style={styles.actionRowLeft}>
      <View style={[styles.iconCircle, { backgroundColor: COLORS.background, marginRight: 12 }]}>
        <Ionicons name={icon} size={18} color={COLORS.textSecondary} />
      </View>
      <Text style={styles.actionRowLabel}>{label}</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color={COLORS.border} />
  </TouchableOpacity>
);

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
  },
  headerBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 250,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  // Header Profile Card
  profileCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
    marginBottom: 20,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: COLORS.cardBg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  activeIndicator: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: COLORS.cardBg,
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.primary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Stats Row
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  statValue: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginTop: 12,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },

  // Sections
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textPrimary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginLeft: 8,
    marginBottom: 12,
  },
  cardGroup: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
    overflow: "hidden",
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 56, // Align with text past the icon
  },

  // Rows
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: COLORS.textPrimary,
  },
  rowValue: {
    fontSize: 15,
    color: COLORS.textSecondary,
    fontWeight: "400",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  actionRowLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionRowLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: COLORS.textPrimary,
  },
  actionRowLabelPrimary: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.primary,
  },

  // UI Elements
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  iconCircleLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },

  // Alerts
  alertBox: {
    marginTop: 16,
    backgroundColor: COLORS.dangerBg,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  alertHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.danger,
  },
  alertText: {
    fontSize: 14,
    color: COLORS.danger,
    lineHeight: 20,
    opacity: 0.9,
    marginBottom: 12,
  },
  alertAction: {
    alignSelf: "flex-start",
    backgroundColor: "#FCA5A5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  alertActionText: {
    color: COLORS.dangerBg,
    fontWeight: "600",
    fontSize: 13,
  },

  // Buttons
  primaryBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryBtnText: {
    color: COLORS.cardBg,
    fontWeight: "700",
    fontSize: 16,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.dangerBg,
    paddingVertical: 16,
    borderRadius: 20,
    marginTop: 8,
  },
  logoutBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.danger,
  },

  // Typography
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    fontWeight: "500",
  },
  errorText: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
  },
  errorSubText: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
  },
  versionText: {
    textAlign: "center",
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 32,
    marginBottom: 16,
    fontWeight: "500",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.9)",
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
    backgroundColor: "transparent",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.cardBg,
  },
  modalCloseBtn: {
    padding: 4,
  },
  closeIconBg: {
    backgroundColor: COLORS.cardBg,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  modalImageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalImage: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },
});
