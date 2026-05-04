import { Ionicons } from "@expo/vector-icons";

import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";

import { Drawer } from "expo-router/drawer";

import React from "react";

import { StyleSheet, Text, View } from "react-native";

import { GestureHandlerRootView } from "react-native-gesture-handler";

const COLORS = {
  bgLight: "#F8FAFC",
  bgUserSection: "#F1F5F9",
  textMain: "#1A202C",
  textSubtle: "#718096",
  primaryBlue: "#003399",
  teal: "#38B2AC",
  activeIndicator: "#3B82F6",
};

function CustomDrawerContent(props: any) {
  return (
    <View style={{ flex: 1, backgroundColor: "#ffffff" }}>
      <DrawerContentScrollView
        {...props}
        scrollEnabled={true}
        contentContainerStyle={{ paddingTop: 0 }}
      >
        <View style={styles.brandSection}>
          <View style={styles.brandIcon}>
            <Ionicons name="business" size={20} color={COLORS.teal} />
          </View>
          <Text style={styles.brandText}>Get Stay</Text>
        </View>

        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={20} color="#ffffff" />
        </View>
        <View>
          <Text style={styles.profileName}>@Dorji</Text>
          <Text style={styles.profileRole}>Administrator</Text>
        </View>
        <Ionicons
          name="log-out-outline"
          size={20}
          color={COLORS.textSubtle}
          style={{ marginLeft: "auto" }}
        />
      </View>
    </View>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={({ route, navigation }) => ({
          drawerType: "slide",
          drawerStyle: { width: 300, borderRadius: 0 },
          headerStyle: {
            backgroundColor: COLORS.primaryBlue,
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTintColor: "#ffffff",
          headerTitleStyle: { fontWeight: "600", fontSize: 18 },

          drawerActiveBackgroundColor: "#EBF5FF",
          drawerActiveTintColor: COLORS.primaryBlue,
          drawerInactiveTintColor: COLORS.textMain,

          drawerItemStyle: {
            borderRadius: 0,
            marginHorizontal: 0,
            width: "100%",
            paddingVertical: 4,
            borderLeftWidth: 4,
            borderLeftColor: navigation.isFocused()
              ? COLORS.activeIndicator
              : "transparent",
          },

          drawerLabelStyle: {
            fontSize: 15,
            fontWeight: "600",
            marginLeft: -10,
          },
          overlayColor: "rgba(0, 0, 0, 0.5)",
        })}
      >
        <Drawer.Screen
          name="index"
          options={{
            drawerLabel: "Dashboard",
            title: "Dashboard",
            drawerIcon: ({ color }) => (
              <Ionicons name="grid" size={22} color={color} />
            ),
          }}
        />

        <Drawer.Screen
          name="room-category"
          options={{
            drawerLabel: "Room Category",
            title: "Room Category",
            drawerIcon: ({ color }) => (
              <Ionicons name="bed" size={22} color={color} />
            ),
          }}
        />

        <Drawer.Screen
          name="todays-check-in"
          options={{
            drawerLabel: "Today's Check In",
            title: "Today's Check In",
            drawerIcon: ({ color }) => (
              <Ionicons name="calendar" size={22} color={color} />
            ),
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  brandSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  brandIcon: {
    backgroundColor: "#E6FFFA",
    padding: 8,
    borderRadius: 6,
    marginRight: 12,
  },
  brandText: {
    color: COLORS.teal,
    fontSize: 18,
    fontWeight: "700",
  },
  profileSection: {
    backgroundColor: COLORS.bgUserSection,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.primaryBlue,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  profileName: {
    color: COLORS.textMain,
    fontSize: 15,
    fontWeight: "700",
  },
  profileRole: {
    color: COLORS.textSubtle,
    fontSize: 12,
    fontWeight: "400",
  },
});
