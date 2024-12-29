import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  useColorScheme,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { useMutation } from "react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import { AntDesign, Feather, FontAwesome, Ionicons } from "@expo/vector-icons";
import { Button } from "@rneui/themed";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import uuid from "react-native-uuid";
import { useFocusEffect } from "@react-navigation/native";
import { collection, addDoc } from "firebase/firestore";
import db from "@/firebaseConfig";
import { fal } from "@fal-ai/client";
global.Buffer = require("buffer").Buffer;

const { height } = Dimensions.get("window");

fal.config({
  credentials:
    "b6903f46-6ad2-43f4-aa77-0ef7295c133e:bbe9490f80ea13d003999a3c6d4a4b39",
});

async function queryAPI(imagePrompt) {
  try {
    console.log(imagePrompt);
    const result = await fal.subscribe("fal-ai/flux/schnell", {
      input: {
        prompt: imagePrompt.inputs,
        image_size: {
          width: imagePrompt.width,
          height: imagePrompt.height,
        },
        num_images: 1,
        num_inference_steps: 4,
        enable_safety_checker: true,
      },
    });
    if (!result?.data?.images[0]?.url) {
      throw new Error("No image generated");
    }

    // Convert the image URL to base64
    const response = await fetch(result.data.images[0].url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error making the request:", error);
    throw error;
  }
}

const index = () => {
  const { prompt, width, height } = useLocalSearchParams();

  const [imageUri, setImageUri] = useState(null);
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [selectedReportOption, setSelectedReportOption] = useState(null);
  const [loadingStage, setLoadingStage] = useState("Analyzing your prompt");
  const router = useRouter();
  const colorScheme = useColorScheme();

  const { mutate, isLoading } = useMutation(queryAPI, {
    onSuccess: async (data) => {
      setImageUri(data);
      const newPromptData = {
        prompt,
        date: new Date().toISOString(),
        id: uuid.v4(),
      };

      try {
        const storedHistory = await AsyncStorage.getItem("history");
        let history = storedHistory ? JSON.parse(storedHistory) : [];

        // Remove old instance if the prompt already exists
        history = history.filter((item) => item.prompt !== prompt);

        // Add the new prompt at the beginning
        history.unshift(newPromptData);

        // Save updated history back to AsyncStorage
        await AsyncStorage.setItem("history", JSON.stringify(history));
      } catch (error) {}
    },
    onError: async () => {
      try {
        await addDoc(collection(db, "users"), {
          error: "Failed to generate the image.",
        });
      } catch (e) {
        console.log(e);
      }
      Alert.alert("Error", "Failed to generate the image.");
    },
  });

  useEffect(() => {
    const loadingStages = [
      "Analyzing your prompt",
      "Creating your art",
      "Almost there...",
    ];
    let stageIndex = 0;

    const interval = setInterval(() => {
      if (stageIndex < loadingStages.length) {
        setLoadingStage(loadingStages[stageIndex]);
        stageIndex++;
      }
    }, 2000); // Change the interval time as needed

    return () => clearInterval(interval);
  }, []);

  useFocusEffect(
    useCallback(() => {
      mutate({ inputs: prompt, width: width, height: height });
    }, [mutate, prompt,width,height])
  );

  const requestMediaLibraryPermission = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "We need permission to access your media library to save images."
      );
      throw new Error("Permission not granted");
    }
  };

  const handleDownload = async () => {
    try {
      await requestMediaLibraryPermission();
      if (imageUri && imageUri.startsWith("data:")) {
        // Extract Base64 string from the data URI
        const base64Data = imageUri.split(",")[1];

        // Define a local file path
        const fileUri = `${FileSystem.cacheDirectory}downloaded_image.png`;

        // Write the Base64 data to the file
        await FileSystem.writeAsStringAsync(fileUri, base64Data, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // Save the file to the media library
        const asset = await MediaLibrary.createAssetAsync(fileUri);
        await MediaLibrary.createAlbumAsync("SavedImages", asset, false);

        Alert.alert(
          "Download Complete",
          "Image has been downloaded to your device."
        );
        console.log("Image downloaded to gallery.");
      } else {
        Alert.alert(
          "Invalid Image",
          "The image URI is not in a valid format for downloading."
        );
      }
    } catch (error) {
      console.error("Error while downloading the image:", error);
      Alert.alert("Download Failed", "Unable to download the image.");
    }
  };

  const handleShare = async () => {
    if (await Sharing.isAvailableAsync()) {
      const fileUri = FileSystem.documentDirectory + "shared_image.png";
      await FileSystem.writeAsStringAsync(fileUri, imageUri.split(",")[1], {
        encoding: FileSystem.EncodingType.Base64,
      });
      await Sharing.shareAsync(fileUri);
    }
  };

  const handleOnClose = () => {
    setImageUri(null);
    router.back();
  };

  const handleFlagOpen = () => setShowFlagModal(true);
  const handleFlagClose = () => setShowFlagModal(false);

  const handleReportSubmit = () => {
    if (!selectedReportOption) {
      Alert.alert(
        "No Option Selected",
        "Please select a reason before submitting your report."
      );
      return;
    }
    setShowFlagModal(false);
    Alert.alert(
      "Report Submitted",
      "Thank you for reporting. Our team will review this."
    );
    setSelectedReportOption(null); // Reset selection
  };

  const themeColors = colorScheme === "dark" ? darkTheme : lightTheme;

  return (
    <>
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={colorScheme === "dark" ? "#fffefe" : "#161716"}
          />
          <Text style={[styles.loadingText, themeColors.subtitle]}>
            {loadingStage}
          </Text>
        </View>
      )}
      {/* <View> */}
      <View style={[styles.modalContainer, themeColors.modalContainer]}>
        <View style={styles.modelHeader}>
          <TouchableOpacity
            onPress={handleOnClose}
            style={[styles.backButton, themeColors.backButton]}
          >
            <Ionicons
              name="chevron-back-sharp"
              size={20}
              color={colorScheme === "dark" ? "#fffefe" : "#161716"}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleFlagOpen}
            style={[styles.backButton, themeColors.backButton]}
          >
            <Ionicons
              name="flag-outline"
              size={20}
              color={colorScheme === "dark" ? "#fffefe" : "#161716"}
            />
          </TouchableOpacity>
        </View>
        <View style={[styles.imageContainer, themeColors.imageContainer]}>
          <Image
            source={{ uri: imageUri }}
            style={{ width: "100%", height: "100%", resizeMode: "contain" }}
          />
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={handleDownload}
            style={[styles.modelButton, themeColors.button]}
          >
            <Feather name="download" size={20} color="#fff" />
            <Text style={styles.buttonText}>Download</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleShare}
            style={[styles.modelButton, themeColors.button]}
          >
            <FontAwesome name="share" size={20} color="#fff" />
            <Text style={styles.buttonText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* </View> */}

      {/* Flag Modal */}
      <Modal
        visible={showFlagModal}
        transparent={true}
        animationType="slide"
        onRequestClose={handleFlagClose}
      >
        <View style={[styles.modalContainer, themeColors.modalContainer]}>
          <TouchableOpacity
            onPress={handleFlagClose}
            style={[styles.modalCloseButton, themeColors.backButton]}
          >
            <AntDesign
              name="close"
              size={20}
              color={colorScheme === "dark" ? "#fffefe" : "#161716"}
            />
          </TouchableOpacity>
          <View style={[styles.modalContent, themeColors.inputContainer]}>
            <Text style={[styles.modalTitle, themeColors.title]}>
              Report Content
            </Text>
            <Text style={[styles.modalSubtitle, themeColors.subtitle]}>
              Please select a reason for reporting:
            </Text>
            <View style={styles.radioContainer}>
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => setSelectedReportOption("Offensive Content")}
              >
                <View
                  style={[
                    styles.radioCircle,
                    selectedReportOption === "Offensive Content" &&
                      styles.radioCircleSelected,
                  ]}
                />
                <Text style={[styles.radioLabel, themeColors.subtitle]}>
                  Offensive Content
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() =>
                  setSelectedReportOption("Inaccurate Information")
                }
              >
                <View
                  style={[
                    styles.radioCircle,
                    selectedReportOption === "Inaccurate Information" &&
                      styles.radioCircleSelected,
                  ]}
                />
                <Text style={[styles.radioLabel, themeColors.subtitle]}>
                  Inaccurate Information
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => setSelectedReportOption("Spam or Irrelevant")}
              >
                <View
                  style={[
                    styles.radioCircle,
                    selectedReportOption === "Spam or Irrelevant" &&
                      styles.radioCircleSelected,
                  ]}
                />
                <Text style={[styles.radioLabel, themeColors.subtitle]}>
                  Spam or Irrelevant
                </Text>
              </TouchableOpacity>
            </View>
            <Button
              title="Submit Report"
              onPress={handleReportSubmit}
              buttonStyle={[styles.button, themeColors.button]}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

export default index;

const darkTheme = StyleSheet.create({
  container: { backgroundColor: "#121212" },
  title: { color: "#fff" },
  subtitle: { color: "#d1d1d1" },
  input: {
    backgroundColor: "#121212",
    color: "#d1d1d1",
    borderColor: "#5e278e",
  },
  inputContainer: {
    borderColor: "#a170dc",
  },
  placeholderColor: "#d1d1d1",
  label: { color: "#fffefe" },
  sliderThumb: "#a170dc",
  button: { backgroundColor: "#a660ff" },
  modalContainer: { backgroundColor: "#121212" },
  backButton: { backgroundColor: "#2d2d2c" },
  exampleImage: { backgroundColor: "#2d2d2c" },
  imageContainer: { backgroundColor: "#2d2d2c" },
  errorBorder: "#ff4d4d",
  errorText: { color: "#ff4d4d" },
});

const lightTheme = {
  container: { backgroundColor: "#fffefe" },
  title: { color: "#000" },
  subtitle: { color: "#161716" },
  input: {
    backgroundColor: "#fffefe",
    color: "#161716",
  },
  inputContainer: {
    borderColor: "#8051c1",
  },
  placeholderColor: "#161716",
  label: { color: "#161716" },
  sliderThumb: "#8051c1",
  button: { backgroundColor: "#903aff" },
  modalContainer: { backgroundColor: "#fffefe" },
  backButton: { backgroundColor: "#ececec" },
  exampleImage: { backgroundColor: "#eceded" },
  imageContainer: { backgroundColor: "#eceded" },
  errorBorder: "#ff4d4d",
  errorText: { color: "#ff4d4d" },
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 32, fontWeight: "bold" },
  subtitle: { fontSize: 16, marginTop: 24, marginBottom: 16 },
  inputContainer: {
    borderWidth: 1.5,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    height: 150,
  },
  input: {
    fontSize: 14,
    padding: 0,
  },
  sliderThumbStyle: {
    height: 24,
    width: 24,
  },
  sliderContainer: { marginBottom: 20 },
  button: {
    borderRadius: 8,
  },
  clearButton: {
    position: "absolute",
    right: 15,
    bottom: 10,
  },
  errorText: {
    fontSize: 14,
    marginBottom: 8,
  },
  modalContainer: {
    flex: 1,
    display: "flex",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  imageContainer: {
    width: "100%",
    height: height / 1.7,
    display: "flex",
    justifyContent: "center",
    justifyContent: "center",
    objectFit: "contain",
  },
  buttonContainer: {
    display: "flex",
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
    marginBottom: 20,
  },
  modelButton: {
    display: "flex",
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    width: 150,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  exampleImage: {
    width: "49%",
    aspectRatio: 1,
    marginBottom: 10,
    borderRadius: 10,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)", // Semi-transparent background
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10, // Ensures it appears on top of everything
  },
  loadingText: {
    marginTop: 16,
    textAlign: "center",
  },
  modalCloseButton: {
    position: "absolute",
    top: 16,
    right: 16,
    padding: 8,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 20,
  },
  modalContent: {
    padding: 16,
    borderRadius: 8,
    margin: 20,
  },
  modelHeader: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    justifyContent: "space-between",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  modalSubtitle: {
    fontSize: 16,
    marginBottom: 12,
  },
  radioContainer: {
    marginBottom: 16,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#8051c1",
    marginRight: 12,
  },
  radioCircleSelected: {
    backgroundColor: "#8051c1",
  },
  radioLabel: {
    fontSize: 16,
  },
});
