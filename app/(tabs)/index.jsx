import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  useColorScheme,
  SafeAreaView,
  Dimensions,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Button } from "@rneui/themed";
import axios from "axios";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import { AntDesign, Feather, FontAwesome, Ionicons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "react-query";
import * as Localization from "expo-localization";
import { Filter } from "bad-words";
import naughtyWords from "naughty-words";

const { width, height } = Dimensions.get("window");

global.Buffer = require("buffer").Buffer;

async function queryAPI(QueryData) {
  try {
    const response = await axios({
      url: `https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell`,
      method: "POST",
      headers: {
        Authorization: `Bearer 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`,
        Accept: "application/json",
        "Content-Type": "application/json",
        "x-use-cache": "false",
      },
      data: JSON.stringify(QueryData),
      responseType: "arraybuffer",
    });
    // console.log(response);
    const mimeType = response.headers["content-type"];
    const result = response.data;

    const base64data = Buffer.from(result, "binary").toString("base64");
    const img = `data:${mimeType};base64,${base64data}`;

    return img;
  } catch (error) {
    console.error("Error making the request:", error);
    throw error;
  }
}

const imageData = [
  {
    id: "1",
    url: "https://res.cloudinary.com/shop-it-ecommerce/image/upload/v1731745826/p1_svkykd.jpg",
  },
  {
    id: "2",
    url: "https://res.cloudinary.com/shop-it-ecommerce/image/upload/v1731745826/p5_lv9xaq.jpg",
  },
  {
    id: "3",
    url: "https://res.cloudinary.com/shop-it-ecommerce/image/upload/v1731745827/p3_rvsd18.jpg",
  },
  {
    id: "4",
    url: "https://res.cloudinary.com/shop-it-ecommerce/image/upload/v1731745827/p2_pxllus.jpg",
  },
  {
    id: "5",
    url: "https://res.cloudinary.com/shop-it-ecommerce/image/upload/v1731745827/p6_k79pdz.jpg",
  },
  {
    id: "6",
    url: "https://res.cloudinary.com/shop-it-ecommerce/image/upload/v1731745827/p4_w9urhj.jpg",
  },
  {
    id: "7",
    url: "https://res.cloudinary.com/shop-it-ecommerce/image/upload/v1731745828/p8_ubswfl.jpg",
  },
  {
    id: "8",
    url: "https://res.cloudinary.com/shop-it-ecommerce/image/upload/v1731745828/p7_spk9b8.jpg",
  },
  {
    id: "9",
    url: "https://res.cloudinary.com/shop-it-ecommerce/image/upload/v1731745829/p10_fsfehk.jpg",
  },
  {
    id: "10",
    url: "https://res.cloudinary.com/shop-it-ecommerce/image/upload/v1731745905/p9_baurm4.jpg",
  },
];
const Imgify = () => {
  const [prompt, setPrompt] = useState("");
  const [imageUri, setImageUri] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [inputError, setInputError] = useState(false);
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [selectedReportOption, setSelectedReportOption] = useState(null);
  const colorScheme = useColorScheme();
  const filter = new Filter();
  filter.addWords("nude");
  // filter.removeWords("Stitch");
  // const locale = Localization.getLocales(); // e.g., "en-US", "fr-FR"
  // const language = locale[0].languageCode; // Extract the language code, e.g., "en", "fr"

  // // Merge the localized list with the English list
  // const profanityList = [
  //   ...new Set([...(naughtyWords[language] || []), ...naughtyWords.en]),
  // ];

  // const containsProfanity = (text) => {
  //   const lowerCaseText = text.toLowerCase();
  //   return profanityList.some((pWord) => lowerCaseText.includes(pWord.toLowerCase()));
  // };

  const { mutate, isLoading } = useMutation(queryAPI, {
    onSuccess: (data) => {
      setImageUri(data);
      setShowModal(true);
    },
    onError: () => {
      Alert.alert("Error", "Failed to generate the image.");
    },
  });

  const handleInputChange = (text) => {
    setPrompt(text);
    const detectedWords = filter.list.filter((word) =>
      text.toLowerCase().includes(word)
    );
    // console.log(filter.list)
    if (detectedWords.length > 0 && !text.toLowerCase().includes("stitch")) {
      setInputError(true);
    } else {
      setInputError(false);
    }
  };

  // const handleInputChange = (text) => {
  //   setPrompt(text);

  //   if (filter.isProfane(text)) {
  //     setInputError(true);
  //   } else {
  //     setInputError(false);
  //   }
  // };
   // React Query: useMutation for image generation

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

 const handleCreate = () => {
    if (inputError) {
      Alert.alert(
        "Policy Violation",
        "Your input contains prohibited content. Please revise your prompt."
      );
      return;
    }
    mutate({ inputs: prompt });
  };

  const handleOnClose = () => {
    setShowModal(false);
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

  const handleClearInput = () => {
    setPrompt("");
    setInputError(false);
    // setErrorWords([]);
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

  const renderExampleImages = () => {
    return (
      <FlatList
        data={imageData}
        renderItem={({ item }) => (
          <Image
            source={{ uri: item.url }}
            style={[styles.exampleImage, themeColors.exampleImage]}
          />
        )}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
      />
    );
  };

  const themeColors = colorScheme === "dark" ? darkTheme : lightTheme;

  return (
    <SafeAreaView style={[styles.container, themeColors.container]}>
      <Text style={[styles.title, themeColors.title]}>ArtGenix</Text>
      <Text style={[styles.subtitle, themeColors.subtitle]}>
        Type your vision
      </Text>
      <View
        style={[
          styles.inputContainer,
          themeColors.inputContainer,
          inputError && { borderColor: themeColors.errorBorder },
        ]}
      >
        <TextInput
          style={[styles.input, themeColors.input]}
          multiline
          numberOfLines={5}
          maxLength={500}
          cursorColor={colorScheme === "dark" ? "#a170dc" : "#8051c1"}
          placeholder="Describe the scene you envision"
          placeholderTextColor={themeColors.placeholderColor}
          value={prompt}
          onChangeText={handleInputChange}
        />
        {prompt && (
          <TouchableOpacity
            onPress={handleClearInput}
            style={styles.clearButton}
          >
            <AntDesign
              name="close"
              size={20}
              color={colorScheme === "dark" ? "#fffefe" : "#161716"}
            />
          </TouchableOpacity>
        )}
      </View>
      {inputError && (
        <Text style={[styles.errorText, themeColors.errorText]}>
          Your input contains inappropriate words.
        </Text>
      )}
      {/* <View style={styles.sliderContainer}>
        <Text style={themeColors.label}>Height: {height}</Text>
        <Slider
          value={height}
          onValueChange={setHeight}
          minimumValue={256}
          maximumValue={2048}
          step={1}
          thumbStyle={styles.sliderThumbStyle}
          thumbTintColor={themeColors.sliderThumb}
        />
        <Text style={themeColors.label}>Width: {width}</Text>
        <Slider
          value={width}
          onValueChange={setWidth}
          minimumValue={256}
          maximumValue={2048}
          step={1}
          thumbStyle={styles.sliderThumbStyle}
          thumbTintColor={themeColors.sliderThumb}
        />
      </View> */}
      <Button
        title="Create"
        onPress={handleCreate}
        buttonStyle={[styles.button, themeColors.button]}
      />

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={colorScheme === "dark" ? "#fffefe" : "#161716"}
          />
        </View>
      )}
      <Modal visible={showModal} transparent={true} animationType="slide">
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

          {/* <Button
            title="Download"
            onPress={handleDownload}
            buttonStyle={themeColors.button}
          /> */}
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
      </Modal>

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

      <Text style={[styles.subtitle, themeColors.subtitle]}>Creations</Text>
      {renderExampleImages()}
    </SafeAreaView>
  );
};

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

export default Imgify;
