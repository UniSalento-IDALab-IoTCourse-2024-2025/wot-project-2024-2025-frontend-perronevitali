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
  const [user,setUser] = useState('')
  const getUser = async () =>{
      const type = await AsyncStorage.getItem('userRole')
      console.log(type)
      setUser(type)

  }
  useEffect(() => {
    const load = async () => {
      await getUser();
    };

    load();
  }, []);

  const isAdmin = user === 'admin';
  const isWorker = user === 'worker';

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
        name="message"
        options={{
           title: 'Message',
           href: isWorker ? undefined : null,
           tabBarIcon: ({ color }) => <Entypo name="message" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
          name="works"
          options={{
             title: 'work list',
             tabBarIcon: ({ color }) => <FontAwesome5 name="clipboard-list" size={24} color={color} />,
          }}
      />
      <Tabs.Screen
         name="activities"
         options={{
            title: 'activity',
            tabBarIcon: ({ color }) => <Entypo name="warning" size={24} color={color} />,
         }}
      />
      <Tabs.Screen
        name="profile"
        options={{
            title: 'Profilo',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
            }}
        />

      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          href: isAdmin ? undefined : null,
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
