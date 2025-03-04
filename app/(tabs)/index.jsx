import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  SafeAreaView,
  Dimensions,
  Alert,
  ToastAndroid,
  Image,
  FlatList,
  ScrollView,
} from "react-native";
import { Slider } from "@rneui/themed";
import CreateModal from "@/components/CreateModal";
import { useRouter } from "expo-router";
import ExampleImages from "@/components/ExampleImages";
import HistoryBottomSheet from "@/components/HistoryBottomSheet";
import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import {
  TestIds,
  AdEventType,
  RewardedInterstitialAd,
  InterstitialAd,
  RewardedAdEventType,
} from "react-native-google-mobile-ads";
import RevenuCartUI from "react-native-purchases-ui";
import usePremiumHandler from "@/hooks/usePremiumHandler";
import { Filter } from "bad-words";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import Crown from "@/assets/icon/crown.svg";
import Edit from "@/assets/icon/edit.svg";
import Close from "@/assets/icon/close.svg";
import Clock from "@/assets/icon/clock.svg";
import Down from "@/assets/icon/down.svg";
import MobilePortrait from "@/assets/icon/shapes/916.svg";
import LandscapeHD from "@/assets/icon/shapes/169.svg";
import Square from "@/assets/icon/shapes/11.svg";
import SquareHD from "@/assets/icon/shapes/11HD.svg";
import InstagramPortrait from "@/assets/icon/shapes/45.svg";
import StandardPhoto from "@/assets/icon/shapes/54.svg";
import ClassicDisplay from "@/assets/icon/shapes/43.svg";
import PortraitPhoto from "@/assets/icon/shapes/34.svg";
import PremiumIcon from "@/assets/icon/premium.svg";

const FREE_DAILY_LIMIT = 5;
const USAGE_KEY = "daily_image_generation_usage";
const { width, height } = Dimensions.get("window");

const REWARDED_AD_UNIT_ID = __DEV__
  ? TestIds.REWARDED_INTERSTITIAL
  : "ca-app-pub-1358580905548176/1972681978";

const dimensions = [
  {
    label: "9:16",
    width: 576,
    height: 1024,
    icon: MobilePortrait,
    description: "Mobile Portrait",
  },
  {
    label: "16:9",
    width: 1024,
    height: 576,
    icon: LandscapeHD,
    description: "Landscape HD",
  },
  {
    label: "1:1",
    width: 512,
    height: 512,
    icon: Square,
    description: "Square",
  },
  {
    label: "HD",
    width: 1024,
    height: 1024,
    icon: SquareHD,
    description: "Square HD",
  },
  {
    label: "4:5",
    width: 819,
    height: 1024,
    icon: InstagramPortrait,
    description: "Instagram Portrait",
  },
  {
    label: "5:4",
    width: 1024,
    height: 819,
    icon: StandardPhoto,
    description: "Standard Photo",
  },
  {
    label: "4:3",
    width: 1024,
    height: 768,
    icon: ClassicDisplay,
    description: "Classic Display",
  },
  {
    label: "3:4",
    width: 768,
    height: 1024,
    icon: PortraitPhoto,
    description: "Portrait Photo",
  },
];

const rewardedInterstitial =
  RewardedInterstitialAd.createForAdRequest(REWARDED_AD_UNIT_ID);

  // Function to compute the ratio
function computeRatio(label) {
  // If the label is exactly "HD" (ignoring case), return 1
  if (label.toUpperCase() === "HD") return 1;
  
  // Check if the label contains a colon, indicating a ratio format like "3:4"
  if (label.includes(":")) {
    const [numStr, denomStr] = label.split(":");
    const numerator = parseFloat(numStr);
    const denominator = parseFloat(denomStr);
    
    // Prevent division by zero
    if (denominator === 0) {
      console.warn("Division by zero for label:", label);
      return null;
    }
    
    return numerator / denominator;
  }
  
  // If none of the above conditions match, return null (or any default value you want)
  return null;
}


const Imgify = () => {
  const [prompt, setPrompt] = useState("");
  const [inputError, setInputError] = useState(false);
  const [selectedDimension, setSelectedDimension] = useState(dimensions[2]);
  const [selectedArtStyle, setSelectedArtStyle] = useState(null);
  const {
    isPremium,
    credits,
    canGenerateImages,
    deductCredits,
    checkSubscriptionStatus,
  } = usePremiumHandler();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [numImages, setNumImages] = useState(1);
  const [dailyUsage, setDailyUsage] = useState(0);
  const [showFreeLimit, setShowFreeLimit] = useState(true);
  const bottomSheetRef = useRef(null);
  const dimensionsBottomSheetRef = useRef(null);
  const filter = new Filter();
  filter.addWords("nude");
  const [isModalVisible, setIsModalVisible] = useState(false);
  let rewardEarned = false;

  const promptRef = useRef("");
  const isPremiumRef = useRef(false);
  const dimensionRef = useRef({
    width: dimensions[2].width,
    height: dimensions[2].height,
  });
  const numImageRef = useRef(1);

  // Art Styles array
  const artStyles = [
    {
      id: "1",
      name: "Anime",
      premium: false,
      stylePrompt: "in an Anime style",
      // Replace with your actual asset or use a placeholder URI
      source: require("../../assets/images/anime.png"),
    },
    {
      id: "2",
      name: "Cyberpunk",
      premium: true,
      stylePrompt: "in a cyberpunk style",
      source: require("../../assets/images/cyber.png"),
    },
    {
      id: "3",
      name: "Realistic",
      premium: false,
      stylePrompt: "in an realistic style",
      source: require("../../assets/images/realistic.png"),
    },
    {
      id: "4",
      name: "Cartoon",
      premium: false,
      stylePrompt: "in a cartoon style",
      source: require("../../assets/images/cartoon.png"),
    },
    {
      id: "5",
      name: "Oil Painting",
      premium: true,
      stylePrompt: "in a Oil Painting style",
      source: require("../../assets/images/olipaint.png"),
    },
    {
      id: "6",
      name: "Nature",
      premium: false,
      stylePrompt: "in a nature style",
      source: require("../../assets/images/nature.png"),
    },
    {
      id: "7",
      name: "3D",
      premium: true,
      stylePrompt: "in a 3D style",
      source: require("../../assets/images/3d.png"),
    },
    {
      id: "8",
      name: "Creative",
      premium: false,
      stylePrompt: "in a Creative style",
      source: require("../../assets/images/v4.png"),
    },
  ];

  // Update promptRef whenever prompt changes
  useEffect(() => {
    promptRef.current = prompt;
  }, [prompt]);

  useEffect(() => {
    isPremiumRef.current = isPremium;
  }, [isPremium]);

  // Update dimensionRef whenever selectedDimension changes
  useEffect(() => {
    if (selectedDimension) {
      dimensionRef.current = {
        width: selectedDimension.width,
        height: selectedDimension.height,
        label: selectedDimension.label,
      };
    }
  }, [selectedDimension]);

  useEffect(() => {
    numImageRef.current = numImages;
  }, [numImages]);

  useEffect(() => {
    checkSubscriptionStatus();
  }, []);
  const checkDailyUsage = async () => {
    try {
      const usageData = await AsyncStorage.getItem(USAGE_KEY);
      if (usageData) {
        const { count, date } = JSON.parse(usageData);
        const lastDate = new Date(date);
        const today = new Date();

        if (
          lastDate.getDate() !== today.getDate() ||
          lastDate.getMonth() !== today.getMonth() ||
          lastDate.getFullYear() !== today.getFullYear()
        ) {
          await AsyncStorage.setItem(
            USAGE_KEY,
            JSON.stringify({
              count: 0,
              date: today.toISOString(),
            })
          );
          setShowFreeLimit(true);
          setDailyUsage(0);
        } else {
          setDailyUsage(count);
          console.log(count);
        }
      } else {
        await AsyncStorage.setItem(
          USAGE_KEY,
          JSON.stringify({
            count: 0,
            date: new Date().toISOString(),
          })
        );
        setDailyUsage(0);
      }
    } catch (error) {
      console.error("Error checking daily usage:", error);
    }
  };

  const incrementDailyUsage = async () => {
    try {
      const newCount = dailyUsage + 1;
      await AsyncStorage.setItem(
        USAGE_KEY,
        JSON.stringify({
          count: newCount,
          date: new Date().toISOString(),
        })
      );
      setDailyUsage(newCount);
    } catch (error) {
      console.error("Error updating daily usage:", error);
    }
  };

  useEffect(() => {
    checkDailyUsage();
  }, []);

  // Modified navigateToImageScreen to combine prompt & art style
  const navigateToImageScreen = () => {
    incrementDailyUsage();
    const aspectRatio = computeRatio(dimensionRef.current.label);
    const finalPrompt =
    promptRef.current + (selectedArtStyle ? " " + selectedArtStyle.stylePrompt : "");
    const artStyle =  selectedArtStyle ? selectedArtStyle.name : "";
    const params = {
      prompt: finalPrompt,
      width: dimensionRef.current.width,
      height: dimensionRef.current.height,
      numImages: numImageRef.current,
      isPremium: isPremiumRef?.current,
      aspectRatio:aspectRatio,
      artStyle: artStyle,
      dimension : dimensionRef.current.label,

    };
    console.log(params);
    router.push({
      pathname: "/imagesScreen",
      params: {
        ...params,
      },
    });
  };

  const loadRewardedInterstitial = () => {
    const unsubscribeLoaded = rewardedInterstitial.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => {
        // setRewardedInterstitialLoaded(true);
      }
    );

    const unsubscribeEarned = rewardedInterstitial.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      (reward) => {
        console.log(`User earned reward of ${reward.amount} ${reward.type}`);
        rewardEarned = true;
      }
    );

    const unsubscribeClosed = rewardedInterstitial.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        if (rewardEarned) {
          navigateToImageScreen();
          
        } else {
          // Alert.alert(
          //   "Watch Complete Ad",
          //   "Please watch the complete ad to generate your image.",
          //   [{ text: "OK", onPress: () => console.log("Alert closed") }]
          // );
          ToastAndroid.show("Please watch the complete ad to generate your image.", ToastAndroid.LONG);
        }
        rewardEarned = false;
        rewardedInterstitial.load();
      }
    );

    rewardedInterstitial.load();
    return () => {
      unsubscribeLoaded();
      unsubscribeClosed();
      unsubscribeEarned();
    };
  };

  useEffect(() => {
    const unsubscribeRewardedInterstitialEvents = loadRewardedInterstitial();

    return () => {
      unsubscribeRewardedInterstitialEvents();
    };
  }, []);

  const handleInputChange = (text) => {
    setPrompt(text);
    const detectedWords = filter.list.filter((word) =>
      text.toLowerCase().includes(word)
    );
    if (detectedWords.length > 0 && !text.toLowerCase().includes("stitch")) {
      setInputError(true);
    } else {
      setInputError(false);
    }
  };


  // Modified handleCreate to work with premium and free users
  const handleCreate = () => {
    if (inputError) {
      // Alert.alert(
      //   "Policy Violation",
      //   "Your input contains prohibited content. Please revise your prompt."
      // );
      ToastAndroid.show("Your input contains prohibited content.", ToastAndroid.LONG);
      return;
    }
    if (isPremium) {
      if (canGenerateImages(numImages)) {
        deductCredits(numImages);
        navigateToImageScreen();
      }
    } else {
      if (dailyUsage >= FREE_DAILY_LIMIT) {
        setShowFreeLimit(false);
        setIsModalVisible(true);
      } else {
        setIsModalVisible(true);
      }
    }
  };

  // const valueSliderChange = (value) => {
  //   setNumImages(value);
  // };
  const handleClearInput = () => {
    setPrompt("");
    setInputError(false);
  };

  const renderDimensionItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        setSelectedDimension(item);
        dimensionsBottomSheetRef.current?.close();
      }}
    >
      <LinearGradient
        colors={
          selectedDimension?.label === item.label
            ? ["#DF3939", "#CD9315", "#E9943E"]
            : colorScheme === "dark" ? ["#110F12", "#110F12"] : ["#FFFFFF", "#FFFFFF"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.dimensionOption}
      >
        <View style={styles.dimensionRow}>
          <View
            style={{
              width: 34,
              height: 21,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <item.icon style={{
                  color: colorScheme === "dark" ? "#ffffff" : selectedDimension?.label === item.label ? "#ffffff":"#000000",
                }} />
          </View>
          <View style={styles.dimensionTextContainer}>
            <Text
              style={[
                styles.dimensionLabel,
                selectedDimension?.label === item.label
                  ? themeColors.selectedText
                  : themeColors.optionText,
              ]}
            >
              {item.label}
            </Text>
            <Text
              style={[
                styles.dimensionDescription,
                selectedDimension?.label === item.label
                  ? themeColors.selectedText
                  : themeColors.optionText,
              ]}
            >
              {item.description}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  // Handler for selecting an art style
  const handleSelectArtStyle = (item) => {
    if (item.premium && !isPremium) {
      ToastAndroid.show(
        "This art style is premium. Please upgrade to access.",
        ToastAndroid.SHORT
      );
      return;
    }
    setSelectedArtStyle(item);
  };

  // Render function for each art style item in the FlatList
  const renderArtStyleItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleSelectArtStyle(item)}
      style={{ marginRight: 12 }}
    >
      {selectedArtStyle?.id === item.id ? (
        <LinearGradient
          colors={["#DF3939", "#CD9315", "#E9943E"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.artStyleSelectedBorder}
        >
          <Image source={item.source} style={styles.artStyleImage} />
          {item.premium && !isPremium && (
            <View style={styles.premiumIconContainer}>
              <PremiumIcon />
            </View>
          )}
        </LinearGradient>
      ) : (
        <View style={styles.artStyleImageContainer}>
          <Image source={item.source} style={styles.artStyleImage} />
          {item.premium && !isPremium && (
            <View style={styles.premiumIconContainer}>
              <PremiumIcon />
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  const themeColors = colorScheme === "dark" ? darkTheme : lightTheme;

  return (
    <SafeAreaView style={[styles.container, themeColors.container]}>
      <View style={styles.headerContainer}>
        <Text style={[styles.title, themeColors.title]}>ArtGenix</Text>
        <View style={styles.headerRight}>
          {isPremium && (
            <Text style={[styles.creditsText, themeColors.subtitle]}>
              Credits: {credits}
            </Text>
          )}
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
      <ScrollView>
        <LinearGradient
          colors={["#DC4435", "#CD9215", "#DC4435"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={styles.gradientBorder}
        >
          <View style={[styles.inputContainer, themeColors.inputContainer]}>
            <View style={styles.subtitleContaier}>
              <View style={styles.subtitleDiv}>
                <Text style={[styles.subtitle, themeColors.subtitle]}>
                  Type your vision
                </Text>
                <Edit
                  style={{
                    color: colorScheme === "dark" ? "#ffffff" : "#050206",
                  }}
                />
              </View>
              {prompt && (
                <TouchableOpacity onPress={handleClearInput}>
                  <Close
                    style={{
                      color: colorScheme === "dark" ? "#ffffff" : "#050206",
                    }}
                  />
                </TouchableOpacity>
              )}
            </View>
            <TextInput
              style={[styles.input, themeColors.input]}
              multiline
              numberOfLines={6}
              cursorColor={colorScheme === "dark" ? "#FFFFFF" : "#8051c1"}
              placeholder="Describe the scene you envision"
              placeholderTextColor={themeColors.placeholderColor}
              value={prompt}
              onChangeText={handleInputChange}
            />
            <TouchableOpacity
              onPress={() => bottomSheetRef.current.expand()}
              style={styles.clearButton}
            >
              <Clock
                style={{
                  color: colorScheme === "dark" ? "#ffffff" : "#050206",
                }}
              />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* {isPremium && (
          <View style={styles.sliderContainer}>
            <Text style={[styles.sliderLabel, themeColors.subtitle]}>
              Number of Images: {numImages}
            </Text>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={4}
              step={1}
              thumbStyle={{ height: 24, width: 24 }}
              value={numImages}
              onValueChange={valueSliderChange}
              minimumTrackTintColor={
                colorScheme === "dark" ? "#a170dc" : "#8051c1"
              }
              maximumTrackTintColor={
                colorScheme === "dark" ? "#2d2d2c" : "#ececec"
              }
              thumbTintColor={colorScheme === "dark" ? "#a170dc" : "#8051c1"}
            />
          </View>
        )} */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={() => dimensionsBottomSheetRef.current?.expand()}
            style={[styles.dimensionButton, themeColors.backButton]}
          >
            <selectedDimension.icon style={{
                  color: colorScheme === "dark" ? "#ffffff" : "#110F12",
                }}/>
            <Text
              style={[
                styles.dimensionButtonText,
                themeColors.dimensionButtonText,
              ]}
            >
              {selectedDimension.label}
            </Text>
            <Down
              style={{
                color: colorScheme === "dark" ? "#ffffff" : "#050206",
              }}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleCreate}>
            <LinearGradient
              colors={["#DF3939", "#CD9315", "#E9943E"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.createButton]}
            >
              <Text style={[styles.createButtonText]}>Generate Art</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Art Style Section */}
        <View style={styles.ArtStyleContainer}>
          <Text style={[styles.ArtStyleText, themeColors.ArtStyleText]}>
            Art Style
          </Text>
          <FlatList
            data={artStyles}
            horizontal
            keyExtractor={(item) => item.id}
            renderItem={renderArtStyleItem}
            contentContainerStyle={styles.artStyleListContainer}
            showsHorizontalScrollIndicator={true}
          />
        </View>
        <ExampleImages />
      </ScrollView>
      {!isModalVisible && (
        <HistoryBottomSheet bottomSheetRef={bottomSheetRef} />
      )}
      {!isModalVisible && (
        <BottomSheet
          ref={dimensionsBottomSheetRef}
          snapPoints={["50%", "80%"]}
          index={-1}
          enableDynamicSizing={"false"}
          handleIndicatorStyle={{ display: "none" }}
          enablePanDownToClose
          backgroundStyle={[styles.bottomSheet, themeColors.bottomSheet]}
          style={styles.bottomSheet}
        >
          <View style={styles.bottomSheetHeader}>
            <Text style={[styles.sheetTitle, themeColors.title]}>
              Select Dimensions
            </Text>
            <Text style={[styles.selectedSize, themeColors.subtitle]}>
              {selectedDimension
                ? `${selectedDimension.width}*${selectedDimension.height}px`
                : "No size selected"}
            </Text>
          </View>
          <BottomSheetFlatList
            data={dimensions}
            renderItem={renderDimensionItem}
            keyExtractor={(item) => item.label}
            contentContainerStyle={styles.bottomSheetContent}
            showsVerticalScrollIndicator={false}
          />
        </BottomSheet>
      )}
      <CreateModal
        visible={isModalVisible}
        showFreeLimit={showFreeLimit}
        onClose={() => setIsModalVisible(false)}
        onPremium={() => {
          setIsModalVisible(false);
          RevenuCartUI.presentPaywall();
        }}
        onWatchAd={() => {
          setIsModalVisible(false);
          if (rewardedInterstitial.loaded) {
            rewardedInterstitial.show();
          } else {
            navigateToImageScreen();
          }
        }}
      />
    </SafeAreaView>
  );
};

const darkTheme = StyleSheet.create({
  container: { backgroundColor: "#050206" },
  title: { color: "#fff" },
  proButton: {
    backgroundColor: "#2d2d2c",
  },
  subtitle: { color: "#ffffff" },
  input: {
    backgroundColor: "#050206",
    color: "#FFFFFF",
  },
  inputContainer: {
    backgroundColor: "#050206",
  },
  placeholderColor: "#665A70",
  label: { color: "#fffefe" },
  sliderThumb: "#a170dc",
  button: { backgroundColor: "#a660ff" },
  modalContainer: { backgroundColor: "#121212" },
  backButton: { backgroundColor: "#FFFFFF17" },
  dimensionButtonText: {
    color: "#FFFFFF",
  },
  exampleImage: { backgroundColor: "#2d2d2c" },
  imageContainer: { backgroundColor: "#2d2d2c" },
  errorBorder: "#ff4d4d",
  errorText: { color: "#ff4d4d" },
  bottomSheet: { backgroundColor: "#110F12" },
  selected: { backgroundColor: "#5e278e" },
  selectedText: { color: "#fff" },
  optionText: { color: "#d1d1d1" },
  ArtStyleText: {
    color: "#FFFFFF",
  },
});

const lightTheme = {
  container: { backgroundColor: "#FFFFFF" },
  title: { color: "#000" },
  proButton: {
    backgroundColor: "#ececec",
  },
  subtitle: { color: "#161716" },
  input: {
    backgroundColor: "#fffefe",
    color: "#161716",
  },
  inputContainer: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FFFFFF",
  },
  placeholderColor: "#161716",
  label: { color: "#161716" },
  sliderThumb: "#8051c1",
  button: { backgroundColor: "#903aff" },
  modalContainer: { backgroundColor: "#fffefe" },
  exampleImage: { backgroundColor: "#eceded" },
  imageContainer: { backgroundColor: "#eceded" },
  errorBorder: "#ff4d4d",
  errorText: { color: "#ff4d4d" },
  bottomSheet: { backgroundColor: "#ffffff", },
  selected: { backgroundColor: "#8051c1" },
  backButton: { backgroundColor: "#7C7C7C17" },
  dimensionButtonText: {
    color: "#110F12",
  },
  selectedText: { color: "#fff" },
  optionText: { color: "#161716" },
  ArtStyleText: {
    color: "#110F12",
  },
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 20,
    lineHeight: 30,
  },
  subtitleContaier: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  subtitleDiv: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  proButton: {
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
  },
  proButtonText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 13,
    marginLeft: 4,
    marginTop: 2.5,
    color: "#fff",
  },
  sliderContainer: {
    marginVertical: 6,
  },
  sliderLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  slider: {
    width: "50%",
    height: 40,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  creditsText: {
    fontSize: 14,
    fontWeight: "500",
  },
  subtitle: {
    fontSize: 16,
    letterSpacing: -0.02 * 20,
    fontFamily: "Poppins_500Medium",
    lineHeight: 24,
  },
  gradientBorder: {
    padding: 1.5,
    borderRadius: 14,
    marginTop: 16,
  },
  inputContainer: {
    borderWidth: 1.5,
    padding: 12,
    height: 160,
    borderRadius: 14,
  },
  input: {
    fontSize: 14,
    padding: 0,
    fontFamily: "Poppins_300Light",
    fontSize: 13,
    letterSpacing: -0.02 * 20,
    lineHeight: 20,
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
  closeButton: {
    alignSelf: "flex-end",
    padding: 8,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 4,
  },
  dimensionOption: {
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
  },
  dimensionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dimensionTextContainer: {
    flex: 1,
  },
  dimensionLabel: {
    fontSize: 16,
    fontFamily: "Poppins_500Medium",
    lineHeight: 24,
  },
  dimensionDescription: {
    fontSize: 13,
    fontFamily: "Poppins_300Light",
    lineHeight: 20,
  },
  dimensionButton: {
    flexDirection: "row",
    padding: 12,
    justifyContent: "space-between",
    alignItems: "center",
    gap: 6,
    borderRadius: 10,
    height: 48,
  },
  dimensionButtonText: {
    fontFamily: "LexendDeca_400Regular",
    fontSize: 14,
    letterSpacing: -0.01 * 20,
    lineHeight: 18,
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 16,
    marginBottom: 20,
  },
  createButton: {
    flex: 1,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    height: 48,
    width: width * 0.6,
    maxWidth: width * 0.63,
  },
  createButtonText: {
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: -0.02 * 20,
    color: "#fff",
  },
  bottomSheet: {
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 20,
  },
  bottomSheetHeader: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(240, 240, 240, 0.3)",
  },
  selectedSize: {
    fontSize: 14,
    opacity: 0.7,
  },
  bottomSheetContent: {
    paddingVertical: 16,
  },
  ArtStyleContainer: {
    flexDirection: "column",
    gap: 12,
    marginBottom: 20,
  },
  ArtStyleText: {
    fontSize: 17,
    fontFamily: "Poppins_500Medium",
    lineHeight: 26,
  },
  // Art style image styles
  artStyleListContainer: {
    // paddingVertical: 10,
  },
  artStyleSelectedBorder: {
    padding: 2,
    borderRadius: 14.44,
  },
  artStyleImage: {
    width: 96,
    height: 96,
    borderRadius: 12.44,
  },
  artStyleImageContainer: {
    borderRadius: 12.44,
  },
  premiumIconContainer: {
    position: "absolute",
    top: 7,
    right: 7,
  },
});

export default Imgify;
