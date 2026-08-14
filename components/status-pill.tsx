import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function StatusPill() {
  const insets = useSafeAreaInsets();
  const [currentArea, setCurrentArea] = useState(null);
  const pollRef = useRef(null);

  const loadArea = async () => {
    const raw = await AsyncStorage.getItem('currArea');
    setCurrentArea(raw ? JSON.parse(raw) : null);
  };

  useEffect(() => {
    loadArea();
    pollRef.current = setInterval(loadArea, 3000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  if (!currentArea) return null;

  const isDanger = currentArea.status === 99;

  return (
    <View style={[styles.dock, { paddingTop: insets.top + 8 }]}>
      <View style={styles.card}>
        <View style={styles.areaText}>
          <Text style={styles.label}>Area attuale</Text>
          <Text style={styles.name} numberOfLines={1}>
            {currentArea.name}
          </Text>
        </View>
        <Text
          style={[styles.statusText, { color: isDanger ? '#ff8a80' : '#7ee8a8' }]}
          numberOfLines={1}
        >
          {isDanger ? 'DANGER' : 'OK'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dock: {
    backgroundColor: '#ffa420',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  card: {
    backgroundColor: '#2c2e52',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  areaText: {
    flexShrink: 1,
    marginRight: 12,
  },
  label: {
    color: '#b9bcd6',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  name: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusText: {
    flexShrink: 0,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});