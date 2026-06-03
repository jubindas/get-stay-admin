import { useAuth } from "@/provider/AuthProvider";
import { Feather } from "@expo/vector-icons";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// ── Per-item switcher row, each animates independently ──
const SwitcherItem = ({
  account,
  onPress,
  index,
  open,
}: {
  account: any;
  onPress: () => void;
  index: number;
  open: boolean;
}) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: open ? 1 : 0,
      duration: open ? 220 + index * 50 : 150,
      delay: open ? index * 40 : 0,
      easing: open ? Easing.out(Easing.quad) : Easing.in(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [open]);

  const opacity = anim;

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-8, 0],
  });

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <TouchableOpacity
        style={styles.switcherItem}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Image source={account.avatar} style={styles.switcherAvatar} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.switcherName} numberOfLines={1}>
            {account.name}
          </Text>
          <Text style={styles.switcherRole} numberOfLines={1}>
            {account.role}
          </Text>
        </View>
        <View style={styles.switchArrow}>
          <Feather
            name="chevron-right"
            size={14}
            color="#64748B"
          />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export const AccountSwitcher = () => {
  const { token } = useAuth();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [activeAccount, setActiveAccount] = useState<any>(null);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const switcherHeight = useRef(new Animated.Value(0)).current;
  const switcherOpacity = useRef(new Animated.Value(0)).current;
  const chevronAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchMyProperties = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/host/properties`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const properties = response.data.properties || [];
        const formattedAccounts = properties.map((prop: any) => {
          // Attempt to extract image url safely
          let avatarSource = require("../assets/img/logo.png");
          if (prop.property_images && prop.property_images.length > 0) {
            const firstImg = prop.property_images[0];
            if (typeof firstImg === 'string') {
              avatarSource = { uri: firstImg };
            } else if (firstImg && firstImg.url) {
              avatarSource = { uri: firstImg.url };
            }
          }

          return {
            id: prop.id,
            name: prop.property_name,
            role: `${prop.address_display || ""} ${prop.city || ""}`.trim() || "Property",
            avatar: avatarSource,
          };
        });

        setAccounts(formattedAccounts);
        if (formattedAccounts.length > 0) {
          setActiveAccount(formattedAccounts[0]);
        }
      } catch (error) {
        console.log("Error fetching properties:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchMyProperties();
    } else {
      setLoading(false);
    }
  }, [token]);

  const OTHER_ACCOUNTS = accounts.filter((a) => a.id !== activeAccount?.id);
  const EXPANDED_HEIGHT = OTHER_ACCOUNTS.length * 62 + 24;

  const openSwitcher = () => {
    if (OTHER_ACCOUNTS.length === 0) return;
    setSwitcherOpen(true);
    Animated.parallel([
      Animated.timing(switcherHeight, {
        toValue: EXPANDED_HEIGHT,
        duration: 280,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
      Animated.timing(switcherOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(chevronAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeSwitcher = () => {
    Animated.parallel([
      Animated.timing(switcherHeight, {
        toValue: 0,
        duration: 220,
        easing: Easing.in(Easing.quad),
        useNativeDriver: false,
      }),
      Animated.timing(switcherOpacity, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }),
      Animated.timing(chevronAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => setSwitcherOpen(false));
  };

  const toggleSwitcher = () =>
    switcherOpen ? closeSwitcher() : openSwitcher();

  const handleSwitchAccount = (account: any) => {
    closeSwitcher();
    setTimeout(() => setActiveAccount(account), 200);
  };

  const chevronRotate = chevronAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  if (loading) {
    return (
      <View style={[styles.profileRow, { paddingVertical: 12, justifyContent: 'center' }]}>
        <ActivityIndicator color="#FFFFFF" size="small" />
      </View>
    );
  }

  if (!activeAccount) {
    return (
      <View style={[styles.profileRow, { paddingVertical: 12 }]}>
        <Text style={styles.userName}>No properties found</Text>
      </View>
    );
  }

  return (
    <>
      <TouchableOpacity
        style={styles.profileRow}
        onPress={OTHER_ACCOUNTS.length > 0 ? toggleSwitcher : undefined}
        activeOpacity={0.75}
      >
        <View style={styles.avatarContainer}>
          <Image source={activeAccount.avatar} style={styles.avatarImage} />
        </View>
        <View style={{ marginLeft: 16, flex: 1 }}>
          <Text style={styles.userName} numberOfLines={1}>{activeAccount.name}</Text>
          <Text style={styles.userRole} numberOfLines={1}>{activeAccount.role}</Text>
        </View>
        {OTHER_ACCOUNTS.length > 0 && (
          <Animated.View
            style={{ transform: [{ rotate: chevronRotate }], marginRight: 2 }}
          >
            <Feather
              name="chevron-down"
              size={18}
              color="rgba(255,255,255,0.75)"
            />
          </Animated.View>
        )}
      </TouchableOpacity>

      {OTHER_ACCOUNTS.length > 0 && (
        <Animated.View style={{ height: switcherHeight, overflow: "hidden" }}>
          <Animated.View style={{ opacity: switcherOpacity }}>
            <View style={styles.switcherContainer}>
              {OTHER_ACCOUNTS.map((account, i) => (
                <SwitcherItem
                  key={account.id}
                  account={account}
                  index={i}
                  open={switcherOpen}
                  onPress={() => handleSwitchAccount(account)}
                />
              ))}
            </View>
          </Animated.View>
        </Animated.View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
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
  switcherContainer: {
    marginTop: 16,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  switcherItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
  },
  switcherAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    resizeMode: "cover",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  switcherName: {
    color: "#0F172A",
    fontSize: 14,
    fontWeight: "700",
  },
  switcherRole: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 2,
  },
  switchArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
});
