import {useEffect} from "react";
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

export default function RootLayout() {
  const colorScheme = useColorScheme();

    useEffect(() => {
        Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.MAX,
          sound: 'alarm.wav',
          vibrationPattern: [0, 250, 250, 250],
        });
      }, []);
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(worker)" options={{ headerShown: false }} />
         <Stack.Screen name="(admin)" options={{ headerShown: false }} />
         <Stack.Screen name="index" options={{ headerShown: false }}/>
         <Stack.Screen name="login" options={{ headerShown: false }}/>
         <Stack.Screen name="activity/activities" options={{ headerShown: false }}/>
         <Stack.Screen name="activity/taskopt" options={{ headerShown: false }}/>
         <Stack.Screen name="activity/inspection" options={{ headerShown: false }}/>
         <Stack.Screen name="activity/maintenance" options={{ headerShown: false }}/>
         <Stack.Screen name="activity/externopt" options={{ headerShown: false }}/>
         <Stack.Screen name="activity/valutation" options={{ headerShown: false }}/>
         <Stack.Screen name="activity/loading/loaditem" options={{ headerShown: false }}/>
         <Stack.Screen name="activity/loading/loadinstore" options={{ headerShown: false }}/>
         <Stack.Screen name="activity/unloading/unloaditem" options={{ headerShown: false }}/>
         <Stack.Screen name="activity/unloading/unloadinstore" options={{ headerShown: false }}/>
         <Stack.Screen name="activity/shift" options={{ headerShown: false }}/>
         <Stack.Screen name="area/areaopt" options={{ headerShown: false }}/>
         <Stack.Screen name="area/newarea" options={{ headerShown: false }}/>
         <Stack.Screen name="area/thresholdarea" options={{ headerShown: false }}/>
         <Stack.Screen name="area/deletearea" options={{ headerShown: false }}/>
         <Stack.Screen name="area/areaedit" options={{ headerShown: false }}/>
         <Stack.Screen name="item/itemopt" options={{ headerShown: false }}/>
         <Stack.Screen name="item/newitem" options={{ headerShown: false }}/>
         <Stack.Screen name="item/updatestore" options={{ headerShown: false }}/>
         <Stack.Screen name="user/newAdmin" options={{ headerShown: false }}/>
         <Stack.Screen name="user/newWorker" options={{ headerShown: false }}/>
         <Stack.Screen name="user/listUser" options={{ headerShown: false }}/>
         <Stack.Screen name="user/listWorker" options={{ headerShown: false }}/>
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
