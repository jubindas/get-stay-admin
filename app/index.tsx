import { useAuth } from "@/provider/AuthProvider";
import { useRouter } from "expo-router";

import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
} from "lucide-react-native";

import { AnimatePresence, MotiText, MotiView } from "moti";
import { MotiPressable } from "moti/interactions";

import React, { useState } from "react";

import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import AlertPopUp, { AlertType } from "@/components/AlertPopUp"; // adjust path as needed

const { width, height } = Dimensions.get("window");

const ACCENT = "#4F6EF7";
const BG = "#F8FAFF";
const SURFACE = "#FFFFFF";
const BORDER = "#E2E8F0";
const BORDER_FOCUS = "#4F6EF7";
const TEXT_DARK = "#0F172A";
const TEXT_MID = "#64748B";
const TEXT_LIGHT = "#94A3B8";

// ─── Alert State Helper ────────────────────────────────────────────────────────
interface AlertState {
  visible: boolean;
  type: AlertType;
  title: string;
  message: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  onPrimary?: () => void;
  onSecondary?: () => void;
}

const ALERT_HIDDEN: AlertState = {
  visible: false,
  type: "info",
  title: "",
  message: "",
};

// ─── Ambient background pieces ────────────────────────────────────────────────
function FloatingOrb({
  size,
  color,
  delay,
  initialX,
  initialY,
}: {
  size: number;
  color: string;
  delay: number;
  initialX: number;
  initialY: number;
}) {
  return (
    <MotiView
      from={{ translateY: 0, scale: 1, opacity: 0.3 }}
      animate={{
        translateY: [-30, 30, -30],
        scale: [1, 1.15, 1],
        opacity: [0.3, 0.65, 0.3],
      }}
      transition={{
        type: "timing",
        duration: 8000,
        loop: true,
        delay,
        repeatReverse: false,
      }}
      style={[
        styles.orb,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          left: initialX,
          top: initialY,
        },
      ]}
    />
  );
}

function SweepLine({ delay, top }: { delay: number; top: number }) {
  return (
    <MotiView
      from={{ translateX: -width, opacity: 0 }}
      animate={{ translateX: width, opacity: [0, 0.5, 0] }}
      transition={{
        type: "timing",
        duration: 5500,
        loop: true,
        repeatReverse: false,
        delay,
      }}
      style={[styles.sweepLine, { top }]}
    />
  );
}

// ─── Form Field ───────────────────────────────────────────────────────────────
function FormField({
  label,
  iconName,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  rightElement,
}: {
  label: string;
  iconName: "mail" | "lock";
  value: string;
  onChangeText: (t: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: any;
  autoCapitalize?: any;
  rightElement?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;
  const iconColor = focused ? ACCENT : TEXT_LIGHT;

  return (
    <View style={styles.fieldContainer}>
      <MotiView
        animate={{ borderColor: focused ? BORDER_FOCUS : BORDER }}
        transition={{ type: "timing", duration: 200 }}
        style={[styles.inputWrapper, focused && styles.inputWrapperFocused]}
      >
        <View style={styles.inputIcon}>
          {iconName === "mail" ? (
            <Mail size={20} color={iconColor} strokeWidth={1.8} />
          ) : (
            <Lock size={20} color={iconColor} strokeWidth={1.8} />
          )}
        </View>

        <View style={styles.inputInner}>
          <MotiText
            animate={{ translateY: active ? -10 : 0, scale: active ? 0.82 : 1 }}
            transition={{ type: "spring", damping: 22, stiffness: 160 }}
            style={[styles.floatLabel, { color: focused ? ACCENT : TEXT_MID }]}
          >
            {label}
          </MotiText>
          <TextInput
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize ?? "none"}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={[styles.textInput, active && styles.textInputActive]}
            selectionColor={ACCENT}
            placeholderTextColor="transparent"
          />
        </View>

        {rightElement && <View style={styles.inputRight}>{rightElement}</View>}
      </MotiView>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  // Single alert state drives the AlertPopUp
  const [alert, setAlert] = useState<AlertState>(ALERT_HIDDEN);

  const dismissAlert = () => setAlert((a) => ({ ...a, visible: false }));

  const showAlert = (config: Omit<AlertState, "visible">) =>
    setAlert({ ...config, visible: true });

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const handleLogin = async () => {
    if (!email || !password) {
      showAlert({
        type: "warning",
        title: "Missing Information",
        message: "Please enter your email and password before continuing.",
        primaryLabel: "Got it",
        onPrimary: dismissAlert,
      });
      return;
    }

    try {
      setStatus("loading");
      await login(email, password);
      setStatus("success");
      setTimeout(() => {
        router.replace("/dashboard");
      }, 1800);
    } catch (error: any) {
      setStatus("idle");
      showAlert({
        type: "error",
        title: "Login Failed",
        message:
          error?.response?.data?.error ||
          "Invalid email or password. Please try again.",
        primaryLabel: "Retry",
        secondaryLabel: "Forgot password?",
        onPrimary: dismissAlert,
        onSecondary: () => {
          dismissAlert();
          // router.push("/forgot-password"); // uncomment when ready
        },
      });
    }
  };

  const handleSocialLogin = (provider: string) => {
    showAlert({
      type: "info",
      title: `${provider} Sign-in`,
      message: `Sign in with ${provider} is coming soon. Please use your email and password for now.`,
      primaryLabel: "OK",
      onPrimary: dismissAlert,
    });
  };

  const handleRegisterNavigation = () => {
    router.push("/register");
  };

  const SOCIAL = [
    { label: "G", name: "Google" },
    { label: "A", name: "Apple" },
    { label: "𝕏", name: "X (Twitter)" },
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" />

      {/* Ambient background */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <FloatingOrb
          size={420}
          color={`${ACCENT}12`}
          delay={0}
          initialX={-150}
          initialY={-120}
        />
        <FloatingOrb
          size={300}
          color="#A78BFA10"
          delay={2000}
          initialX={width - 180}
          initialY={height * 0.55}
        />
        <FloatingOrb
          size={200}
          color={`${ACCENT}08`}
          delay={1200}
          initialX={width * 0.2}
          initialY={height * 0.75}
        />
        <SweepLine delay={0} top={height * 0.18} />
        <SweepLine delay={2000} top={height * 0.42} />
        <SweepLine delay={3800} top={height * 0.68} />
      </View>

      {/* Success splash overlay */}
      <AnimatePresence>
        {status === "success" && (
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.08 }}
            transition={{ type: "timing", duration: 500 }}
            style={styles.splashOverlay}
          >
            <MotiView
              from={{ scale: 0.4, opacity: 1 }}
              animate={{ scale: 3, opacity: 0 }}
              transition={{
                type: "timing",
                duration: 2000,
                loop: true,
                repeatReverse: false,
              }}
              style={styles.waveCircle}
            />
            <MotiView
              from={{ scale: 0.4, opacity: 0.8 }}
              animate={{ scale: 3, opacity: 0 }}
              transition={{
                type: "timing",
                duration: 2000,
                loop: true,
                repeatReverse: false,
                delay: 700,
              }}
              style={[
                styles.waveCircle,
                { borderColor: "rgba(167,139,250,0.5)" },
              ]}
            />
            <MotiView
              from={{ scale: 0.75, opacity: 0, translateY: 28 }}
              animate={{ scale: 1, opacity: 1, translateY: 0 }}
              transition={{ type: "spring", damping: 14 }}
              style={styles.splashContent}
            >
              <MotiView
                animate={{ translateY: [0, -14, 0], opacity: [1, 0.72, 1] }}
                transition={{
                  translateY: { type: "timing", duration: 2000, loop: true },
                  opacity: { type: "timing", duration: 1600, loop: true },
                }}
                style={styles.successIconOuter}
              >
                <CheckCircle2 size={60} color="#FFF" strokeWidth={1.8} />
              </MotiView>
              <MotiText
                from={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 350, type: "spring" }}
                style={styles.successText}
              >
                Welcome Back
              </MotiText>
              <MotiText
                from={{ opacity: 0 }}
                animate={{ opacity: 0.65 }}
                transition={{ delay: 650, type: "timing", duration: 500 }}
                style={styles.successSub}
              >
                Taking you in…
              </MotiText>
            </MotiView>
          </MotiView>
        )}
      </AnimatePresence>

      {/* Main content */}
      <View style={styles.inner}>
        <MotiView
          from={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", delay: 100, damping: 18 }}
          style={styles.logoBadge}
        >
          <View style={styles.dot} />
          <Text style={styles.logoText}>GETSTAY HOST</Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateX: -20 }}
          animate={{ opacity: 1, translateX: 0 }}
          transition={{ type: "spring", delay: 200, damping: 20 }}
          style={styles.headerContainer}
        >
          <Text style={styles.title}>Login</Text>
          <Text style={styles.subtitle}>
            Enter your credentials to manage your property
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 24 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "spring", delay: 360, damping: 18 }}
        >
          <FormField
            label="Email Address"
            iconName="mail"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <FormField
            label="Password"
            iconName="lock"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPw}
            rightElement={
              <TouchableOpacity
                onPress={() => setShowPw((p) => !p)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={styles.eyeBtn}
              >
                {showPw ? (
                  <EyeOff size={20} color={TEXT_LIGHT} strokeWidth={1.8} />
                ) : (
                  <Eye size={20} color={TEXT_LIGHT} strokeWidth={1.8} />
                )}
              </TouchableOpacity>
            }
          />

          <MotiPressable
            onPress={handleLogin}
            disabled={status !== "idle"}
            animate={({ pressed }) => {
              "worklet";
              return { scale: pressed ? 0.97 : 1, opacity: pressed ? 0.92 : 1 };
            }}
            style={styles.button}
          >
            {status === "loading" ? (
              <MotiView
                from={{ rotate: "0deg" }}
                animate={{ rotate: "360deg" }}
                transition={{
                  loop: true,
                  repeatReverse: false,
                  type: "timing",
                  duration: 900,
                }}
                style={styles.spinner}
              />
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>Continue</Text>
                <ArrowRight color="#FFF" size={20} strokeWidth={2.5} />
              </View>
            )}
          </MotiPressable>

          {/* Social row */}
          <View style={styles.socialRow}>
            {SOCIAL.map(({ label, name }) => (
              <MotiPressable
                key={label}
                onPress={() => handleSocialLogin(name)}
                animate={({ pressed }) => {
                  "worklet";
                  return { scale: pressed ? 0.91 : 1 };
                }}
                style={styles.socialBtn}
              >
                <Text style={styles.socialLabel}>{label}</Text>
              </MotiPressable>
            ))}
          </View>

          <MotiPressable
            onPress={handleRegisterNavigation}
            animate={({ pressed }) => {
              "worklet";
              return { scale: pressed ? 0.98 : 1, opacity: pressed ? 0.8 : 1 };
            }}
            style={styles.registerContainer}
          >
            <Text style={styles.registerTextLeft}>Dont have an account? </Text>
            <Text style={styles.registerTextLink}>Register now</Text>
          </MotiPressable>
        </MotiView>
      </View>

      {/* ── AlertPopUp — single instance, driven by `alert` state ── */}
      <AlertPopUp
        visible={alert.visible}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        primaryLabel={alert.primaryLabel}
        secondaryLabel={alert.secondaryLabel}
        onPrimary={alert.onPrimary}
        onSecondary={alert.onSecondary}
        onDismiss={dismissAlert}
      />
    </KeyboardAvoidingView>
  );
}

// ─── Styles (unchanged from original) ────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG, overflow: "hidden" },
  splashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: ACCENT,
    zIndex: 9999,
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
    height: 1000,
  },
  waveCircle: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 8,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  splashContent: { alignItems: "center", zIndex: 2 },
  successIconOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  successText: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FFF",
    textAlign: "center",
  },
  successSub: {
    fontSize: 16,
    color: "#FFF",
    marginTop: 12,
    letterSpacing: 1.2,
    fontWeight: "500",
  },
  orb: { position: "absolute" },
  sweepLine: {
    position: "absolute",
    width: width * 2,
    height: 1,
    borderTopWidth: 1,
    borderColor: `${ACCENT}22`,
    borderStyle: "dashed",
    left: -width * 0.5,
  },
  inner: { flex: 1, paddingHorizontal: 32, justifyContent: "center" },
  logoBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: SURFACE,
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 100,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: ACCENT,
    marginRight: 8,
  },
  logoText: {
    fontSize: 11,
    fontWeight: "800",
    color: TEXT_DARK,
    letterSpacing: 1.5,
  },
  headerContainer: { marginBottom: 36 },
  title: {
    fontSize: 40,
    fontWeight: "800",
    color: TEXT_DARK,
    letterSpacing: -1.2,
  },
  subtitle: { fontSize: 15, color: TEXT_MID, marginTop: 8, lineHeight: 22 },
  fieldContainer: { marginBottom: 14 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: BORDER,
    paddingHorizontal: 16,
    height: 66,
    backgroundColor: SURFACE,
  },
  inputWrapperFocused: {
    backgroundColor: "#FAFBFF",
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  inputIcon: { marginRight: 12 },
  inputInner: { flex: 1, justifyContent: "center", height: "100%" },
  floatLabel: {
    position: "absolute",
    fontSize: 15,
    fontWeight: "500",
    left: 0,
    transformOrigin: "left center",
  },
  textInput: {
    fontSize: 15,
    color: TEXT_DARK,
    fontWeight: "600",
    height: 28,
    paddingTop: 0,
    paddingBottom: 0,
    opacity: 0,
  },
  textInputActive: { opacity: 1, marginTop: 14 },
  inputRight: { marginLeft: 8 },
  eyeBtn: { padding: 4 },
  button: {
    height: 62,
    backgroundColor: ACCENT,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.32,
    shadowRadius: 20,
    elevation: 6,
  },
  buttonContent: { flexDirection: "row", alignItems: "center", gap: 10 },
  buttonText: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  spinner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: "#FFF",
    borderTopColor: "transparent",
  },
  socialRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  socialBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: BORDER,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: SURFACE,
  },
  socialLabel: { fontSize: 16, color: TEXT_DARK, fontWeight: "700" },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 8,
  },
  registerTextLeft: { fontSize: 14, color: TEXT_MID, fontWeight: "500" },
  registerTextLink: { fontSize: 14, color: ACCENT, fontWeight: "700" },
});
