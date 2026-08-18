import { Client } from '@stomp/stompjs';
import { Client as MqttClient } from 'react-native-paho-mqtt';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { API_BASE_URL, API_PORT_OS, API_PORT_US } from '@/constants/api';

let client = null;
let stompReady = false;
const readyCallbacks = [];
const endpointUS = API_BASE_URL + API_PORT_US;
const endpointOS = API_BASE_URL + API_PORT_OS;

const AREA_SUBTOPICS = ['alert', 'unauthorized', 'danger'];

let mqttClient = null;
let mqttReady = false;
let currentAreaTopics = [];
let currentAreaId = null;
let pendingAreaId = null;
let mqttReconnectTimer = null;
let personalSub = null;

const mqttStorage = {
  setItem: (key, item) => AsyncStorage.setItem(key, item),
  getItem: (key) => AsyncStorage.getItem(key),
  removeItem: (key) => AsyncStorage.removeItem(key),
};

export function getStompClient(idUser) {
  if (client) return client;

  client = new Client({
    brokerURL: 'ws://100.65.22.118:15674/ws',
    connectHeaders: {
      login: 'FARO',
      passcode: 'FARO',
    },
    forceBinaryWSFrames: true,
    appendMissingNULLonIncoming: true,
    onConnect: () => {
      console.log('STOMP CONNESSO');
      personalSub = client.subscribe('/queue/faro.inbox.' + idUser, onPersonalMessage);
      stompReady = true;
      readyCallbacks.forEach(cb => cb());
      readyCallbacks.length = 0;
    },
    onStompError: (frame) => {
      console.log('STOMP ERROR:', frame.headers['message'], frame.body);
    },
    onWebSocketError: (event) => {
      console.log('WEBSOCKET ERROR:', event.message || event);
    },
    onDisconnect: () => {
      console.log('STOMP DISCONNESSO');
      stompReady = false;
      currentAreaTopics = [];
      currentAreaId = null;
    },
  });

  client.activate();
  connectMqtt();
  return client;
}

function connectMqtt() {
  if (mqttClient) return;

  mqttClient = new MqttClient({
    uri: 'ws://100.65.22.118:15675/ws',
    clientId: 'faro-area-' + Date.now(),
    storage: mqttStorage,
  });

  mqttClient.on('connectionLost', (responseObject) => {
    console.log('MQTT DISCONNESSO:', responseObject.errorMessage);
    mqttReady = false;
    currentAreaTopics = [];
    scheduleMqttReconnect();
  });

  mqttClient.on('messageReceived', onAreaMqttMessage);

  doMqttConnect();
}

function doMqttConnect() {
  mqttClient
    .connect({ userName: 'FARO', password: 'FARO' })
    .then(() => {
      console.log('MQTT CONNESSO');
      mqttReady = true;
      currentAreaId = null;
      if (pendingAreaId) {
        const idArea = pendingAreaId;
        pendingAreaId = null;
        switchAreaSubscription(idArea);
      }
    })
    .catch((error) => {
      console.log('MQTT ERROR:', error);
      scheduleMqttReconnect();
    });
}

function scheduleMqttReconnect() {
  if (mqttReconnectTimer) return;
  mqttReconnectTimer = setTimeout(() => {
    mqttReconnectTimer = null;
    if (!mqttReady && mqttClient) {
      doMqttConnect();
    }
  }, 3000);
}

export function switchAreaSubscription(idArea) {
  console.log('switchAreaSubscription chiamata, mqttReady =', mqttReady);
  if (!idArea) return;

  if (!mqttClient || !mqttReady) {
    pendingAreaId = idArea;
    return;
  }

  if (idArea === currentAreaId) return; // già iscritto a questa area, non fare nulla

  currentAreaTopics.forEach((topic) => mqttClient.unsubscribe(topic));

  currentAreaTopics = AREA_SUBTOPICS.map((subTopic) => 'area/' + idArea + '/' + subTopic);
  currentAreaTopics.forEach((topic) => mqttClient.subscribe(topic, { qos: 1 }));
  currentAreaId = idArea;

  console.log('Sottoscritto alla nuova area:', idArea);

  AsyncStorage.setItem('mexsLive', JSON.stringify([]));
  AsyncStorage.setItem('mexsRecent', JSON.stringify([]));

  refreshCurrentAreaFromServer(idArea, { notifyIfDanger: true });
}

export function clearAreaSubscription() {
  if (mqttClient) {
    currentAreaTopics.forEach((topic) => mqttClient.unsubscribe(topic));
  }
  currentAreaTopics = [];
  currentAreaId = null;
  pendingAreaId = null;
}

export function getExistingStompClient() {
  return client;
}
export function isStompReady() {
  return stompReady;
}

export function onStompReady(cb) {
  if (stompReady) cb();
  else readyCallbacks.push(cb);
}

function onPersonalMessage(message) {
  console.log('Messaggio personale ricevuto:', JSON.parse(message.body));
  const mex = JSON.parse(message.body);
  const type = mex.type;
  switch (type) {
    case 'TASK_ASSIGNED':
      inviaNotifica('Nuova task', 'Hai una nuova task', true);

      getAuthorizedAreas();
      break;
    case 'TASK_REJECTED':
      inviaNotifica('Task rifiutata', 'Un worker ha rifiutato la task', true);
      break;
    default:
      return;
  }

}

function onAreaMqttMessage(message) {
  const raw = message.payloadString;
  if (!raw) return;
  console.log('Messaggio area ricevuto:', JSON.parse(raw));
  const mex = JSON.parse(raw);
  handleAreaEvent(mex.type, mex.payload, mex.timestamp, message.retained);
}

async function handleAreaEvent(type, payload, timestamp, retained) {
  const user = JSON.parse(await AsyncStorage.getItem('user'));
  const display = buildDisplayMessage(type, payload, timestamp, user?.id);
  if (!display) return;

  if (retained) {
    await appendRecentMessage(display);
    return;
  }

  notifyForEvent(type, display);
  await appendLiveMessage(display);

  // lo status dell'area può essere cambiato: aggiorna lo snapshot che alimenta la
  // pillola di stato, altrimenti resta congelato a quello letto solo all'ingresso
  refreshCurrentAreaFromServer(currentAreaId);
}

function notifyForEvent(type, display) {
  switch (type) {
    case 'AREA_ALERT':
    case 'AREA_DANGER':
      inviaNotifica(display.header, display.description, true);
      break;
    case 'AREA_SAFE':
    case 'AREA_DANGER_CLEARED':
      inviaNotifica(display.header, display.description, false);
      break;
    case 'AREA_UNAUTHORIZED':
      inviaNotifica(display.header, display.description, false);
      break;
    default:
      break;
  }
}


export function buildDisplayMessage(type, payload, timestamp, currentUserId) {
  switch (type) {
    case 'AREA_ALERT':
      return {
        type,
        timestamp,
        severity: 'urgent',
        header: 'Allarme sensori',
        description: "Temperatura o umidità dell'area hanno superato la soglia consentita.",
      };
    case 'AREA_SAFE':
      return {
        type,
        timestamp,
        severity: 'safe',
        header: 'Rientro sensori',
        description: 'Temperatura e umidità sono rientrate nella norma.',
      };
    case 'AREA_DANGER':
      return {
        type,
        timestamp,
        severity: 'urgent',
        header: 'Pericolo area',
        description: "L'indice di pericolo delle task in corso ha superato la soglia dell'area.",
        totalDangerIndex: payload?.totalDangerIndex,
        dangerIndexThreshold: payload?.dangerIndexThreshold,
      };
    case 'AREA_DANGER_CLEARED':
      return {
        type,
        timestamp,
        severity: 'safe',
        header: 'Rientro pericolo area',
        description: "L'indice di pericolo dell'area è rientrato sotto soglia.",
        totalDangerIndex: payload?.totalDangerIndex,
        dangerIndexThreshold: payload?.dangerIndexThreshold,
      };
    case 'AREA_UNAUTHORIZED': {
      const isSelf =
        payload?.workerId != null &&
        currentUserId != null &&
        payload.workerId === currentUserId;
      return {
        type,
        timestamp,
        severity: 'warning',
        header: 'Accesso non autorizzato',
        description: isSelf
          ? "Sei entrato in un'area a cui non sei autorizzato."
          : "Del personale non autorizzato è entrato nell'area.",
        // salvato solo per il confronto interno/audit: MAI mostrato a terzi in UI
        workerId: payload?.workerId,
      };
    }
    default:
      return null;
  }
}

async function appendRecentMessage(display) {
  const raw = await AsyncStorage.getItem('mexsRecent');
  const list = raw ? JSON.parse(raw) : [];
  list.unshift(display); // più recente in cima
  await AsyncStorage.setItem('mexsRecent', JSON.stringify(list));
}

async function appendLiveMessage(display) {
  const raw = await AsyncStorage.getItem('mexsLive');
  const list = raw ? JSON.parse(raw) : [];
  list.unshift(display); // più recente in cima
  await AsyncStorage.setItem('mexsLive', JSON.stringify(list));
}

const inviaNotifica = async (title, body, urgent) => {
  try {
    const { status: permStatus } = await Notifications.requestPermissionsAsync();
    if (permStatus !== 'granted') {
      alert('Permessi negati: ' + permStatus);
      return;
    }
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: urgent ? 'alarm.wav' : undefined,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 1,
        channelId: urgent ? 'default' : 'quiet',
      },
    });
  } catch (e) {
    alert('Errore: ' + e);
  }
};

export async function disconnectStomp() {
  if (mqttReconnectTimer) {
    clearTimeout(mqttReconnectTimer);
    mqttReconnectTimer = null;
  }

  if (mqttClient) {
    currentAreaTopics.forEach((topic) => mqttClient.unsubscribe(topic));
  }
  currentAreaTopics = [];
  currentAreaId = null;
  pendingAreaId = null;

  if (personalSub) {
    personalSub.unsubscribe();
    personalSub = null;
  }

  if (client) {
    await client.deactivate();
    client = null;
  }
  stompReady = false;

  if (mqttClient) {
    mqttClient.disconnect();
    mqttClient = null;
  }
  mqttReady = false;

  await AsyncStorage.setItem('mexsLive', JSON.stringify([]));
  await AsyncStorage.setItem('mexsRecent', JSON.stringify([]));
  console.log('STOMP e MQTT disconnessi manualmente');
}

async function refreshCurrentAreaFromServer(areaId, { notifyIfDanger } = {}) {
  if (!areaId) return;
  try {
    const token = await AsyncStorage.getItem('token');
    const url = endpointOS + '/api/areas/' + areaId;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
    });
    if (!response.ok) {
      console.log('Errore GET /api/areas/:id in refreshCurrentAreaFromServer', response.status);
      return;
    }
    const data = await response.json();
    if (data.result === 0) {
      const area = data.areas.areasList[0];
      await AsyncStorage.setItem('currArea', JSON.stringify(area));
      if (notifyIfDanger && area?.status === 99) {
        inviaNotifica('PERICOLO AREA!', "PERICOLO RILEVATO, EVACUARE L'AREA!", true);
      }
    }
  } catch (e) {
    console.log('Errore refreshCurrentAreaFromServer', e);
  }
}

const getAuthorizedAreas = async () => {
  const token = await AsyncStorage.getItem('token');
  const user = JSON.parse(await AsyncStorage.getItem('user'));
  const emailUser = user.email;
  try {
    const url = endpointUS + '/api/workers/email?email=' + emailUser;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
    });
    if (!response.ok) {
      console.log(response.status, ': api/workers/email?email');
    } else {
      const data = await response.json();
      const workAreaList = data.workers.workersList[0].authorizedAreaIds;
      console.log('Aree aggiornate');
      await AsyncStorage.setItem('authArea', JSON.stringify(workAreaList));
    }
  } catch (e) {
    console.log('Errore chiamata API GET AREA WORKER', e);
  }
};