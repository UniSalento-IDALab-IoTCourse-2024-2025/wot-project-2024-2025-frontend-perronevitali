import { useState, useEffect, useCallback } from 'react';
import { Text, StyleSheet, TouchableOpacity, ScrollView, View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_PORT_OS } from '@/constants/api';
import { useRouter } from 'expo-router';
import { buildDisplayMessage } from '@/hooks/stompClient';

const SEVERITY_TEXT_COLOR = {
  urgent: '#e74c3c',
  warning: '#ffa420',
  safe: '#2ecc71',
};

export default function AreaHistoryScreen() {
  const router = useRouter();
  const endpointOS = API_BASE_URL + API_PORT_OS;
  const [areaId, setAreaId] = useState(null);
  const [areaName, setAreaName] = useState('');
  const [messages, setMessages] = useState([]);
  const [before, setBefore] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadPage = useCallback(
    async (id, cursor) => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem('token');
        const user = JSON.parse(await AsyncStorage.getItem('user'));
        let url = endpointOS + '/api/message-history/areas/' + id + '?limit=20';
        if (cursor) url += '&before=' + encodeURIComponent(cursor);
        const response = await fetch(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        });
        if (!response.ok) {
          console.log('Errore GET /api/message-history/areas/:id', response.status);
          return;
        }
        const data = await response.json();
        const display = (data.messages || [])
          .map((entry) => buildDisplayMessage(entry.type, entry.payload, entry.timestamp, user?.id))
          .filter(Boolean);
        setMessages((prev) => (cursor ? [...prev, ...display] : display));
        setHasMore(!!data.hasMore);
        if (display.length > 0) {
          setBefore(display[display.length - 1].timestamp);
        }
      } catch (e) {
        console.log('Errore chiamata storico area', e);
      } finally {
        setLoading(false);
      }
    },
    [endpointOS]
  );

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem('currArea');
      const area = raw ? JSON.parse(raw) : null;
      if (!area) return;
      setAreaId(area.id);
      setAreaName(area.name);
      loadPage(area.id, null);
    })();
  }, [loadPage]);

  const getDate = (timestamp) => new Date(timestamp).toLocaleDateString('it-IT');
  const getHour = (timestamp) => new Date(timestamp).toLocaleTimeString('it-IT');

  const loadMore = () => {
    if (!areaId || loading || !hasMore) return;
    loadPage(areaId, before);
  };

  return (
    <ScrollView style={{ backgroundColor: '#ffa420' }}>
      <Text style={styles.start}>Storico — {areaName}</Text>

      <View style={styles.container}>
        {messages.length === 0 && !loading ? (
          <Text style={styles.placeholder}>Nessun evento storico per quest'area</Text>
        ) : (
          messages.map((m, key) => (
            <View key={key} style={styles.boxMessage}>
              <View style={styles.textContainer}>
                <Text style={[styles.message, { color: SEVERITY_TEXT_COLOR[m.severity] || 'white' }]}>
                  {m.header}
                </Text>
                <Text style={styles.hourMessage}>
                  {getDate(m.timestamp)}
                  {'\t'}
                  {'\t'}
                  {'\t'}
                  {'\t'}
                  {'\t'}
                  {'\t'}
                  {getHour(m.timestamp)}
                </Text>
              </View>
            </View>
          ))
        )}

        {loading && <ActivityIndicator color="#2c2e52" style={{ marginTop: 20 }} />}

        {hasMore && !loading && (
          <TouchableOpacity style={styles.buttonlog} onPress={loadMore}>
            <Text style={styles.textbutton}>Carica altri</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.textbutton}>Torna indietro</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingBottom: 40 },
  start: { fontSize: 24, fontWeight: 'bold', color: 'white', marginTop: 40, marginLeft: 10, marginBottom: 10 },
  placeholder: { fontSize: 16, color: 'white', marginTop: 20, fontStyle: 'italic' },
  boxMessage: {
    width: 340,
    minHeight: 90,
    marginBottom: 14,
    padding: 10,
    backgroundColor: '#2c2e52',
    borderRadius: 10,
    justifyContent: 'center',
  },
  message: { fontSize: 20, fontWeight: 'bold' },
  textContainer: { flex: 1 },
  hourMessage: { fontSize: 14, color: '#cfcfcf', marginTop: 4 },
  button: {
    justifyContent: 'center', alignItems: 'center', backgroundColor: '#ff4700',
    height: 55, width: 200, borderRadius: 15, marginTop: 20,
  },
  buttonlog: {
    justifyContent: 'center', alignItems: 'center', backgroundColor: '#2c2e52',
    height: 50, width: 200, borderRadius: 15, marginTop: 10,
  },
  textbutton: { fontSize: 16, fontWeight: 'bold', color: 'white' },
});