import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import RevenueChart from '../components/RevenueChart';

const COLORS = {
  primaryBlue: "#003399",
  bg: "#F4F6F8",
  white: "#FFFFFF",
  textMain: "#1F2937",
  textSubtle: "#6B7280",
  green: "#10B981",
};

export default function Revenue() {
    return (
        <SafeAreaView edges={["top"]} style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            
            {/* Header */}
            <View style={styles.headerContainer}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.actionBtn}
                    activeOpacity={0.7}
                >
                    <Feather name="arrow-left" size={24} color="#0F172A" />
                </TouchableOpacity>
                
                <View style={styles.titleWrapper}>
                    <Text style={styles.headerTitle}>Revenue Overview</Text>
                </View>
                
                {/* Empty view to balance the header flex */}
                <View style={{ width: 40 }} />
            </View>

            <ScrollView 
                style={styles.container} 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollPadding}
            >
                <View style={styles.summaryGrid}>
                    <View style={styles.summaryCard}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="wallet-outline" size={20} color={COLORS.primaryBlue} />
                        </View>
                        <Text style={styles.summaryLabel}>Total Balance</Text>
                        <Text style={styles.summaryValue}>₹3,45,000</Text>
                    </View>
                    <View style={styles.summaryCard}>
                        <View style={[styles.iconCircle, { backgroundColor: '#ECFDF5' }]}>
                            <Ionicons name="trending-up-outline" size={20} color={COLORS.green} />
                        </View>
                        <Text style={styles.summaryLabel}>This Month</Text>
                        <Text style={styles.summaryValue}>₹52,000</Text>
                    </View>
                </View>

                <View style={styles.chartContainer}>
                    <RevenueChart />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#ffffff",
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
    actionBtn: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 12,
        backgroundColor: "#F8FAFC",
    },
    titleWrapper: {
        flex: 1,
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#0F172A",
    },
    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    scrollPadding: {
        padding: 20,
        paddingBottom: 40,
    },
    summaryGrid: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    summaryCard: {
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: 16,
        width: '48%',
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#EFF6FF",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },
    summaryLabel: {
        fontSize: 12,
        color: COLORS.textSubtle,
        fontWeight: "600",
        marginBottom: 4,
    },
    summaryValue: {
        fontSize: 18,
        fontWeight: "800",
        color: COLORS.textMain,
    },
    chartContainer: {
        marginTop: 10,
    }
});