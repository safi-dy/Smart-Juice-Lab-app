import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { Audio } from "expo-av";

interface JuiceRecipe {
  id: string;
  name: string;
  description: string;
  image: any;
  pumpSequence: {
    pump: number;
    duration: number;
  }[];
}

export default function HomeScreen() {
  const [selectedFruits, setSelectedFruits] = useState<string[]>([]);
  const [dispensing, setDispensing] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [cupSize, setCupSize] = useState<1 | 2 | 3>(1); // 1 = 250ml, 2 = 500ml, 3 = 750ml

  const juices: JuiceRecipe[] = [
    {
      id: "1",
      name: "Banana",
      description: "Classic banana",
      image: require("../assets/images/banana.jpg"),
      pumpSequence: [
        { pump: 1, duration: 3000 },
        { pump: 2, duration: 1000 },
        { pump: 3, duration: 5000 },
      ],
    },
    {
      id: "2",
      name: "Papaya",
      description: "Tropical papaya",
      image: require("../assets/images/papaya.jpg"),
      pumpSequence: [
        { pump: 4, duration: 3000 },
        { pump: 2, duration: 1000 },
        { pump: 3, duration: 5000 },
      ],
    },
    {
      id: "3",
      name: "Peach",
      description: "Sweet strawberry",
      image: require("../assets/images/peach.jpeg"),
      pumpSequence: [
        { pump: 5, duration: 3000 },
        { pump: 2, duration: 1000 },
        { pump: 3, duration: 5000 },
      ],
    },
    {
      id: "4",
      name: "Pineapple",
      description: "Tangy pineapple",
      image: require("../assets/images/pine.jpg"),
      pumpSequence: [
        { pump: 6, duration: 3000 },
        { pump: 2, duration: 1000 },
        { pump: 3, duration: 5000 },
      ],
    },
  ];

  // Calculate quantities based on cup size
  const getQuantities = () => {
    const baseWater = 150; // ml per cup
    const baseSugar = 15; // g per cup
    const baseFruit = 100; // ml per cup (total for all selected fruits)

    return {
      water: baseWater * cupSize,
      sugar: baseSugar * cupSize,
      fruit: baseFruit * cupSize,
      fruitPerType: Math.round(
        (baseFruit * cupSize) / (selectedFruits.length || 1)
      ),
    };
  };

  const playSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("../assets/mixty.wav")
      );
      setSound(sound);
      await sound.playAsync();
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  };

  React.useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const toggleFruit = (id: string) => {
    if (dispensing) return;

    if (selectedFruits.includes(id)) {
      setSelectedFruits(selectedFruits.filter((fruitId) => fruitId !== id));
    } else {
      if (selectedFruits.length < juices.length) {
        setSelectedFruits([...selectedFruits, id]);
      }
    }
  };

  const dispenseJuice = async () => {
    if (selectedFruits.length === 0) return;

    await playSound();

    setDispensing(true);

    const selectedRecipes = juices.filter((j) => selectedFruits.includes(j.id));

    const quantities = getQuantities();

    try {
      const response = await fetch("http://192.168.1.100/dispense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipes: selectedRecipes.map((r) => r.name),
          pumpSequences: selectedRecipes.map((r) => r.pumpSequence),
          quantities: {
            cupSize: cupSize,
            water: quantities.water,
            sugar: quantities.sugar,
            fruitPerType: quantities.fruitPerType,
            totalVolume: quantities.water + quantities.fruit,
          },
        }),
      });

      console.log(
        "Dispensing:",
        selectedRecipes.map((r) => r.name).join(" + ")
      );
      console.log("Quantities:", quantities);
    } catch (error) {
      console.error("ESP32 Error:", error);
    }

    setTimeout(() => {
      setDispensing(false);
      setSelectedFruits([]);
    }, 9000);
  };

  const getSelectionText = () => {
    if (selectedFruits.length === 0) return "Select your fruits";
    const names = selectedFruits.map(
      (id) => juices.find((j) => j.id === id)?.name
    );
    return names.join(" + ");
  };

  const getCupSizeLabel = () => {
    switch (cupSize) {
      case 1:
        return "Small (250ml)";
      case 2:
        return "Medium (500ml)";
      case 3:
        return "Large (750ml)";
    }
  };

  return (
    <View className="flex-1">
      {/* Selection Info */}
      <View className="bg-[#e0960e] px-6 py-2 mx-4 mt-8 rounded-full shadow-lg shadow-yellow-800">
        {/* <Text className="text-sm text-gray-500 text-center mb-1">Your Selection</Text> */}
        <Text className="text-xl font-bold text-gray-100 text-center">
          {getSelectionText()}
        </Text>
        <Text className="text-xs text-gray-100 text-center mt-1">
          {selectedFruits.length > 0
            ? `${selectedFruits.length} fruit${
                selectedFruits.length > 1 ? "s" : ""
              } selected`
            : "Tap fruits to select"}
        </Text>
      </View>

      {/* Cup Size Selector */}
      <View className="bg-white px-6 py-4 border-b border-gray-200 mt-2">
        <Text className="text-sm font-semibold text-gray-700 mb-3 text-center">
          Select Cup Size
        </Text>
        <View className="flex-row justify-between shadow-lg shadow-blue-800">
          <TouchableOpacity
            onPress={() => setCupSize(1)}
            disabled={dispensing}
            className={`flex-1 py-3 rounded-full mr-2 ${
              cupSize === 1 ? "bg-blue-400" : "bg-gray-200"
            }`}
          >
            <Text
              className={`text-center font-bold ${
                cupSize === 1 ? "text-white" : "text-gray-600"
              }`}
            >
              Small
            </Text>
            <Text
              className={`text-center text-xs ${
                cupSize === 1 ? "text-blue-100" : "text-gray-500"
              }`}
            >
              250ml
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setCupSize(2)}
            disabled={dispensing}
            className={`flex-1 py-3 rounded-full mx-1 ${
              cupSize === 2 ? "bg-blue-400" : "bg-gray-200"
            }`}
          >
            <Text
              className={`text-center font-bold ${
                cupSize === 2 ? "text-white" : "text-gray-600"
              }`}
            >
              Medium
            </Text>
            <Text
              className={`text-center text-xs ${
                cupSize === 2 ? "text-blue-100" : "text-gray-500"
              }`}
            >
              500ml
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setCupSize(3)}
            disabled={dispensing}
            className={`flex-1 py-3 rounded-full ml-2 ${
              cupSize === 3 ? "bg-blue-400" : "bg-gray-200"
            }`}
          >
            <Text
              className={`text-center font-bold ${
                cupSize === 3 ? "text-white" : "text-gray-600"
              }`}
            >
              Large
            </Text>
            <Text
              className={`text-center text-xs ${
                cupSize === 3 ? "text-blue-100" : "text-gray-500"
              }`}
            >
              750ml
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quantity Display */}
        {selectedFruits.length > 0 && (
          <View className="mt-4 p-3 bg-gray-50 rounded-lg">
            <Text className="text-xs font-semibold text-gray-600 mb-2 text-center">
              Recipe Details
            </Text>
            <View className="flex-row justify-around">
              <View className="items-center">
                <Text className="text-lg font-bold">
                  {getQuantities().water}ml
                </Text>
                <Text className="text-xs text-gray-500">Water</Text>
              </View>
              <View className="items-center">
                <Text className="text-lg font-bold">
                  {getQuantities().sugar}g
                </Text>
                <Text className="text-xs text-gray-500">Sugar</Text>
              </View>
              <View className="items-center">
                <Text className="text-lg font-bold">
                  {getQuantities().fruitPerType}ml
                </Text>
                <Text className="text-xs text-gray-500">Each Fruit</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Juice Grid */}
      <ScrollView className="flex-1" contentContainerClassName="p-3">
        <View className="flex-col flex-wrap">
          {juices.map((juice) => {
            const isSelected = selectedFruits.includes(juice.id);
            return (
              <TouchableOpacity
                key={juice.id}
                onPress={() => toggleFruit(juice.id)}
                disabled={dispensing}
                className={`mb-4 rounded-2xl bg-white overflow-hidden w-full`}
                style={{
                  opacity: dispensing ? 0.4 : isSelected ? 1 : 0.5,
                  elevation: isSelected ? 8 : 3,
                  borderWidth: isSelected ? 4 : 0,
                  borderColor: isSelected ? "#fff" : "transparent",
                }}
              >
                {/* Content */}
                <View className="pb-10 items-center h-[50vh]">
                  <Image
                    source={juice.image}
                    className="w-[100%] h-[90%] mb-3"
                    resizeMode="cover"
                  />
                  <Text className="text-xl font-bold text-gray-800 text-center mb-1">
                    {juice.name}
                  </Text>
                  <Text className="text-sm text-gray-500 text-center">
                    {juice.description}
                  </Text>
                </View>

                {/* Selection indicator (checkmark) */}
                {isSelected && (
                  <View
                    className="absolute right-1 bg-white rounded-full items-center justify-center"
                    style={{ width: 36, height: 36 }}
                  >
                    <Text className="text-2xl font-bold">✓</Text>
                  </View>
                )}

                {/* Selection overlay */}
                {isSelected && !dispensing && (
                  <View className="absolute inset-0" style={{ opacity: 0.1 }} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Prepare Button */}
      <View className="bg-white px-6 py-5 border-t border-gray-200 mb-6">
        {dispensing ? (
          <View className="flex-row items-center justify-center">
            <View className="w-3 h-3 rounded-full bg-green-500 mr-3" />
            <Text className="text-lg font-semibold text-gray-800">
              Preparing your {getCupSizeLabel()} juice...
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            onPress={dispenseJuice}
            disabled={selectedFruits.length === 0}
            className={`w-full py-4 rounded-full items-center ${
              selectedFruits.length > 0 ? "bg-yellow-500" : "bg-gray-200"
            }`}
          >
            <Text
              className={`font-bold text-lg ${
                selectedFruits.length > 0 ? "text-white" : "text-gray-400"
              }`}
            >
              {selectedFruits.length > 0
                ? `Prepare ${getCupSizeLabel()}`
                : "Select fruits to continue"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
