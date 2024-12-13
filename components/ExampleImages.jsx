import { View, Text, FlatList, StyleSheet, useColorScheme, Image } from "react-native";
import React from "react";


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

const ExampleImages = () => {
    const colorScheme = useColorScheme();
  const themeColors = colorScheme === "dark" ? darkTheme : lightTheme;

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
  return (
    <>
      <Text style={[styles.subtitle, themeColors.subtitle]}>Creations</Text>
      {renderExampleImages()}
    </>
  );
};

export default ExampleImages;


const darkTheme = StyleSheet.create({
    subtitle: { color: "#d1d1d1" },
    exampleImage: { backgroundColor: "#2d2d2c" },
  });
  
  const lightTheme = {
    subtitle: { color: "#161716" },
    exampleImage: { backgroundColor: "#eceded" },
  };
  
  const styles = StyleSheet.create({
    subtitle: { fontSize: 16, marginTop: 24, marginBottom: 16 },
    exampleImage: {
      width: "49%",
      aspectRatio: 1,
      marginBottom: 10,
      borderRadius: 10,
    },
  });
    