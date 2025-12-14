import { Stack } from 'expo-router';
import { useState } from 'react';
import SplashScreen from './SplashScreen';
import WifiSetup from './wifiSetup';
import './globals.css';

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);
  const [esp32Connected, setEsp32Connected] = useState(false);
  const [esp32Ip, setEsp32Ip] = useState('');

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (!esp32Connected) {
    return (
      <WifiSetup 
        onConnected={(ip) => {
          setEsp32Ip(ip);
          setEsp32Connected(true);
        }} 
      />
    );
  }

  return (
    <Stack 
      screenOptions={{ 
        headerShown: false 
      }}
      initialRouteName="index"
    >
      <Stack.Screen 
        name="index" 
        initialParams={{ esp32Ip }}
      />
    </Stack>
  );
}

// app/_layout.tsx or App.tsx
// import React, { useState } from 'react';
// import './globals.css';
// import SplashScreen from './SplashScreen';
// import HomeScreen from './index'; // Your main juice ordering interface

// export default function App() {
//   const [showSplash, setShowSplash] = useState(true);

//   if (showSplash) {
//     return <SplashScreen onFinish={() => setShowSplash(false)} />;
//   }

//   return <HomeScreen />;
// }