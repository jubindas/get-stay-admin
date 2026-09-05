import Header from "@/components/Header";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const COLORS = {
  primary: "#4338CA",
  surface: "#FFFFFF",
  background: "#F8FAFC",
  textMain: "#1E293B",
  textSubtle: "#64748B",
  border: "#E2E8F0",
  success: "#10B981",
};

export default function RaiseTicketScreen() {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!subject.trim() || !description.trim()) {
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <Header />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {submitted ? (
            <View style={styles.successContainer}>
              <View style={styles.successIconWrapper}>
                <Ionicons name="checkmark-circle" size={80} color={COLORS.success} />
              </View>
              <Text style={styles.successTitle}>Ticket Submitted!</Text>
              <Text style={styles.successText}>
                Our support team has received your query and will get back to you shortly.
              </Text>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => router.back()}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>Back to Dashboard</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.formContainer}>
              <Text style={styles.pageDescription}>
                Need help? Describe your issue or query below, and we'll resolve it as soon as possible.
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Subject</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Issue with booking rates"
                  placeholderTextColor="#94A3B8"
                  value={subject}
                  onChangeText={setSubject}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Please describe your query in detail..."
                  placeholderTextColor="#94A3B8"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  textAlignVertical="top"
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  (!subject.trim() || !description.trim()) && styles.buttonDisabled
                ]}
                onPress={handleSubmit}
                disabled={!subject.trim() || !description.trim() || isSubmitting}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>
                  {isSubmitting ? "Submitting..." : "Submit Ticket"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.background,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textMain,
  },
  headerRight: {
    width: 40,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  formContainer: {
    flex: 1,
  },
  pageDescription: {
    fontSize: 15,
    color: COLORS.textSubtle,
    lineHeight: 22,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textMain,
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.textMain,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  textArea: {
    height: 160,
    paddingTop: 16,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: "#A5B4FC",
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  successContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  successIconWrapper: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.textMain,
    marginBottom: 12,
  },
  successText: {
    fontSize: 15,
    color: COLORS.textSubtle,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
});
