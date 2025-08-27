import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import ScanScreen from './src/screens/ScanScreen';
import InventoryScreen from './src/screens/InventoryScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Scan') {
              iconName = focused ? 'camera' : 'camera-outline';
            } else if (route.name === 'Inventory') {
              iconName = focused ? 'library' : 'library-outline';
            } else if (route.name === 'Analytics') {
              iconName = focused ? 'analytics' : 'analytics-outline';
            } else {
              iconName = 'help-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#10b981',
          tabBarInactiveTintColor: '#6b7280',
          tabBarStyle: {
            backgroundColor: '#1f2937',
            borderTopColor: '#374151',
            borderTopWidth: 1,
          },
          headerStyle: {
            backgroundColor: '#111827',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        })}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ title: 'ScryVault' }}
        />
        <Tab.Screen 
          name="Scan" 
          component={ScanScreen}
          options={{ title: 'Scan Book' }}
        />
        <Tab.Screen 
          name="Inventory" 
          component={InventoryScreen}
          options={{ title: 'Inventory' }}
        />
        <Tab.Screen 
          name="Analytics" 
          component={AnalyticsScreen}
          options={{ title: 'Analytics' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
