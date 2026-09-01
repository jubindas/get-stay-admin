import { Feather } from "@expo/vector-icons";

import React, { useState } from "react";

import {
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import DrawerMenu from "./DrawerMenu";

const Header = () => {

  const [drawerVisible, setDrawerVisible] = useState(false);

  return (
    <>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

        <View style={styles.headerContainer}>
          {/* Menu Button */}
          <TouchableOpacity
            onPress={() => setDrawerVisible(true)}
            style={styles.actionBtn}
            activeOpacity={0.7}
          >
            <Feather name="menu" size={24} color="#0F172A" />
          </TouchableOpacity>

          {/* Styled Text Logo */}
          <View style={styles.logoWrapper}>
            <Text style={styles.logoMain}>
              Getstay <Text style={styles.logoHost}>Host</Text>
            </Text>
          </View>

          {/* Notification Button */}
          <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
            <View style={styles.iconContainer}>
              <Feather name="bell" size={22} color="#0F172A" />
              {/* Modern Notification Badge */}
              <View style={styles.badge} />
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* DRAWER */}
      <DrawerMenu visible={drawerVisible} setVisible={setDrawerVisible} />
    </>
  );
};

export default Header;

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#ffffff",
    // Standard shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    // Standard shadow for Android
    elevation: 3,
    zIndex: 10,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  logoWrapper: {
    flex: 1,
    alignItems: "center",
  },
  logoMain: {
    fontSize: 20,
    fontWeight: "800", // Extra bold for brand presence
    color: "#0F172A",
    letterSpacing: -0.5,
  },
  logoHost: {
    color: "#4F6EF7", // Using the accent color from your login page
    fontWeight: "500", // Slightly lighter for contrast
  },
  actionBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: "#F8FAFC", // Subtle button background
  },
  iconContainer: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#EF4444", // Bright red for attention
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
});
