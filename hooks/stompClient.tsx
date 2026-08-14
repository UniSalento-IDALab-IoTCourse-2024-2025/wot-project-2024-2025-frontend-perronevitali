import { Client } from '@stomp/stompjs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { API_BASE_URL, API_PORT_OS, API_PORT_US } from '@/constants/api';

let client = null;
let stompReady = false;
const readyCallbacks = [];
const endpointUS = API_BASE_URL + API_PORT_US;
const endpointOS = API_BASE_URL + API_PORT_OS;

let currentAreaSub = null;
let currentAreaId = null;
let personalSub = null;

// due canali indipendenti: se entrambi presenti in /recent, si tiene solo il più recente
const SENSOR_CHANNEL_TYPES = ['AREA_ALERT', 'AREA_SAFE'];
const DANGER_CHANNEL_TYPES = ['AREA_DANGER', 'AREA_DANGER_CLEARED'];

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
      currentAreaSub = null;
      currentAreaId = null;
    },
  });

  client.activate();
  return client;
}

export function switchAreaSubscription(idArea) {
  if (!client || !stompReady) return;
  if (!idArea) return;
  if (idArea === currentAreaId) return; // già iscritto a questa area, non fare nulla

  if (currentAreaSub) {
    currentAreaSub.unsubscribe();
    currentAreaSub = null;
  }

  currentAreaSub = client.subscribe(
    '/exchange/faro.areas/area.' + idArea,
    onAreaMessage
  );
  currentAreaId = idArea;

  console.log('Sottoscritto alla nuova area:', idArea);

  // la lista "in tempo reale" riparte da zero: gli eventi live della vecchia area
  // non hanno senso mostrati come se riguardassero quella nuova
  AsyncStorage.setItem('mexsLive', JSON.stringify([]));

  loadRecentForArea(idArea);
  refreshCurrentAreaFromServer(idArea, { notifyIfDanger: true });
}

export function clearAreaSubscription() {
  if (currentAreaSub) {
    currentAreaSub.unsubscribe();
    currentAreaSub = null;
    currentAreaId = null;
  }
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
      // il worker viene autorizzato su un'area solo quando gli viene assegnata una task
      // in quell'area: le aree autorizzate vanno quindi ricaricate a ogni nuova assegnazione
      getAuthorizedAreas();
      break;
    case 'TASK_REJECTED':
      inviaNotifica('Task rifiutata', 'Un worker ha rifiutato la task', true);
      break;
    default:
      return;
  }
  // Nota: TASK_ASSIGNED/TASK_REJECTED non vengono storicizzati localmente (vedi piano,
  // punto 1.3) — solo notifica. L'aggiornamento della lista task avviene al prossimo
  // mount/focus dello screen task, non c'è ancora un trigger di refresh immediato.
}

function onAreaMessage(message) {
  console.log('Messaggio area ricevuto:', JSON.parse(message.body));
  const mex = JSON.parse(message.body);
  handleLiveAreaEvent(mex.type, mex.payload, mex.timestamp);
}

async function handleLiveAreaEvent(type, payload, timestamp) {
  const user = JSON.parse(await AsyncStorage.getItem('user'));
  const display = buildDisplayMessage(type, payload, timestamp, user?.id);
  if (!display) return; // tipo sconosciuto, ignorato

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
      // stesso trattamento urgente per entrambi: il worker non deve distinguere
      // se il pericolo viene dai sensori o dall'accumulo task
      inviaNotifica(display.header, display.description, true);
      break;
    case 'AREA_SAFE':
    case 'AREA_DANGER_CLEARED':
      inviaNotifica(display.header, display.description, false);
      break;
    case 'AREA_UNAUTHORIZED':
      // decisione presa: nessun suono per questo tipo di evento
      inviaNotifica(display.header, display.description, false);
      break;
    default:
      break;
  }
}

// Converte un evento grezzo (type + payload + timestamp) in un oggetto pronto per la UI.
// Usata sia per gli eventi live sia per la risposta di /recent e dello storico paginato
// (stessa forma) — esportata perché riusata anche in app/area/history.tsx.
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

async function loadRecentForArea(areaId) {
  try {
    const token = await AsyncStorage.getItem('token');
    const user = JSON.parse(await AsyncStorage.getItem('user'));
    const url = endpointOS + '/api/message-history/areas/' + areaId + '/recent';
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
    });
    if (!response.ok) {
      console.log('Errore GET /api/message-history/areas/.../recent', response.status);
      await AsyncStorage.setItem('mexsRecent', JSON.stringify([]));
      return;
    }
    const data = await response.json();
    const raw = data.messages || [];
    const display = raw
      .map((entry) => buildDisplayMessage(entry.type, entry.payload, entry.timestamp, user?.id))
      .filter(Boolean);
    const filtered = filterRecentByChannel(display);
    await AsyncStorage.setItem('mexsRecent', JSON.stringify(filtered));
  } catch (e) {
    console.log('Errore chiamata /recent', e);
  }
}

function filterRecentByChannel(displayMessages) {
  const sensors = displayMessages.filter((m) => SENSOR_CHANNEL_TYPES.includes(m.type));
  const danger = displayMessages.filter((m) => DANGER_CHANNEL_TYPES.includes(m.type));
  const unauthorized = displayMessages.find((m) => m.type === 'AREA_UNAUTHORIZED');

  const latest = (arr) =>
    arr.length === 0
      ? null
      : arr.reduce((a, b) => (new Date(a.timestamp) > new Date(b.timestamp) ? a : b));

  const result = [];
  const sensorLatest = latest(sensors);
  if (sensorLatest) result.push(sensorLatest);
  const dangerLatest = latest(danger);
  if (dangerLatest) result.push(dangerLatest);
  if (unauthorized) result.push(unauthorized);
  return result;
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
  if (currentAreaSub) {
    currentAreaSub.unsubscribe();
    currentAreaSub = null;
  }
  currentAreaId = null;
  if (personalSub) {
    personalSub.unsubscribe();
    personalSub = null;
  }

  if (client) {
    await client.deactivate();
    client = null;
  }

  stompReady = false;
  await AsyncStorage.setItem('mexsLive', JSON.stringify([]));
  console.log('STOMP disconnesso manualmente');
}

// Fa un fetch fresco dell'area e riscrive "currArea": usata sia all'ingresso in una
// nuova area (con notifica se già in DANGER) sia a ogni evento live ricevuto mentre
// si è già dentro un'area, altrimenti la pillola di stato resta congelata al valore
// letto al momento dell'ingresso.
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