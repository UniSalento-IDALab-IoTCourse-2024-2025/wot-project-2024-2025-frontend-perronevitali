import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    async function checkUser() {
      const role = await AsyncStorage.getItem('userRole');

      if (role === 'admin') {
        router.replace('/(admin)');
      } else {
        router.replace('/(worker)');
      }
    }

    checkUser();
  }, []);

  return null;
}