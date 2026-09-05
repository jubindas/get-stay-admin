import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

import { AccountSwitcher } from "./AccountSwitcher";

import { router, usePathname } from "expo-router";

import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../provider/AuthProvider";

import {
  Animated,
  Dimensions,
  Easing,
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface DrawerMenuProps {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const { width } = Dimensions.get("window");

const DRAWER_WIDTH = Math.min(width * 0.8, 320);

// A slightly richer, more "designed" palette — a deep indigo primary,
// a warmer neutral scale, and a soft accent tint for active/hover states.
const COLORS = {
  primary: "#4338CA",
  primaryDark: "#3730A3",
  primarySoft: "#EEF0FF",
  accent: "#6366F1",
  activeBg: "#EEF0FF",
  activeText: "#4338CA",
  inactiveText: "#64748B",
  iconInactive: "#94A3B8",
  heading: "#1E293B",
  border: "#EEF1F5",
  surface: "#FFFFFF",
  danger: "#EF4444",
  dangerSoft: "#FEF2F2",
};

const DrawerMenu: React.FC<DrawerMenuProps> = ({ visible, setVisible }) => {
  const pathname = usePathname();
  const { logout } = useAuth();

  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: visible ? 1 : 0,
      duration: 340,
      easing: visible ? Easing.out(Easing.back(1)) : Easing.in(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [visible]);

  const navigate = (path: string) => {
    if (pathname === path) {
      setVisible(false);
      return;
    }
    setVisible(false);
    setTimeout(() => router.replace(path as any), 150);
  };

  const scale = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1],
  });

  const opacity = animValue.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0, 0.4, 1],
  });

  const translateX = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-DRAWER_WIDTH, 0],
  });

  return (
    <View style={styles.container} pointerEvents={visible ? "auto" : "none"}>
      <Animated.View style={[styles.overlay, { opacity: animValue }]}>
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.drawer,
          { opacity, transform: [{ translateX }, { scale }] },
        ]}
      >
        <View style={styles.header}>
          <View style={styles.headerAccentCircleLg} />
          <View style={styles.headerAccentCircleSm} />
          <AccountSwitcher />
        </View>

        <View style={styles.menuBlock}>
          <Text style={styles.sectionLabel}>MENU</Text>

          <MenuItem
            icon="home"
            label="Dashboard"
            path="/dashboard"
            pathname={pathname}
            onPress={() => navigate("/dashboard")}
          />

          <ExpandableMenuGroup
            icon="tools"
            iconFamily="material"
            label="Master Setup"
            pathname={pathname}
            paths={["/add-property", "/my-rooms"]}
          >
            <MenuItem
              icon="home-plus"
              iconFamily="material"
              label="Add Properties"
              path="/add-property"
              pathname={pathname}
              onPress={() => navigate("/add-property")}
              isSubItem
            />
            <MenuItem
              icon="list"
              label="My Rooms"
              path="/my-rooms"
              pathname={pathname}
              onPress={() => navigate("/my-rooms")}
              isSubItem
            />
          </ExpandableMenuGroup>

          <MenuItem
            icon="bed"
            iconFamily="material"
            label="Bookings"
            path="/book-rooms"
            pathname={pathname}
            onPress={() => navigate("/book-rooms")}
          />

          <MenuItem
            icon="calendar"
            label="Check In"
            path="/todays-check-in"
            pathname={pathname}
            onPress={() => navigate("/todays-check-in")}
          />
          <MenuItem
            icon="grid"
            label="Manage Rooms"
            path="/room-category"
            pathname={pathname}
            onPress={() => navigate("/room-category")}
          />
          <MenuItem
            icon="cash-multiple"
            iconFamily="material"
            label="Manage Rates"
            path="/manage-rates"
            pathname={pathname}
            onPress={() => navigate("/manage-rates")}
          />

          <MenuItem
            icon="help-circle"
            label="Any query? Raise a ticket"
            path="/raise-ticket"
            pathname={pathname}
            onPress={() => navigate("/raise-ticket")}
          />

          <Divider />

          <Text style={styles.sectionLabel}>ACCOUNT</Text>

          <MenuItem
            icon="user"
            label="Profile"
            path="/profile"
            pathname={pathname}
            onPress={() => navigate("/profile")}
          />

          <View style={styles.logoutWrapper}>
            <Divider />
            <MenuItem
              icon="log-out"
              label="Logout"
              path="/login"
              pathname={pathname}
              onPress={async () => {
                await logout();
                navigate("/");
              }}
              isLogout
            />
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const MenuItem = ({
  icon,
  label,
  path,
  pathname,
  onPress,
  isLogout,
  iconFamily,
  isSubItem,
}: any) => {
  const isActive = pathname === path;
  const iconColor = isLogout
    ? COLORS.danger
    : isActive
      ? COLORS.activeText
      : COLORS.iconInactive;

  return (
    <TouchableOpacity
      style={[
        styles.menuItem,
        isActive && styles.activeMenuItem,
        isSubItem && styles.subMenuItem,
      ]}
      onPress={onPress}
      activeOpacity={0.65}
    >
      {isActive && <View style={styles.activeBar} />}

      <View
        style={[
          styles.iconWrap,
          isSubItem && styles.iconWrapSub,
          isActive && styles.iconWrapActive,
          isLogout && styles.iconWrapDanger,
        ]}
      >
        {iconFamily === "material" ? (
          <MaterialCommunityIcons
            name={icon}
            size={isSubItem ? 17 : 19}
            color={iconColor}
          />
        ) : (
          <Feather name={icon} size={isSubItem ? 17 : 19} color={iconColor} />
        )}
      </View>

      <Text
        style={[
          styles.menuText,
          isActive && styles.activeMenuText,
          isLogout && { color: COLORS.danger },
          isSubItem && styles.subMenuText,
        ]}
      >
        {label}
      </Text>

      {isActive && !isLogout && (
        <View style={styles.activeDot} />
      )}
    </TouchableOpacity>
  );
};

const ExpandableMenuGroup = ({
  icon,
  iconFamily,
  label,
  children,
  pathname,
  paths,
}: any) => {
  const [expanded, setExpanded] = useState(false);
  const rotateValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!paths.includes(pathname)) {
      setExpanded(false);
    }
  }, [pathname]);

  useEffect(() => {
    Animated.timing(rotateValue, {
      toValue: expanded ? 1 : 0,
      duration: 200,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [expanded]);

  const toggle = () => {
    LayoutAnimation.configureNext(
      LayoutAnimation.create(
        220,
        LayoutAnimation.Types.easeInEaseOut,
        LayoutAnimation.Properties.opacity
      )
    );
    setExpanded((prev) => !prev);
  };

  const rotate = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const groupActive = paths.includes(pathname);

  return (
    <View style={styles.menuGroup}>
      <TouchableOpacity
        style={styles.menuGroupHeader}
        onPress={toggle}
        activeOpacity={0.65}
      >
        <View
          style={[
            styles.iconWrap,
            groupActive && styles.iconWrapActive,
          ]}
        >
          {iconFamily === "material" ? (
            <MaterialCommunityIcons
              name={icon}
              size={19}
              color={groupActive ? COLORS.activeText : COLORS.iconInactive}
            />
          ) : (
            <Feather
              name={icon}
              size={19}
              color={groupActive ? COLORS.activeText : COLORS.iconInactive}
            />
          )}
        </View>
        <Text
          style={[
            styles.menuGroupText,
            groupActive && { color: COLORS.activeText },
          ]}
        >
          {label}
        </Text>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <Feather name="chevron-down" size={16} color={COLORS.iconInactive} />
        </Animated.View>
      </TouchableOpacity>

      {expanded && <View style={styles.menuGroupContent}>{children}</View>}
    </View>
  );
};

const Divider = () => <View style={styles.divider} />;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 9999,
  },
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
  },
  drawer: {
    width: DRAWER_WIDTH,
    height: "100%",
    backgroundColor: COLORS.surface,
    borderTopRightRadius: 28,
    borderBottomRightRadius: 28,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 12, height: 0 },
        shadowOpacity: 0.18,
        shadowRadius: 24,
      },
      android: { elevation: 24 },
    }),
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 64,
    paddingBottom: 28,
    paddingHorizontal: 20,
    borderBottomRightRadius: 36,
    overflow: "hidden",
    position: "relative",
  },
  headerAccentCircleLg: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.06)",
    top: -60,
    right: -50,
  },
  headerAccentCircleSm: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(255,255,255,0.05)",
    bottom: -30,
    left: -20,
  },
  menuBlock: {
    flex: 1,
    paddingTop: 20,
    paddingBottom: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    color: "#B4BCC8",
    marginHorizontal: 24,
    marginBottom: 8,
    marginTop: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
    paddingHorizontal: 16,
    marginHorizontal: 12,
    borderRadius: 14,
    marginBottom: 3,
  },
  activeMenuItem: {
    backgroundColor: COLORS.activeBg,
  },
  activeBar: {
    position: "absolute",
    left: -12,
    top: 8,
    bottom: 8,
    width: 4,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  iconWrapSub: {
    width: 28,
    height: 28,
    borderRadius: 8,
  },
  iconWrapActive: {
    backgroundColor: "#FFFFFF",
  },
  iconWrapDanger: {
    backgroundColor: COLORS.dangerSoft,
  },
  menuText: {
    marginLeft: 12,
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.inactiveText,
    flex: 1,
  },
  activeMenuText: {
    color: COLORS.activeText,
    fontWeight: "700",
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  subMenuItem: {
    paddingVertical: 9,
    marginBottom: 2,
  },
  subMenuText: {
    fontSize: 14,
    fontWeight: "500",
  },
  menuGroup: {
    marginBottom: 3,
  },
  menuGroupHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
    paddingHorizontal: 16,
    marginHorizontal: 12,
    borderRadius: 14,
  },
  menuGroupText: {
    marginLeft: 12,
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.heading,
    flex: 1,
  },
  menuGroupContent: {
    paddingLeft: 18,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 14,
    marginHorizontal: 24,
  },
  logoutWrapper: {
    marginTop: "auto",
    marginBottom: 32,
  },
});

export default DrawerMenu;