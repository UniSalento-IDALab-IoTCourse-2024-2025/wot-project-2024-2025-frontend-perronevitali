import { Client } from '@stomp/stompjs';
import { Client as MqttClient } from 'react-native-paho-mqtt';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { API_BASE_URL, API_PORT_OS, API_PORT_US } from '@/constants/api';

let client = null;
let stompReady = false;
const readyCallbacks = [];
const endpointUS = API_BASE_URL + API_PORT_US;
const endpointOS = API_BASE_URL + API_PORT_OS;

const AREA_SUBTOPICS = ['alert', 'unauthorized', 'danger'];

// Un messaggio marcato "retained" non e' di per se' un messaggio vecchio: il
// broker puo' consegnarlo con il flag attivo anche a un client gia' iscritto.
// L'unico criterio affidabile per distinguere un evento appena accaduto da uno
// storico e' il suo timestamp. Oltre questa soglia il messaggio racconta lo
// stato in cui l'area si trovava prima del nostro arrivo: va salvato nello
// storico, non notificato.
const FRESH_EVENT_MS = 60000;

let mqttClient = null;
let mqttReady = false;
let currentAreaTopics = [];
let currentAreaId = null;
let pendingAreaId = null;
// sopravvive alle disconnessioni: serve a ri-sottoscriversi da soli dopo una
// riconnessione, altrimenti l'app resta connessa al broker ma senza alcuna
// subscription attiva e non riceve piu' nessun evento d'area
let lastAreaId = null;
let mqttReconnectTimer = null;
let personalSub = null;
let notificationsConfigured = false;

const mqttStorage = {
  setItem: (key, item) => AsyncStorage.setItem(key, item),
  getItem: (key) => AsyncStorage.getItem(key),
  removeItem: (key) => AsyncStorage.removeItem(key),
};

export function getStompClient(idUser) {
  if (client) return client;

  configureNotifications();

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

// I permessi e i canali Android vanno predisposti una sola volta all'avvio.
// Il canale "quiet" DEVE esistere: su Android una notifica indirizzata a un
// channelId inesistente viene scartata senza errori, e tutti gli eventi non
// urgenti (rientri, accessi non autorizzati) sparirebbero in silenzio.
async function configureNotifications() {
  if (notificationsConfigured) return;
  notificationsConfigured = true;

  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      const { status: requested } = await Notifications.requestPermissionsAsync();
      if (requested !== 'granted') {
        console.log('Permessi notifiche negati:', requested);
      }
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Allarmi',
        importance: Notifications.AndroidImportance.MAX,
        sound: 'alarm.wav',
        vibrationPattern: [0, 500, 250, 500],
        enableVibrate: true,
      });
      await Notifications.setNotificationChannelAsync('quiet', {
        name: 'Avvisi',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250],
        enableVibrate: true,
      });
    }
  } catch (e) {
    console.log('Errore configurazione notifiche', e);
  }
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
    currentAreaId = null; // le subscription sono cadute con la connessione
    scheduleMqttReconnect();
  });

  mqttClient.on('messageReceived', onAreaMqttMessage);

  doMqttConnect();
}

function doMqttConnect() {
  mqttClient
    .connect({
      userName: 'FARO',
      password: 'FARO',
      // senza keepalive il broker chiude la socket quando la connessione resta
      // inattiva, ed e' la causa piu' comune del "Socket closed" ricorrente
      keepAliveInterval: 30,
    })
    .then(() => {
      console.log('MQTT CONNESSO');
      mqttReady = true;
      currentAreaId = null;

      // ripristina la sottoscrizione all'ultima area nota: dopo una
      // riconnessione nessuno lo farebbe, e l'app resterebbe senza eventi
      const idArea = pendingAreaId || lastAreaId;
      pendingAreaId = null;
      if (idArea) {
        console.log('Ripristino sottoscrizione area dopo connessione:', idArea);
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

  // memorizzata comunque: se la connessione non e' pronta, o cade piu' avanti,
  // e' da qui che si riparte
  lastAreaId = idArea;

  if (!mqttClient || !mqttReady) {
    pendingAreaId = idArea;
    return;
  }

  if (idArea === currentAreaId) return; // già iscritto a questa area, non fare nulla

  const cambioArea = currentAreaId !== null && currentAreaId !== idArea;

  currentAreaTopics.forEach((topic) => mqttClient.unsubscribe(topic));

  currentAreaTopics = AREA_SUBTOPICS.map((subTopic) => 'area/' + idArea + '/' + subTopic);
  currentAreaTopics.forEach((topic) => mqttClient.subscribe(topic, { qos: 1 }));
  currentAreaId = idArea;

  console.log('Sottoscritto alla nuova area:', idArea);

  // lo storico messaggi si azzera solo quando si cambia davvero area, non a
  // ogni riconnessione al broker: altrimenti una disconnessione momentanea
  // cancellerebbe i messaggi dell'area in cui ci si trova ancora
  if (cambioArea || currentAreaId !== lastAreaId) {
    AsyncStorage.setItem('mexsLive', JSON.stringify([]));
    AsyncStorage.setItem('mexsRecent', JSON.stringify([]));
  }

  refreshCurrentAreaFromServer(idArea);
}

export function clearAreaSubscription() {
  if (mqttClient) {
    currentAreaTopics.forEach((topic) => mqttClient.unsubscribe(topic));
  }
  currentAreaTopics = [];
  currentAreaId = null;
  pendingAreaId = null;
  lastAreaId = null;
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
      inviaNotifica('Nuova task', 'Hai una nuova task', false);

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
  // payload vuoto = cancellazione di un messaggio retained lato broker,
  // non un evento da mostrare
  if (!raw) return;
  console.log('Messaggio area ricevuto:', JSON.parse(raw));
  const mex = JSON.parse(raw);
  handleAreaEvent(mex.type, mex.payload, mex.timestamp, message.retained);
}

// Un evento e' "storico" se il suo timestamp e' piu' vecchio di FRESH_EVENT_MS.
// Non ci si puo' basare sul flag retained da solo: il broker lo lascia attivo
// anche su consegne live, e un evento provocato dal nostro stesso ingresso in
// area arriva a un soffio dalla sottoscrizione.
function isHistoricalEvent(timestamp) {
  if (!timestamp) return false;
  const eventTime = Date.parse(timestamp);
  if (Number.isNaN(eventTime)) return false;
  return Date.now() - eventTime > FRESH_EVENT_MS;
}

async function handleAreaEvent(type, payload, timestamp, retained) {
  const user = JSON.parse(await AsyncStorage.getItem('user'));
  const display = buildDisplayMessage(type, payload, timestamp, user?.id);
  if (!display) return;

  const storico = isHistoricalEvent(timestamp);
  console.log('evento area', type, '| retained =', retained, '| storico =', storico);

  if (storico) {
    await appendRecentMessage(display);

    // Il broker conserva un solo messaggio retained per topic, e sia l'edge
    // sia il backend lo cancellano al rientro. Quindi un ALERT o un DANGER
    // ricevuto come storico non racconta il passato: descrive lo stato in cui
    // l'area si trova ADESSO. Chi entra in una zona gia' in pericolo deve
    // essere avvisato, ed e' proprio il caso che giustifica l'uso del retain.
    if (type === 'AREA_ALERT' || type === 'AREA_DANGER') {
      inviaNotifica(
        'Attenzione: area in allarme',
        type === 'AREA_ALERT'
          ? "Sei entrato in un'area con temperatura o umidità oltre soglia."
          : "Sei entrato in un'area con l'indice di pericolo oltre soglia.",
        true
      );
    }

    refreshCurrentAreaFromServer(currentAreaId);
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
    await configureNotifications();

    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      // niente alert() bloccante: in una situazione di allarme non deve
      // comparire una finestra modale al posto dell'avviso
      console.log('Notifica non mostrata, permessi mancanti:', status);
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
    console.log('Errore invio notifica', e);
  }
};

export async function disconnectStomp() {
  if (mqttReconnectTimer) {
    clearTimeout(mqttReconnectTimer);
    mqttReconnectTimer = null;
  }

  if (mqttClient) {
    try {
      currentAreaTopics.forEach((topic) => mqttClient.unsubscribe(topic));
    } catch (e) {
      console.log('Errore unsubscribe topic area', e);
    }
  }
  currentAreaTopics = [];
  currentAreaId = null;
  pendingAreaId = null;
  lastAreaId = null;

  if (personalSub) {
    try {
      personalSub.unsubscribe();
    } catch (e) {
      console.log('Errore unsubscribe coda personale', e);
    }
    personalSub = null;
  }

  if (client) {
    await client.deactivate();
    client = null;
  }
  stompReady = false;

  if (mqttClient) {
    try {
      mqttClient.disconnect();
    } catch (e) {
      console.log('Errore disconnessione MQTT', e);
    }
    mqttClient = null;
  }
  mqttReady = false;

  await AsyncStorage.setItem('mexsLive', JSON.stringify([]));
  await AsyncStorage.setItem('mexsRecent', JSON.stringify([]));
  console.log('STOMP e MQTT disconnessi manualmente');
}

async function refreshCurrentAreaFromServer(areaId) {
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
