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

const { width, height } = Dimensions.get("window");

global.Buffer = require("buffer").Buffer;

async function query(QueryData) {
  try {
    const response = await axios({
      url: `https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell`,
      method: "POST",
      headers: {
        Authorization: `Bearer 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`,
        Accept: "application/json",
        "Content-Type": "application/json",
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
  const [isLoading, setIsLoading] = useState(false);
  const [imageUri, setImageUri] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const colorScheme = useColorScheme();

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

  const handleCreate = async () => {
    setIsLoading(true); // Show spinner
    try {
      const data = { inputs: prompt };
      const response = await query(data);
      setImageUri(response);
      setShowModal(true);
    } catch (error) {
      Alert.alert("Error", "Failed to generate the image.");
    } finally {
      setIsLoading(false); // Hide spinner
    }
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
      <Text style={[styles.title, themeColors.title]}>Imgify</Text>
      <Text style={[styles.subtitle, themeColors.subtitle]}>
        Type your vision
      </Text>
      <View style={[styles.inputContainer, themeColors.inputContainer]}>
        <TextInput
          style={[styles.input, themeColors.input]}
          multiline
          numberOfLines={5}
          maxLength={500}
          cursorColor={colorScheme === "dark" ? "#a170dc" : "#8051c1"}
          placeholder="Describe the scene you envision"
          placeholderTextColor={themeColors.placeholderColor}
          value={prompt}
          onChangeText={setPrompt}
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
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 32, fontWeight: "bold" },
  subtitle: { fontSize: 16, marginTop: 24, marginBottom: 16 },
  inputContainer: {
    borderWidth: 1.5,
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
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
  modalContainer: {
    flex: 1,
    display: "flex",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    aspectRatio: 1,
    borderRadius: 999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: 20,
  },
  imageContainer: {
    width: "100%",
    height: height / 1.5,
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
});

export default Imgify;
