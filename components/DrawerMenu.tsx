
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

import { AccountSwitcher } from "./AccountSwitcher";

import { router, usePathname } from "expo-router";

import React, { useEffect, useRef, useState } from "react";

import {
  Animated,
  Dimensions,
  Easing,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";




interface DrawerMenuProps {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
}




const { width } = Dimensions.get("window");

const DRAWER_WIDTH = width * 0.78;

const COLORS = {
  primary: "#4F6EF7",
  activeBg: "#F1F5F9",
  activeText: "#4F6EF7",
  inactiveText: "#475569",
  border: "#F1F5F9",
  danger: "#EF4444",
};

const DrawerMenu: React.FC<DrawerMenuProps> = ({ visible, setVisible }) => {
  const pathname = usePathname();

  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: visible ? 1 : 0,
      duration: 350,
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
    outputRange: [0.85, 1],
  });

  const opacity = animValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
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
          <AccountSwitcher />
        </View>

        <View style={styles.menuBlock}>
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
            label="Manage rates"
            path="/manage-rates"
            pathname={pathname}
            onPress={() => navigate("/manage-rates")}
          />

          <Divider />

          <MenuItem
            icon="user"
            label="Profile"
            path="/profile"
            pathname={pathname}
            onPress={() => navigate("/profile")}
          />

          <View style={styles.logoutWrapper}>
            <MenuItem
              icon="log-out"
              label="Logout"
              path="/login"
              pathname={pathname}
              onPress={() => navigate("/")}
              isLogout
            />
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

// 2. Updated MenuItem to accept and switch between Feather and Material icon sets
const MenuItem = ({ icon, label, path, pathname, onPress, isLogout, iconFamily, isSubItem }: any) => {
  const isActive = pathname === path;
  const iconColor = isLogout
    ? COLORS.danger
    : isActive
      ? COLORS.activeText
      : COLORS.inactiveText;

  return (
    <TouchableOpacity
      style={[
        styles.menuItem,
        isActive && styles.activeMenuItem,
        isSubItem && styles.subMenuItem
      ]}
      onPress={onPress}
      activeOpacity={0.6}
    >
      {isActive && <View style={styles.activeBar} />}

      {/* Dynamic toggle between families */}
      {iconFamily === "material" ? (
        <MaterialCommunityIcons name={icon} size={22} color={iconColor} />
      ) : (
        <Feather name={icon} size={22} color={iconColor} />
      )}

      <Text
        style={[
          styles.menuText,
          isActive && styles.activeMenuText,
          isLogout && { color: COLORS.danger },
          isSubItem && styles.subMenuText
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const ExpandableMenuGroup = ({ icon, iconFamily, label, children, pathname, paths }: any) => {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!paths.includes(pathname)) {
      setExpanded(false);
    }
  }, [pathname]);

  return (
    <View style={styles.menuGroup}>
      <TouchableOpacity
        style={styles.menuGroupHeader}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.6}
      >
        {iconFamily === "material" ? (
          <MaterialCommunityIcons name={icon} size={22} color={"#000"} />
        ) : (
          <Feather name={icon} size={22} color={"#000"} />
        )}
        <Text style={styles.menuGroupText}>{label}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.menuGroupContent}>
          {children}
        </View>
      )}
    </View>
  );
};

const Divider = () => <View style={styles.divider} />;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
  },
  drawer: {
    width: DRAWER_WIDTH,
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 10, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
      },
      android: { elevation: 24 },
    }),
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomRightRadius: 32,
  },
  menuBlock: {
    flex: 1,
    paddingTop: 24,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  activeMenuItem: {
    backgroundColor: COLORS.activeBg,
  },
  activeBar: {
    position: "absolute",
    left: 0,
    top: 12,
    bottom: 12,
    width: 4,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  menuText: {
    marginLeft: 16,
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.inactiveText,
  },
  activeMenuText: {
    color: COLORS.activeText,
    fontWeight: "700",
  },
  subMenuItem: {
    paddingVertical: 10,
    marginBottom: 2,
  },
  subMenuText: {
    fontSize: 15,
  },
  menuGroup: {
    marginBottom: 4,
  },
  menuGroupHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginHorizontal: 12,
  },
  menuGroupText: {
    marginLeft: 16,
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },
  menuGroupContent: {
    paddingLeft: 16,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 16,
    marginHorizontal: 24,
  },
  logoutWrapper: {
    marginTop: "auto",
    marginBottom: 40,
  },
});

export default DrawerMenu;

