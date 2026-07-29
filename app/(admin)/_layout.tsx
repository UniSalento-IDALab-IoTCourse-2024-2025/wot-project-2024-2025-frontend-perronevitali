import { Tabs } from 'expo-router';
import React,{useEffect,useState} from 'react';
import {View} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRouter } from 'expo-router';
import Entypo from '@expo/vector-icons/Entypo';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter()
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: { position: 'absolute', backgroundColor:'#2c2e52'},
        tabBarActiveTintColor: "#ffa420",
        tabBarInactiveTintColor: "white",
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
            title: 'Inventory',
            tabBarIcon: ({ color }) => <Entypo name="box" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
        title: 'Task assignment',
            tabBarIcon: ({ color }) => <FontAwesome5 name="clipboard-list" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
      name="profile"
      options={{
        title: 'Profilo',
        tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
      }}
      />
    </Tabs>
  );
}
