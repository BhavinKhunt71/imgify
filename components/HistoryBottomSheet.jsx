import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  useColorScheme,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import * as Clipboard from "expo-clipboard";
import { useFocusEffect } from "@react-navigation/native";
import { Feather, MaterialIcons } from "@expo/vector-icons";

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

  const copyToClipboard = (prompt) => {
    Clipboard.setStringAsync(prompt);
    Alert.alert("Copied", "Prompt has been copied to clipboard!");
  };

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [])
  );

  const renderCard = useCallback(
    ({ item }) => (
      <View style={styles.card}>
        <Text style={styles.prompt}>{item.prompt}</Text>
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => deletePrompt(item.id)}>
            <MaterialIcons name="delete-outline" size={24} color="#d9534f" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => copyToClipboard(item.prompt)}>
            <Feather
              name="copy"
              size={20}
              color={colorScheme === "dark" ? "white" : "black"}
            />
          </TouchableOpacity>
        </View>
      </View>
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
        />
      </View>
    );
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        bottomSheetBackground: {
          backgroundColor: colorScheme === "dark" ? "#333" : "#fff",
        },
        header: {
          flexDirection: "row",
          justifyContent: "space-between",
          padding: 16,
          borderBottomWidth: 1,
          borderBottomColor: colorScheme === "dark" ? "#444" : "#ddd",
        },
        headerText: {
          fontSize: 18,
          fontWeight: "bold",
          color: colorScheme === "dark" ? "#fff" : "#000",
        },
        closeButton: {
          padding: 8,
        },
        closeButtonText: {
          color: colorScheme === "dark" ? "#fff" : "#000",
          fontSize: 16,
        },
        group: {
          paddingHorizontal: 16,
          paddingVertical: 8,
        },
        dayLabel: {
          fontSize: 16,
          fontWeight: "bold",
          color: colorScheme === "dark" ? "#ccc" : "#444",
          marginBottom: 8,
        },
        card: {
          padding: 16,
          borderRadius: 8,
          marginBottom: 8,
          backgroundColor: colorScheme === "dark" ? "#444" : "#f9f9f9",
        },
        prompt: {
          fontSize: 14,
          color: colorScheme === "dark" ? "#fff" : "#000",
          marginBottom: 8,
        },
        actions: {
          flexDirection: "row",
          justifyContent: "flex-end",
          gap: 12,
          alignItems: "center",
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
    >
      <View style={styles.header}>
        <Text style={styles.headerText}>History</Text>
        <TouchableOpacity
          onPress={() => bottomSheetRef.current.close()}
          style={styles.closeButton}
        >
          <Text style={styles.closeButtonText}>Close</Text>
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
