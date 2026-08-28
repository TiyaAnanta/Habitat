import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeScreen from '../screens/HomeScreen';
import AnalyticsListScreen from '../screens/AnalyticsListScreen';
import QuestDetailScreen from '../screens/QuestDetailScreen';
import GoalsScreen from '../screens/GoalsScreen';

const Tab = createBottomTabNavigator();
const AnalyticsStack = createNativeStackNavigator();

function AnalyticsNavigator() {
  return (
    <AnalyticsStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <AnalyticsStack.Screen
        name="AnalyticsList"
        component={AnalyticsListScreen}
      />
      <AnalyticsStack.Screen
        name="QuestDetail"
        component={QuestDetailScreen}
      />
    </AnalyticsStack.Navigator>
  );
}

export default function AppNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Today') iconName = 'zap';
          else if (route.name === 'Analytics') iconName = 'bar-chart-2';
          else if (route.name === 'Goals') iconName = 'target';
          return <Feather name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#534AB7',
        tabBarInactiveTintColor: '#bbb',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#eee',
          paddingTop: 4,
          height: 56 + insets.bottom,
          paddingBottom: insets.bottom,
        },
      })}
    >
      <Tab.Screen name="Today" component={HomeScreen} />
      <Tab.Screen name="Analytics" component={AnalyticsNavigator} />
      <Tab.Screen name="Goals" component={GoalsScreen} />
    </Tab.Navigator>
  );
}
