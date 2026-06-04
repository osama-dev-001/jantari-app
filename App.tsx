import React, { useEffect } from 'react';
import BootSplash from 'react-native-bootsplash';
import HomeScreen from './src/screens/HomeScreen';

export default function App() {
  useEffect(() => {
    BootSplash.hide({ fade: true });
  }, []);

  return <HomeScreen />;
}