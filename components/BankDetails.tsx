import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform, ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AlertPopUp, { AlertType } from "./AlertPopUp";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const COLORS = {
  background: "#F3F4F6",
  cardBg: "#FFFFFF",
  textPrimary: "#111827",
  textSecondary: "#6B7280",
  primaryBlue: "#2563EB",
  border: "#E5E7EB",
};

interface BankDetailsProps {
  profile: any;
  token: string | null;
  onUpdate: (updatedBankData: any) => void;
}

export default function BankDetails({ profile, token, onUpdate }: BankDetailsProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    bank_name: "",
    account_number: "",
    ifsc_code: "",
    account_holder_name: "",
    branch_name: ""
  });

  // Custom Alert State
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertType, setAlertType] = useState<AlertType>("info");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const showAlert = (type: AlertType, title: string, message: string) => {
    setAlertType(type);
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const openModal = () => {
    setForm({
      bank_name: profile?.host_attributes?.bank_name || "",
      account_number: profile?.host_attributes?.account_number || "",
      ifsc_code: profile?.host_attributes?.ifsc_code || "",
      account_holder_name: profile?.host_attributes?.account_holder_name || "",
      branch_name: profile?.host_attributes?.branch_name || ""
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.bank_name || !form.account_number || !form.ifsc_code) {
      showAlert("warning", "Missing Fields", "Bank name, account number, and IFSC code are required.");
      return;
    }
    setSaving(true);
    try {
      await axios.patch(`${API_BASE_URL}/api/host/auth/bank-details`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onUpdate(form);
      setModalVisible(false);
      showAlert("success", "Success", "Bank details updated successfully.");
    } catch (e: any) {
      // Enhanced error logging
      console.error("[BankDetails] Error updating bank details:");
      console.error(" - Message:", e.message);
      console.error(" - Data:", e.response?.data);
      console.error(" - Status:", e.response?.status);
      
      const msg = e.response?.data?.error || e.message;
      showAlert("error", "Failed to Update", msg);
    } finally {
      setSaving(false);
    }
  };

  const hasBankDetails = !!profile?.host_attributes?.account_number;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.groupTitle}>Bank Details</Text>
        {hasBankDetails && (
          <TouchableOpacity style={styles.editBtn} onPress={openModal}>
            <Ionicons name="pencil" size={14} color={COLORS.primaryBlue} />
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      {hasBankDetails ? (
        <LinearGradient
          colors={["#1E3A8A", "#2563EB", "#3B82F6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <View style={styles.cardTopRow}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="business" size={20} color="rgba(255,255,255,0.9)" style={{ marginRight: 8 }} />
              <Text style={styles.bankName}>{profile.host_attributes.bank_name}</Text>
            </View>
            <Ionicons name="wifi" size={20} color="rgba(255,255,255,0.7)" style={{ transform: [{ rotate: "90deg" }] }} />
          </View>

          <Text style={styles.cardNumber}>
            {`**** **** **** ${profile.host_attributes.account_number.slice(-4)}`}
          </Text>

          <View style={styles.cardFooter}>
            <View>
              <Text style={styles.cardLabel}>ACCOUNT HOLDER</Text>
              <Text style={styles.cardValue}>{(profile.host_attributes.account_holder_name || profile.full_name).toUpperCase()}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.cardLabel}>IFSC CODE</Text>
              <Text style={styles.cardValue}>{profile.host_attributes.ifsc_code.toUpperCase()}</Text>
            </View>
          </View>
        </LinearGradient>
      ) : (
        <TouchableOpacity style={styles.addBtn} onPress={openModal} activeOpacity={0.7}>
          <View style={styles.addIconWrap}>
            <Ionicons name="add" size={24} color={COLORS.primaryBlue} />
          </View>
          <View>
            <Text style={styles.addBtnTitle}>Add Bank Account</Text>
            <Text style={styles.addBtnSub}>Required for receiving payouts</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Bank Details Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <SafeAreaView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Bank Details</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ padding: 20 }}>
              <Text style={styles.inputLabel}>Bank Name</Text>
              <TextInput
                style={styles.input}
                value={form.bank_name}
                onChangeText={(val) => setForm(prev => ({ ...prev, bank_name: val }))}
                placeholder="e.g. State Bank of India"
              />
              <Text style={styles.inputLabel}>Account Holder Name</Text>
              <TextInput
                style={styles.input}
                value={form.account_holder_name}
                onChangeText={(val) => setForm(prev => ({ ...prev, account_holder_name: val }))}
                placeholder="e.g. John Doe"
              />
              <Text style={styles.inputLabel}>Account Number</Text>
              <TextInput
                style={styles.input}
                value={form.account_number}
                onChangeText={(val) => setForm(prev => ({ ...prev, account_number: val }))}
                placeholder="e.g. 1234567890"
                keyboardType="number-pad"
              />
              <Text style={styles.inputLabel}>IFSC Code</Text>
              <TextInput
                style={styles.input}
                value={form.ifsc_code}
                onChangeText={(val) => setForm(prev => ({ ...prev, ifsc_code: val }))}
                placeholder="e.g. SBIN0001234"
                autoCapitalize="characters"
              />
              <Text style={styles.inputLabel}>Branch Name</Text>
              <TextInput
                style={styles.input}
                value={form.branch_name}
                onChangeText={(val) => setForm(prev => ({ ...prev, branch_name: val }))}
                placeholder="e.g. Main Branch"
              />

              <TouchableOpacity style={styles.primaryBtn} onPress={handleSave} disabled={saving}>
                {saving ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.primaryBtnText}>Save Bank Details</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>

      <AlertPopUp
        visible={alertVisible}
        type={alertType}
        title={alertTitle}
        message={alertMessage}
        onDismiss={() => setAlertVisible(false)}
        onPrimary={() => setAlertVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(37, 99, 235, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  editBtnText: {
    color: COLORS.primaryBlue,
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 4,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    shadowColor: COLORS.primaryBlue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  bankName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  cardNumber: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 4,
    marginBottom: 24,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  cardLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 1,
    marginBottom: 4,
  },
  cardValue: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1,
  },
  addBtn: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: "rgba(37, 99, 235, 0.2)",
    borderStyle: "dashed",
    flexDirection: "row",
    alignItems: "center",
  },
  addIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(37, 99, 235, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  addBtnTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  addBtnSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.cardBg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  modalCloseBtn: {
    padding: 4,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.textPrimary,
    backgroundColor: "#F9FAFB",
    marginBottom: 16,
  },
  primaryBtn: {
    backgroundColor: COLORS.primaryBlue,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  primaryBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
