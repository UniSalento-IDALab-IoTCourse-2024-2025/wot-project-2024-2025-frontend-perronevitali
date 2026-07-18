import { Client } from '@stomp/stompjs';

let client = null;
let stompReady = false;
const readyCallbacks = [];

let currentAreaSub = null;
let currentAreaId = null;

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
      client.subscribe('/queue/faro.inbox.' + idUser, onPersonalMessage);
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

  // rimuovi la subscription precedente, se esiste
  if (currentAreaSub) {
    currentAreaSub.unsubscribe();
    currentAreaSub = null;
  }

  // sottoscrivi alla nuova area
  currentAreaSub = client.subscribe(
    '/exchange/faro.areas/area.' + idArea,
    onAreaMessage
  );
  currentAreaId = idArea;

  console.log('Sottoscritto alla nuova area:', idArea);
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
}
function onAreaMessage(message) {
  console.log('Messaggio area ricevuto:', JSON.parse(message.body));
}