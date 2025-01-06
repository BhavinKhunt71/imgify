import React from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  useColorScheme,
  Image,
} from "react-native";
import { Button } from "@rneui/themed";
import { MaterialIcons, AntDesign, Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const CreateModal = ({ visible, onClose, onPremium, onWatchAd }) => {
  const colorScheme = useColorScheme();
  const themeColors = colorScheme === "dark" ? darkTheme : lightTheme;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, themeColors.modalContent]}>
          {/* Close Button */}
          <TouchableOpacity style={[styles.closeButton,themeColors.adButton]} onPress={onClose}>
            <AntDesign
              name="close"
              size={24}
              color={colorScheme === "dark" ? "#d1d1d1" : "#161716"}
            />
          </TouchableOpacity>

          {/* Image Placeholder */}
          <View style={[styles.imageContainer, themeColors.imageContainer]}>
            <Image
              source={{
                uri: "https://res.cloudinary.com/shop-it-ecommerce/image/upload/v1735894287/zw77kzlpm2ab4nyohl50.png",
              }}
              style={styles.modelImage}
            />
            {/* <MaterialIcons
              name="image"
              size={48}
              color={colorScheme === "dark" ? "#d1d1d1" : "#161716"}
            /> */}
          </View>

          {/* Text Content */}
          <Text style={[styles.title, themeColors.title]}>
            Generate Amazing Art
          </Text>
          <Text style={[styles.subtitle, themeColors.subtitle]}>
            Transform your ideas into stunning visuals with our AI-powered image
            generation
          </Text>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <Button
              title="Go Premium"
              buttonStyle={[styles.premiumButton, themeColors.premiumButton]}
              titleStyle={styles.buttonText}
              onPress={onPremium}
            />

            <TouchableOpacity
              style={[styles.adButton, themeColors.adButton]}
              onPress={onWatchAd}
            >
              <Ionicons
                name="play-circle-outline"
                size={24}
                color={colorScheme === "dark" ? "#d1d1d1" : "#161716"}
              />
              <Text style={[styles.adButtonText, themeColors.adButtonText]}>
                Watch an Ad
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const darkTheme = StyleSheet.create({
  modalContent: {
    backgroundColor: "#121212",
  },
  imageContainer: {
    backgroundColor: "#2d2d2c",
  },
  title: {
    color: "#ffffff",
  },
  subtitle: {
    color: "#d1d1d1",
  },
  premiumButton: {
    backgroundColor: "#a660ff",
  },
  adButton: {
    backgroundColor: "#2d2d2c",
  },
  adButtonText: {
    color: "#d1d1d1",
  },
  closeButton: { backgroundColor: "#2d2d2c" },
});

const lightTheme = StyleSheet.create({
  modalContent: {
    backgroundColor: "#ffffff",
  },
  imageContainer: {
    backgroundColor: "#eceded",
  },
  title: {
    color: "#161716",
  },
  subtitle: {
    color: "#161716",
  },
  premiumButton: {
    backgroundColor: "#903aff",
  },
  adButton: {
    backgroundColor: "#ececec",
  },
  adButtonText: {
    color: "#161716",
  },
  closeButton: { backgroundColor: "#ececec" },
});

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 16,
  },
  modalContent: {
    width: width - 32,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    right: 16,
    top: 16,
    padding: 8,
    zIndex: 1,
    borderRadius : 20,
  },
  imageContainer: {
    width: width - 80,
    height: width - 80,
    borderRadius: 12,
    marginBottom: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  modelImage:{
    width: width - 80,
    height: width - 80,
    borderRadius: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  buttonContainer: {
    width: "100%",
    gap: 12,
  },
  premiumButton: {
    borderRadius: 8,
    paddingVertical: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  adButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  adButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
});

export default CreateModal;
