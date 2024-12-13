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
  const isDarkMode = colorScheme === "dark";
  const snapPoints = useMemo(() => ["100%", "50%"], []);

  const styles = createStyles(isDarkMode);

  // Fetch history from AsyncStorage
  const fetchHistory = async () => {
    const storedHistory = await AsyncStorage.getItem("history");
    if (storedHistory) {
      const parsedData = JSON.parse(storedHistory);
      const groupedData = groupByMonth(parsedData);
      setHistoryData(groupedData);
    }
  };

  const groupByMonth = (data) => {
    const grouped = {};
    data.forEach((item) => {
      const month = new Date(item.date).toLocaleString("default", {
        month: "long",
        year: "numeric",
      });
      if (!grouped[month]) grouped[month] = [];
      grouped[month].push(item);
    });
    return Object.entries(grouped); // Convert object to array of [month, items]
  };

  const deletePrompt = async (id) => {
    const storedHistory = await AsyncStorage.getItem("history");

    const parsedData = JSON.parse(storedHistory);

    const updatedHistory = parsedData.filter((items) => items.id != id);

    await AsyncStorage.setItem("history", JSON.stringify(updatedHistory));
    const groupUpdatedHistory = groupByMonth(updatedHistory);
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
          <TouchableOpacity
            // style={[styles.button, styles.deleteButton]}
            onPress={() => deletePrompt(item.id)}
          >
            <MaterialIcons name="delete-outline" size={24} color="#d9534f" />
            {/* <Text style={styles.buttonText}>Delete</Text> */}
          </TouchableOpacity>
          <TouchableOpacity
            // style={[styles.button, styles.copyButton]}
            onPress={() => copyToClipboard(item.prompt)}
          >
            <Feather
              name="copy"
              size={20}
              color={colorScheme == "dark" ? "white" : "black"}
            />
          </TouchableOpacity>
        </View>
      </View>
    ),
    []
  );

  const renderGroup = ({ item }) => {
    const [month, prompts] = item;
    return (
      <View style={styles.group}>
        <Text style={styles.month}>{month}</Text>
        <FlatList
          data={prompts}
          keyExtractor={(item) => item.id}
          renderItem={renderCard}
        />
      </View>
    );
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
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

const createStyles = (isDarkMode) =>
  StyleSheet.create({
    bottomSheetBackground: {
      backgroundColor: isDarkMode ? "#333" : "#fff",

      //   zIndex : 999
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? "#444" : "#ddd",
    },
    headerText: {
      fontSize: 18,
      fontWeight: "bold",
      color: isDarkMode ? "#fff" : "#000",
    },
    closeButton: {
      padding: 8,
    },
    closeButtonText: {
      color: isDarkMode ? "#fff" : "#000",
      fontSize: 16,
    },
    group: {
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    month: {
      fontSize: 16,
      fontWeight: "bold",
      color: isDarkMode ? "#ccc" : "#444",
      marginBottom: 8,
    },
    card: {
      padding: 16,
      borderRadius: 8,
      marginBottom: 8,
      backgroundColor: isDarkMode ? "#444" : "#f9f9f9",
    },
    prompt: {
      fontSize: 14,
      color: isDarkMode ? "#fff" : "#000",
      marginBottom: 8,
    },
    actions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap : 12,
      alignItems: "center",
    },
    button: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 4,
    },
    deleteButton: {
      backgroundColor: "#d9534f",
    },
    copyButton: {
      backgroundColor: "#5bc0de",
    },
    buttonText: {
      color: "#fff",
      fontSize: 14,
    },
  });

export default HistoryBottomSheet;
