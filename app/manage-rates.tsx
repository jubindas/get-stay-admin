import React, { useState } from "react";

import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { 
  Percent, 
  SlidersHorizontal, 
  Receipt, 
  Save, 
  CalendarDays, 
  CircleDollarSign 
} from "lucide-react-native";

import Header from "../components/Header";

export default function ManageRates() {

  const [basePrice, setBasePrice] = useState("2499");

  const [weekendPrice, setWeekendPrice] = useState("3299");

  const [discount, setDiscount] = useState("10");

  const [taxEnabled, setTaxEnabled] = useState(true);

  const [activeInput, setActiveInput] = useState(null);

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <View style={styles.iconContainer}>
            <SlidersHorizontal color="#0284c7" size={20} />
          </View>
          <View style={styles.heroTextContainer}>
            <Text style={styles.heroTitle}>Manage Room Rates</Text>
            <Text style={styles.heroSubtitle}>
              Update hotel room pricing, weekend charges, taxes, and tactical seasonal discounts.
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardMainTitle}>Rate Optimization</Text>
          
          
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Base Price Per Night</Text>
            <View style={[
              styles.inputContainer, 
              activeInput === "base" && styles.inputContainerActive
            ]}>
              <View style={styles.prefix}>
                <CircleDollarSign color={activeInput === "base" ? "#0284c7" : "#64748b"} size={18} />
              </View>
              <TextInput
                value={basePrice}
                onChangeText={setBasePrice}
                keyboardType="numeric"
                placeholder="0.00"
                placeholderTextColor="#94a3b8"
                style={styles.input}
                onFocus={() => setActiveInput("base")}
                onBlur={() => setActiveInput(null)}
              />
              <Text style={styles.suffixText}>RS</Text>
            </View>
          </View>

        
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Weekend Surge Premium</Text>
            <View style={[
              styles.inputContainer, 
              activeInput === "weekend" && styles.inputContainerActive
            ]}>
              <View style={styles.prefix}>
                <CalendarDays color={activeInput === "weekend" ? "#0284c7" : "#64748b"} size={18} />
              </View>
              <TextInput
                value={weekendPrice}
                onChangeText={setWeekendPrice}
                keyboardType="numeric"
                placeholder="0.00"
                placeholderTextColor="#94a3b8"
                style={styles.input}
                onFocus={() => setActiveInput("weekend")}
                onBlur={() => setActiveInput(null)}
              />
              <Text style={styles.suffixText}>USD</Text>
            </View>
          </View>
        </View>

        {/* Marketing & Discounts */}
        <View style={styles.card}>
          <Text style={styles.cardMainTitle}>Promotional Strategy</Text>
          
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Default Discount Offer</Text>
            <View style={[
              styles.inputContainer, 
              activeInput === "discount" && styles.inputContainerActive
            ]}>
              <TextInput
                value={discount}
                onChangeText={setDiscount}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#94a3b8"
                style={[styles.input, { paddingLeft: 16 }]}
                onFocus={() => setActiveInput("discount")}
                onBlur={() => setActiveInput(null)}
              />
              <View style={styles.suffixIcon}>
                <Percent color={activeInput === "discount" ? "#0284c7" : "#64748b"} size={16} />
              </View>
            </View>
          </View>
        </View>

      
        <View style={styles.toggleCard}>
          <View style={styles.toggleHeader}>
            <View style={styles.toggleIconBox}>
              <Receipt color="#10b981" size={20} />
            </View>
            <View style={styles.toggleTextPane}>
              <Text style={styles.toggleTitle}>Automate Regional Taxes</Text>
              <Text style={styles.toggleSubtitle}>
                Calculate and transparently attach mandatory dynamic itemized tax structures onto the room base totals.
              </Text>
            </View>
          </View>
          <Switch 
            value={taxEnabled} 
            onValueChange={setTaxEnabled}
            trackColor={{ false: "#e2e8f0", true: "#a7f3d0" }}
            thumbColor={taxEnabled ? "#10b981" : "#f1f5f9"}
          />
        </View>


        <TouchableOpacity style={styles.saveButton} activeOpacity={0.8}>
          <Save color="#ffffff" size={18} style={{ marginRight: 8 }} />
          <Text style={styles.saveButtonText}>Commit Rate Updates</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  content: {
    padding: 16,
  },
  heroCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconContainer: {
    backgroundColor: "#e0f2fe",
    padding: 10,
    borderRadius: 12,
    marginRight: 14,
  },
  heroTextContainer: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: "#64748b",
  },
  card: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardMainTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    color: "#475569",
    marginBottom: 6,
    fontWeight: "600",
  },
  inputContainer: {
    height: 48,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
  },
  inputContainerActive: {
    borderColor: "#0284c7",
    borderWidth: 1.5,
  },
  prefix: {
    paddingLeft: 12,
    paddingRight: 8,
    justifyContent: "center",
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 15,
    color: "#0f172a",
    fontWeight: "500",
  },
  suffixText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#94a3b8",
    paddingRight: 14,
  },
  suffixIcon: {
    paddingRight: 14,
    justifyContent: "center",
  },
  toggleCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toggleHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
    paddingRight: 16,
  },
  toggleIconBox: {
    backgroundColor: "#d1fae5",
    padding: 8,
    borderRadius: 10,
    marginRight: 12,
    marginTop: 2,
  },
  toggleTextPane: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
  },
  toggleSubtitle: {
    fontSize: 12,
    color: "#64748b",
    lineHeight: 16,
    marginTop: 2,
  },
  saveButton: {
    backgroundColor: "#0f172a",
    height: 52,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
});

