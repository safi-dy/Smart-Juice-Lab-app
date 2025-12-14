import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

interface WifiSetupProps {
  onConnected: (esp32Ip: string) => void;
}

export default function WifiSetup({ onConnected }: WifiSetupProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [esp32Ip, setEsp32Ip] = useState('192.168.1.100');
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    checkWifiConnection();
    
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? false);
    });

    return () => unsubscribe();
  }, []);

  const checkWifiConnection = async () => {
    const state = await NetInfo.fetch();
    setIsConnected(state.isConnected ?? false);
  };

  const testESP32Connection = async () => {
  if (!isConnected) {
    Alert.alert('No WiFi', 'Please connect to WiFi first');
    return;
  }

  setTesting(true);
  
  try {
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`http://${esp32Ip}/status`, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      Alert.alert(
        'Success!',
        'Connected to Smart Juice Lab',
        [
          {
            text: 'Continue',
            onPress: () => onConnected(esp32Ip)
          }
        ]
      );
    } else {
      Alert.alert('Error', 'ESP32 responded but with error');
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      Alert.alert(
        'Connection Timeout',
        `Cannot reach ESP32 at ${esp32Ip}\n\nConnection timed out after 5 seconds.`
      );
    } else {
      Alert.alert(
        'Connection Failed',
        `Cannot reach ESP32 at ${esp32Ip}\n\nMake sure:\n• ESP32 is powered on\n• You're on the same WiFi network\n• IP address is correct`
      );
    }
  } finally {
    setTesting(false);
  }
};

  return (
    <View className="flex-1 bg-white">
      <View className="flex-1 justify-center px-8">
        
        {/* Header */}
        <View className="items-center mb-12">
          <Text className="text-6xl mb-4">📡</Text>
          <Text className="text-3xl font-bold text-gray-800 text-center mb-2">
            Setup Connection
          </Text>
          <Text className="text-base text-gray-500 text-center">
            Connect to your Smart Juice Lab
          </Text>
        </View>

        {/* WiFi Status */}
        <View className="bg-gray-50 rounded-2xl p-5 mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-semibold text-gray-800">
              WiFi Status
            </Text>
            <View className={`px-3 py-1 rounded-full ${isConnected ? 'bg-green-100' : 'bg-red-100'}`}>
              <Text className={`text-sm font-medium ${isConnected ? 'text-green-700' : 'text-red-700'}`}>
                {isConnected ? '● Connected' : '● Disconnected'}
              </Text>
            </View>
          </View>
          {!isConnected && (
            <Text className="text-sm text-gray-600">
              Please connect your device to WiFi in Settings
            </Text>
          )}
        </View>

        {/* ESP32 IP Input */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-gray-700 mb-2">
            ESP32 IP Address
          </Text>
          <TextInput
            value={esp32Ip}
            onChangeText={setEsp32Ip}
            placeholder="192.168.1.100"
            keyboardType="numeric"
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base text-gray-800"
          />
          <Text className="text-xs text-gray-500 mt-2">
            Enter the IP address of your ESP32 device
          </Text>
        </View>

        {/* Test Connection Button */}
        <TouchableOpacity
          onPress={testESP32Connection}
          disabled={!isConnected || testing}
          className={`rounded-xl py-4 items-center ${
            !isConnected || testing ? 'bg-gray-300' : 'bg-green-500'
          }`}
        >
          <Text className="text-white text-lg font-bold">
            {testing ? 'Testing Connection...' : 'Test Connection'}
          </Text>
        </TouchableOpacity>

        {/* Instructions */}
        <View className="mt-8 bg-blue-50 rounded-xl p-4">
          <Text className="text-sm font-semibold text-blue-800 mb-2">
            ℹ️ Quick Setup Guide
          </Text>
          <Text className="text-sm text-blue-700 leading-5">
            1. Connect your phone to WiFi{'\n'}
            2. Power on the ESP32 device{'\n'}
            3. Enter the ESP32 IP address{'\n'}
            4. Tap "Test Connection"
          </Text>
        </View>
      </View>
    </View>
  );
}