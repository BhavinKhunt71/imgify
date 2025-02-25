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
} from "react-native";
import { Slider, Button } from "@rneui/themed";
import CreateModal from "@/components/CreateModal";
import {
  AntDesign,
  FontAwesome,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
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

const FREE_DAILY_LIMIT = 5;
const USAGE_KEY = "daily_image_generation_usage";
const { width, height } = Dimensions.get("window");

const REWARDED_AD_UNIT_ID = __DEV__
  ? TestIds.REWARDED_INTERSTITIAL
  : "ca-app-pub-1358580905548176/1972681978";

// const InterstitialAd_Ad_Unit_id = __DEV__
//   ? TestIds.INTERSTITIAL
//   : "ca-app-pub-1358580905548176/1877253134";

const dimensions = [
  {
    label: "9:16",
    width: 576, // scaled down from 1080
    height: 1024, // scaled down from 1920
    icon: MobilePortrait,
    description: "Mobile Portrait",
  },
  {
    label: "16:9",
    width: 1024, // scaled down from 1920
    height: 576, // scaled down from 1080
    icon: "tablet-landscape-outline",
    icon: LandscapeHD,
    description: "Landscape HD",
  },
  {
    label: "1:1",
    width: 512, // scaled down from 1080
    height: 512, // scaled down from 1080
    icon: Square,
    description: "Square",
  },
  {
    label: "HD",
    width: 1024, // scaled down from 1080
    height: 1024, // scaled down from 1080
    icon: SquareHD,
    description: "Square HD",
  },
  {
    label: "4:5",
    width: 819, // scaled down from 1080
    height: 1024, // scaled down from 1350
    icon: InstagramPortrait,
    description: "Instagram Portrait",
  },
  {
    label: "5:4",
    width: 1024, // scaled down from 1350
    height: 819, // scaled down from 1080
    icon: StandardPhoto,
    description: "Standard Photo",
  },
  {
    label: "4:3",
    width: 1024, // scaled down from 1440
    height: 768, // scaled down from 1080
    icon: ClassicDisplay,
    description: "Classic Display",
  },
  {
    label: "3:4",
    width: 768, // scaled down from 1080
    height: 1024, // scaled down from 1440
    icon: PortraitPhoto,
    description: "Portrait Photo",
  },
];

const rewardedInterstitial =
  RewardedInterstitialAd.createForAdRequest(REWARDED_AD_UNIT_ID);
// const interstitial = InterstitialAd.createForAdRequest(
//   InterstitialAd_Ad_Unit_id
// );
const Imgify = () => {
  const [prompt, setPrompt] = useState("");
  const [inputError, setInputError] = useState(false);
  const [selectedDimension, setSelectedDimension] = useState(dimensions[2]);
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
      };
    }
  }, [selectedDimension]);

  useEffect(() => {
    numImageRef.current = numImages;
  }, [numImages]);

  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  const navigateToImageScreen = () => {
    const params = {
      prompt: promptRef.current,
      width: dimensionRef.current.width,
      height: dimensionRef.current.height,
      numImages: numImageRef.current,
      isPremium: isPremiumRef?.current,
    };
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
          Alert.alert(
            "Watch Complete Ad",
            "Please watch the complete ad to generate your image.",
            [{ text: "OK", onPress: () => console.log("Alert closed") }]
          );
        }
        // Reset states for next ad
        // setRewardedInterstitialLoaded(false);
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
    // console.log(filter.list)
    if (detectedWords.length > 0 && !text.toLowerCase().includes("stitch")) {
      setInputError(true);
    } else {
      setInputError(false);
    }
  };

  // Add this function to check and update daily usage
  const checkDailyUsage = async () => {
    try {
      const usageData = await AsyncStorage.getItem(USAGE_KEY);
      if (usageData) {
        const { count, date } = JSON.parse(usageData);
        const lastDate = new Date(date);
        const today = new Date();

        // Reset count if it's a new day
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
        }
      } else {
        // Initialize usage data if it doesn't exist
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

  // Add this function to increment usage
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

  // Add useEffect to check daily usage on component mount
  useEffect(() => {
    checkDailyUsage();
  }, []);

  // Modify handleCreate function
  const handleCreate = () => {
    if (inputError) {
      Alert.alert(
        "Policy Violation",
        "Your input contains prohibited content. Please revise your prompt."
      );
      return;
    }

    if (isPremium) {
      if (canGenerateImages(numImages)) {
        deductCredits(numImages);
        navigateToImageScreen();
      }
    } else {
      if (dailyUsage >= FREE_DAILY_LIMIT) {
        console.log(dailyUsage);
        setShowFreeLimit(false);
        setIsModalVisible(true);
      } else {
        incrementDailyUsage();
        setIsModalVisible(true);
      }
    }
  };

  const valueSliderChange = (value) => {
    setNumImages(value);
  };
  const handleClearInput = () => {
    setPrompt("");
    setInputError(false);
  };

  const renderDimensionItem = ({ item }) => (
    <TouchableOpacity
      // style={[
      //   styles.dimensionOption,
      //   // selectedDimension?.label === item.label && themeColors.selected,
      // ]}
      onPress={() => {
        setSelectedDimension(item);
        dimensionsBottomSheetRef.current?.close();
      }}
    >
      <LinearGradient
        colors={
          selectedDimension?.label === item.label
            ? ["#DF3939", "#CD9315", "#E9943E"]
            : ["#110F12", "#110F12"]
        }
        // While CSS used an angle of 105.84deg, we approximate with start/end points.
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.dimensionOption]}
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
            <item.icon />
          </View>
          {/* <item.icon
        // color={
        //   selectedDimension?.label === item.label
        //     ? "black"
        //     : themeColors.optionText.color
        // }
        /> */}
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

  const themeColors = colorScheme === "dark" ? darkTheme : lightTheme;
  // // Dimension Button
  // const DimensionButton = ({ onPress, colorScheme }) => (
  //   <TouchableOpacity
  //     onPress={onPress}
  //     style={[styles.dimensionButton, themeColors.backButton]}
  //   >
  //     <MaterialIcons
  //       name="aspect-ratio"
  //       size={24}
  //       color={colorScheme === "dark" ? "#fffefe" : "#161716"}
  //     />
  //   </TouchableOpacity>
  // );

  // // Create Button
  // const CreateButton = ({ onPress }) => (
  //   <TouchableOpacity
  //     onPress={onPress}
  //     style={[styles.createButton, themeColors.button]}
  //   >
  //     <Text style={{ color: "#fefefe", fontWeight: "600", fontSize: 16 }}>
  //       Create
  //     </Text>
  //   </TouchableOpacity>
  // );

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
              // While CSS used an angle of 105.84deg, we approximate with start/end points.
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.proButton]}
            >
              {/* <MaterialCommunityIcons
                name="crown"
                size={20}
                color="#FFD700" // both cases are #FFD700, so no conditional needed here.
              /> */}

              <Crown />
              <Text style={[styles.proButtonText]}>Get Pro</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
      <LinearGradient
        colors={["#DC4435", "#CD9215", "#DC4435"]}
        // Adjust these values to get the desired gradient angle effect
        start={{ x: 0, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={styles.gradientBorder}
      >
        <View
          style={[
            styles.inputContainer,
            themeColors.inputContainer,
            // inputError && { borderColor: themeColors.errorBorder },
          ]}
        >
          <View style={styles.subtitleContaier}>
            <View style={styles.subtitleDiv}>
              <Text style={[styles.subtitle, themeColors.subtitle]}>
                Type your vision
              </Text>
              <Edit />
            </View>
            {prompt && (
              <TouchableOpacity onPress={handleClearInput}>
                <Close />
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
            <Clock />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* {inputError && (
        <Text style={[styles.errorText, themeColors.errorText]}>
          Your input contains inappropriate words.
        </Text>
      )} */}
      {isPremium && (
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
      )}
      <View style={styles.buttonContainer}>
        {/* <Button
          icon={
            <MaterialIcons
              name="aspect-ratio"
              size={24}
              color={colorScheme === "dark" ? "#fffefe" : "#161716"}
            />
          }
          onPress={() => dimensionsBottomSheetRef.current?.expand()}
          buttonStyle={[styles.dimensionButton, themeColors.backButton]}
        /> */}
        <TouchableOpacity
          onPress={() => dimensionsBottomSheetRef.current?.expand()}
          style={[styles.dimensionButton, themeColors.backButton]}
        >
          <selectedDimension.icon />
          <Text
            style={[
              styles.dimensionButtonText,
              themeColors.dimensionButtonText,
            ]}
          >
            {selectedDimension.label}
          </Text>
          <Down />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleCreate}>
          <LinearGradient
            colors={["#DF3939", "#CD9315", "#E9943E"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.createButton]}
          >
            <Text style={[styles.proButtonText]}>Generate Art</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
      <View style={styles.ArtStyleContainer}>
        <Text style={[styles.ArtStyleText, themeColors.ArtStyleText]}>
          Art Style
        </Text>
      </View>
      <ExampleImages />
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
                ? `${selectedDimension.width}x${selectedDimension.height}px`
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
    // borderColor: "#5e278e",
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
  bottomSheet: { backgroundColor: "#ececec" },
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
    letterSpacing: -0.03 * 20,
  },
  subtitleContaier: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  subtitleDiv: {
    display: "flex",
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
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    height: 38,
    borderRadius: 10,
    // Basic shadow for iOS and elevation for Android.
    shadowColor: "rgba(210, 74, 74, 0.63)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 15, // For Android
  },
  proButtonText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 13,
    marginLeft: 4,
    lineHeight: 19.5,
    letterSpacing: -0.03 * 20,
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
  closeButton: {
    alignSelf: "flex-end",
    padding: 8,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  dimensionOption: {
    padding: 12,
    marginVertical: 8,
    borderRadius: 8,
  },
  dimensionButton: {
    display: "flex",
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 4,
    borderRadius: 10,
    height: 48,
  },
  dimensionRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dimensionButtonText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    letterSpacing: -0.01 * 20,
    lineHeight: 18,
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    // justifyContent: "space-between",
    gap: 10,
    marginTop: 16,
    marginBottom: 20,
  },
  createButton: {
    flex: 1,
    borderRadius: 14,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: 48,
    width: width * 0.63,
    maxWidth: width * 0.63,
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    fontSize: 34,
    lineHeight: 24,
    letterSpacing: -0.02 * 20,
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
  sheetTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 4,
  },
  selectedSize: {
    fontSize: 14,
    opacity: 0.7,
  },
  bottomSheetContent: {
    paddingVertical: 16,
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
    // marginLeft: 12,
  },
  dimensionLabel: {
    fontSize: 16,
    fontFamily: "Poppins_500Medium",
    lineHeight: 24,
    letterSpacing: -0.02 * 20,
  },
  dimensionDescription: {
    fontSize: 13,
    fontFamily: "Poppins_300Light",
    lineHeight: 20,
    letterSpacing: -0.02 * 20,
  },
  iconStyle: {
    padding: 4,
  },
  ArtStyleContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    marginBottom:20
  },
  ArtStyleText: {
    fontSize: 17,
    fontFamily: "Poppins_500Medium",
    lineHeight: 26,
    letterSpacing: -0.02 * 20,
  },
});

export default Imgify;
