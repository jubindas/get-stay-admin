import { Ionicons } from "@expo/vector-icons";
import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { router } from "expo-router";
import { Drawer } from "expo-router/drawer";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const COLORS = {
  bgLight: "#F8FAFC",
  bgUserSection: "#F1F5F9",
  textMain: "#1A202C",
  textSubtle: "#718096",
  primaryBlue: "#003399",
  teal: "#38B2AC",
  activeIndicator: "#3B82F6",

  // Derived
  border: "#E2E8F0",
  activeBg: "#EBF5FF",
  white: "#FFFFFF",
  online: "#22C55E",
};

function CustomDrawerContent(props: any) {
  return (
    <View style={styles.drawerRoot}>
      <DrawerContentScrollView
        {...props}
        scrollEnabled
        contentContainerStyle={{ paddingTop: 0, paddingBottom: 0 }}
      >
        {/* ── Logo / Brand ── */}
        <View style={styles.brandSection}>
          <View style={styles.logoWrapper}>
            <Image
              source={require("../assets/img/logo.png")}
              style={styles.logoImage}
              resizeMode="cover"
            />
          </View>
          <View style={styles.brandText}>
            <Text style={styles.brandName}>GetStay</Text>
            <Text style={styles.brandTagline}>Hotel Management</Text>
          </View>
        </View>

        {/* ── Divider ── */}
        <View style={styles.divider} />

        {/* ── Nav Label ── */}
        <Text style={styles.navLabel}>MAIN MENU</Text>

        <DrawerItemList {...props} />

        <View style={{ height: 24 }} />
      </DrawerContentScrollView>

      <TouchableOpacity
        onPress={() => router.push("/profile")}
        style={styles.profileSection}
      >
        <View style={styles.avatarRing}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={18} color={COLORS.white} />
          </View>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>Zubeens Hotel</Text>
          <View style={styles.roleBadge}>
            <View style={styles.roleDot} />
            <Text style={styles.profileRole}>Hotel Owner</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.7}>
          <Ionicons
            name="log-out-outline"
            size={20}
            color={COLORS.textSubtle}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={() => ({
          drawerType: "slide",
          drawerStyle: {
            width: 290,
            borderRadius: 0,
            backgroundColor: COLORS.bgLight,
            borderRightWidth: 1,
            borderRightColor: COLORS.border,
          },
          headerStyle: {
            backgroundColor: COLORS.primaryBlue,
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTintColor: COLORS.white,
          headerTitleStyle: {
            fontWeight: "700",
            fontSize: 17,
            letterSpacing: 0.3,
          },

          drawerActiveBackgroundColor: COLORS.activeBg,
          drawerActiveTintColor: COLORS.activeIndicator,
          drawerInactiveTintColor: COLORS.textMain,

          drawerItemStyle: {
            borderRadius: 10,
            marginHorizontal: 12,
            marginVertical: 2,
            paddingVertical: 2,
          },

          drawerLabelStyle: {
            fontSize: 14,
            fontWeight: "600",
            marginLeft: -8,
            letterSpacing: 0.2,
          },
          overlayColor: "rgba(0,0,0,0.3)",
        })}
      >
        <Drawer.Screen
          name="index"
          options={{
            drawerLabel: "Dashboard",
            title: "Dashboard",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="grid-outline" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="add-rooms"
          options={{
            drawerLabel: "Add Rooms",
            title: "Add Rooms",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="add-circle-outline" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="room-category"
          options={{
            drawerLabel: "Room Management",
            title: "Room Management",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="bed-outline" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="todays-check-in"
          options={{
            drawerLabel: "Today's Check In",
            title: "Today's Check In",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="calendar-outline" size={size} color={color} />
            ),
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  drawerRoot: {
    flex: 1,
    backgroundColor: COLORS.bgLight,
  },

  /* ── Brand ── */
  brandSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 24,
    gap: 14,
    backgroundColor: COLORS.bgLight,
  },
  logoWrapper: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.teal,
    overflow: "hidden",
    shadowColor: COLORS.primaryBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  logoImage: {
    width: "100%",
    height: "100%",
  },
  brandText: {
    flex: 1,
  },
  brandName: {
    color: COLORS.primaryBlue,
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  brandTagline: {
    color: COLORS.teal,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginTop: 2,
  },

  /* ── Divider & Section Label ── */
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  navLabel: {
    color: COLORS.textSubtle,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.8,
    paddingHorizontal: 24,
    marginBottom: 6,
  },

  /* ── Profile ── */
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.bgUserSection,
    gap: 12,
  },
  avatarRing: {
    padding: 2,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: COLORS.teal,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryBlue,
    justifyContent: "center",
    alignItems: "center",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: COLORS.textMain,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 2,
  },
  roleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.online,
  },
  profileRole: {
    color: COLORS.textSubtle,
    fontSize: 11,
    fontWeight: "500",
  },
  logoutBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.border,
  },
});
