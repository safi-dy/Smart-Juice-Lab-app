import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Animated,
  Dimensions,
  ImageBackground,
} from "react-native";
import { Audio } from "expo-av";

const { width } = Dimensions.get("window");

interface Slide {
  title: string;
  subtitle: string;
  bgImage: any; // Changed from string to any for require()
}

interface SplashScreenProps {
  onFinish?: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(0));
  const [currentSlide, setCurrentSlide] = useState<number>(0);

  const slides: Slide[] = [
    {
      title: "Welcome to",
      subtitle: "Smart JuiceLab",
      bgImage: require("../assets/images/watermelon.jpeg"),
    },
    {
      title: "Fresh Juices",
      subtitle: "Made Daily",
      bgImage: require("../assets/images/peach.png"),
    },
    {
      title: "Healthy & Tasty",
      subtitle: "Let's Get Started!",
      bgImage: require("../assets/images/juices.jpeg"),
    },
  ];

  const playWelcomeAudio = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("../assets/welcom.aac")
      );
      await sound.playAsync();
    } catch (error) {
      console.log("Audio error:", error);
    }
  };

  useEffect(() => {
    playWelcomeAudio();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => {
        const nextSlide = (prev + 1) % slides.length;

        Animated.sequence([
          Animated.timing(slideAnim, {
            toValue: -width,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]).start();

        return nextSlide;
      });
    }, 3000);

    const finishTimer = setTimeout(() => {
      if (onFinish) onFinish();
    }, 9000);

    return () => {
      clearInterval(slideInterval);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <View className="flex-1">
      <ImageBackground
        source={slides[currentSlide].bgImage}
        style={{ width: "100%", height: "100%" }}
        resizeMode="cover"
      >
        {/* Optional dark overlay for better text visibility */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
          }}
        />

        <Animated.View
          style={{ opacity: fadeAnim }}
          className="flex-1 justify-center items-center"
        >
          <Animated.View
            style={{ transform: [{ translateX: slideAnim }] }}
            className="items-center"
          >
            <Text className="text-white text-[70px] font-bold mb-2 text-center">
              {slides[currentSlide].title}
            </Text>
            <Text className="text-white text-5xl font-light text-center">
              {slides[currentSlide].subtitle}
            </Text>
          </Animated.View>

          {/* Slide indicators */}
          <View className="flex-row absolute bottom-20 space-x-2">
            {slides.map((_, index: number) => (
              <View
                key={index}
                className={`h-2 rounded-full ${
                  index === currentSlide ? "w-8 bg-white" : "w-2 bg-white/50"
                }`}
              />
            ))}
          </View>
        </Animated.View>
      </ImageBackground>
    </View>
  );
}
