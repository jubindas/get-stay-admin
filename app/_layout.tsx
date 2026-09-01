import { AuthProvider, useAuth } from "@/provider/AuthProvider";

import { Stack, useRouter } from "expo-router";

import React, { useEffect } from "react";

function NavigationGuard({ children }: { children: React.ReactNode }) {

  const { token, loading } = useAuth();

  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (token) {
      router.replace("/dashboard");
    } else {
      router.replace("/");
    }
  }, [token, loading]);

  if (loading) {
    return null;
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <NavigationGuard>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "fade",
            animationDuration: 350,
            contentStyle: {
              backgroundColor: "#FFFFFF",
            },
            orientation: "portrait",
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="register" />
          <Stack.Screen name="dashboard" />
          <Stack.Screen name="add-rooms" />
          <Stack.Screen name="room-category" />
          <Stack.Screen name="todays-check-in" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="settings" />
          <Stack.Screen name="book-rooms" />
          <Stack.Screen name="add-property" />
          <Stack.Screen name="my-rooms" />
          <Stack.Screen name="manage-rates" />
          <Stack.Screen name="add-rooms-temp" />
          <Stack.Screen name="revenue" />
        </Stack>
      </NavigationGuard>
    </AuthProvider>
  );
}
