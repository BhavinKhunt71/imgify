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
  ScrollView,
  PanResponder,
  Animated,
  ToastAndroid,
  SafeAreaView,
} from "react-native";
import ImageViewer from "react-native-image-zoom-viewer";
import React, { useCallback, useEffect, useState } from "react";
import { useMutation } from "react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import { AntDesign, Feather, FontAwesome, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import uuid from "react-native-uuid";
import { useFocusEffect } from "@react-navigation/native";
import { collection, addDoc } from "firebase/firestore";
import db from "@/firebaseConfig";
import { fal } from "@fal-ai/client";
import LeftArrow from "@/assets/icon/left-arrow.svg";
import usePremiumHandler from "@/hooks/usePremiumHandler";
import { LinearGradient } from "expo-linear-gradient";
import Crown from "@/assets/icon/crown.svg";
import Share from "@/assets/icon/share.svg";
import Download from "@/assets/icon/download.svg";
import Copy from "@/assets/icon/copy.svg";
import RevenuCartUI from "react-native-purchases-ui";
import * as Clipboard from "expo-clipboard";
import DownloadLight from "@/assets/icon/light/download_light.svg";
import ShareLight from "@/assets/icon/light/share_light.svg";
import Close from "@/assets/icon/close.svg";

global.Buffer = require("buffer").Buffer;

const { height, width } = Dimensions.get("window");

fal.config({
  credentials:
    "b6903f46-6ad2-43f4-aa77-0ef7295c133e:bbe9490f80ea13d003999a3c6d4a4b39",
});

async function queryPremiumAPI(imagePrompt) {
  try {
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

    if (!result?.data?.images) {
      throw new Error("No images generated");
    }

    // // Convert all image URLs to base64
    // const base64Images = await Promise.all(
    //   result.data.images.map(async (image) => {
    //     const response = await fetch(image.url);
    //     const blob = await response.blob();
    //     return new Promise((resolve, reject) => {
    //       const reader = new FileReader();
    //       reader.onloadend = () => resolve(reader.result);
    //       reader.onerror = reject;
    //       reader.readAsDataURL(blob);
    //     });
    //   })
    // );

    // return base64Images;
    console.log(result.data.images[0].url);
    return result.data.images[0].url;
  } catch (error) {
    console.error("Error making the request:", error);
    throw error;
  }
}

async function queryAPI(QueryData) {
  try {
    const result = await fal.subscribe("fal-ai/fast-lightning-sdxl", {
      input: {
        prompt: QueryData.inputs,
        image_size: {
          width: parseInt(QueryData.width),
          height: parseInt(QueryData.height),
        },
        num_images: 1,
        num_inference_steps: 4,
        enable_safety_checker: true,
      },
    });
    console.log("heeeww");
    if (!result?.data?.images) {
      throw new Error("No images generated from fallback API");
    }
    // console.log(result.data.images[0].url);
    // // Convert image URL to base64
    // const response = await fetch(result.data.images[0].url);
    // const blob = await response.blob();
    // return new Promise((resolve, reject) => {
    //   const reader = new FileReader();
    //   reader.onloadend = () => resolve([reader.result]); // Wrap in array to match original API format
    //   reader.onerror = reject;
    //   reader.readAsDataURL(blob);
    // });

    return result.data.images[0].url;
  } catch (fallbackError) {
    console.error("Error in fallback API:", fallbackError);
    throw fallbackError;
  }
}

const index = () => {
  const {
    prompt,
    width,
    height,
    numImages,
    aspectRatio,
    url,
    artStyle,
    dimension,
  } = useLocalSearchParams();
  const { isPremium } = usePremiumHandler();
  const [imageUris, setImageUris] = useState();
  const [AspectRatio, setAspectRatio] = useState(1);
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [selectedReportOption, setSelectedReportOption] = useState(null);
  const [loadingStage, setLoadingStage] = useState("Analyzing your prompt");
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
  // Format images for react-native-image-viewing
  // const formattedImages = imageUris.map((uri) => ({ uri }));
  // Handle image press
  const handleImagePress = () => {
    setIsImageViewerVisible(true);
  };

  const handleQueryAPI = async (imagePrompts) => {
    try {
      console.log("Current premium status:", imagePrompts.isPremium);

      if (imagePrompts.isPremium === "true") {
        console.log("Using Premium API flow");
        const premiumResults = await queryPremiumAPI(imagePrompts);
        return premiumResults;
      } else {
        console.log("Using Standard API flow");
        const standardResults = await queryAPI(imagePrompts);
        return standardResults;
      }
    } catch (error) {
      console.error("Error in handleQueryAPI:", error);
      throw error;
    }
  };

  const { mutate, isLoading } = useMutation(handleQueryAPI, {
    onSuccess: async (data) => {
      setImageUris(data);
      const newPromptData = {
        prompt,
        date: new Date().toISOString(),
        id: uuid.v4(),
      };

      try {
        const storedHistory = await AsyncStorage.getItem("history");
        let history = storedHistory ? JSON.parse(storedHistory) : [];
        history = history.filter((item) => item.prompt !== prompt);
        history.unshift(newPromptData);
        await AsyncStorage.setItem("history", JSON.stringify(history));
      } catch (error) {
        console.error("Error saving to history:", error);
      }
    },
    onError: async (error) => {
      try {
        await addDoc(collection(db, "users"), {
          error: "Failed to generate images.",
        });
      } catch (e) {
        console.log(e);
      }
      ToastAndroid.show("Failed to generate image.", ToastAndroid.LONG);
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
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  if (!url) {
    useFocusEffect(
      useCallback(() => {
        mutate({
          inputs: prompt,
          width,
          height,
          numImages: parseInt(numImages),
          isPremium: isPremium,
        });
        setAspectRatio(aspectRatio);
      }, [mutate, prompt, width, height, numImages, isPremium, aspectRatio])
    );
  } else {
    useFocusEffect(
      useCallback(() => {
        setImageUris(url);
        setAspectRatio(aspectRatio);
      }, [url, aspectRatio])
    );
  }

  // const requestMediaLibraryPermission = async () => {
  //   const { status } = await MediaLibrary.requestPermissionsAsync();
  //   if (status !== "granted") {
  //     Alert.alert(
  //       "Permission Denied",
  //       "We need permission to access your media library to save images."
  //     );
  //     throw new Error("Permission not granted");
  //   }
  // };

  const handleDownload = async (url) => {
    try {
      // Check permissions first
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        ToastAndroid.show(
          "Sorry, we need media library permissions to download images.",
          ToastAndroid.LONG
        );
        return;
      }

      // Download the file
      const filename = url.split("/").pop();
      const localFile = `${FileSystem.cacheDirectory}${filename}`;

      const downloadResumable = FileSystem.createDownloadResumable(
        url,
        localFile,
        {},
        (downloadProgress) => {
          const progress =
            downloadProgress.totalBytesWritten /
            downloadProgress.totalBytesExpectedToWrite;
          // You can use this progress value to update UI
        }
      );

      const { uri } = await downloadResumable.downloadAsync();

      // Save to media library
      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync("Waifu Gallery", asset, false);

      ToastAndroid.show(
        "Image saved to gallery successfully!",
        ToastAndroid.LONG
      );
    } catch (error) {
      console.error("Error downloading image:", error);
      ToastAndroid.show("Failed to download image.", ToastAndroid.LONG);
    }
  };

  const handleShare = async (url) => {
    try {
      const filename = url.split("/").pop();
      const localFile = `${FileSystem.cacheDirectory}${filename}`;
      await FileSystem.downloadAsync(url, localFile);
      await Sharing.shareAsync(localFile);
    } catch (error) {
      console.error(error);
      // alert("Failed to share image. Please try again.");
      // ToastAndroid.show(
      //   "Failed to share image.",
      //   ToastAndroid.SHORT,
      //   ToastAndroid.BOTTOM
      // );
    }
  };

  const copyToClipboard = async () => {
    try {
      await Clipboard.setStringAsync(prompt);
      ToastAndroid.show("Prompt copied successfully!", ToastAndroid.LONG);
    } catch (error) {
      ToastAndroid.show("Failed to copy prompt.", ToastAndroid.LONG);
    }
  };

  const handleOnClose = () => {
    setImageUris();
    router.back();
  };

  const handleFlagOpen = () => {
    setShowFlagModal(true);
  };

  const handleFlagClose = () => {
    setShowFlagModal(false);
  };

  const handleReportSubmit = () => {
    if (!selectedReportOption) {
      ToastAndroid.show("No Option Selected", ToastAndroid.LONG);
      return;
    }
    setShowFlagModal(false);
    ToastAndroid.show("Report has been submitted.", ToastAndroid.LONG);
    setSelectedReportOption(null);
  };

  const themeColors = colorScheme === "dark" ? darkTheme : lightTheme;
  const renderImageViewerControls = () => {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.controlContainer}>
          <TouchableOpacity
            onPress={() => setIsImageViewerVisible(false)}
            style={[styles.button, themeColors.shareDownloadButton]}
          >
            <Close
              style={{
                color: colorScheme === "dark" ? "#ffffff" : "#050206",
              }}
            />
          </TouchableOpacity>

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              onPress={() => handleDownload(imageUris)}
              style={[
                styles.button,
                styles.buttonSpacing,
                themeColors.shareDownloadButton,
              ]}
            >
              {colorScheme === "dark" ? <Download /> : <DownloadLight />}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleShare(imageUris)}
              style={[styles.button, themeColors.shareDownloadButton]}
            >
              {colorScheme === "dark" ? <Share /> : <ShareLight />}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  };

  return (
    <>
      {/* {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={colorScheme === "dark" ? "#fffefe" : "#161716"}
          />
          <Text style={[styles.loadingText, themeColors.subtitle]}>
            {loadingStage}
          </Text>
        </View>
      )} */}

      <View style={[styles.container, themeColors.container]}>
        <View style={styles.header}>
          <View style={styles.leftHeader}>
            <TouchableOpacity onPress={handleOnClose}>
              <LeftArrow
                style={{
                  color: colorScheme === "dark" ? "#ffffff" : "#050206",
                }}
              />
            </TouchableOpacity>
            <Text style={[styles.title, themeColors.title]}>Creation</Text>
          </View>

          <View style={styles.rightHeader}>
            <TouchableOpacity
              onPress={() => handleFlagOpen(selectedImageIndex)}
            >
              <Text style={[styles.reportText, themeColors.title]}>Report</Text>
            </TouchableOpacity>
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
        </View>

        {/* Fixed ScrollView implementation */}
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContentContainer}
          removeClippedSubviews={false}
        >
          <View style={styles.imageGrid}>
            <View style={styles.imageWrapper}>
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator
                    size="large"
                    color={colorScheme === "dark" ? "#ffffff" : "#050206"}
                  />
                  <Text
                    style={[
                      styles.shareDownloadText,
                      themeColors.shareDownloadText,
                    ]}
                  >
                    {loadingStage}
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => handleImagePress()}
                  activeOpacity={0.9}
                >
                  <Image
                    source={{ uri: imageUris }}
                    style={[
                      styles.gridImage,
                      {
                        aspectRatio: AspectRatio,
                      },
                    ]}
                    // Add default dimensions to prevent layout issues
                    defaultSource={{ uri: "placeholder" }}
                  />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.detailsContainer}>
              <View style={styles.shareDownloadContainer}>
                <TouchableOpacity
                  style={[
                    styles.shareDownloadButton,
                    themeColors.shareDownloadButton,
                  ]}
                  onPress={() => handleShare(imageUris)}
                >
                  {colorScheme === "dark" ? <Share /> : <ShareLight />}
                  <Text
                    style={[
                      styles.shareDownloadText,
                      themeColors.shareDownloadText,
                    ]}
                  >
                    Share
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.shareDownloadButton,
                    themeColors.shareDownloadButton,
                  ]}
                  onPress={() => handleDownload(imageUris)}
                >
                  {colorScheme === "dark" ? <Download /> : <DownloadLight />}
                  <Text
                    style={[
                      styles.shareDownloadText,
                      themeColors.shareDownloadText,
                    ]}
                  >
                    Download
                  </Text>
                </TouchableOpacity>
              </View>

              <View
                style={[styles.promptContainer, themeColors.promptContainer]}
              >
                <View style={styles.shareDownloadContainer}>
                  <Text
                    style={[
                      styles.promptHeaderText,
                      themeColors.shareDownloadText,
                    ]}
                  >
                    Prompt
                  </Text>
                  <TouchableOpacity onPress={copyToClipboard}>
                    <Copy
                      style={{
                        color: colorScheme === "dark" ? "#ffffff" : "#110F12",
                      }}
                    />
                  </TouchableOpacity>
                </View>

                <Text
                  style={[styles.promptText, themeColors.shareDownloadText]}
                >
                  {prompt.length == 0 ? "Nothing to see..." : prompt}
                </Text>
              </View>

              <View style={styles.otherDetailsContainer}>
                <View style={styles.otherDetail}>
                  <Text style={[styles.otherLabel, themeColors.otherLabel]}>
                    Style
                  </Text>
                  <Text
                    style={[styles.otherAnswer, themeColors.shareDownloadText]}
                  >
                    {artStyle?.length == 0 ? "No Style" : artStyle}
                  </Text>
                </View>
                <View style={styles.otherDetail}>
                  <Text style={[styles.otherLabel, themeColors.otherLabel]}>
                    Size
                  </Text>
                  <Text
                    style={[styles.otherAnswer, themeColors.shareDownloadText]}
                  >
                    {dimension}
                  </Text>
                </View>
                <View style={styles.otherDetail}>
                  <Text style={[styles.otherLabel, themeColors.otherLabel]}>
                    Model
                  </Text>
                  <Text
                    style={[styles.otherAnswer, themeColors.shareDownloadText]}
                  >
                    {isPremium ? "FLUX" : "Stable Diffusion"}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
      {/* Flag Modal */}
      <Modal
        visible={showFlagModal}
        transparent={true}
        animationType="slide"
        onRequestClose={handleFlagClose}
      >
        <View style={[styles.container, themeColors.container]}>
          <View style={styles.header}>
            <View style={styles.leftHeader}>
              <TouchableOpacity onPress={handleFlagClose}>
                <LeftArrow
                  style={{
                    color: colorScheme === "dark" ? "#ffffff" : "#050206",
                  }}
                />
              </TouchableOpacity>
              <Text style={[styles.title, themeColors.title]}>
                Report Content
              </Text>
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

          <View style={styles.modelHeader}>
            <Text style={[styles.flagTitle, themeColors.title]}>
              Please select
            </Text>
            <View style={styles.radioContainer}>
              {[
                "Offensive Content",
                "Inaccurate Information",
                "Spam or Irrelevant",
              ].map((data, index) => (
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => setSelectedReportOption(data)}
                  key={index}
                >
                  <LinearGradient
                    colors={["#DC4435", "#CD9215", "#DC4435"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0.8, y: 1 }}
                    style={[styles.radioCircle]}
                  >
                    {selectedReportOption != data && (
                      <View
                        style={[styles.radioCircleDull, themeColors.container]}
                      />
                    )}
                  </LinearGradient>
                  <Text style={[styles.radioLabel, themeColors.subtitle]}>
                    {data}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <TouchableOpacity onPress={handleReportSubmit}>
            <LinearGradient
              colors={["#DF3939", "#CD9315", "#E9943E"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.createButton]}
            >
              <Text style={[styles.createButtonText]}>Submit Report</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal visible={isImageViewerVisible} transparent>
        <ImageViewer
          imageUrls={[{ url: imageUris }]}
          enableSwipeDown
          onSwipeDown={() => setIsImageViewerVisible(false)}
          renderIndicator={() => null} // Removes pagination indicators
          renderHeader={renderImageViewerControls} // Custom header with controls
          footerContainerStyle={{ display: "none" }} // Hides footer
          enableImageZoom={true}
          backgroundColor={colorScheme === "dark" ? "#050206" : "#fff"}
          onClick={() => {}} // Prevents default click behavior
          swipeDownThreshold={50}
        />
      </Modal>
    </>
  );
};

export default index;

const darkTheme = StyleSheet.create({
  container: { backgroundColor: "#050206" },
  title: { color: "#fff" },
  subtitle: { color: "#d1d1d1" },
  shareDownloadButton: {
    backgroundColor: "#FFFFFF1A",
  },
  shareDownloadText: {
    color: "#FFFFFF",
  },
  promptContainer: {
    backgroundColor: "#FFFFFF0D",
  },
  otherLabel: {
    color: "#A0A5AF",
  },
  button: { backgroundColor: "#a660ff" },
  modalContainer: { backgroundColor: "#121212" },
  backButton: { backgroundColor: "#2d2d2c" },
  exampleImage: { backgroundColor: "#2d2d2c" },
  imageContainer: { backgroundColor: "#2d2d2c" },
  errorBorder: "#ff4d4d",
  errorText: { color: "#ff4d4d" },
});

const lightTheme = StyleSheet.create({
  container: { backgroundColor: "#FFFFFF" },
  title: { color: "#000" },
  subtitle: { color: "#161716" },
  shareDownloadButton: {
    backgroundColor: "#A0A0A01A",
  },
  shareDownloadText: {
    color: "#050206",
  },
  promptContainer: {
    backgroundColor: "#F7F7F7",
  },
  otherLabel: {
    color: "#A0A5AF",
  },
  button: { backgroundColor: "#903aff" },
  modalContainer: { backgroundColor: "#fffefe" },
  backButton: { backgroundColor: "#ececec" },
  exampleImage: { backgroundColor: "#eceded" },
  imageContainer: { backgroundColor: "#eceded" },
  errorBorder: "#ff4d4d",
  errorText: { color: "#ff4d4d" },
});

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
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
  },
  reportText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: -0.03 * 20,
    textDecorationLine: "underline",
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
  scrollContentContainer: {
    flexGrow: 1,
    paddingVertical: 8,
  },
  imageGrid: {
    flexDirection: "column",
    justifyContent: "flex-start",
    display: "flex",
  },
  loadingContainer: {
    width: width - 64,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    aspectRatio: 1,
  },
  imageWrapper: {
    width: width - 64,
    display: "flex",
    alignItems: "center",
    marginBottom: 20,
    marginHorizontal: "auto",
    resizeMode: "contain",
    borderRadius: 14,
  },
  gridImage: {
    width: "100%",
    borderRadius: 14,
  },
  detailsContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    flexDirection: "column",
  },
  shareDownloadContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexDirection: "row",
  },
  shareDownloadButton: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    flexDirection: "row",
    padding: 12,
    width: (width - 52) / 2,
    borderRadius: 14,
  },
  shareDownloadText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    lineHeight: 21,
    letterSpacing: -0.02 * 20,
  },
  promptContainer: {
    width: width - 40,
    display: "flex",
    flexDirection: "column",
    gap: 8,
    padding: 12,
    borderRadius: 14,
  },
  promptHeaderText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: -0.02 * 20,
  },
  promptText: {
    fontFamily: "Poppins_300Light",
    fontSize: 13,
    lineHeight: 20,
    letterSpacing: -0.02 * 20,
  },
  otherDetailsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    paddingHorizontal: 12,
  },
  otherDetail: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 4,
    width: "100%",
  },
  otherLabel: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    lineHeight: 21,
    letterSpacing: -0.02 * 20,
  },
  otherAnswer: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
    lineHeight: 21,
    letterSpacing: -0.02 * 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  modelHeader: {
    display: "flex",
    flexDirection: "column",
    marginTop: 13,
    gap: 10,
  },
  flagTitle: {
    fontFamily: "Poppins_500Medium",
    fontSize: 16,
    lineHeight: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  modalSubtitle: {
    fontSize: 16,
    // marginBottom: 12,
  },
  radioContainer: {
    marginBottom: 32,
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
    // borderWidth: 2,
    marginRight: 12,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  radioCircleDull: {
    width: 16,
    height: 16,
    borderRadius: 10,
  },
  radioLabel: {
    fontSize: 16,
  },
  createButton: {
    // flex: 1,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    height: 48,
    width: width - 40,
  },
  createButtonText: {
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: -0.02 * 20,
    color: "#fff",
  },
  scrollContainer: {
    flex: 1,
  },
  safeArea: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
  },
  controlContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16, // Tailwind's p-4 is roughly 16px padding
  },
  button: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 9999, // A high value to ensure a "full" round shape
    padding: 10, // Tailwind's p-2
  },
  buttonGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  // This spacing adds a gap (equivalent to Tailwind's gap-4) between buttons
  buttonSpacing: {
    marginRight: 16, // 16px gap; remove on the last button if needed
  },
  icon: {
    width: 24,
    height: 24,
  },
});
