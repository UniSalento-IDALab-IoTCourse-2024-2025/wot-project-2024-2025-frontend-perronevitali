import { useState, useEffect, useRef } from 'react';
import { Text, StyleSheet, TouchableOpacity, ScrollView, View, Modal } from 'react-native';
import { Divider } from 'react-native-elements';
import Feather from '@expo/vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const SEVERITY_TEXT_COLOR = {
  urgent: '#e74c3c',
  warning: '#ffa420',
  safe: '#2ecc71',
};

export default function MessageScreen() {
  const router = useRouter();
  const [recentMessages, setRecentMessages] = useState([]);
  const [liveMessages, setLiveMessages] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const pollRef = useRef(null);

  const loadAll = async () => {
    const recent = JSON.parse(await AsyncStorage.getItem('mexsRecent'));
    setRecentMessages(recent || []);
    const live = JSON.parse(await AsyncStorage.getItem('mexsLive'));
    setLiveMessages(live || []);
  };

  useEffect(() => {
    loadAll();
    pollRef.current = setInterval(loadAll, 5000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const getDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('it-IT');
  };
  const getHour = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('it-IT');
  };

  const openModal = (message) => {
    setSelectedMessage(message);
    setModalVisible(true);
  };
  const closeModal = () => setModalVisible(false);

  const renderCard = (message, key) => (
    <View key={key} style={styles.boxMessage}>
      <View style={styles.textContainer}>
        <Text style={[styles.message, { color: SEVERITY_TEXT_COLOR[message.severity] || 'white' }]}>
          {message.header}
        </Text>
        <Text style={styles.hourMessage}>
          {getDate(message.timestamp)}
          {'\t'}
          {'\t'}
          {'\t'}
          {'\t'}
          {'\t'}
          {'\t'}
          {getHour(message.timestamp)}
        </Text>
      </View>
      <TouchableOpacity onPress={() => openModal(message)}>
        <Feather name="external-link" size={28} color="#ff4700" />
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={{ backgroundColor: '#ffa420' }} contentContainerStyle={{ paddingBottom: 60 }}>
      <Text style={styles.start}>I tuoi messaggi</Text>
      <TouchableOpacity style={styles.buttonlog} onPress={() => router.push('/area/history')}>
        <Text style={styles.textbutton}>Vedi storico completo</Text>
      </TouchableOpacity>

      <Text style={styles.selectArea}>Prima del tuo arrivo</Text>
      <View style={styles.container}>
        {
          recentMessages.map((m, key) => renderCard(m, 'recent-' + key))
        }
      </View>

      <Text style={styles.selectArea}>In tempo reale</Text>
      <View style={styles.container}>
        {
          liveMessages?.map((m, key) => renderCard(m, 'live-' + key))
        }
      </View>

      <Modal visible={isModalVisible} transparent animationType="slide" onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>
            <Divider style={{ backgroundColor: '#ffa420', marginVertical: 1, width: '30%', alignSelf: 'center', height: 5 }} />
            <Divider style={{ backgroundColor: '#ccc', marginVertical: 10 }} />
            <Text style={styles.modalText}>{selectedMessage?.header}</Text>
            <Text style={styles.modalText}>
              Descrizione:<Text style={styles.infoText}> {selectedMessage?.description}</Text>
            </Text>
            {selectedMessage?.totalDangerIndex != null && (
              <Text style={styles.modalText}>
                Indice pericolo:
                <Text style={styles.infoText}>
                  {' '}
                  {Math.round(selectedMessage.totalDangerIndex)} / soglia {Math.round(selectedMessage.dangerIndexThreshold)}
                </Text>
              </Text>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffa420',
  },
  start: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 40,
    marginLeft: 10,
  },
 buttonlog:{
     justifyContent: 'center',
     alignItems: 'center',
     backgroundColor: '#ff4700',
    height: 55,
    width: 200,
    borderRadius: 15,
    marginTop: 20,
    marginLeft:20
   },
  selectArea: {
    fontSize: 24,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    color: 'white',
    marginTop: 20,
    marginLeft: 10,
  },
  placeholder: {
    fontSize: 16,
    color: 'white',
    marginTop: 10,
    marginLeft: 10,
    fontStyle: 'italic',
    alignSelf: 'flex-start',
  },
  boxMessage: {
    width: 340,
    minHeight: 90,
    marginTop: 30,
    marginBottom: 30,
    padding: 10,
    backgroundColor: '#2c2e52',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  message: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  textContainer: {
    flex: 1,
  },
  hourMessage: {
    fontSize: 14,
    color: '#cfcfcf',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#2c2e52',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: 200,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'red',
  },
  modalText: {
    fontSize: 24,
    marginTop: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  infoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffa420',
  },
  textbutton:{
      fontSize:18,
      fontWeight: 'bold',
      color:'white'
  },
});