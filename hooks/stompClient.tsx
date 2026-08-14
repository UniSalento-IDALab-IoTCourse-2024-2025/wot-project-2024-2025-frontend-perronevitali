import { Client } from '@stomp/stompjs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { API_BASE_URL,API_PORT_US } from '@/constants/api';

let client = null;
let stompReady = false;
const readyCallbacks = [];
const endpoint = API_BASE_URL+API_PORT_US
let currentAreaSub = null;
let currentAreaId = null;
let lastProcessedKey = null
let personalSub = null;
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
  //sendAlertNoAuth()
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
  const mex = JSON.parse(message.body)
  const type = mex.type
  switch(type){
     case 'TASK_ASSIGNED':
         inviaNotifica("Nuova task","Hai una nuova task")
         getAuthorizedAreas()
         break
     case 'TASK_REJECTED':
         inviaNotifica("Task Rifiutata","Un worker ha rifiutato la task")
         break
  }
  updateMessageList(mex,type)
}
function onAreaMessage(message) {
  console.log('Messaggio area ricevuto:', JSON.parse(message.body));
  const mex = JSON.parse(message.body)
  const type = mex.type
  switch(type){
      case 'AREA_UNAUTHORIZED':
          inviaNotifica("AVVISO FARO","Attenzione, sei entrato in un'area a cui non sei autorizzato!")
          break
      case 'AREA_DANGER':
          inviaNotifica("PERICOLO AREA","PERICOLO RILEVATO, EVACURARE l'AREA!")
          break
  }
   updateMessageList(mex,type)
}
const updateMessageList = async(newMessage,type) =>{
    let lastMessage = null
    switch(type){
        case 'AREA_UNAUTHORIZED':
             lastMessage = {
                "type" : type,
                "header": "Mancata autorizzazione area",
                "description": "Sei appena entrato in un area a cui non sei autorizzato",
                "timestamp": newMessage.timestamp
            }
            break
        case 'AREA_DANGER':
            lastMessage = {
                "type" : type,
                "header": "Pericolo area",
                "description": "È stata rilevata un anomalia all'interno dell'area",
                "timestamp": newMessage.timestamp
            }
            break
        case 'TASK_ASSIGNED':
            lastMessage = {
                "type" : type,
                "header": "Nuova task",
                "timestamp": newMessage.timestamp,
                "taskName": newMessage.payload.taskName,
                "description": newMessage.payload.description,
            }
            break
        case 'TASK_REJECTED':
            lastMessage = {
                "type" : type,
                "header": "task Rifiutata",
                "description": newMessage.payload.description,
                "timestamp": newMessage.timestamp,
                "taskName": newMessage.payload.taskName,
                "reason": newMessage.payload.reason
            }
            break
    }
    console.log("Last message",lastMessage)
    messages.push(lastMessage)
    console.log("Messaggi",messages)
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
  messages = [];
  console.log('STOMP disconnesso manualmente');
}
const sendWarningMessage = async () =>{
    let area = JSON.parse(await AsyncStorage.getItem("currArea"))
    if(area?.status===99){
        inviaNotifica("PERICOLO AREA!","PERICOLO RILEVATO, EVACURARE l'AREA!")
    }
}
const getAuthorizedAreas = async() =>{
    const token = await AsyncStorage.getItem("token")
    const user = JSON.parse(await AsyncStorage.getItem("user"))
    const emailUser = user.email
    try{
        const url = endpoint+"/api/workers/email?email="+emailUser

        const response = await fetch(url,{
            method: 'GET',
            headers:{
                'Content-Type': 'application/json',
                'Authorization': 'Bearer '+token
            }
        })
        if(!response.ok){
            console.log(response.status,": api/workers/email?email")
        }else{
            const data = await response.json()
            const workAreaList = data.workers.workersList[0].authorizedAreaIds
            console.log("Aree aggiornate")
            await AsyncStorage.setItem("authArea",JSON.stringify(workAreaList))
       }
    }catch(e){
        console.log("Errore chiamata API GET AREA WORKER",e)
    }
}
/*const sendAlertNoAuth = async () =>{
    let area = JSON.parse(await AsyncStorage.getItem("currArea"))
    const unworkers = area.unauthorizedWorkerIds
    const unworkersl = area.unauthorizedWorkerIds.length
    const user = JSON.parse(await AsyncStorage.getItem("user"))
    console.log(user.id)
    const intruder = unworkers.find((unworker)=>unworker===user.id)
    if(unworkersl>0 && !intruder){
        inviaNotifica("AVVISO FARO","Attenzione, del personale non autorizzato è appena entrato nell'area!")
    }
}
const sleepFunction = async () =>{
    await sleep(5000)
}*/