import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';

interface Props {
  onNavigateToFlatList: () => void;
}

export default function TestHomeScreen({ onNavigateToFlatList }: Props) {
  const tests = [
    {
      id: 'flatlist',
      title: 'FlatList 测试',
      description: '测试 FlatList 的所有常用属性和功能',
      onPress: onNavigateToFlatList,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>React Native 测试</Text>
        <Text style={styles.subtitle}>选择要测试的组件</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {tests.map((test) => (
          <TouchableOpacity
            key={test.id}
            style={styles.testCard}
            onPress={test.onPress}
            activeOpacity={0.7}
          >
            <Text style={styles.testTitle}>{test.title}</Text>
            <Text style={styles.testDescription}>{test.description}</Text>
            <View style={styles.arrow}>
              <Text style={styles.arrowText}>→</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 32,
    backgroundColor: '#1e293b',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  testCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
    position: 'relative',
  },
  testTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  testDescription: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
    paddingRight: 40,
  },
  arrow: {
    position: 'absolute',
    right: 20,
    top: '50%',
    marginTop: -12,
  },
  arrowText: {
    fontSize: 20,
    color: '#3b82f6',
    fontWeight: '600',
  },
});