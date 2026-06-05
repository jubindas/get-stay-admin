import React, { useCallback, useEffect, useRef } from "react";

import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";


const ACCENT   = "#4F6EF7";
const BG       = "#F8FAFF";
const SURFACE  = "#FFFFFF";
const BORDER   = "#E2E8F0";
const TEXT_DARK = "#0F172A";
const TEXT_MID  = "#64748B";


export type AlertType = "success" | "error" | "warning" | "info";

interface AlertConfig {
  iconBg:    string;
  iconColor: string;
  accent:    string;
  icon:      string;
  label:     string;
  glowColor: string;
}

const CONFIGS: Record<AlertType, AlertConfig> = {
  success: {
    iconBg:    "#DCFCE7",
    iconColor: "#16A34A",
    accent:    "#16A34A",
    icon:      "✓",
    label:     "Success",
    glowColor: "#16A34A",
  },
  error: {
    iconBg:    "#FFE4E6",
    iconColor: "#E11D48",
    accent:    "#E11D48",
    icon:      "✕",
    label:     "Error",
    glowColor: "#E11D48",
  },
  warning: {
    iconBg:    "#FEF3C7",
    iconColor: "#D97706",
    accent:    "#D97706",
    icon:      "!",
    label:     "Warning",
    glowColor: "#D97706",
  },
  info: {
    iconBg:    "#DBEAFE",
    iconColor: ACCENT,
    accent:    ACCENT,
    icon:      "i",
    label:     "Info",
    glowColor: ACCENT,
  },
};

export interface AlertPopUpProps {
  visible:        boolean;
  type?:          AlertType;
  title:          string;
  message:        string;
  primaryLabel?:  string;
  secondaryLabel?: string;
  onPrimary?:     () => void;
  onSecondary?:   () => void;
  onDismiss?:     () => void;
  dismissable?:   boolean;
}


const SP_CARD   = { damping: 26, stiffness: 300, useNativeDriver: true } as const;
const SP_ICON   = { damping: 14, stiffness: 320, useNativeDriver: true } as const;
const SP_SUBTLE = { damping: 22, stiffness: 260, useNativeDriver: true } as const;

function SpringButton({
  onPress,
  style,
  children,
}: {
  onPress?: () => void;
  style?: any;
  children: React.ReactNode;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn  = () => Animated.spring(scale, { toValue: 0.94, ...SP_SUBTLE }).start();
  const pressOut = () => Animated.spring(scale, { toValue: 1,    ...SP_SUBTLE }).start();

  return (
    <Pressable
      onPress={onPress}
      onPressIn={pressIn}
      onPressOut={pressOut}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}


export default function AlertPopUp({
  visible,
  type        = "info",
  title,
  message,
  primaryLabel  = "Got it",
  secondaryLabel,
  onPrimary,
  onSecondary,
  onDismiss,
  dismissable = true,
}: AlertPopUpProps) {
  const cfg = CONFIGS[type];

  const backdrop      = useRef(new Animated.Value(0)).current;
  const blurScale     = useRef(new Animated.Value(1.08)).current; 
  const cardY         = useRef(new Animated.Value(32)).current;
  const cardScale     = useRef(new Animated.Value(0.88)).current;
  const cardOpacity   = useRef(new Animated.Value(0)).current;
  const iconScale     = useRef(new Animated.Value(0)).current;
  const iconOpacity   = useRef(new Animated.Value(0)).current;
  const glowOpacity   = useRef(new Animated.Value(0)).current;
  const glowScale     = useRef(new Animated.Value(0.6)).current;
  const contentY      = useRef(new Animated.Value(10)).current;
  const contentOpacity= useRef(new Animated.Value(0)).current;
  const accentWidth   = useRef(new Animated.Value(0)).current;
  const shimmerX      = useRef(new Animated.Value(-1)).current;


  const reset = useCallback(() => {
    backdrop.setValue(0);
    blurScale.setValue(1.08);
    cardY.setValue(32);
    cardScale.setValue(0.88);
    cardOpacity.setValue(0);
    iconScale.setValue(0);
    iconOpacity.setValue(0);
    glowOpacity.setValue(0);
    glowScale.setValue(0.6);
    contentY.setValue(10);
    contentOpacity.setValue(0);
    accentWidth.setValue(0);
    shimmerX.setValue(-1);
  }, []);

  useEffect(() => {
    if (visible) {
      
      Animated.parallel([
        Animated.timing(backdrop, {
          toValue: 1, duration: 260,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(blurScale, {
          toValue: 1, duration: 320,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),

        Animated.sequence([
          Animated.delay(40),
          Animated.parallel([
            Animated.spring(cardY,       { toValue: 0,  ...SP_CARD }),
            Animated.spring(cardScale,   { toValue: 1,  ...SP_CARD }),
            Animated.timing(cardOpacity, {
              toValue: 1, duration: 180,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        ]),

        // Wave 3 — content fades up inside card
        Animated.sequence([
          Animated.delay(100),
          Animated.parallel([
            Animated.spring(contentY,       { toValue: 0, ...SP_SUBTLE }),
            Animated.timing(contentOpacity, {
              toValue: 1, duration: 200,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        ]),

        // Wave 4 — icon elastic pop
        Animated.sequence([
          Animated.delay(120),
          Animated.parallel([
            Animated.spring(iconScale,   { toValue: 1, ...SP_ICON }),
            Animated.timing(iconOpacity, {
              toValue: 1, duration: 140,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        ]),

        // Wave 5 — icon glow bloom
        Animated.sequence([
          Animated.delay(160),
          Animated.parallel([
            Animated.spring(glowScale,   { toValue: 1,   ...SP_SUBTLE }),
            Animated.timing(glowOpacity, {
              toValue: 0.35, duration: 280,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          // glow fades away after blooming
          Animated.timing(glowOpacity, {
            toValue: 0, duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),

        // Wave 6 — accent bar slides in (needs useNativeDriver:false for width)
        Animated.sequence([
          Animated.delay(80),
          Animated.timing(accentWidth, {
            toValue: 1, duration: 380,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
          }),
        ]),

        // Wave 7 — shimmer sweep after bar is filled
        Animated.sequence([
          Animated.delay(500),
          Animated.timing(shimmerX, {
            toValue: 2, duration: 550,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
        ]),
      ]).start();

    } else {
      // ── EXIT: unified smooth dissolve ────────────────────────────────────
      Animated.parallel([
        Animated.timing(backdrop, {
          toValue: 0, duration: 200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 0, duration: 170,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(cardScale, {
          toValue: 0.94, duration: 170,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(cardY, {
          toValue: 12, duration: 170,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(reset);
    }
  }, [visible]);

  // ── Derived interpolations ────────────────────────────────────────────────
  const accentWidthPct = accentWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const shimmerTranslate = shimmerX.interpolate({
    inputRange: [-1, 2],
    outputRange: ["-100%", "200%"],
  });

  return (
    <Modal transparent visible={visible} statusBarTranslucent animationType="none">

      {/* ── Backdrop ─────────────────────────────────────────────────────── */}
      <Animated.View
        style={[
          styles.backdrop,
          {
            opacity: backdrop,
            transform: [{ scale: blurScale }],
          },
        ]}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={dismissable ? onDismiss : undefined}
        />
      </Animated.View>

      {/* ── Card ─────────────────────────────────────────────────────────── */}
      <View style={styles.centeredView} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.card,
            {
              opacity:   cardOpacity,
              transform: [{ scale: cardScale }, { translateY: cardY }],
            },
          ]}
        >

          {/* Accent bar + shimmer */}
          <View style={styles.accentTrack}>
            <Animated.View
              style={[
                styles.accentBar,
                { backgroundColor: cfg.accent, width: accentWidthPct },
              ]}
            >
              {/* Shimmer light sweep */}
              <Animated.View
                style={[
                  styles.shimmer,
                  { transform: [{ translateX: shimmerTranslate }] },
                ]}
              />
            </Animated.View>
          </View>

          {/* Header */}
          <Animated.View
            style={[
              styles.header,
              {
                opacity:   contentOpacity,
                transform: [{ translateY: contentY }],
              },
            ]}
          >
            {/* Icon + glow */}
            <View style={styles.iconWrapper}>
              {/* Bloom glow behind icon */}
              <Animated.View
                style={[
                  styles.iconGlow,
                  {
                    backgroundColor: cfg.glowColor,
                    opacity: glowOpacity,
                    transform: [{ scale: glowScale }],
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.iconBadge,
                  {
                    backgroundColor: cfg.iconBg,
                    borderColor: cfg.iconColor + "30",
                    opacity:   iconOpacity,
                    transform: [{ scale: iconScale }],
                  },
                ]}
              >
                <Text style={[styles.iconText, { color: cfg.iconColor }]}>
                  {cfg.icon}
                </Text>
              </Animated.View>
            </View>

            <View style={styles.titleBlock}>
              <Text style={[styles.typeLabel, { color: cfg.accent }]}>
                {cfg.label}
              </Text>
              <Text style={styles.title} numberOfLines={2}>
                {title}
              </Text>
            </View>

            {dismissable && (
              <SpringButton onPress={onDismiss} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </SpringButton>
            )}
          </Animated.View>

          {/* Divider */}
          <Animated.View
            style={[
              styles.divider,
              { opacity: contentOpacity },
            ]}
          />

          {/* Message */}
          <Animated.Text
            style={[
              styles.message,
              {
                opacity:   contentOpacity,
                transform: [{ translateY: contentY }],
              },
            ]}
          >
            {message}
          </Animated.Text>

          {/* Actions */}
          <Animated.View
            style={[
              styles.actions,
              {
                opacity:   contentOpacity,
                transform: [{ translateY: contentY }],
              },
            ]}
          >
            {secondaryLabel && (
              <SpringButton onPress={onSecondary} style={styles.btnSecondary}>
                <Text style={styles.btnSecondaryText}>{secondaryLabel}</Text>
              </SpringButton>
            )}

            <SpringButton
              onPress={onPrimary ?? onDismiss}
              style={[styles.btnPrimary, { backgroundColor: cfg.accent }]}
            >
              <Text style={styles.btnPrimaryText}>{primaryLabel}</Text>
            </SpringButton>
          </Animated.View>

        </Animated.View>
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(8, 15, 36, 0.52)",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 22,
  },

  // Card
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: SURFACE,
    borderRadius: 22,
    overflow: "hidden",
    // Layered shadow for depth
    shadowColor: "#1E293B",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.22,
    shadowRadius: 48,
    elevation: 28,
    borderWidth: 1,
    borderColor: "rgba(226,232,240,0.8)",
  },

  // Accent bar
  accentTrack: {
    height: 3.5,
    backgroundColor: BG,
    overflow: "hidden",
  },
  accentBar: {
    height: "100%",
    overflow: "hidden",
  },
  shimmer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: "30%",
    backgroundColor: "rgba(255,255,255,0.55)",
    // Soft feathered edges via very subtle gradient-like taper
    borderRadius: 2,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingTop: 22,
    paddingHorizontal: 20,
    paddingBottom: 14,
    gap: 14,
  },

  // Icon
  iconWrapper: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 1,
  },
  iconGlow: {
    position: "absolute",
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 15,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    fontSize: 21,
    fontWeight: "700",
    lineHeight: 26,
    textAlign: "center",
  },

  // Title area
  titleBlock: {
    flex: 1,
    gap: 3,
  },
  typeLabel: {
    fontSize: 10.5,
    fontWeight: "800",
    letterSpacing: 1.3,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: TEXT_DARK,
    letterSpacing: -0.35,
    lineHeight: 23,
  },

  // Close button
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BG,
    borderWidth: 1,
    borderColor: BORDER,
    flexShrink: 0,
    marginTop: -1,
  },
  closeBtnText: {
    fontSize: 12,
    color: TEXT_MID,
    fontWeight: "600",
    lineHeight: 16,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: BORDER,
    marginHorizontal: 20,
    marginBottom: 14,
  },

  // Message
  message: {
    fontSize: 14.5,
    color: TEXT_MID,
    lineHeight: 22,
    paddingHorizontal: 20,
    paddingBottom: 22,
    letterSpacing: -0.1,
  },

  // Actions
  actions: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    paddingBottom: 20,
    justifyContent: "flex-end",
  },
  btnPrimary: {
    borderRadius: 13,
    paddingVertical: 12,
    paddingHorizontal: 22,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 88,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 5,
  },
  btnPrimaryText: {
    color: "#FFFFFF",
    fontSize: 14.5,
    fontWeight: "700",
    letterSpacing: 0.1,
  },
  btnSecondary: {
    borderRadius: 13,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 80,
    backgroundColor: BG,
    borderWidth: 1.5,
    borderColor: BORDER,
  },
  btnSecondaryText: {
    color: TEXT_DARK,
    fontSize: 14.5,
    fontWeight: "600",
  },
});