import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import BootSplash from 'react-native-bootsplash';

import LandingScreen from './src/screens/LandingScreen';
import HomeScreen from './src/screens/HomeScreen';
import DhikrScreen from './src/screens/DhikrScreen';
import DhikrDetailScreen from './src/screens/DhikrDetailScreen';

const Stack = createStackNavigator();

export default function App() {
  useEffect(() => {
    BootSplash.hide({ fade: true });
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Landing"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Landing" component={LandingScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Dhikr" component={DhikrScreen} />
        <Stack.Screen name="DhikrDetail" component={DhikrDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}