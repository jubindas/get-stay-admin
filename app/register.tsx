/* eslint-disable import/no-named-as-default-member */
import axios from "axios";

import * as ImagePicker from "expo-image-picker";

import { router } from "expo-router";

import React, { useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Premium, Minimalist Design Tokens
const ACCENT = "#6366F1"; // Modern Indigo Accent
const ACCENT_LIGHT = "#EEF2FF";
const BRAND = "#4F46E5";
const BG = "#FAF9F6"; // Sophisticated Off-White/Alabaster
const SURFACE = "#FFFFFF";
const BORDER = "#E2E8F0";
const TEXT_DARK = "#0B132B"; // High-contrast Deep Slate
const TEXT_MID = "#4A5568";
const TEXT_LIGHT = "#94A3B8";
const ERROR_COLOR = "#F43F5E"; // Vibrant Rose/Crimson

type DocumentType =
  | "Passport"
  | "National ID"
  | "Driver's License"
  | "Voter ID"
  | "Residence Permit"
  | "Tax ID"
  | "";

interface FormState {
  full_name: string;
  email: string;
  password: string;
  confirmPassword: string;
  age: string;
  phone: string;
  document_type: DocumentType;
  image: ImagePicker.ImagePickerAsset | null;
  document: ImagePicker.ImagePickerAsset | null;
}

interface FieldError {
  full_name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  age?: string;
  phone?: string;
  document_type?: string;
}

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const DOCUMENT_TYPES: DocumentType[] = [
  "Passport",
  "National ID",
  "Driver's License",
  "Voter ID",
  "Residence Permit",
  "Tax ID",
];

const validate = (form: FormState): FieldError => {
  const errors: FieldError = {};
  if (!form.full_name.trim()) errors.full_name = "Full name is required";
  if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
    errors.email = "Enter a valid email";
  if (form.password.length < 8)
    errors.password = "Password must be at least 8 characters";
  if (form.password !== form.confirmPassword)
    errors.confirmPassword = "Passwords do not match";
  if (!form.age || isNaN(Number(form.age)) || Number(form.age) < 18)
    errors.age = "Must be 18 or older";
  if (!form.phone.match(/^\+?[\d\s\-]{7,15}$/))
    errors.phone = "Enter a valid phone number";
  if (!form.document_type) errors.document_type = "Select a document type";
  return errors;
};

const buildFormData = (form: FormState): FormData => {
  const data = new FormData();
  data.append("full_name", form.full_name.trim());
  data.append("email", form.email.trim().toLowerCase());
  data.append("password", form.password);
  data.append("age", form.age);
  data.append("phone", form.phone);
  data.append("document_type", form.document_type);

  if (form.image) {
    data.append("image", {
      uri: form.image.uri,
      name: form.image.fileName ?? "profile.jpg",
      type: form.image.mimeType ?? "image/jpeg",
    } as unknown as Blob);
  }

  if (form.document) {
    data.append("document", {
      uri: form.document.uri,
      name: form.document.fileName ?? "kyc_document.jpg",
      type: form.document.mimeType ?? "image/jpeg",
    } as unknown as Blob);
  }

  return data;
};

const SectionLabel = ({ label }: { label: string }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionLabel}>{label}</Text>
    <View style={styles.sectionLine} />
  </View>
);

const Field = ({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) => (
  <View style={styles.fieldWrapper}>
    <Text style={styles.label}>{label}</Text>
    {children}
    {error ? <Text style={styles.errorText}>{error}</Text> : null}
  </View>
);

const StyledInput = ({
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  hasError,
  onFocus,
  onBlur,
  isFocused,
  rightElement,
}: {
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "phone-pad" | "numeric";
  hasError?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  isFocused?: boolean;
  rightElement?: React.ReactNode;
}) => (
  <View
    style={[
      styles.inputContainer,
      hasError && styles.inputError,
      !hasError && isFocused && styles.inputFocused,
    ]}
  >
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={TEXT_LIGHT}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType ?? "default"}
      autoCapitalize="none"
      onFocus={onFocus}
      onBlur={onBlur}
    />
    {rightElement && (
      <View style={styles.rightElementContainer}>{rightElement}</View>
    )}
  </View>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export default function RegisterScreen() {
  const [form, setForm] = useState<FormState>({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    age: "",
    phone: "",
    document_type: "",
    image: null,
    document: null,
  });
  const [errors, setErrors] = useState<FieldError>({});
  const [loading, setLoading] = useState(false);

  // States for dynamic UI behavior
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const update = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const pickImage = async (field: "image" | "document") => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Please allow access to your photo library.",
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: field === "image",
      aspect: field === "image" ? [1, 1] : undefined,
    });
    if (!result.canceled && result.assets?.[0]) {
      setForm((prev) => ({ ...prev, [field]: result.assets[0] }));
    }
  };

  const handleSubmit = async () => {
    const validationErrors = validate(form);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);

      Alert.alert(
        "Validation Error",
        "Please fill all required fields correctly.",
      );
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/host/auth/register`,
        buildFormData(form),
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 15000,
        },
      );

      console.log("the response", response.data);

      const { user } = response.data;

      Alert.alert(
        "Registration Successful 🎉",
        `Welcome ${user.full_name}! Your account has been created successfully.`,
        [
          {
            text: "Continue",
            onPress: () => {
              router.replace("/");
            },
          },
        ],
      );
    } catch (error) {
      console.log("Registration Error:", error);

      if (axios.isAxiosError(error)) {
        if (error.code === "ECONNABORTED") {
          Alert.alert(
            "Request Timed Out ⏱️",
            "The server took too long to respond. Please try again.",
          );
        }

        // Network error
        else if (error.message === "Network Error") {
          Alert.alert(
            "Connection Failed 🌐",
            "Unable to connect to the server.\n\nPlease check:\n• Internet connection\n• API URL\n• Backend server is running",
          );
        }

        // Server returned response
        else if (error.response) {
          const status = error.response.status;
          const message =
            error.response.data?.message || error.response.data?.error;

          if (status === 422) {
            Alert.alert("Validation Error", message);
          } else if (status === 401) {
            Alert.alert("Unauthorized", message);
          } else if (status === 500) {
            Alert.alert("Server Error", "Something went wrong on the server.");
          } else {
            Alert.alert(
              "Registration Failed",
              message || "Something went wrong.",
            );
          }
        }

        // Unknown axios error
        else {
          Alert.alert("Connection Error", "Could not connect to the server.");
        }
      } else {
        Alert.alert("Unexpected Error", "Something unexpected happened.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.eyebrowContainer}>
          <Text style={styles.eyebrow}>HOST PORTAL</Text>
        </View>
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>
          Fill in your details below to get started as a verified host.
        </Text>
      </View>

      <View style={styles.avatarSection}>
        <TouchableOpacity
          style={styles.avatarTouchable}
          onPress={() => pickImage("image")}
          activeOpacity={0.85}
        >
          {form.image ? (
            <Image source={{ uri: form.image.uri }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarIcon}>📸</Text>
            </View>
          )}
          <View style={styles.avatarBadge}>
            <Text style={styles.avatarBadgeText}>＋</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.avatarLabel}>Profile Photo</Text>
      </View>

      <SectionLabel label="Personal Information" />

      <Field label="Full Name" error={errors.full_name}>
        <StyledInput
          value={form.full_name}
          onChangeText={(v) => update("full_name", v)}
          placeholder="Jane Doe"
          hasError={!!errors.full_name}
          isFocused={focusedField === "full_name"}
          onFocus={() => setFocusedField("full_name")}
          onBlur={() => setFocusedField(null)}
        />
      </Field>

      <View style={styles.row}>
        <View style={styles.rowFlex1}>
          <Field label="Age" error={errors.age}>
            <StyledInput
              value={form.age}
              onChangeText={(v) => update("age", v)}
              placeholder="25"
              keyboardType="numeric"
              hasError={!!errors.age}
              isFocused={focusedField === "age"}
              onFocus={() => setFocusedField("age")}
              onBlur={() => setFocusedField(null)}
            />
          </Field>
        </View>
        <View style={styles.rowFlex2}>
          <Field label="Phone" error={errors.phone}>
            <StyledInput
              value={form.phone}
              onChangeText={(v) => update("phone", v)}
              placeholder="+1 555 000 0000"
              keyboardType="phone-pad"
              hasError={!!errors.phone}
              isFocused={focusedField === "phone"}
              onFocus={() => setFocusedField("phone")}
              onBlur={() => setFocusedField(null)}
            />
          </Field>
        </View>
      </View>

      {/* Account Credentials */}
      <SectionLabel label="Account Credentials" />

      <Field label="Email Address" error={errors.email}>
        <StyledInput
          value={form.email}
          onChangeText={(v) => update("email", v)}
          placeholder="jane@example.com"
          keyboardType="email-address"
          hasError={!!errors.email}
          isFocused={focusedField === "email"}
          onFocus={() => setFocusedField("email")}
          onBlur={() => setFocusedField(null)}
        />
      </Field>

      <Field label="Password" error={errors.password}>
        <StyledInput
          value={form.password}
          onChangeText={(v) => update("password", v)}
          placeholder="Min. 8 characters"
          secureTextEntry={!showPassword}
          hasError={!!errors.password}
          isFocused={focusedField === "password"}
          onFocus={() => setFocusedField("password")}
          onBlur={() => setFocusedField(null)}
          rightElement={
            <TouchableOpacity
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={styles.eyeButtonText}>
                {showPassword ? "Hide" : "Show"}
              </Text>
            </TouchableOpacity>
          }
        />
      </Field>

      <Field label="Confirm Password" error={errors.confirmPassword}>
        <StyledInput
          value={form.confirmPassword}
          onChangeText={(v) => update("confirmPassword", v)}
          placeholder="Repeat password"
          secureTextEntry={!showConfirmPassword}
          hasError={!!errors.confirmPassword}
          isFocused={focusedField === "confirmPassword"}
          onFocus={() => setFocusedField("confirmPassword")}
          onBlur={() => setFocusedField(null)}
          rightElement={
            <TouchableOpacity
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Text style={styles.eyeButtonText}>
                {showConfirmPassword ? "Hide" : "Show"}
              </Text>
            </TouchableOpacity>
          }
        />
      </Field>

      {/* KYC Verification */}
      <SectionLabel label="KYC Verification" />

      <Field label="Document Type" error={errors.document_type}>
        <View style={styles.documentTypeRow}>
          {DOCUMENT_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.docTypeChip,
                form.document_type === type && styles.docTypeChipActive,
              ]}
              onPress={() => {
                setForm((prev) => ({ ...prev, document_type: type }));
                setErrors((prev) => ({ ...prev, document_type: undefined }));
              }}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.docTypeChipText,
                  form.document_type === type && styles.docTypeChipTextActive,
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Field>

      <Field label="KYC Document Image" error={undefined}>
        <TouchableOpacity
          style={[
            styles.uploadButton,
            form.document && styles.uploadButtonActive,
          ]}
          onPress={() => pickImage("document")}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.uploadButtonText,
              form.document && styles.uploadButtonTextActive,
            ]}
          >
            {form.document
              ? `📄  ${form.document.fileName ?? "Document Selected"}`
              : "📷  Upload Document Image"}
          </Text>
        </TouchableOpacity>
      </Field>

      {/* Submit */}
      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
        activeOpacity={0.9}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Create Account</Text>
        )}
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity
          onPress={() => {
            /* navigate to Login */
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.footerLink}>Sign in</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ─── Stylesheet ──────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  content: {
    paddingHorizontal: 28,
    paddingTop: Platform.OS === "ios" ? 70 : 50,
    paddingBottom: 60,
  },

  // Header Design
  header: {
    marginBottom: 36,
  },
  eyebrowContainer: {
    alignSelf: "flex-start",
    backgroundColor: ACCENT_LIGHT,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 12,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
    color: BRAND,
  },
  title: {
    fontSize: 34,
    fontWeight: "900",
    color: TEXT_DARK,
    lineHeight: 40,
    letterSpacing: -1,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: TEXT_MID,
    lineHeight: 23,
    fontWeight: "400",
  },

  // Premium Avatar Uploader
  avatarSection: {
    alignItems: "center",
    marginBottom: 36,
  },
  avatarTouchable: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: SURFACE,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    ...Platform.select({
      ios: {
        shadowColor: TEXT_DARK,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  avatar: {
    width: 104,
    height: 104,
    borderRadius: 52,
  },
  avatarPlaceholder: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: BORDER,
  },
  avatarIcon: {
    fontSize: 26,
  },
  avatarBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: ACCENT,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: SURFACE,
  },
  avatarBadgeText: {
    color: SURFACE,
    fontSize: 16,
    fontWeight: "bold",
    marginTop: -1,
  },
  avatarLabel: {
    fontSize: 13,
    color: TEXT_DARK,
    marginTop: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  // Minimalist Section Labels
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
    color: TEXT_LIGHT,
    textTransform: "uppercase",
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: BORDER,
    marginLeft: 16,
    opacity: 0.7,
  },

  // Sleek Form Inputs
  fieldWrapper: {
    marginBottom: 22,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: TEXT_DARK,
    marginBottom: 10,
    letterSpacing: 0.1,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    backgroundColor: SURFACE,
    borderWidth: 1.5,
    borderColor: BORDER,
    borderRadius: 16,
    paddingHorizontal: 18,
    ...Platform.select({
      ios: {
        shadowColor: TEXT_DARK,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02,
        shadowRadius: 6,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 15,
    color: TEXT_DARK,
    fontWeight: "500",
  },
  inputFocused: {
    borderColor: ACCENT,
    backgroundColor: SURFACE,
    ...Platform.select({
      ios: {
        shadowColor: ACCENT,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  inputError: {
    borderColor: ERROR_COLOR,
    backgroundColor: "#FFF8F9",
  },
  rightElementContainer: {
    marginLeft: 12,
    justifyContent: "center",
  },
  eyeButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: ACCENT,
    letterSpacing: 0.3,
  },
  errorText: {
    marginTop: 8,
    fontSize: 12,
    color: ERROR_COLOR,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  row: {
    flexDirection: "row",
    gap: 16,
  },
  rowFlex1: {
    flex: 1,
  },
  rowFlex2: {
    flex: 2,
  },

  // Document Selection Micro-Grid
  documentTypeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 6,
  },
  docTypeChip: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: BORDER,
    backgroundColor: SURFACE,
  },
  docTypeChipActive: {
    borderColor: ACCENT,
    backgroundColor: ACCENT,
  },
  docTypeChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: TEXT_MID,
  },
  docTypeChipTextActive: {
    color: SURFACE,
    fontWeight: "700",
  },

  // Modern File Upload Block
  uploadButton: {
    height: 58,
    backgroundColor: SURFACE,
    borderWidth: 1.5,
    borderColor: BORDER,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderStyle: "dashed",
  },
  uploadButtonActive: {
    borderStyle: "solid",
    borderColor: "#10B981",
    backgroundColor: "#F0FDF4",
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: TEXT_MID,
  },
  uploadButtonTextActive: {
    color: "#15803D",
  },

  // High-Contrast Action Button
  submitButton: {
    height: 58,
    backgroundColor: ACCENT,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 32,
    ...Platform.select({
      ios: {
        shadowColor: ACCENT,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: SURFACE,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  // Footer Redirection
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 36,
    paddingVertical: 8,
  },
  footerText: {
    fontSize: 14,
    color: TEXT_MID,
    fontWeight: "500",
  },
  footerLink: {
    fontSize: 14,
    fontWeight: "700",
    color: ACCENT,
  },
});
