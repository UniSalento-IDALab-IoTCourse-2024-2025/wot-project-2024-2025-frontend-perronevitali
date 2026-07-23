import { Client } from '@stomp/stompjs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

let client = null;
let stompReady = false;
const readyCallbacks = [];

let currentAreaSub = null;
let currentAreaId = null;
let messages= new Array()
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
  sendAlertNoAuth()
  sendWarningMessage()
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
  const mex = JSON.parse(message.body)
  const type = mex.type
  switch(type){
      case 'AREA_UNAUTHORIZED':
          inviaNotifica("AVVISO FARO","Attenzione, sei entrato in un'area a cui non sei autorizzato!")
          updanteMessageList(mex)
          return;
      default:
          return;
  }
}
const updanteMessageList = async(newMessage) =>{
    const type = newMessage.type
    let lastMessage = null
    switch(type){
        case 'AREA_UNAUTHORIZED':
             lastMessage = {
                "header": "Mancata autorizzazione area",
                "description": "Sei appena entrato in un area a cui non sei autorizzato",
                "timestamp": newMessage.timestamp
            }
    }
    for(let i=messages.length-1; i>=0;i--){

        if(JSON.stringify(lastMessage) === JSON.stringify(messages[i])){
             console.log(comp)
        }

     }
    messages.push(lastMessage)
    await AsyncStorage.setItem("mexs",JSON.stringify(messages))
}
const inviaNotifica = async (title,body) =>{
    try{
        const { status: permStatus } = await Notifications.requestPermissionsAsync();
        if (permStatus !== 'granted') { alert('Permessi negati: ' + permStatus); return; }
        await Notifications.scheduleNotificationAsync({
            content: { title: title, body: body,sound:'alarm.wav' },
            trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                seconds: 1,
                channelId: 'default', },
        });
    }catch(e){
        alert('Errore: ' + e);
    }
}
const sendWarningMessage = async () =>{
    let area = JSON.parse(await AsyncStorage.getItem("currArea"))
    console.log(area.status)
    if(area.status===99){
        inviaNotifica("PERICOLO AREA!","EVACURARE L'AREA QUANTO PRIMA")
    }
}
const sendAlertNoAuth = async () =>{
    let area = JSON.parse(await AsyncStorage.getItem("currArea"))
    const unworkers = area.unauthorizedWorkerIds
    const unworkersl = area.unauthorizedWorkerIds.length
    const user = JSON.parse(await AsyncStorage.getItem("user"))
    const intruder = unworkers.find((unworker)=>unworker===user.id)
    if(unworkersl>0 && !intruder){
        inviaNotifica("AVVISO FARO","Attenzione, del personale non autorizzato è appena entrato nell'area!")
    }
}