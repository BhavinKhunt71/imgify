import React, { useRef, useState } from "react";
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
import { Button } from "@rneui/themed";
import {
  AntDesign,
  Feather,
  FontAwesome,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
// import * as Localization from "expo-localization";
import { Filter } from "bad-words";
// import naughtyWords from "naughty-words";
import { useRouter } from "expo-router";
import ExampleImages from "@/components/ExampleImages";
import HistoryBottomSheet from "@/components/HistoryBottomSheet";
const { width, height } = Dimensions.get("window");

const Imgify = () => {
  const [prompt, setPrompt] = useState("");
  const [inputError, setInputError] = useState(false);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const bottomSheetRef = useRef(null);
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

  const handleCreate = () => {
    if (inputError) {
      Alert.alert(
        "Policy Violation",
        "Your input contains prohibited content. Please revise your prompt."
      );
      return;
    }
    // mutate({ inputs: prompt });
    router.push({
      pathname: "/imagesScreen",
      params: { prompt: prompt }, // Pass the prompt parameter
    });
  };

  const handleClearInput = () => {
    setPrompt("");
    setInputError(false);
    // setErrorWords([]);
  };

  const themeColors = colorScheme === "dark" ? darkTheme : lightTheme;

  return (
    <SafeAreaView style={[styles.container, themeColors.container]}>
      <Text style={[styles.title, themeColors.title]}>ArtGenix</Text>
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

      <ExampleImages />
      <HistoryBottomSheet bottomSheetRef={bottomSheetRef} />
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
  subtitleContaier: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 16,
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
