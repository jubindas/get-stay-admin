import { Feather } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface DrawerMenuProps {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const { width, height } = Dimensions.get("window");
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

  // New Animation Values for the "Scale/Fade" effect
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
    setTimeout(() => {
      router.replace(path as any);
    }, 150);
  };

  // Interpolations for the Scale effect
  const scale = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.85, 1], // Starts slightly smaller
  });

  const opacity = animValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1], // Quick fade in towards the end
  });

  const translateX = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-DRAWER_WIDTH, 0], // Still moves, but combined with scale it looks "poppy"
  });

  return (
    <View style={styles.container} pointerEvents={visible ? "auto" : "none"}>
      {/* OVERLAY */}
      <Animated.View style={[styles.overlay, { opacity: animValue }]}>
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        />
      </Animated.View>

      {/* DRAWER BODY with SCALE & FADE */}
      <Animated.View
        style={[
          styles.drawer,
          {
            opacity: opacity,
            transform: [{ translateX: translateX }, { scale: scale }],
          },
        ]}
      >
        <View style={styles.header}>
          <View style={styles.profileRow}>
            <View style={styles.avatarContainer}>
              <Image
                source={require("../assets/img/logo.png")}
                style={styles.avatarImage}
              />
            </View>
            <View style={{ marginLeft: 16 }}>
              <Text style={styles.userName}>Zubeens Hotel</Text>
              <Text style={styles.userRole}>Property Manager</Text>
            </View>
          </View>
        </View>

        <View style={styles.menuBlock}>
          <MenuItem
            icon="home"
            label="Dashboard"
            path="/dashboard"
            pathname={pathname}
            onPress={() => navigate("/dashboard")}
          />
          <MenuItem
            icon="plus-circle"
            label="Add Rooms"
            path="/add-rooms"
            pathname={pathname}
            onPress={() => navigate("/add-rooms")}
          />
          <MenuItem
            icon="grid"
            label="Room Management"
            path="/room-category"
            pathname={pathname}
            onPress={() => navigate("/room-category")}
          />
          <MenuItem
            icon="calendar"
            label="Today's Check In"
            path="/todays-check-in"
            pathname={pathname}
            onPress={() => navigate("/todays-check-in")}
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

const MenuItem = ({ icon, label, path, pathname, onPress, isLogout }: any) => {
  const isActive = pathname === path;
  return (
    <TouchableOpacity
      style={[styles.menuItem, isActive && styles.activeMenuItem]}
      onPress={onPress}
      activeOpacity={0.6}
    >
      {isActive && <View style={styles.activeBar} />}
      <Feather
        name={icon}
        size={22}
        color={
          isLogout
            ? COLORS.danger
            : isActive
              ? COLORS.activeText
              : COLORS.inactiveText
        }
      />
      <Text
        style={[
          styles.menuText,
          isActive && styles.activeMenuText,
          isLogout && { color: COLORS.danger },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
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
      android: {
        elevation: 24,
      },
    }),
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomRightRadius: 32,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 30,
    resizeMode: "cover",
  },
  userName: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  userRole: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    marginTop: 2,
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
