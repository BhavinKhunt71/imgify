import React, { useEffect, useRef, useState } from "react";
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
import CreateModal from '@/components/CreateModal';
import { Button } from "@rneui/themed";
import {
  AntDesign,
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import ExampleImages from "@/components/ExampleImages";
import HistoryBottomSheet from "@/components/HistoryBottomSheet";
import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import {
  RewardedAd,
  TestIds,
  RewardedAdEventType,
  AdEventType,
  RewardedInterstitialAd,
  InterstitialAd,
} from "react-native-google-mobile-ads";
import RevenuCartUI from 'react-native-purchases-ui';

const { width, height } = Dimensions.get("window");

const REWARDED_AD_UNIT_ID = __DEV__
  ? TestIds.REWARDED_INTERSTITIAL
  : "ca-app-pub-1358580905548176/1972681978";

const dimensions = [
  {
    label: "9:16",
    width: 576, // scaled down from 1080
    height: 1024, // scaled down from 1920
    icon: "tablet-portrait-outline",
    IconComponent: Ionicons,
    description: "Mobile Portrait",
  },
  {
    label: "16:9",
    width: 1024, // scaled down from 1920
    height: 576, // scaled down from 1080
    icon: "tablet-landscape-outline",
    IconComponent: Ionicons,
    description: "Landscape HD",
  },
  {
    label: "1:1",
    width: 512, // scaled down from 1080
    height: 512, // scaled down from 1080
    icon: "square-o",
    IconComponent: FontAwesome,
    description: "Square",
  },
  {
    label: "1:1 HD",
    width: 1024, // scaled down from 1080
    height: 1024, // scaled down from 1080
    icon: "square-o",
    IconComponent: FontAwesome,
    description: "Square HD",
  },
  {
    label: "4:5",
    width: 819, // scaled down from 1080
    height: 1024, // scaled down from 1350
    icon: "phone-portrait-outline",
    IconComponent: Ionicons,
    description: "Instagram Portrait",
  },
  {
    label: "5:4",
    width: 1024, // scaled down from 1350
    height: 819, // scaled down from 1080
    icon: "phone-landscape-outline",
    IconComponent: Ionicons,
    description: "Standard Photo",
  },
  {
    label: "4:3",
    width: 1024, // scaled down from 1440
    height: 768, // scaled down from 1080
    icon: "crop-portrait",
    IconComponent: MaterialIcons,
    description: "Classic Display",
  },
  {
    label: "3:4",
    width: 768, // scaled down from 1080
    height: 1024, // scaled down from 1440
    icon: "crop-landscape",
    IconComponent: MaterialIcons,
    description: "Portrait Photo",
  },
];

const rewardedInterstitial = RewardedInterstitialAd.createForAdRequest(
  REWARDED_AD_UNIT_ID,
  {
    requestNonPersonalizedAdsOnly: true,
  }
);

const Imgify = () => {
  const [prompt, setPrompt] = useState("");
  const [inputError, setInputError] = useState(false);
  const [selectedDimension, setSelectedDimension] = useState(dimensions[2]);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const bottomSheetRef = useRef(null);
  const dimensionsBottomSheetRef = useRef(null);
  // At the top of your Imgify component
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [rewardedInterstitialLoaded, setRewardedInterstitialLoaded] = useState(false);
  // const [rewardEarned, setRewardEarned] = useState(false);
  let rewardEarned = false;
  // const [loaded, setLoaded] = useState(false);
  // const [rewardedAdLoaded, setRewardedAdLoaded] = useState(false);

  // useEffect(() => {
  //   const unsubscribeLoaded = rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
  //     // setLoaded(true);
  //   });
  //   const unsubscribeEarned = rewarded.addAdEventListener(
  //     RewardedAdEventType.EARNED_REWARD,
  //     reward => {
  //       console.log('User earned reward of ', reward);
  //     },
  //   );

  //   // Start loading the rewarded ad straight away
  //   rewarded.load();

  //   // Unsubscribe from events on unmount
  //   return () => {
  //     unsubscribeLoaded();
  //     unsubscribeEarned();
  //   };
  // }, []);
  const promptRef = useRef("");
  const dimensionRef = useRef({
    width: dimensions[2].width,
    height: dimensions[2].height,
  });

  // Update promptRef whenever prompt changes
  useEffect(() => {
    promptRef.current = prompt;
  }, [prompt]);

  // Update dimensionRef whenever selectedDimension changes
  useEffect(() => {
    if (selectedDimension) {
      dimensionRef.current = {
        width: selectedDimension.width,
        height: selectedDimension.height,
      };
    }
  }, [selectedDimension]);

  const navigateToImageScreen = () => {
    const params = {
      prompt: promptRef.current,
      width: dimensionRef.current.width,
      height: dimensionRef.current.height,
    };
    console.log("Navigating with params:", params);
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
        setRewardedInterstitialLoaded(true);
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
        setRewardedInterstitialLoaded(false);
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
  };


// Modify your handleCreate function
const handleCreate = () => {
  if (inputError) {
    Alert.alert(
      "Policy Violation",
      "Your input contains prohibited content. Please revise your prompt."
    );
    return;
  }
  setIsModalVisible(true);
};


  const handleClearInput = () => {
    setPrompt("");
    setInputError(false);
  };

  const renderDimensionItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.dimensionOption,
        selectedDimension?.label === item.label && themeColors.selected,
      ]}
      onPress={() => {
        setSelectedDimension(item);
        dimensionsBottomSheetRef.current?.close();
      }}
    >
      <View style={styles.dimensionRow}>
        <item.IconComponent
          name={item.icon}
          size={24}
          color={
            selectedDimension?.label === item.label
              ? "white"
              : themeColors.optionText.color
          }
          style={styles.iconStyle}
        />
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
    </TouchableOpacity>
  );

  const themeColors = colorScheme === "dark" ? darkTheme : lightTheme;

  return (
    <SafeAreaView style={[styles.container, themeColors.container]}>
      <View style={styles.headerContainer}>
        <Text style={[styles.title, themeColors.title]}>ArtGenix</Text>
        <TouchableOpacity
          style={[styles.proButton, themeColors.proButton]}
          onPress={() => {RevenuCartUI.presentPaywall()}}
        >
          <MaterialCommunityIcons
            name="crown"
            size={20}
            color={colorScheme === "dark" ? "#FFD700" : "#FFD700"}
          />
          <Text style={[styles.proButtonText, themeColors.proButtonText]}>
            PRO
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.subtitleContaier}>
        <Text style={[styles.subtitle, themeColors.subtitle]}>
          Type your vision
        </Text>
        <TouchableOpacity onPress={() => bottomSheetRef.current.expand()}>
          <MaterialIcons
            name="history"
            size={20}
            color={colorScheme == "dark" ? "#d1d1d1" : "#161716"}
          />
        </TouchableOpacity>
      </View>
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
      <View style={styles.buttonContainer}>
        <Button
          icon={
            <MaterialIcons
              name="aspect-ratio"
              size={24}
              color={colorScheme === "dark" ? "#fffefe" : "#161716"}
            />
          }
          onPress={() => dimensionsBottomSheetRef.current?.expand()}
          buttonStyle={[styles.dimensionButton, themeColors.backButton]}
        />
        <Button
          title="create"
          onPress={handleCreate}
          buttonStyle={[styles.createButton, themeColors.button]}
        />
      </View>
      <ExampleImages />
      {!isModalVisible && <HistoryBottomSheet bottomSheetRef={bottomSheetRef} />}
    { !isModalVisible && <BottomSheet
        ref={dimensionsBottomSheetRef}
        snapPoints={["50%", "80%"]}
        index={-1}
        enableDynamicSizing={"false"}
        handleIndicatorStyle={{ display: "none" }}
        enablePanDownToClose
        backgroundStyle={[styles.bottomSheet, themeColors.bottomSheet]}
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
      </BottomSheet>}
      <CreateModal
        visible={isModalVisible}
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
            navigateToImageSrreen();
          }
        }}
      />
    </SafeAreaView>
  );
};

const darkTheme = StyleSheet.create({
  container: { backgroundColor: "#121212" },
  title: { color: "#fff" },
  proButton: {
    backgroundColor: '#2d2d2c',
  },
  proButtonText: {
    color: '#FFD700',
  },
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
  bottomSheet: { backgroundColor: "#2d2d2c", padding: 16 },
  backButton: { backgroundColor: "#2d2d2c" },
  selected: { backgroundColor: "#5e278e" },
  selectedText: { color: "#fff" },
  optionText: { color: "#d1d1d1" },
});

const lightTheme = {
  container: { backgroundColor: "#fffefe" },
  title: { color: "#000" },
  proButton: {
    backgroundColor: '#ececec',
  },
  proButtonText: {
    color: '#FFD700',
  },
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
  bottomSheet: { backgroundColor: "#ececec", padding: 16 },
  selected: { backgroundColor: "#8051c1" },
  backButton: { backgroundColor: "#ececec" },
  selectedText: { color: "#fff" },
  optionText: { color: "#161716" },
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 32, fontWeight: "bold" },
  subtitleContaier: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  proButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  proButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  subtitle: { fontSize: 16 },
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
    // position: "absolute",
    bottom: 80,
    right: 16,
    padding: 12,
    borderRadius: 24,
  },
  dimensionRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 16,
  },
  createButton: {
    flex: 1,
    borderRadius: 8,
    width: width - 96,
  },
  dimensionButton: {
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  bottomSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  bottomSheetHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
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
    padding: 16,
  },
  dimensionOption: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
  },
  dimensionRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dimensionTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  dimensionLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  dimensionDescription: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  iconStyle: {
    padding: 4,
  },
});

export default Imgify;
