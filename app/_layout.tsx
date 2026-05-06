import { Stack } from "expo-router";
import React from "react";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade_from_bottom",
        animationDuration: 350,
        contentStyle: {
          backgroundColor: "#FFFFFF",
        },
        orientation: "portrait",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="add-rooms" />
      <Stack.Screen name="room-category" />
      <Stack.Screen name="todays-check-in" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="login" />
    </Stack>
  );
}
