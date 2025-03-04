import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  Image,
  Dimensions,
  TouchableOpacity,
  FlatList,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import usePremiumHandler from "@/hooks/usePremiumHandler";

const imageData = [
  {
    id: "10",
    url: "https://res.cloudinary.com/shop-it-ecommerce/image/upload/v1731745905/p9_baurm4.jpg",
    size: "medium",
    aspectRatio: 1,
    prompt:
      "portrait | wide angle shot of eyes off to one side of frame, lucid dream-like woman, looking off in distance ::8 style | daydreampunk with glowing skin and eyes, styled in headdress, beautiful, she is dripping in neon lights, very colorful blue, green, purple, bioluminescent, glowing ::8 background | forest, vivid neon wonderland, particles, blue, green, purple ::7 parameters | rule of thirds, golden ratio, assymetric composition, hyper- maximalist, octane render, photorealism, cinematic realism, unreal engine, 8k ::7 --ar 16:9 --s 1000",
  },
  {
    id: "1",
    url: "https://res.cloudinary.com/shop-it-ecommerce/image/upload/v1740563780/image_6_bo2t6q.png",
    size: "large",
    aspectRatio: 0.6667,
    prompt:
      "Lenneth, Valyrie Profile, Watercolor painting, full body side view, dark blue armour, standing position, finest illustrated, sharp focus, Beautiful",
  },
  {
    id: "2",
    url: "https://res.cloudinary.com/shop-it-ecommerce/image/upload/v1731745829/p10_fsfehk.jpg",
    size: "small",
    aspectRatio: 1.4286,
    prompt:
      "cat + glasses, cynematic light, futuristic, epic fantasy, 8k --ar 2:3",
  },
  {
    id: "3",
    url: "https://res.cloudinary.com/shop-it-ecommerce/image/upload/v1740564515/NEfJ2ESrr0vxmDW2Cg_Ke_3d52bd63ab914d939a222130a5bac8b9_vegrqt.jpg",
    size: "medium",
    aspectRatio: 1,
    prompt:
      "Shot captured using a DSLR camera with a 50mm f/1.8 lens, giving a shallow depth of field. The subject is sitting at a café table, turned slightly while talking to someone just off-camera. The lighting is soft and natural, creating gentle shadows and highlights. The image has a natural feel, with small imperfections like stray hairs and slight fabric wrinkles visible. On the table in front, there is a cup of coffee and some personal items like keys or a phone. The background is blurred slightly due to the wide aperture, enhancing the focus on the subject while keeping the ambiance of the coffee shop intact. The framing feels intimate, as if the photographer is engaged in the conversation.",
  },
  {
    id: "6",
    url: "https://res.cloudinary.com/shop-it-ecommerce/image/upload/v1740564172/iSbWi9FcV3NZ-6mCEDXwd_image_zxkvpj.webp",
    size: "large",
    aspectRatio: 0.6667,
    prompt:
      "A woman in vintage attire, possibly from the 1950s or 1960s, posing confidently next to a classic motorcycle. She wears a knitted top and a fitted skirt, and her hair is styled in a retro wave. A golden retriever dog sits attentively at her feet, looking directly at the camera. The backdrop is a muted, textured wall, giving it a nostalgic feel.",
  },
  {
    id: "5",
    url: "https://res.cloudinary.com/shop-it-ecommerce/image/upload/v1740564378/92a7aaafd440416385b9c53ff49adde2_191f37763aa44d9b8a031f651b68ce92_ivzuop.png",
    size: "medium",
    aspectRatio: 1,
    prompt:
      "In the heart of a sprawling cyberpunk city, towering skyscrapers adorned with colorful neon lights pierce the rainy night sky. The streets, slick with rain, reflect vivid hues of electric blue, pink, and green from glowing billboards and holographic ads. A diverse crowd moves through narrow alleys and bustling markets, where vendors sell street food and illicit tech under the glow of neon signs. Hovercars and drones zip overhead, blending into the city's kaleidoscope of colors. Steam rises from sidewalk grates, adding a dreamlike haze. Amidst this urban jungle, a lone figure in a black trench coat and illuminated visor walks with purpose, embodying the gritty allure of the cyberpunk world.",
  },
  {
    id: "8",
    url: "https://res.cloudinary.com/shop-it-ecommerce/image/upload/v1731745828/p7_spk9b8.jpg",
    size: "medium",
    aspectRatio: 1,
    prompt:
      "girl of the future using a food vendor machine, futuristic design, electronic artwork, manga character, techno-noir, animated drawing, vintage futurism, pan futurism, dystopian cyberpunk, neon-lit urban landscape, dark and gritty, high-tech, graffiti, futuristic gadgets, cinematic, detailed cityscape, moody lighting, ultra-detailed, urban landscape, high-tech implants, augmented reality",
  },
  {
    id: "7",
    url: "https://res.cloudinary.com/shop-it-ecommerce/image/upload/v1740564831/hhdNgqYBmTtUqSnL6EYmN_52551829250a45f7b194c808bc95de48_q6tfqq.jpg",
    size: "small",
    aspectRatio: 1.4286,
    prompt:
      "A futuristic Tokyo street scene at night, neon holographic advertisements reflecting in puddles, with a mix of high-tech robots and traditionally dressed humans",
  },
  {
    id: "4",
    url: "https://res.cloudinary.com/shop-it-ecommerce/image/upload/v1740564605/xwm81Alrqou9gj8V0Y42p_b857bfe5882e4f1f80e27b19971b7e6c_hl5wma.jpg",
    size: "small",
    aspectRatio: 1.4286,
    prompt:
      "a person going to musical world through cosmic musical pathway with music raining in background and magic light falling on the path hyper HD ultra Realistic fantasy cinematic dreamy",
  },
  {
    id: "9",
    url: "https://res.cloudinary.com/shop-it-ecommerce/image/upload/v1740565238/q22Ye_cv-5U3LNz5rwWDm_v9nyop.png",
    size: "small",
    aspectRatio: 1.4286,
    prompt:
      "A solar system with vibrant-colored planets and exotic atmospheres, depicted in a science fiction style. HD, 8k, vivid colors, HDR effect, color palette, illustration, photo, 3D render, vibrant, portrait photography.",
  },
];

const ExampleImages = () => {
  const colorScheme = useColorScheme();
  const themeColors = colorScheme === "dark" ? darkTheme : lightTheme;
  const router = useRouter();
  const { isPremium } = usePremiumHandler();
  const [screenWidth, setScreenWidth] = useState(Dimensions.get("window").width);
  const isPremiumRef = useRef(false);

  useEffect(() => {
    const updateLayout = () => {
      setScreenWidth(Dimensions.get("window").width);
    };

    Dimensions.addEventListener("change", updateLayout);

    return () => {
      // Clean up
    };
  }, []);

  useEffect(() => {
    isPremiumRef.current = isPremium;
  }, [isPremium]);

  // Organize data into left and right columns
  const organizeColumns = () => {
    const leftColumn = [];
    const rightColumn = [];
    imageData.forEach((item, index) => {
      if (index % 2 === 0) {
        leftColumn.push(item);
      } else {
        rightColumn.push(item);
      }
    });
    return { leftColumn, rightColumn };
  };

  const { leftColumn, rightColumn } = organizeColumns();

  // Calculate image dimensions
  const getImageStyle = (size) => {
    // Calculate base width (account for padding/margins)
    const baseWidth = (screenWidth - 52) / 2;
    switch (size) {
      case "small":
        return { width: baseWidth, height: baseWidth * 0.7 };
      case "medium":
        return { width: baseWidth, height: baseWidth };
      case "large":
        return { width: baseWidth, height: baseWidth * 1.5 };
      default:
        return { width: baseWidth, height: baseWidth };
    }
  };

  // Navigate to the image screen
  const navigateToImageScreen = (targetId) => {
    const columnData = imageData.find((item) => item.id === targetId);
    const params = {
      prompt: columnData.prompt,
      isPremium: isPremiumRef.current,
      aspectRatio: columnData.aspectRatio,
      url: columnData.url,
    };
    router.push({
      pathname: "/imagesScreen",
      params: { ...params },
    });
  };

  // Render each image item
  const renderItem = ({ item }) => {
    const sizeStyle = getImageStyle(item.size);
    return (
      <TouchableOpacity
        style={{ width: sizeStyle.width, height: sizeStyle.height, marginBottom: 12 }}
        onPress={() => navigateToImageScreen(item.id)}
      >
        <Image
          source={{ uri: item.url }}
          style={[
            styles.exampleImage,
            themeColors.exampleImage,
            { width: sizeStyle.width, height: sizeStyle.height },
          ]}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.subtitle, themeColors.subtitle]}>Community Creation</Text>
      <View style={styles.gridContainer}>
        <View style={styles.column}>
          <FlatList
            data={leftColumn}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>
        <View>
          <FlatList
            data={rightColumn}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>
      </View>
    </View>
  );
};

export default ExampleImages;

const darkTheme = StyleSheet.create({
  subtitle: {
    color: "#FFFFFF",
  },
  exampleImage: {
    backgroundColor: "#2d2d2c",
  },
});

const lightTheme = {
  subtitle: {
    color: "#161716",
  },
  exampleImage: {
    backgroundColor: "#eceded",
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 12,
    fontFamily: "Poppins_500Medium",
    lineHeight: 27,
    letterSpacing: -0.02 * 20,
  },
  gridContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  column: {
    flex: 1,
    // Adding some margin to separate the two columns
    // margin: 6,
  },
  exampleImage: {
    borderRadius: 14,
    resizeMode: "cover",
  },
});
