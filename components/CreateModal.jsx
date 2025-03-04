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
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

const CreateModal = ({
  visible,
  onClose,
  onPremium,
  onWatchAd,
  showFreeLimit,
}) => {
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
          <TouchableOpacity
            style={[styles.closeButton, themeColors.closeButton]}
            onPress={onClose}
          >
            <AntDesign
              name="close"
              size={24}
              color={colorScheme === "dark" ? "#FFFFFF" : "#110F12"}
            />
          </TouchableOpacity>

          {/* Image Placeholder */}
          <View style={[styles.imageContainer, themeColors.imageContainer]}>
            <Image
              source={{
                uri: "https://res.cloudinary.com/shop-it-ecommerce/image/upload/v1740651809/HC5ScmxwaN7WzhUT7USgr_dggvau.png",
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
          {showFreeLimit ? (
            <>
              <Text style={[styles.title, themeColors.title]}>
                Generate Amazing Art
              </Text>
              <Text style={[styles.subtitle, themeColors.subtitle]}>
                Transform your ideas into stunning visuals with our AI-powered
                image generation
              </Text>
            </>
          ) : (
            <>
              <Text style={[styles.title, themeColors.title]}>
                Out of generation Today!
              </Text>
              <Text style={[styles.subtitle, themeColors.subtitle]}>
                Buy our premium or Wait until tomorrow for free attempts
              </Text>
            </>
          )}
          {/* Buttons */}
          <View style={styles.buttonContainer}>
            {/* <Button
              title="Go Premium"
              buttonStyle={[styles.premiumButton, themeColors.premiumButton]}
              titleStyle={styles.buttonText}
              onPress={onPremium}
            /> */}
            <TouchableOpacity onPress={onPremium}>
              <LinearGradient
                colors={["#DF3939", "#CD9315", "#E9943E"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.createButton]}
              >
                <Text style={[styles.createButtonText]}>Go Premium</Text>
              </LinearGradient>
            </TouchableOpacity>
            {showFreeLimit ? (
              <TouchableOpacity
                style={[styles.adButton, themeColors.adButton]}
                onPress={onWatchAd}
              >
                <Ionicons
                  name="play-circle-outline"
                  size={24}
                  color={colorScheme === "dark" ? "#FFFFFF" : "#110F12"}
                />
                <Text style={[styles.adButtonText, themeColors.adButtonText]}>
                  Watch an Ad
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.adButton, themeColors.adButton]}
                onPress={onClose}
              >
                <Text style={[styles.adButtonText, themeColors.adButtonText]}>
                  Cancel
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const darkTheme = StyleSheet.create({
  modalContent: {
    backgroundColor: "#110F12",
  },
  imageContainer: {
    backgroundColor: "#2d2d2c",
  },
  title: {
    color: "#ffffff",
  },
  subtitle: {
    color: "#ffffff",
  },
  premiumButton: {
    backgroundColor: "#a660ff",
  },
  adButton: {
    backgroundColor: "#FFFFFF17",
  },
  adButtonText: {
    color: "#fff",
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
    color: "#110F12",
  },
  subtitle: {
    color: "#110F12",
  },
  premiumButton: {
    backgroundColor: "#903aff",
  },
  adButton: {
    backgroundColor: "#7C7C7C17",
  },
  adButtonText: {
    color: "#110F12",
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
    borderRadius: 20,
  },
  imageContainer: {
    width: width - 80,
    height: width - 80,
    borderRadius: 12,
    marginBottom: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  modelImage: {
    width: width - 80,
    height: width - 80,
    borderRadius: 12,
  },
  title: {
    fontSize: 24,
    lineHeight:36,
    fontFamily: "Poppins_600SemiBold",
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: -0.01 * 20,
  },
  subtitle: {
    fontSize: 16,
    lineHeight:22,
    fontFamily: "Poppins_300Light",
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal:12,
    letterSpacing: -0.02 * 20,
  },
  buttonContainer: {
    width: "100%",
    gap: 12,
  },
  premiumButton: {
    borderRadius: 8,
    paddingVertical: 12,
  },
  createButton: {
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    height: 48,
    width: width * 0.8,
  },
  createButtonText: {
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: -0.02 * 20,
    color: "#fff",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  adButton: {
    flexDirection: "row",
    gap: 8,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    height: 48,
    width: width * 0.8,
  },
  adButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
});

export default CreateModal;
