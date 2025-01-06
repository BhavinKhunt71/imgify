import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "react-query";
import Purchases from "react-native-purchases";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    // console.log(process.env.EXPO_RC_Android);
    // if (process.env.EXPO_RC_Android) {
    Purchases.setLogLevel(Purchases.LOG_LEVEL.VERBOSE);
    Purchases.configure({ apiKey: "goog_cmtdtgPFbSMJlfaTXIMNgLFFehn" });
    // }

    console.log("hello");
    Purchases.getOfferings().catch((error) => {
      console.error("Error fetching offerings:", error);
    });
  }, []);

  if (!loaded) {
    return null;
  }

  return (
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="light" />
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
        </QueryClientProvider>
      </ThemeProvider>
  );
}
