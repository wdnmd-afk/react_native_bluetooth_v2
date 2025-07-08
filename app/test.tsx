import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import FlatListTestScreen from '../components/FlatListTestScreen';
import TestHomeScreen from '../components/TestHomeScreen';

export default function TestScreen() {
  const [currentScreen, setCurrentScreen] = useState('home');

  if (currentScreen === 'flatlist') {
    return <FlatListTestScreen onBack={() => setCurrentScreen('home')} />;
  }

  return <TestHomeScreen onNavigateToFlatList={() => setCurrentScreen('flatlist')} />;
}