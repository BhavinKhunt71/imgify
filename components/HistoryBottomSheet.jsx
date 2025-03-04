import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  useColorScheme,
  Alert,
  ToastAndroid,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import * as Clipboard from "expo-clipboard";
import { useFocusEffect } from "@react-navigation/native";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import RevenuCartUI from "react-native-purchases-ui";
import LeftArrow from "@/assets/icon/left-arrow.svg";
import { LinearGradient } from "expo-linear-gradient";
import Crown from "@/assets/icon/crown.svg";
import CopyInvert from "@/assets/icon/copy-invert.svg";
import Delete from "@/assets/icon/delete.svg";
const HistoryBottomSheet = ({ bottomSheetRef }) => {
  const [historyData, setHistoryData] = useState([]);
  const colorScheme = useColorScheme();
  const snapPoints = useMemo(() => ["100%", "50%"], []);

  // Fetch history from AsyncStorage
  const fetchHistory = async () => {
    const storedHistory = await AsyncStorage.getItem("history");
    if (storedHistory) {
      const parsedData = JSON.parse(storedHistory);
      const groupedData = groupByDay(parsedData);
      setHistoryData(groupedData);
    }
  };

  const groupByDay = (data) => {
    const grouped = {};
    const today = new Date();
    const todayString = today.toDateString();

    data.forEach((item) => {
      const itemDate = new Date(item.date);
      const itemDateString = itemDate.toDateString();
      const groupLabel =
        itemDateString === todayString
          ? "Today"
          : itemDate.toLocaleDateString("default", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            });

      if (!grouped[groupLabel]) grouped[groupLabel] = [];
      grouped[groupLabel].push(item);
    });

    return Object.entries(grouped); // Convert object to array of [dayLabel, items]
  };

  const deletePrompt = async (id) => {
    const storedHistory = await AsyncStorage.getItem("history");

    const parsedData = JSON.parse(storedHistory);

    const updatedHistory = parsedData.filter((items) => items.id !== id);

    await AsyncStorage.setItem("history", JSON.stringify(updatedHistory));
    const groupUpdatedHistory = groupByDay(updatedHistory);
    setHistoryData(groupUpdatedHistory);
  };

  const copyToClipboard = async (prompt) => {
      try {
         await Clipboard.setStringAsync(prompt);
         ToastAndroid.show("Prompt copied successfully!", ToastAndroid.LONG);
       } catch (error) {
         ToastAndroid.show("Failed to copy prompt.", ToastAndroid.LONG);
       }
  };

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [])
  );

  const renderCard = useCallback(
    ({ item }) => (
      <LinearGradient
        colors={["#DC4435", "#CD9215", "#DC4435"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={styles.gradientBorder}
      >
        <View style={styles.card}>
          <Text style={styles.prompt}>
            {item.prompt.length == 0 ? "Nothing to see..." : item.prompt}
          </Text>
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => deletePrompt(item.id)}>
              <Delete />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => copyToClipboard(item.prompt)}>
              <CopyInvert
                style={{
                  color: colorScheme === "dark" ? "#ffffff" : "#110F12",
                }}
              />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    ),
    [colorScheme]
  );

  const renderGroup = ({ item }) => {
    const [dayLabel, prompts] = item;
    return (
      <View style={styles.group}>
        <Text style={styles.dayLabel}>{dayLabel}</Text>
        <FlatList
          data={prompts}
          keyExtractor={(item) => item.id}
          renderItem={renderCard}
          style={styles.groupList}
        />
      </View>
    );
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          paddingHorizontal: 20,
        },
        bottomSheetBackground: {
          backgroundColor: colorScheme === "dark" ? "#050206" : "#fff",
        },
        header: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingVertical: 8,
          flexDirection: "row",
        },
        leftHeader: {
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          gap: 20,
          flexDirection: "row",
        },
        rightHeader: {
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          gap: 12,
          flexDirection: "row",
        },
        title: {
          fontSize: 16,
          lineHeight: 20,
          letterSpacing: -0.03 * 20,
          fontFamily: "LexendDeca_400Regular",
          color: colorScheme === "dark" ? "#fff" : "#000",
        },
        proButton: {
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 12,
          height: 38,
          borderRadius: 10,
          shadowColor: "rgba(210, 74, 74, 0.63)",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 1,
          shadowRadius: 5,
          elevation: 15,
          gap: 4,
        },
        proButtonText: {
          fontFamily: "Poppins_500Medium",
          fontSize: 13,
          lineHeight: 19.5,
          letterSpacing: -0.03 * 20,
          color: "#fff",
          marginTop: 2.5,
        },
        group: {
          marginBottom: 16,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        },
        groupList: {
          display: "flex",
          flexDirection: "column",
          gap: 12,
        },
        dayLabel: {
          fontSize: 16,
          fontWeight: "bold",
          color: colorScheme === "dark" ? "#fff" : "#050206",
          marginBottom: 8,
        },
        card: {
          padding: 18,
          borderRadius: 14,
          // marginBottom: 8,
          backgroundColor: colorScheme === "dark" ? "#050206" : "#fff",
          display: "flex",
          flexDirection: "row",
          gap: 16,
          width: "100%",
          justifyContent: "space-between",
        },
        prompt: {
          fontFamily: "Poppins_300Light",
          fontSize: 12,
          lineHeight: 18,
          letterSpacing: -0.02 * 20,
          color: colorScheme === "dark" ? "#948B9C" : "#665A70",
        },
        actions: {
          flexDirection: "column",
          justifyContent: "flex-end",
          gap: 24,
          alignItems: "center",
        },
        gradientBorder: {
          padding: 1.5,
          borderRadius: 14,
        },
      }),
    [colorScheme]
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      handleIndicatorStyle={{ display: "none" }}
      backgroundStyle={styles.bottomSheetBackground}
      style={styles.container}
    >
      <View style={styles.header}>
        <View style={styles.leftHeader}>
          <TouchableOpacity onPress={() => bottomSheetRef.current.close()}>
            <LeftArrow
              style={{
                color: colorScheme === "dark" ? "#ffffff" : "#050206",
              }}
            />
          </TouchableOpacity>
          <Text style={styles.title}>History</Text>
        </View>

        <TouchableOpacity onPress={() => RevenuCartUI.presentPaywall()}>
          <LinearGradient
            colors={["#DF3939", "#CD9315", "#E9943E"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.proButton]}
          >
            <Crown />
            <Text style={[styles.proButtonText]}>Get Pro</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
      <BottomSheetFlatList
        data={historyData}
        keyExtractor={(item) => item[0]}
        renderItem={renderGroup}
      />
    </BottomSheet>
  );
};

export default HistoryBottomSheet;
