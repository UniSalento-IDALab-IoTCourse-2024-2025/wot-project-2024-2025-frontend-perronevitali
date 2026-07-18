import { BleManager, Service, ScanMode} from 'react-native-ble-plx';
import { getExistingStompClient, isStompReady, switchAreaSubscription } from './stompClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

   const bleManager = new BleManager();
   let isScanning = false;
   let stateSubscription = null;
   let stompReady = false;
   let idRabbit=""
   let curr_area=null
   let prev_area=null
   let client = null;
   const BeaconService = {
       startAll,
       startScanning,
       stopScanning
   };

   //function cconnectTorabbit(){}
   /*const client = mqtt.connect('ws://100.65.22.118:15674/ws', {
     username: 'FARO',
     password: 'FARO',
   });

  client.on('connect', () => {
    // Puoi usare wildcard: + = un livello, # = tutto il resto
    client.subscribe('faro.outbox');
  });

  client.on('message', (topic, message) => {
    const data = JSON.parse(message.toString());
    console.log('Topic:', topic, 'Payload:', data);
  });*/


 function startAll (zones,idWorker){
      idRabbit=idWorker
      if (stateSubscription) {
          return;
      }
      client = getExistingStompClient();
      if (!client || !isStompReady()) {
            console.warn('STOMP non ancora pronto, impossibile avviare beacon service');
            return;
      }
      stateSubscription = bleManager.onStateChange((state) => {
          console.log(state);
          if (state === "PoweredOn") {
            startScanning(zones, idWorker);
          }
          if (state === "PoweredOff") {
            alert("Bluetooth spento");
            stopScanning();
          }
          if (state === "Unauthorized") {
            alert("Autorizza dall'app");
          }
      }, true);
  }
  function onPersonalMessage(message) {
      console.log("Messaggio ricevuto:", message.body);
  }

  function startScanning (zones,idWorker){
      if(isScanning){
          console.log("Scansione già avviata")
          return
      }
      console.log("Inizio scansione")
      bleManager.startDeviceScan(null,  {allowDuplicates: true, legacyScan: false }, (error, scannedDevice) => {
      if (error) {
          if(error.errorCode!==102)
            console.warn(JSON.stringify(error,null,2));
        return;
      }
      if (scannedDevice) {
          const devicefounded = zones.find(({mac})=>mac===scannedDevice.id)
          if(devicefounded===null || devicefounded===undefined){
              //console.log("Nessun dispositivo trovato")
              return;
          }
          //Primo dispositivo trovato
          if(curr_area===null){
              curr_area=devicefounded
              curr_area["power"]=scannedDevice.rssi
              prev_area=devicefounded
              prev_area["power"]=scannedDevice.rssi
              if(client.connected){
                  switchAreaSubscription(devicefounded.area)
                  const date = new Date()
                  const message = JSON.stringify(
                      {
                          "type":"POSITION_UPDATE",
                          "timestamp":date,
                          "payload":{
                            "areaId": devicefounded.area,
                            "previousAreaId": prev_area.area,
                          }
                      })
                  client.publish({
                      destination: "/exchange/faro.outbox/"+idWorker,
                      headers: {type:"POSITION_UPDATE"},
                      body: message
                  })
                  console.log("Messaggio pubblicato")
                  setCurrentArea(devicefounded.area)
              }
              return;
          }else{
              curr_area=devicefounded
              curr_area["power"]=scannedDevice.rssi
          }

         if(curr_area["area"]!==prev_area["area"] && curr_area["power"]>prev_area["power"]){
            console.log("Ti sei allontanato da",prev_area,"ma ti sei avvicinato a",curr_area)
            prev_area=curr_area
            curr_area=devicefounded.area
            console.log(devicefounded)
            if(client.connected){
                switchAreaSubscription(devicefounded.area)
                const date = new Date()
                const message = JSON.stringify(
                    {
                        "type":"POSITION_UPDATE",
                        "timestamp":date,
                        "payload":{
                            "areaId": devicefounded.area,
                            "previousAreaId": prev_area.area,
                        }
                })
                client.publish({
                    destination: "/exchange/faro.outbox/"+idWorker,
                    headers: {type:"POSITION_UPDATE"},
                    body: message
                })
                console.log("Messaggio pubblicato")
                setCurrentArea(devicefounded.area)
            }else{
                console.log("STOMP non ancora connesso, scarto questo tentativo")
           }
         }
          /*if(client.connected){

              const date = new Date()
              const message = JSON.stringify(
                  {
                      "type":"POSITION_UPDATE",
                      "timestamp":date,
                      "payload":{
                          "areaId":"cassacarragnu",
                          "previousAreaId":"42r24r24r42r43t432t25",
                      }
                  })
                  client.publish({
                      destination: "/exchange/faro.outbox/"+idWorker,
                      headers: {type:"POSITION_UPDATE"},
                      body: message
                  })
                  console.log("Messaggio pubblicato")
          }else{

          }*/

            /*
            if (client.connected) {
                const payload = JSON.stringify({
                    zone: 3,
                    distance: distance,
                    timestamp: Date.now(),
               });
               client.publish('queue2', payload, { qos: 1 }, (err) => {
               if (!err) console.log('Messaggio inviato');
               });
            }*/
      }
      });
     }

    function stopScanning(){
        console.log("Ferma scansione")
        bleManager.stopDeviceScan();
        isScanning=false
    }
    const setCurrentArea = async (area)=>{
        await AsyncStorage.setItem("currArea",area)
    }
export default BeaconService;